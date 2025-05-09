import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { RAGCounts } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function for calculating RAG counts
export const calculateRagCounts = (score: number, projectCount: number = 10): RAGCounts => {
    let green = 0, amber = 0, red = 0;
    if (projectCount === 0) return { green: 0, amber: 0, red: 0 };

    const baseGreen = Math.floor(projectCount * (score / 100));
    const remaining = projectCount - baseGreen;

    if (score > 85) {
        green = baseGreen + Math.floor(remaining * 0.7);
        amber = projectCount - green; // remaining projects become amber
        red = 0;
         // Ensure amber is not negative if green calculation made it so
        if (amber < 0) {
            green += amber; // Reduce green by the negative amber amount
            amber = 0;
        }

    } else if (score > 65) {
        green = baseGreen;
        amber = Math.floor(remaining * 0.6);
        red = projectCount - green - amber;
         if (red < 0) { // If red becomes negative
            amber += red; // Reduce amber
            red = 0;
            if (amber < 0) { // If amber also becomes negative
                green += amber;
                amber = 0;
            }
        }
    } else { // score <= 65
        // Prioritize showing some red and amber
        red = Math.floor(remaining * 0.6) + Math.max(0, Math.floor(projectCount * 0.1)); // At least 10% red if projects exist
        red = Math.min(red, projectCount); // Cap red at total project count

        amber = Math.floor(remaining * 0.3) + Math.max(0, Math.floor(projectCount * 0.15)); // At least 15% amber
        amber = Math.min(amber, projectCount - red); // Cap amber

        green = projectCount - red - amber;

        if (green < 0) { // If calculation results in negative green
            // This implies red + amber > projectCount. Adjust them.
            // This scenario should be rare if logic above is sound, but as a fallback:
            const overflow = Math.abs(green);
            red -= Math.ceil(overflow / 2);
            amber -= Math.floor(overflow / 2);
            green = 0;
        }
    }
    
    // Final check to ensure counts are non-negative and sum up correctly
    green = Math.max(0, Math.round(green));
    amber = Math.max(0, Math.round(amber));
    red = Math.max(0, Math.round(red));

    let currentTotal = green + amber + red;
    if (currentTotal !== projectCount) {
        // Adjust green first, then amber, then red to meet total
        green += (projectCount - currentTotal);
        if (green < 0) {
            amber += green;
            green = 0;
            if (amber < 0) {
                red += amber;
                amber = 0;
                if (red < 0) red = 0; // Should not happen
            }
        }
         // If over, reduce starting from red
        currentTotal = green + amber + red;
        if (currentTotal > projectCount) {
            const diff = currentTotal - projectCount;
            if (red >= diff) red -= diff;
            else {
                const remainingDiff = diff - red;
                red = 0;
                if (amber >= remainingDiff) amber -= remainingDiff;
                else {
                    const finalRemainingDiff = remainingDiff - amber;
                    amber = 0;
                    green -= finalRemainingDiff; // Green must absorb the rest
                }
            }
        }
    }
    
    // Final sanity check for counts
    green = Math.max(0, green);
    amber = Math.max(0, amber);
    red = Math.max(0, red);
    if (green + amber + red !== projectCount) {
        // If still not matching, assign all to green as a last resort (or handle error)
        // This indicates a flaw in the distribution logic for specific edge cases
        // For now, let's try to distribute the difference to green
        const finalDiff = projectCount - (green + amber + red);
        green += finalDiff;
        green = Math.max(0, green); // Ensure green is not negative
        // Re-check if green adjustment made total incorrect
        if (green + amber + red !== projectCount) {
           // Fallback if logic is still off: prioritize total, then green, amber, red
           red = projectCount - green - amber;
           if (red < 0) {
               amber += red; red = 0;
               if (amber < 0) { green += amber; amber = 0;}
           }
        }
    }


    return { green, amber, red };
};
