import { Head } from '@inertiajs/react';
import { memo } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import MortgageCalculator from '@/components/tools/MortgageCalculator';

export default function MortgageCalculatorPage() {
    return (
        <>
            <Head title="Mortgage Calculator - Moovey Tools">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                {/* Tool Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="flex flex-col lg:flex-row">
                                {/* Left Section - Illustration */}
                                <div className="lg:w-1/3 p-8 flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fffe, #e6fdfc)' }}>
                                    {/* Background decorative elements */}
                                    <div className="absolute top-4 right-4 opacity-30" style={{ color: '#17B7C7' }}>
                                        <span className="text-2xl">✨</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 opacity-30" style={{ color: '#138994' }}>
                                        <span className="text-xl">🎯</span>
                                    </div>
                                    <div className="absolute top-1/2 left-1/4 opacity-20" style={{ color: '#17B7C7' }}>
                                        <span className="text-lg">💫</span>
                                    </div>
                                    
                                    {/* Tool Icon/Illustration */}
                                    <div className="text-center z-10">
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #17B7C7, #138994)' }}>
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M12 3l9 9-3 3v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6l-3-3 9-9z"/>
                                            </svg>
                                        </div>
                                        <div className="flex justify-center space-x-2">
                                            <span className="text-yellow-400 text-lg">⭐</span>
                                            <span className="text-lg" style={{ color: '#17B7C7' }}>🔧</span>
                                            <span className="text-lg" style={{ color: '#138994' }}>📊</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Content */}
                                <div className="lg:w-2/3 p-8 flex flex-col justify-center">
                                    <div className="mb-6">
                                        <h2 className="text-2xl lg:text-3xl font-bold mb-3" style={{ color: '#17B7C7' }}>
                                            Mortgage Calculator
                                        </h2>
                                        <p className="text-gray-600 text-lg leading-relaxed mb-4">
                                            Calculate monthly mortgage payments, interest rates, and loan terms to plan your home purchase budget.
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
                                </div>
                            </div>
                        </div>

                        {/* Tool Component */}
                        <div className="mt-8">
                            <MortgageCalculator />
                        </div>
                    </div>
                </section>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}