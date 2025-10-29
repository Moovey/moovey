import { memo, useMemo, useState, useEffect, useRef } from 'react';

interface Tool {
    id: string;
    name: string;
    description: string;
    color: string;
    bgColor: string;
    icon: string;
}

const ToolsShowcase = memo(() => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

    // Memoized tools data to prevent re-renders
    const tools: Tool[] = useMemo(() => [
        {
            id: 'mortgage',
            name: 'Mortgage Calculator',
            description: 'Calculate monthly mortgage payments, interest rates, and loan terms',
            color: 'blue-500',
            bgColor: 'blue-50',
            icon: 'home'
        },
        {
            id: 'affordability',
            name: 'Affordability Calculator',
            description: 'Work out how much you can afford',
            color: 'green-500',
            bgColor: 'green-50',
            icon: 'calculator'
        },
        {
            id: 'school',
            name: 'School Catchment Map',
            description: 'Research and plot school catchment areas',
            color: 'purple-500',
            bgColor: 'purple-50',
            icon: 'map'
        },
        {
            id: 'volume',
            name: 'Volume Calculator',
            description: 'Calculate the volume of the things you need to move',
            color: 'orange-500',
            bgColor: 'orange-50',
            icon: 'box'
        },
        {
            id: 'declutter',
            name: 'Declutter List',
            description: 'List the things you need to ditch, and find buyers through moovey',
            color: 'pink-500',
            bgColor: 'pink-50',
            icon: 'trash'
        }
    ], []);

    // Auto-scroll functionality
    useEffect(() => {
        if (!isUserInteracting) {
            autoScrollInterval.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % tools.length);
            }, 3000); // Auto-scroll every 3 seconds
        }

        return () => {
            if (autoScrollInterval.current) {
                clearInterval(autoScrollInterval.current);
            }
        };
    }, [isUserInteracting, tools.length]);

    // Handle manual navigation
    const handlePrevious = () => {
        setIsUserInteracting(true);
        setCurrentIndex((prevIndex) => (prevIndex - 1 + tools.length) % tools.length);
        setTimeout(() => setIsUserInteracting(false), 5000); // Resume auto-scroll after 5 seconds
    };

    const handleNext = () => {
        setIsUserInteracting(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % tools.length);
        setTimeout(() => setIsUserInteracting(false), 5000); // Resume auto-scroll after 5 seconds
    };

    const handleDotClick = (index: number) => {
        setIsUserInteracting(true);
        setCurrentIndex(index);
        setTimeout(() => setIsUserInteracting(false), 5000); // Resume auto-scroll after 5 seconds
    };

    const renderIcon = (iconType: string, className: string) => {
        const iconProps = {
            className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
            strokeWidth: 2
        };

        switch (iconType) {
            case 'home':
                return (
                    <svg {...iconProps}>
                        <path d="M3 21l18-18M12 3l9 9-3 3v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6l-3-3 9-9z"/>
                        <path d="M9 12h6m-6 4h6m-3-8h.01"/>
                    </svg>
                );
            case 'calculator':
                return (
                    <svg {...iconProps}>
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        <path d="M9 7h6m-6 10h6"/>
                    </svg>
                );
            case 'map':
                return (
                    <svg {...iconProps}>
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path d="M12 6V4l3 1.5L12 7 9 5.5 12 4v2z"/>
                    </svg>
                );
            case 'box':
                return (
                    <svg {...iconProps}>
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        <path d="M3 3h2m14 0h2M3 21h2m14 0h2M3 12h2m14 0h2"/>
                    </svg>
                );
            case 'trash':
                return (
                    <svg {...iconProps}>
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        <path d="M10 11v6m4-6v6m-7-9h10" />
                    </svg>
                );
            default:
                return (
                    <svg {...iconProps}>
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                );
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        Powerful <span className="text-[#17B7C7]">Moving Tools</span>
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Access our suite of professional-grade tools designed to simplify every aspect of your move.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative overflow-hidden">
                    {/* Navigation Arrows */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-105"
                        aria-label="Previous tool"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-105"
                        aria-label="Next tool"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Carousel Content */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {tools.map((tool) => (
                            <div 
                                key={tool.id}
                                className="w-full flex-shrink-0 px-4 sm:px-8"
                            >
                                <div className={`bg-gradient-to-br from-${tool.bgColor} to-white rounded-2xl p-8 sm:p-12 shadow-lg text-center max-w-2xl mx-auto`}>
                                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-${tool.color} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                                        {renderIcon(tool.icon, "w-8 h-8 sm:w-10 sm:h-10 text-white")}
                                    </div>
                                    <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">{tool.name}</h4>
                                    <p className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto">{tool.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {tools.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentIndex 
                                        ? 'bg-[#17B7C7] scale-125' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to tool ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="text-center mt-12">
                    <a 
                        href="/tools"
                        className="bg-[#17B7C7] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
                    >
                        Try Now
                    </a>
                </div>
            </div>
        </section>
    );
});

ToolsShowcase.displayName = 'ToolsShowcase';

export default ToolsShowcase;