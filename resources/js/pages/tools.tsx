import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import { useToolPreloader } from '@/hooks/use-tool-preloader';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';
import Breadcrumb from '@/components/Breadcrumb';

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



    // Handle tool hover for preloading
    const handleToolHover = useCallback((toolIndex: number) => {
        preloadTool(toolIndex);
    }, [preloadTool]);

    // Navigate to dedicated tool page
    const navigateToTool = useCallback((toolIndex: number) => {
        const toolRoutes = [
            '/tools/mortgage-calculator',
            '/tools/affordability-calculator', 
            '/tools/school-catchment-map',
            '/tools/volume-calculator',
            '/tools/declutter-list'
        ];
        
        if (toolRoutes[toolIndex]) {
            router.visit(toolRoutes[toolIndex]);
        }
    }, []);



    return (
        <>
            <Head title="Moovey Tools - Calculate Your Move">
                {/* SEO Meta Tags */}
                <meta name="description" content="Free moving calculators and tools to plan your perfect move. Calculate mortgage affordability, moving costs, volume requirements, and explore school catchment areas. Professional-grade tools for UK house movers." />
                <meta name="keywords" content="moving calculator, mortgage calculator, affordability calculator, volume calculator, school catchment map, declutter list, moving tools, UK moving, house moving calculator, free moving tools" />
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph Meta Tags */}
                <meta property="og:title" content="Moovey Tools - Calculate Your Move" />
                <meta property="og:description" content="Free moving calculators and tools to plan your perfect move. Calculate costs, volume, and explore school catchments." />
                <meta property="og:image" content="/images/tools-banner.webp" />
                <meta property="og:url" content="https://moovey.com/tools" />
                <meta property="og:type" content="website" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Moovey Tools - Calculate Your Move" />
                <meta name="twitter:description" content="Free moving calculators and tools to plan your perfect move." />
                <meta name="twitter:image" content="/images/tools-banner.webp" />
                
                {/* Canonical URL */}
                <link rel="canonical" href="https://moovey.com/tools" />
                
                {/* Structured Data - WebApplication */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Moovey Moving Tools",
                        "description": "Suite of professional moving calculators and planning tools",
                        "url": "https://moovey.com/tools",
                        "applicationCategory": "UtilityApplication",
                        "operatingSystem": "Web Browser",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "GBP"
                        },
                        "featureList": [
                            "Mortgage Calculator",
                            "Affordability Calculator", 
                            "School Catchment Map",
                            "Volume Calculator",
                            "Declutter List"
                        ]
                    })}
                </script>
                
                {/* Font Loading */}
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap" rel="stylesheet" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                {/* Breadcrumb */}
                <div className="bg-gray-50 py-3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Breadcrumb items={[
                            { name: 'Home', href: '/' },
                            { name: 'Tools', current: true }
                        ]} />
                    </div>
                </div>

                <main role="main" itemScope itemType="https://schema.org/WebApplication">
                    {/* Small Header Banner - Fully Responsive */}
                <section 
                    className="pt-4 px-3 xs:pt-6 xs:px-4 sm:pt-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative bg-cover bg-center bg-no-repeat min-h-[360px] flex flex-col"
                    style={{
                        background: `linear-gradient(135deg, #8ae2eb 0%, #eafffe 100%), url('/images/tools-background.webp')`,
                        backgroundSize: 'cover, cover',
                        backgroundPosition: 'center, center',
                        backgroundRepeat: 'no-repeat, no-repeat',
                        backgroundBlendMode: 'overlay'
                    }}
                >
                    {/* Text Content Container with horizontal padding only */}
                    <div className="max-w-7xl mx-auto w-full relative z-10 flex-grow flex flex-col">
                        {/* Text Content at Top Left - Compact Responsive */}
                        <div className="text-left pt-2 xs:pt-3 sm:pt-4 md:pt-6 lg:pt-8">
                            <div className="inline-block bg-white/30 backdrop-blur-lg rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-700 mb-1 sm:mb-2 tracking-tight leading-tight" 
                                    style={{ 
                                        fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: '900',
                                        textShadow: '2px 2px 0px rgba(255,255,255,0.3), 4px 4px 0px rgba(255,255,255,0.1)',
                                        transform: 'rotate(-1.5deg)'
                                    }}
                                >
                                    <span className="inline-block">Explore Our Moovey Tools</span>
                                </h1>
                            </div>
                        </div>
                        
                        {/* Compact Spacer to push image to bottom */}
                        <div className="flex-grow min-h-[10px] sm:min-h-[15px]"></div>
                    </div>
                    
                    {/* Banner Image at Absolute Bottom - Mobile Compact, Desktop Large */}
                    <div className="w-full flex justify-center items-center absolute bottom-0 left-0 right-0">
                        {/* Mobile Banner Image */}
                        <img 
                            src="/images/tools-banner-small.webp" 
                            alt="Moovey Tools Banner" 
                            className="sm:hidden h-64 xs:h-72 w-auto object-contain max-w-[95%] block mx-auto"
                            style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                            }}
                        />
                        {/* Desktop Banner Image */}
                        <img 
                            src="/images/tools-banner.webp" 
                            alt="Moovey Tools Banner" 
                            className="hidden sm:block h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 w-auto object-contain max-w-[90%] md:max-w-[85%] lg:max-w-full mx-auto"
                            style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                            }}
                        />
                    </div>
                </section>

                    {/* Tools Cards Section */}
                    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="space-y-8">
                            {tools.map((tool, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                                >
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Left Section - Tool Image */}
                                        <div className="lg:w-1/3 p-4 flex items-center justify-center bg-white">
                                            {tool.icon === 'mortgage' && (
                                                <img 
                                                    src="/images/Mortgage-Calculator.webp" 
                                                    alt="Mortgage Calculator" 
                                                    width="320"
                                                    height="240"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-auto object-contain max-w-xs"
                                                />
                                            )}
                                            {tool.icon === 'affordability' && (
                                                <img 
                                                    src="/images/Affordability-Calculator.webp" 
                                                    alt="Affordability Calculator" 
                                                    width="320"
                                                    height="240"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-auto object-contain max-w-xs"
                                                />
                                            )}
                                            {tool.icon === 'school' && (
                                                <img 
                                                    src="/images/School-Catchment-Map.webp" 
                                                    alt="School Catchment Map" 
                                                    width="320"
                                                    height="240"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-auto object-contain max-w-xs"
                                                />
                                            )}
                                            {tool.icon === 'volume' && (
                                                <img 
                                                    src="/images/Volume-Calculator.webp" 
                                                    alt="Volume Calculator" 
                                                    width="320"
                                                    height="240"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-auto object-contain max-w-xs"
                                                />
                                            )}
                                            {tool.icon === 'declutter' && (
                                                <img 
                                                    src="/images/Declutter-List.webp" 
                                                    alt="Declutter List" 
                                                    width="320"
                                                    height="240"
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-auto object-contain max-w-xs"
                                                />
                                            )}
                                        </div>

                                        {/* Right Section - Content */}
                                        <div className="lg:w-2/3 p-8 flex flex-col justify-center">
                                            <div className="mb-6">
                                                <h2 className="text-2xl lg:text-3xl font-bold mb-3" style={{ color: '#17B7C7' }}>
                                                    {tool.name}
                                                </h2>
                                                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                                    {tool.description}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#17B7C7', color: 'white' }}>
                                                        Free Tool
                                                    </span>
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                        Instant Results
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <button
                                                    onClick={() => navigateToTool(index)}
                                                    onMouseEnter={(e) => {
                                                        handleToolHover(index);
                                                        (e.target as HTMLElement).style.backgroundColor = '#138994';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.target as HTMLElement).style.backgroundColor = '#17B7C7';
                                                    }}
                                                    className="text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                                    style={{ backgroundColor: '#17B7C7' }}
                                                >
                                                    Give it a try! 🚀
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    </section>
                </main>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
