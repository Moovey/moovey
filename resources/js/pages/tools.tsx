import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, Suspense, useCallback, useMemo, memo, ReactNode } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import ToolLoadingSkeleton from '@/components/tools/ToolLoadingSkeleton';
import ToolErrorBoundary from '@/components/tools/ToolErrorBoundary';
import { 
    LazyMortgageCalculator, 
    LazyAffordabilityCalculator, 
    LazySchoolCatchmentMap, 
    LazyVolumeCalculator, 
    LazyDeclutterList,
    useToolPreloader 
} from '@/hooks/use-tool-preloader';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';

// Memoized tool button component for better performance
const ToolButton = memo(({ 
    tool, 
    index, 
    isActive, 
    onClick, 
    onHover 
}: {
    tool: any;
    index: number;
    isActive: boolean;
    onClick: () => void;
    onHover: () => void;
}) => {
    const renderIcon = useCallback(() => {
        switch (tool.icon) {
            case 'mortgage':
                return (
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M12 3l9 9-3 3v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6l-3-3 9-9z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-3-8h.01"/>
                    </svg>
                );
            case 'affordability':
                return (
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 10h6"/>
                    </svg>
                );
            case 'school':
                return (
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4l3 1.5L12 7 9 5.5 12 4v2z"/>
                    </svg>
                );
            case 'volume':
                return (
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2m14 0h2M3 21h2m14 0h2M3 12h2m14 0h2"/>
                    </svg>
                );
            case 'declutter':
                return (
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6m4-6v6m-7-9h10" />
                    </svg>
                );
            default:
                return <div className="w-12 h-12 mx-auto">🔧</div>;
        }
    }, [tool.icon]);

    return (
        <button
            onClick={onClick}
            onMouseEnter={onHover}
            className={`flex-shrink-0 w-64 p-6 rounded-xl border-2 transition-all duration-200 text-center group ${
                isActive
                    ? 'bg-[#17B7C7] border-[#17B7C7] text-white transform scale-105 shadow-lg'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#17B7C7] hover:shadow-md hover:transform hover:scale-102'
            }`}
        >
            <div className={`mb-4 ${
                isActive ? 'text-white' : 'text-[#17B7C7]'
            }`}>
                {renderIcon()}
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
                isActive ? 'text-white' : 'text-gray-900'
            }`}>
                {tool.name}
            </h3>
            <p className={`text-sm leading-relaxed ${
                isActive ? 'text-white/90' : 'text-gray-600'
            }`}>
                {tool.description}
            </p>
            <div className={`mt-4 text-xs font-medium ${
                isActive ? 'text-white' : 'text-[#17B7C7]'
            }`}>
                {isActive ? 'Currently Active' : 'Click to Use'}
            </div>
        </button>
    );
});

ToolButton.displayName = 'ToolButton';

export default function Tools() {
    // Get URL parameters from Inertia
    const { url } = usePage();
    
    // Performance monitoring
    const { measureToolSwitch } = usePerformanceMonitoring({
        enabled: import.meta.env.DEV
    });

    // Tool preloading
    const { preloadTool, preloadAdjacentTools } = useToolPreloader();

    // Get initial tool index from URL or default to 0
    const getInitialToolIndex = useCallback(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const toolParam = urlParams.get('tool');
            if (toolParam) {
                const index = parseInt(toolParam, 10);
                return !isNaN(index) && index >= 0 && index <= 4 ? index : 0;
            }
        }
        return 0;
    }, []);

    const [activeToolIndex, setActiveToolIndex] = useState(getInitialToolIndex);

    // Memoized tools data
    const tools = useMemo(() => [
        {
            name: 'Mortgage Calculator',
            description: 'Calculate monthly mortgage payments, interest rates, and loan terms to plan your home purchase budget.',
            icon: 'mortgage'
        },
        {
            name: 'Affordability Calculator',
            description: 'Discover how much house you can afford based on your income, debts, and down payment amount.',
            icon: 'affordability'
        },
        {
            name: 'School Catchment Map',
            description: 'Search for homes within specific school district boundaries to secure the best education for your children.',
            icon: 'school'
        },
        {
            name: 'Volume Calculator',
            description: 'Estimate the volume of your belongings to determine the right moving truck size and moving costs.',
            icon: 'volume'
        },
        {
            name: 'Declutter List',
            description: 'Create a list of items to declutter. Decide what to throw away, donate, or sell on Moovey marketplace.',
            icon: 'declutter'
        }
    ], []);

    // Listen for URL parameter changes and update active tool
    useEffect(() => {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const toolParam = urlParams.get('tool');
        if (toolParam) {
            const index = parseInt(toolParam, 10);
            if (!isNaN(index) && index >= 0 && index <= 4) {
                setActiveToolIndex(index);
            }
        } else {
            setActiveToolIndex(0); // Default to first tool if no parameter
        }
    }, [url]);

    // Update URL when active tool changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tool', activeToolIndex.toString());
            window.history.replaceState({}, '', url.toString());
        }
    }, [activeToolIndex]);

    // Preload adjacent tools when tool changes
    useEffect(() => {
        preloadAdjacentTools(activeToolIndex);
    }, [activeToolIndex, preloadAdjacentTools]);

    // Handle tool switching with performance measurement
    const handleToolSwitch = useCallback((newIndex: number) => {
        if (newIndex === activeToolIndex) return;
        
        measureToolSwitch(tools[newIndex].name, () => {
            setActiveToolIndex(newIndex);
        });
    }, [activeToolIndex, tools, measureToolSwitch]);

    // Handle tool hover for preloading
    const handleToolHover = useCallback((toolIndex: number) => {
        preloadTool(toolIndex);
    }, [preloadTool]);

    // Memoized active tool component with error boundaries
    const renderActiveTool = useMemo(() => {
        const toolName = tools[activeToolIndex].name;
        
        const ToolWrapper = ({ children }: { children: ReactNode }) => (
            <ToolErrorBoundary>
                <Suspense fallback={<ToolLoadingSkeleton toolName={toolName} />}>
                    {children}
                </Suspense>
            </ToolErrorBoundary>
        );
        
        switch (activeToolIndex) {
            case 0:
                return (
                    <ToolWrapper>
                        <LazyMortgageCalculator />
                    </ToolWrapper>
                );
            case 1:
                return (
                    <ToolWrapper>
                        <LazyAffordabilityCalculator />
                    </ToolWrapper>
                );
            case 2:
                return (
                    <ToolWrapper>
                        <LazySchoolCatchmentMap />
                    </ToolWrapper>
                );
            case 3:
                return (
                    <ToolWrapper>
                        <LazyVolumeCalculator />
                    </ToolWrapper>
                );
            case 4:
                return (
                    <ToolWrapper>
                        <LazyDeclutterList />
                    </ToolWrapper>
                );
            default:
                return (
                    <ToolWrapper>
                        <LazyMortgageCalculator />
                    </ToolWrapper>
                );
        }
    }, [activeToolIndex, tools]);

    return (
        <>
            <Head title="Moovey Tools - Calculate Your Move">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                {/* Small Header Banner */}
                <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#17B7C7] to-[#1A237E]">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                            Moovey Tools
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base">
                            Choose a tool below to help calculate and plan your move
                        </p>
                    </div>
                </section>

                {/* Tools Carousel Section */}
                <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="overflow-x-auto pb-4">
                            <div className="flex gap-6 min-w-max px-4">
                                {tools.map((tool, index) => (
                                    <ToolButton
                                        key={index}
                                        tool={tool}
                                        index={index}
                                        isActive={activeToolIndex === index}
                                        onClick={() => handleToolSwitch(index)}
                                        onHover={() => handleToolHover(index)}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Scroll Indicator */}
                        <div className="flex justify-center mt-2">
                            <div className="flex space-x-2">
                                {tools.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleToolSwitch(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            activeToolIndex === index ? 'bg-[#17B7C7]' : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Tool Section */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                {tools[activeToolIndex].name}
                            </h2>
                            <div className="w-16 h-1 bg-[#17B7C7] mx-auto rounded-full"></div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                            {renderActiveTool}
                        </div>
                    </div>
                </section>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
