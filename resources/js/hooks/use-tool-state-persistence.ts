import { useEffect, useRef, useState } from 'react';

interface UseToolStatePersistenceOptions {
    key: string;
    initialState: any;
    debounceMs?: number;
}

export function useToolStatePersistence<T>({
    key,
    initialState,
    debounceMs = 500
}: UseToolStatePersistenceOptions) {
    // Initialize state from localStorage if available
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') return initialState;
        
        try {
            const saved = localStorage.getItem(`moovey_tool_${key}`);
            return saved ? JSON.parse(saved) : initialState;
        } catch (error) {
            console.warn(`Failed to parse saved state for ${key}:`, error);
            return initialState;
        }
    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced save to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(`moovey_tool_${key}`, JSON.stringify(state));
            } catch (error) {
                console.warn(`Failed to save state for ${key}:`, error);
            }
        }, debounceMs);

        // Cleanup timeout on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [state, key, debounceMs]);

    // Clear saved state
    const clearSavedState = () => {
        if (typeof window === 'undefined') return;
        
        try {
            localStorage.removeItem(`moovey_tool_${key}`);
            setState(initialState);
        } catch (error) {
            console.warn(`Failed to clear saved state for ${key}:`, error);
        }
    };

    return [state, setState, clearSavedState] as const;
}