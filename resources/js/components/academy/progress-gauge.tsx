import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface ProgressGaugeProps {
    totalLessons: number;
    completedLessons: number;
    isAuthenticated: boolean;
}

export default function ProgressGauge({ totalLessons, completedLessons, isAuthenticated }: ProgressGaugeProps) {
    // State for animated gauge progress
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number | null>(null);
    const fromRef = useRef<number>(0);

    // Smoothly animate progress when values change
    useEffect(() => {
        if (totalLessons <= 0) return;

        const target = Math.max(0, Math.min(1, completedLessons / totalLessons));
        const duration = 1200; // ms
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        // Start from current animated value for smooth transitions both up and down
        fromRef.current = animatedProgress;
        startRef.current = null;

        const tick = (ts: number) => {
            if (startRef.current === null) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const t = Math.min(1, elapsed / duration);
            const eased = easeOutCubic(t);
            const value = fromRef.current + (target - fromRef.current) * eased;
            setAnimatedProgress(value);
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [completedLessons, totalLessons]);

    return (
        <div className="inline-flex flex-col items-center bg-white rounded-xl sm:rounded-2xl px-4 sm:px-8 md:px-12 py-6 sm:py-8 shadow-lg border border-gray-200 mb-6 sm:mb-8 w-full max-w-sm mx-auto">
            {/* Gauge */}
            <div className="relative mb-3 sm:mb-4">
                <svg viewBox="0 0 200 120" className="w-40 h-20 xs:w-44 xs:h-22 sm:w-52 sm:h-28 md:w-60 md:h-32 lg:w-64 lg:h-34" shapeRendering="geometricPrecision">
                    {/* Background Arc */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="20"
                        strokeLinecap="round"
                    />

                    {/* Progress Arc - Dynamic based on animated progress */}
                    {totalLessons > 0 && animatedProgress > 0 && (
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#00BCD4"
                            strokeWidth="16"
                            strokeLinecap="round"
                            pathLength={100}
                            strokeDasharray="100"
                            strokeDashoffset={100 - animatedProgress * 100}
                            style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0, 188, 212, 0.3))'
                            }}
                        />
                    )}

                    {/* Needle - Animated */}
                    {totalLessons > 0 && (
                        <g>
                            {/* Needle shadow for depth */}
                            <line
                                x1="100"
                                y1="100"
                                x2={100 + 70 * Math.cos(Math.PI * animatedProgress - Math.PI) + 1}
                                y2={100 + 70 * Math.sin(Math.PI * animatedProgress - Math.PI) + 1}
                                stroke="rgba(0, 0, 0, 0.2)"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            
                            {/* Main needle */}
                            <line
                                x1="100"
                                y1="100"
                                x2={100 + 70 * Math.cos(Math.PI * animatedProgress - Math.PI)}
                                y2={100 + 70 * Math.sin(Math.PI * animatedProgress - Math.PI)}
                                stroke="#1F2937"
                                strokeWidth="6"
                                strokeLinecap="round"
                                style={{
                                    transition: 'none', // Remove transition since we're animating manually
                                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                                }}
                            />
                            
                            {/* Needle tip indicator */}
                            <circle 
                                cx={100 + 70 * Math.cos(Math.PI * animatedProgress - Math.PI)}
                                cy={100 + 70 * Math.sin(Math.PI * animatedProgress - Math.PI)}
                                r="4" 
                                fill="#00BCD4"
                                style={{
                                    transition: 'none', // Remove transition since we're animating manually
                                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                                }}
                            />
                        </g>
                    )}

                    {/* Needle center circle with enhanced styling */}
                    <circle cx="100" cy="100" r="14" fill="#1F2937" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }} />
                    <circle cx="100" cy="100" r="8" fill="#374151" />
                    <circle cx="100" cy="100" r="4" fill="#6B7280" />
                    
                    {/* Progress percentage text */}
                    <text 
                        x="100" 
                        y="85" 
                        textAnchor="middle" 
                        className="fill-gray-700 text-sm font-bold"
                        style={{ fontSize: '12px' }}
                    >
                        {Math.round(animatedProgress * 100)}%
                    </text>
                </svg>
            </div>

            {/* Progress details */}
            <div className="text-center w-full">
                <div className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                    {completedLessons} <span className="text-gray-500 text-lg xs:text-xl sm:text-2xl md:text-3xl">of</span> {totalLessons}
                </div>
                <div className="bg-gray-600 text-white text-xs xs:text-sm sm:text-sm md:text-base px-3 xs:px-4 py-1 sm:py-1.5 rounded-full font-medium">
                    Lessons Completed
                </div>
                {!isAuthenticated && (
                    <div className="mt-2 sm:mt-3 text-xs xs:text-sm text-amber-600 bg-amber-50 px-2 xs:px-3 py-1 sm:py-1.5 rounded-full">
                        <Link href="/login" className="hover:underline">
                            Sign in to track progress
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}