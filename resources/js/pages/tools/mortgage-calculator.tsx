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

                {/* Banner Section - Pip Value Calculator Style */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-left space-y-6">
                            {/* Main Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                                Mortgage Calculator
                            </h1>
                            
                            {/* Italic Subtitle */}
                            <h2 className="text-xl sm:text-2xl lg:text-3xl italic text-gray-600 font-normal leading-relaxed">
                                How much will your monthly mortgage payment be?
                            </h2>
                            
                            {/* Description Paragraphs */}
                            <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl">
                                <p>
                                    Our <span className="font-semibold text-gray-800">Mortgage Calculator</span> helps you estimate your monthly payments based on your loan amount, interest rate, and term so that you can better plan your home purchase budget.
                                </p>
                                
                                <p>
                                    Simply enter your loan details including the property price, down payment amount, interest rate, and loan term to get an overview of your expected payments and total loan cost.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tool Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        {/* Tool Component */}
                        <MortgageCalculator />
                    </div>
                </section>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}