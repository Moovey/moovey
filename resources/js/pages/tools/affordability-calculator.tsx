import { Head } from '@inertiajs/react';
import { memo } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import AffordabilityCalculator from '@/components/tools/AffordabilityCalculator';

interface Props {
    savedResults?: any[];
}

export default function AffordabilityCalculatorPage({ savedResults = [] }: Props) {
    return (
        <>
            <Head title="Affordability Calculator - Moovey Tools">
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
                                Affordability Calculator
                            </h1>
                            
                            {/* Italic Subtitle */}
                            <h2 className="text-xl sm:text-2xl lg:text-3xl italic text-gray-600 font-normal leading-relaxed">
                                How much house can you afford?
                            </h2>
                            
                            {/* Description Paragraphs */}
                            <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl">
                                <p>
                                    Our <span className="font-semibold text-gray-800">Affordability Calculator</span> helps you determine the maximum house price you can afford based on your income, monthly debts, and down payment so that you can shop for homes within your budget.
                                </p>
                                
                                <p>
                                    Simply enter your financial details including your annual income, monthly debt payments, available down payment, and preferred interest rate to discover your home buying power.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tool Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        {/* Tool Component */}
                        <AffordabilityCalculator initialSavedResults={savedResults} />
                    </div>
                </section>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}