import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import MortgageCalculator from '@/components/tools/MortgageCalculator';
import AffordabilityCalculator from '@/components/tools/AffordabilityCalculator';
import SchoolCatchmentMap from '@/components/tools/SchoolCatchmentMap';
import VolumeCalculator from '@/components/tools/VolumeCalculator';

export default function Tools() {
    // Get initial tool index from URL or default to 0
    const getInitialToolIndex = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const toolParam = urlParams.get('tool');
            if (toolParam) {
                const index = parseInt(toolParam, 10);
                return !isNaN(index) && index >= 0 && index <= 3 ? index : 0;
            }
        }
        return 0;
    };

    const [activeToolIndex, setActiveToolIndex] = useState(getInitialToolIndex);

    // Update URL when active tool changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tool', activeToolIndex.toString());
            window.history.replaceState({}, '', url.toString());
        }
    }, [activeToolIndex]);

    const tools = [
        {
            name: 'Mortgage Calculator',
            description: 'Estimate your monthly mortgage payments based on factors such as loan amount, interest rate, loan term, and down payment.',
            icon: '🏠'
        },
        {
            name: 'Affordability Calculator',
            description: 'Determine how much house you can afford based on your income, expenses, and financial goals.',
            icon: '📋'
        },
        {
            name: 'School Catchment Map',
            description: 'Find properties within specific school catchment areas to ensure your children get the best education.',
            icon: '🔍'
        },
        {
            name: 'Volume Calculator',
            description: 'Calculate the volume of your belongings to estimate moving truck size and costs.',
            icon: '📦'
        }
    ];

    const renderActiveTool = () => {
        switch (activeToolIndex) {
            case 0:
                return <MortgageCalculator />;
            case 1:
                return <AffordabilityCalculator />;
            case 2:
                return <SchoolCatchmentMap />;
            case 3:
                return <VolumeCalculator />;
            default:
                return <MortgageCalculator />;
        }
    };

    return (
        <>
            <Head title="Moovey Tools - Calculate Your Move">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                {/* Hero Section */}
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                            {/* Left Side Content */}
                            <div className="text-center lg:text-left order-2 lg:order-1">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#17B7C7] mb-4 sm:mb-6 leading-tight">
                                    YOUR MOOVEY TOOLS
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
                                    Calculate your move with our helpful moving tools
                                </p>
                                <button className="border-2 border-[#17B7C7] text-[#17B7C7] px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-[#17B7C7] hover:text-white transition-colors text-sm sm:text-base">
                                    Browse Tools
                                </button>
                            </div>

                            {/* Right Side Visual */}
                            <div className="relative flex justify-center order-1 lg:order-2">
                                {/* Main Mascot Image */}
                                <div className="relative">
                                    <img 
                                        src="/images/tools-mascot.webp" 
                                        alt="Moovey Tools Mascot" 
                                        className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[30rem] lg:h-[30rem] object-cover"
                                        onError={(e) => {
                                            // Fallback to emoji if image fails to load
                                            e.currentTarget.style.display = 'none';
                                            if (e.currentTarget.nextElementSibling) {
                                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                            }
                                        }}
                                    />
                                    {/* Fallback content if image fails to load */}
                                    <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[30rem] lg:h-[30rem] flex items-center justify-center text-gray-400 text-4xl sm:text-6xl md:text-8xl" style={{display: 'none'}}>
                                        🐄
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tool Navigation Icons */}
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-8 sm:mt-12">
                            {tools.map((tool, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveToolIndex(index)}
                                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center text-lg sm:text-xl md:text-2xl transition-colors ${
                                        activeToolIndex === index
                                            ? 'bg-[#17B7C7] border-[#17B7C7] text-white'
                                            : 'bg-white border-gray-300 text-gray-600 hover:border-[#17B7C7] hover:text-[#17B7C7]'
                                    }`}
                                >
                                    {tool.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Tool Section */}
                <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {tools[activeToolIndex].name}
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                                {tools[activeToolIndex].description}
                            </p>
                        </div>

                        {renderActiveTool()}
                    </div>
                </section>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
