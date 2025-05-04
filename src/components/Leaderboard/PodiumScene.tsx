'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
// Use a simpler, more generic interface that includes expected properties
interface PodiumPerformer {
    project_id?: string; // Optional project ID
    id?: string; // Allow using 'id' as fallback
    city: string;
    rag_status?: string | undefined; // Optional RAG status
    run_rate: number;
    last_updated?: string; // Optional last updated
    rank: number;
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PodiumSceneProps {
  performers: PodiumPerformer[]; // Use the updated interface
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

  // Sort performers by rank to ensure correct placement
  const sortedPerformers = useMemo(() => {
      return [...performers].sort((a, b) => a.rank - b.rank);
  }, [performers]);


  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Updated background color to match the theme's card/muted background
    scene.background = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--card') || '#ffffff');

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 2.5, 5); // Adjusted camera position
    camera.lookAt(0, 1, 0); // Look towards the center of the podium

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable alpha for transparent background if needed
    rendererRef.current = renderer;
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Slightly brighter ambient
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Slightly stronger directional
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    // Adjust shadow camera bounds if necessary
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Add a soft backlight or fill light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);


    // Podium Group
    const podiumGroup = new THREE.Group();
    podiumGroupRef.current = podiumGroup;
    scene.add(podiumGroup);

    // Podium Steps Materials - Using more vibrant colors
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.4 }); // Gold
    const silverMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.3 }); // Silver
    const bronzeMaterial = new THREE.MeshStandardMaterial({ color: 0xcd7f32, metalness: 0.5, roughness: 0.5 }); // Bronze

    const materials = [goldMaterial, silverMaterial, bronzeMaterial];
    const heights = [1.5, 1.2, 0.9]; // Heights for 1st, 2nd, 3rd
    const positions = [
        { x: 0, y: heights[0] / 2, z: 0 },    // 1st place (center)
        { x: -1.2, y: heights[1] / 2, z: 0 }, // 2nd place (left)
        { x: 1.2, y: heights[2] / 2, z: 0 }   // 3rd place (right)
    ];
    const labels = ['1st', '2nd', '3rd'];

    sortedPerformers.slice(0, 3).forEach((performer, index) => { // Use sorted performers and index for placement
         if (!performer) return; // Skip if performer data is somehow undefined

         const podiumIndex = index; // Use the loop index after sorting (0=1st, 1=2nd, 2=3rd)

         const geometry = new THREE.BoxGeometry(1, heights[podiumIndex], 1);
         const podiumMesh = new THREE.Mesh(geometry, materials[podiumIndex]);
         podiumMesh.position.set(positions[podiumIndex].x, positions[podiumIndex].y, positions[podiumIndex].z);
         podiumMesh.castShadow = true;
         podiumMesh.receiveShadow = true;
         podiumMesh.userData = { // Store performer data for interaction
             type: 'podium',
             tooltip: `${performer.city ?? 'N/A'} (${labels[podiumIndex]}) - Run Rate: ${performer.run_rate ?? 'N/A'}%`,
             rank: performer.rank
         };
         podiumGroup.add(podiumMesh);
     });


    // Ground Plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    // Use a transparent material if blending with page background, or a subtle color
    // const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, side: THREE.DoubleSide, roughness: 0.9 });
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 }); // Only receives shadows
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0.01; // Slightly above 0 to avoid z-fighting if there's another ground
    groundMesh.receiveShadow = true;
    podiumGroup.add(groundMesh); // Add ground to the group

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      // Add subtle rotation animation
      podiumGroup.rotation.y += 0.002;
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
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
    // Initial resize call
    handleResize();

    // Mouse move listener for tooltips
    const handleMouseMove = (event: MouseEvent) => {
        if (!mountRef.current || !cameraRef.current || !sceneRef.current || !podiumGroupRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(podiumGroupRef.current.children);

        let foundTooltip = false;
        // Reset scale before checking for new hover
         podiumGroupRef.current.children.forEach(child => {
             if (child instanceof THREE.Mesh && child.userData.type === 'podium') {
                 // Check if scale exists before setting
                 if (child.scale) {
                    child.scale.set(1, 1, 1); // Reset scale
                 }
             }
         });

        if (intersects.length > 0) {
            const firstIntersect = intersects[0].object;
             // Check if the intersected object is one of our podium meshes
            if (firstIntersect instanceof THREE.Mesh && firstIntersect.userData.type === 'podium') {
                setTooltipContent({
                    text: firstIntersect.userData.tooltip,
                    position: { x: event.clientX, y: event.clientY }
                });
                foundTooltip = true;

                // Basic hover effect: slightly scale up the hovered item
                // Check if scale exists before setting
                 if(firstIntersect.scale) {
                     firstIntersect.scale.set(1.05, 1.05, 1.05);
                 }
            }
        }

        if (!foundTooltip) {
             setTooltipContent(null);
             // Ensure all scales are reset if no tooltip is shown
             podiumGroupRef.current.children.forEach(child => {
                 if (child instanceof THREE.Mesh && child.userData.type === 'podium') {
                      // Check if scale exists before setting
                     if (child.scale) {
                        child.scale.set(1, 1, 1); // Reset scale
                     }
                 }
             });
        }
    };
    currentMount.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
       if (currentMount) { // Check if mountRef.current is still valid
           currentMount.removeEventListener('mousemove', handleMouseMove);
           if (rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
               currentMount.removeChild(rendererRef.current.domElement);
           }
       }
      // Dispose Three.js objects
      sceneRef.current?.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose(); // Check if geometry exists
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material?.dispose()); // Check if material exists
          } else if(object.material instanceof THREE.Material) { // Check if material is valid
            object.material?.dispose(); // Check if material exists
          }
        }
      });
      rendererRef.current?.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      podiumGroupRef.current = null;
    };
  }, [sortedPerformers]); // Re-run effect if sortedPerformers change


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
