import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import GlobalHeader from '@/components/global-header';
import { useToolPreloader } from '@/hooks/use-tool-preloader';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';
const WelcomeFooterLazy = lazy(() => import('@/components/welcome/welcome-footer'));

export default function Tools() {
    
    // Performance monitoring
    const { measureToolSwitch } = usePerformanceMonitoring({
        enabled: import.meta.env.DEV
    });

    // Tool preloading
    const { preloadTool } = useToolPreloader();

    // Defer heavy hero background image on mobile; enable on larger screens after mount
    const [showHeroBgImage, setShowHeroBgImage] = useState(false);
    useEffect(() => {
        try {
            const saveData = (navigator as any)?.connection?.saveData;
            if (saveData) {
                setShowHeroBgImage(false);
                return;
            }
        } catch {}
        const isLarge = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false; // lg breakpoint
        if (isLarge) setShowHeroBgImage(true);
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

                <main role="main" itemScope itemType="https://schema.org/WebApplication">
                    {/* Small Header Banner - Fully Responsive */}
                <section 
                    className="pt-4 px-3 xs:pt-6 xs:px-4 sm:pt-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative bg-cover bg-center bg-no-repeat min-h-[360px] flex flex-col"
                    style={showHeroBgImage ? {
                        background: `linear-gradient(135deg, #8ae2eb 0%, #eafffe 100%), url('/images/tools-background.webp')`,
                        backgroundSize: 'cover, cover',
                        backgroundPosition: 'center, center',
                        backgroundRepeat: 'no-repeat, no-repeat',
                        backgroundBlendMode: 'overlay'
                    } : {
                        background: 'linear-gradient(135deg, #8ae2eb 0%, #eafffe 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
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
                        <picture>
                            <source srcSet="/images/tools-banner-small.webp" media="(max-width: 639px)" />
                            <source srcSet="/images/tools-banner.webp" media="(min-width: 640px)" />
                            <img 
                                src="/images/tools-banner.webp" 
                                alt="Moovey Tools Banner" 
                                width="1600"
                                height="400"
                                sizes="(max-width: 639px) 95vw, (max-width: 1024px) 85vw, 100vw"
                                loading="eager"
                                decoding="sync"
                                fetchPriority="high"
                                className="h-48 sm:h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 w-auto object-contain mx-auto drop-shadow-md"
                            />
                        </picture>
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
                                            {(() => {
                                                const srcMap: Record<string, { src: string; alt: string }>= {
                                                    mortgage: { src: '/images/Mortgage-Calculator.webp', alt: 'Mortgage Calculator' },
                                                    affordability: { src: '/images/Affordability-Calculator.webp', alt: 'Affordability Calculator' },
                                                    school: { src: '/images/School-Catchment-Map.webp', alt: 'School Catchment Map' },
                                                    volume: { src: '/images/Volume-Calculator.webp', alt: 'Volume Calculator' },
                                                    declutter: { src: '/images/Declutter-List.webp', alt: 'Declutter List' },
                                                };
                                                const chosen = srcMap[tool.icon] ?? { src: '/images/Volume-Calculator.webp', alt: tool.name };
                                                return (
                                                    <img
                                                        src={chosen.src}
                                                        alt={chosen.alt}
                                                        width="320"
                                                        height="240"
                                                        loading="lazy"
                                                        decoding="async"
                                                        sizes="(min-width: 1024px) 320px, 80vw"
                                                        className="w-full h-auto object-contain max-w-xs"
                                                    />
                                                );
                                            })()}
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
                                                    onMouseEnter={() => handleToolHover(index)}
                                                    className="text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-[#17B7C7] hover:bg-[#138994]"
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

                {/* Welcome Footer (lazy) */}
                <Suspense fallback={<div aria-hidden className="h-40" />}> 
                    <WelcomeFooterLazy />
                </Suspense>
            </div>
        </>
    );
}
