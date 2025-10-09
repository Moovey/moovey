import { lazy } from 'react';

// Lazy load components that are not immediately visible
export const LazyRecommendedServices = lazy(() => 
    import('@/components/trade-directory/RecommendedServices')
);

export const LazyArticlesSection = lazy(() => 
    import('@/components/trade-directory/ArticlesSection')
);

export const LazyFinalCTA = lazy(() => 
    import('@/components/trade-directory/FinalCTA')
);

export const LazyBusinessProfileView = lazy(() => 
    import('@/components/trade-directory/BusinessProfileView')
);

// Component wrapper with error boundary and loading fallback
export const LazyComponentWrapper = ({ 
    children, 
    fallback = <div className="animate-pulse bg-gray-200 h-32 rounded-lg" />,
    errorFallback = <div className="text-center text-gray-500 py-8">Failed to load component</div>
}: { 
    children: React.ReactNode;
    fallback?: React.ReactNode;
    errorFallback?: React.ReactNode;
}) => {
    return (
        <div className="lazy-component-wrapper">
            {children}
        </div>
    );
};