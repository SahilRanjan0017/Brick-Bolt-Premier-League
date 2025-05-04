'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import type { ProjectData } from '@/services/cloud-sql';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PodiumSceneProps {
  performers: ProjectData[];
}

const PodiumScene: React.FC<PodiumSceneProps> = ({ performers }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<{ text: string, position: { x: number, y: number } } | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const podiumGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf0f0f0); // Light gray background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 2.5, 5); // Adjusted camera position
    camera.lookAt(0, 1, 0); // Look towards the center of the podium

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Podium Group
    const podiumGroup = new THREE.Group();
    podiumGroupRef.current = podiumGroup;
    scene.add(podiumGroup);

    // Podium Steps Materials
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.3 }); // Gold
    const silverMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.9, roughness: 0.2 }); // Silver
    const bronzeMaterial = new THREE.MeshStandardMaterial({ color: 0xCD7F32, metalness: 0.7, roughness: 0.4 }); // Bronze

    const materials = [goldMaterial, silverMaterial, bronzeMaterial];
    const heights = [1.5, 1.2, 0.9]; // Heights for 1st, 2nd, 3rd
    const positions = [
        { x: 0, y: heights[0] / 2, z: 0 },  // 1st place (center)
        { x: -1.2, y: heights[1] / 2, z: 0 }, // 2nd place (left)
        { x: 1.2, y: heights[2] / 2, z: 0 }   // 3rd place (right)
    ];
    const labels = ['1st', '2nd', '3rd'];

    performers.slice(0, 3).forEach((performer, index) => {
        const podiumIndex = performer.rank === 1 ? 0 : performer.rank === 2 ? 1 : 2; // Map rank to podium position index
        if (podiumIndex > 2) return; // Ensure only top 3

        const geometry = new THREE.BoxGeometry(1, heights[podiumIndex], 1);
        const podiumMesh = new THREE.Mesh(geometry, materials[podiumIndex]);
        podiumMesh.position.set(positions[podiumIndex].x, positions[podiumIndex].y, positions[podiumIndex].z);
        podiumMesh.castShadow = true;
        podiumMesh.receiveShadow = true;
        podiumMesh.userData = { // Store performer data for interaction
            type: 'podium',
            tooltip: `${performer.city} (${labels[podiumIndex]}) - Run Rate: ${performer.run_rate}`,
            rank: performer.rank
        };
        podiumGroup.add(podiumMesh);
    });


    // Ground Plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide, roughness: 0.8 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    podiumGroup.add(groundMesh); // Add ground to the group

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Add subtle rotation animation
      podiumGroup.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (currentMount && cameraRef.current && rendererRef.current) {
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // Mouse move listener for tooltips
    const handleMouseMove = (event: MouseEvent) => {
        if (!mountRef.current || !cameraRef.current || !sceneRef.current || !podiumGroupRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(podiumGroupRef.current.children);

        let foundTooltip = false;
        if (intersects.length > 0) {
            const firstIntersect = intersects[0].object;
            if (firstIntersect.userData.type === 'podium') {
                setTooltipContent({
                    text: firstIntersect.userData.tooltip,
                    position: { x: event.clientX, y: event.clientY }
                });
                foundTooltip = true;

                // Basic hover effect: slightly scale up
                 podiumGroupRef.current.children.forEach(child => {
                     if (child instanceof THREE.Mesh && child.userData.type === 'podium') {
                         child.scale.set(1, 1, 1); // Reset scale
                     }
                 });
                 if(firstIntersect instanceof THREE.Mesh){
                     firstIntersect.scale.set(1.05, 1.05, 1.05);
                 }

            }
        }

        if (!foundTooltip) {
             podiumGroupRef.current.children.forEach(child => {
                 if (child instanceof THREE.Mesh && child.userData.type === 'podium') {
                     child.scale.set(1, 1, 1); // Reset scale
                 }
             });
             setTooltipContent(null);
        }
    };
    currentMount.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('mousemove', handleMouseMove);
      if (rendererRef.current) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      // Dispose Three.js objects
      sceneRef.current?.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      rendererRef.current?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      podiumGroupRef.current = null;
    };
  }, [performers]); // Re-run effect if performers change


  // Add rank to performers data
   const rankedPerformers = performers.map((p, index) => ({ ...p, rank: index + 1 }));


  return (
      <TooltipProvider>
        <div ref={mountRef} className="w-full h-full cursor-pointer relative overflow-hidden">
          {tooltipContent && (
            <Tooltip open={true}>
                {/* Invisible trigger at mouse position */}
                <TooltipTrigger style={{ position: 'fixed', top: tooltipContent.position.y, left: tooltipContent.position.x, width: 0, height: 0, pointerEvents: 'none' }} />
                <TooltipContent side="top" align="center">
                   <p>{tooltipContent.text}</p>
                </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
  );
};

export default PodiumScene;
