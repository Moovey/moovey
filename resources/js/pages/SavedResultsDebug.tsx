import { Head, Link } from '@inertiajs/react';
import GlobalHeader from '@/components/global-header';

export default function SavedResultsDebug({ savedResults }: { savedResults: any }) {
    console.log('SavedResults data:', savedResults);
    console.log('Type of savedResults:', typeof savedResults);
    console.log('savedResults keys:', savedResults ? Object.keys(savedResults) : 'null');
    
    return (
        <>
            <Head title="Debug - Saved Results">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">Debug Saved Results</h1>
                        
                        <div className="bg-gray-100 p-6 rounded-lg">
                            <h2 className="text-lg font-semibold mb-4">Raw Data Structure:</h2>
                            <pre className="text-sm overflow-auto">
                                {JSON.stringify(savedResults, null, 2)}
                            </pre>
                        </div>
                        
                        <div className="mt-6">
                            <Link
                                href="/tools"
                                className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors"
                            >
                                Back to Tools
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}