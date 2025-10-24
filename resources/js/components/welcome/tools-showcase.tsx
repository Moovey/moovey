import { memo, useMemo } from 'react';

interface Tool {
    id: string;
    name: string;
    description: string;
    color: string;
    bgColor: string;
    icon: string;
}

const ToolsShowcase = memo(() => {
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
            description: 'Discover how much house you can afford based on your income',
            color: 'green-500',
            bgColor: 'green-50',
            icon: 'calculator'
        },
        {
            id: 'school',
            name: 'School Catchment Map',
            description: 'Search for homes within specific school district boundaries',
            color: 'purple-500',
            bgColor: 'purple-50',
            icon: 'map'
        },
        {
            id: 'volume',
            name: 'Volume Calculator',
            description: 'Estimate the volume of your belongings for moving',
            color: 'orange-500',
            bgColor: 'orange-50',
            icon: 'box'
        },
        {
            id: 'declutter',
            name: 'Declutter List',
            description: 'Create a list to decide what to throw away, donate, or sell',
            color: 'pink-500',
            bgColor: 'pink-50',
            icon: 'trash'
        }
    ], []);

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
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-8 leading-tight">
                        Powerful <span className="text-[#17B7C7]">Moving Tools</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-600 max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto leading-relaxed px-4 sm:px-0">
                        Access our suite of professional-grade tools designed to simplify every aspect of your move.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
                    {tools.map((tool) => (
                        <div 
                            key={tool.id}
                            className={`bg-gradient-to-br from-${tool.bgColor} to-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center`}
                        >
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-18 2xl:h-18 bg-${tool.color} rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-8`}>
                                {renderIcon(tool.icon, "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-9 2xl:h-9 text-white")}
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3 lg:mb-4 xl:mb-5 2xl:mb-6 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-tight">{tool.name}</h4>
                            <p className="text-gray-600 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-8 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed">{tool.description}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8 sm:mt-10 md:mt-12 lg:mt-16 xl:mt-20 2xl:mt-24">
                    <a 
                        href="/tools"
                        className="bg-[#17B7C7] text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 xl:px-14 xl:py-7 2xl:px-16 2xl:py-8 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
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