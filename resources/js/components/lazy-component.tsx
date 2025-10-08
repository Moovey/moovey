import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyComponentProps {
    children: ReactNode;
    fallback?: ReactNode;
    rootMargin?: string;
    threshold?: number;
}

export default function LazyComponent({ 
    children, 
    fallback = null, 
    rootMargin = '100px',
    threshold = 0.1 
}: LazyComponentProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasLoaded) {
                    setIsVisible(true);
                    setHasLoaded(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin,
                threshold,
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [rootMargin, threshold, hasLoaded]);

    return (
        <div ref={elementRef}>
            {isVisible ? children : fallback}
        </div>
    );
}