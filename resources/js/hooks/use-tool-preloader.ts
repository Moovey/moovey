import { lazy, useRef } from 'react';

// Import functions for preloading
const importMortgage = () => import('@/components/tools/MortgageCalculatorOptimized');
const importAffordability = () => import('@/components/tools/AffordabilityCalculator');
const importSchool = () => import('@/components/tools/SchoolCatchmentMap');
const importVolume = () => import('@/components/tools/VolumeCalculator');
const importDeclutter = () => import('@/components/tools/DeclutterList');

// Lazy-loaded tool components
export const LazyMortgageCalculator = lazy(importMortgage);
export const LazyAffordabilityCalculator = lazy(importAffordability);
export const LazySchoolCatchmentMap = lazy(importSchool);
export const LazyVolumeCalculator = lazy(importVolume);
export const LazyDeclutterList = lazy(importDeclutter);

// Import functions mapping for preloading
const toolImports = [
    importMortgage,
    importAffordability,
    importSchool,
    importVolume,
    importDeclutter,
];

export function useToolPreloader() {
    const preloadedTools = useRef<Set<number>>(new Set());

    const preloadTool = (toolIndex: number) => {
        if (preloadedTools.current.has(toolIndex) || toolIndex < 0 || toolIndex >= toolImports.length) {
            return;
        }

        // Mark as preloaded to avoid duplicate requests
        preloadedTools.current.add(toolIndex);

        // Preload the component by calling its import function
        const importFn = toolImports[toolIndex];
        if (importFn) {
            // This triggers the module loading and caches it
            importFn().catch(error => {
                console.warn(`Failed to preload tool ${toolIndex}:`, error);
                // Remove from preloaded set on error so it can be retried
                preloadedTools.current.delete(toolIndex);
            });
        }
    };

    const preloadAdjacentTools = (currentIndex: number) => {
        // Preload previous tool
        if (currentIndex > 0) {
            preloadTool(currentIndex - 1);
        }
        
        // Preload next tool
        if (currentIndex < toolImports.length - 1) {
            preloadTool(currentIndex + 1);
        }
    };

    return {
        preloadTool,
        preloadAdjacentTools,
        isPreloaded: (toolIndex: number) => preloadedTools.current.has(toolIndex),
    };
}