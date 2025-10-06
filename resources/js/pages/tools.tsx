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
                                {tools.map((tool, index) => {
                                    const renderIcon = () => {
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
                                            default:
                                                return <div className="w-12 h-12 mx-auto">🔧</div>;
                                        }
                                    };

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setActiveToolIndex(index)}
                                            className={`flex-shrink-0 w-64 p-6 rounded-xl border-2 transition-all duration-200 text-center group ${
                                                activeToolIndex === index
                                                    ? 'bg-[#17B7C7] border-[#17B7C7] text-white transform scale-105 shadow-lg'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#17B7C7] hover:shadow-md hover:transform hover:scale-102'
                                            }`}
                                        >
                                            <div className={`mb-4 ${
                                                activeToolIndex === index ? 'text-white' : 'text-[#17B7C7]'
                                            }`}>
                                                {renderIcon()}
                                            </div>
                                            <h3 className={`text-lg font-semibold mb-2 ${
                                                activeToolIndex === index ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {tool.name}
                                            </h3>
                                            <p className={`text-sm leading-relaxed ${
                                                activeToolIndex === index ? 'text-white/90' : 'text-gray-600'
                                            }`}>
                                                {tool.description}
                                            </p>
                                            <div className={`mt-4 text-xs font-medium ${
                                                activeToolIndex === index ? 'text-white' : 'text-[#17B7C7]'
                                            }`}>
                                                {activeToolIndex === index ? 'Currently Active' : 'Click to Use'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {/* Scroll Indicator */}
                        <div className="flex justify-center mt-2">
                            <div className="flex space-x-2">
                                {tools.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveToolIndex(index)}
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
                            {renderActiveTool()}
                        </div>
                    </div>
                </section>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}
