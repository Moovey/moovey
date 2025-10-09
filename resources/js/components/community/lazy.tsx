import { lazy, Suspense } from 'react';

// Lazy load non-critical components
const CommunityStats = lazy(() => import('./CommunityStats'));
const CommunityGuidelines = lazy(() => import('./CommunityGuidelines'));
const CommunityCTA = lazy(() => import('./CommunityCTA'));

// Loading fallback component
const LoadingSection = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse ${className}`}>
        <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
                </div>
                <div className="grid md:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-xl p-6">
                            <div className="h-12 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const GuidelinesLoading = () => (
    <div className="animate-pulse py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i}>
                            <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                            <div className="space-y-2">
                                {[...Array(5)].map((_, j) => (
                                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const CTALoading = () => (
    <div className="animate-pulse py-20 px-4 sm:px-6 lg:px-8 bg-gray-300">
        <div className="max-w-4xl mx-auto text-center">
            <div className="h-10 bg-gray-400 rounded w-96 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-400 rounded w-[600px] mx-auto mb-8"></div>
            <div className="h-12 bg-gray-400 rounded w-48 mx-auto"></div>
        </div>
    </div>
);

// Lazy-loaded components with loading states
export const LazyCommunityStats = () => (
    <Suspense fallback={<LoadingSection />}>
        <CommunityStats />
    </Suspense>
);

export const LazyCommunityGuidelines = () => (
    <Suspense fallback={<GuidelinesLoading />}>
        <CommunityGuidelines />
    </Suspense>
);

export const LazyCommunityCTA = () => (
    <Suspense fallback={<CTALoading />}>
        <CommunityCTA />
    </Suspense>
);

// Export original components for direct import if needed
export { default as CommunityHero } from './CommunityHero';
export { default as CommunityFeed } from './CommunityFeed';
export { 
    CommunityStats,
    CommunityGuidelines, 
    CommunityCTA 
};