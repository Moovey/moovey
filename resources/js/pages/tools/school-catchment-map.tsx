import { Head } from '@inertiajs/react';
import { memo } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import SchoolCatchmentMap from '@/components/tools/SchoolCatchmentMap';

export default function SchoolCatchmentMapPage() {
    return (
        <>
            <Head title="School Catchment Map - Moovey Tools">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                {/* Banner Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-left space-y-6">
                            {/* Main Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                                School Catchment Map
                            </h1>
                            
                            {/* Italic Subtitle */}
                            <h2 className="text-xl sm:text-2xl lg:text-3xl italic text-gray-600 font-normal leading-relaxed">
                                Find homes within your preferred school district boundaries
                            </h2>
                            
                            {/* Description Paragraphs */}
                            <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl">
                                <p>
                                    Our <span className="font-semibold text-gray-800">School Catchment Map</span> helps you search for homes within specific school district boundaries to secure the best education for your children.
                                </p>
                                
                                <p>
                                    Simply search for schools or areas to see the catchment boundaries and find properties that guarantee enrollment in your preferred educational institutions.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tool Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        {/* Tool Component */}
                        <SchoolCatchmentMap />
                    </div>
                </section>

                {/* Welcome Footer */}
                <WelcomeFooter />
            </div>
        </>
    );
}