import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';

interface SavedResult {
    id: number;
    name: string;
    tool_type: string;
    tool_display_name: string;
    form_data: any;
    results: any;
    calculated_at: string;
}

interface SavedResultsProps {
    savedResults: {
        data: SavedResult[];
        links?: any[];
        meta?: any;
        total?: number;
        per_page?: number;
        current_page?: number;
        last_page?: number;
        from?: number;
        to?: number;
    };
}

export default function SavedResults({ savedResults }: SavedResultsProps) {
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [activeToasts, setActiveToasts] = useState<Set<string>>(new Set());

    // Performance optimization: Only log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('SavedResults pagination data:', {
            total: savedResults.meta?.total || savedResults.total,
            currentPage: savedResults.meta?.current_page || savedResults.current_page,
            lastPage: savedResults.meta?.last_page || savedResults.last_page
        });
    }

    // Safety check to ensure savedResults has the expected structure
    if (!savedResults || !savedResults.data) {
        return (
            <>
                <Head title="Saved Results - Moovey Tools">
                    <link rel="preconnect" href="https://fonts.bunny.net" />
                    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
                </Head>
                
                <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                    <GlobalHeader currentPage="tools" />
                    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Loading Error
                            </h2>
                            <p className="text-gray-600 mb-6">
                                There was an issue loading your saved results. Please try again.
                            </p>
                            <Link
                                href="/tools"
                                className="bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors"
                            >
                                Go to Tools
                            </Link>
                        </div>
                    </section>
                </div>
            </>
        );
    }

    const handleDelete = (id: number) => {
        const toastId = `delete-${id}`;
        
        // Prevent duplicate deletions
        if (deletingIds.has(id) || activeToasts.has(toastId)) {
            return;
        }
        
        setDeletingIds(prev => new Set(prev).add(id));
        setActiveToasts(prev => new Set(prev).add(toastId));
        
        router.delete(`/saved-results/${id}`, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setIsLoading(true),
            onSuccess: () => {
                if (!toast.isActive(toastId)) {
                    toast.success('Saved calculation deleted successfully! 🗑️', {
                        toastId: toastId,
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        onClose: () => {
                            setActiveToasts(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(toastId);
                                return newSet;
                            });
                        }
                    });
                }
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                const errorToastId = `error-${id}`;
                if (!toast.isActive(errorToastId)) {
                    toast.error('Failed to delete calculation. Please try again.', {
                        toastId: errorToastId,
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        onClose: () => {
                            setActiveToasts(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(errorToastId);
                                return newSet;
                            });
                        }
                    });
                }
            },
            onFinish: () => {
                setDeletingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
                setActiveToasts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(toastId);
                    return newSet;
                });
                setIsLoading(false);
            }
        });
    };

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'Unknown date';
            return new Date(dateString).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    const getToolIcon = (toolType: string) => {
        switch (toolType) {
            case 'mortgage': return '🏠';
            case 'affordability': return '📋';
            case 'volume': return '📦';
            case 'school-catchment': return '🔍';
            default: return '🔧';
        }
    };

    const getResultSummary = (toolType: string, results: any) => {
        if (!results) return 'No calculation available';
        
        try {
            switch (toolType) {
                case 'mortgage':
                    return results.monthlyPayment 
                        ? `£${results.monthlyPayment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month`
                        : 'No calculation available';
                case 'affordability':
                    return results.maxHousePrice 
                        ? `Max price: £${results.maxHousePrice.toLocaleString('en-GB')}`
                        : 'No calculation available';
                case 'volume':
                    return results.totalVolume 
                        ? `${results.totalVolume.toFixed(1)}m³ - ${results.recommendedTruck?.name || 'Unknown truck'}`
                        : 'No calculation available';
                case 'school-catchment':
                    return results.circles 
                        ? `${results.circles.length} circles - ${results.searchedAddress || 'Unknown location'}`
                        : 'No calculation available';
                default:
                    return 'Calculation result';
            }
        } catch (error) {
            console.error('Error formatting result summary:', error);
            return 'Calculation result';
        }
    };

    return (
        <>
            <Head title="Saved Results - Moovey Tools">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                {/* Header Section */}
                <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#17B7C7] mb-2">
                                    💾 SAVED RESULTS
                                </h1>
                                <p className="text-gray-600">
                                    View and manage your saved tool calculations
                                </p>
                            </div>
                            <Link
                                href="/tools"
                                className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors text-sm"
                            >
                                Back to Tools
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <div className="flex flex-col items-center">
                                <svg className="animate-spin h-8 w-8 text-[#17B7C7]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2 text-sm text-gray-600">Loading...</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="max-w-7xl mx-auto">
                        {(!savedResults.data || savedResults.data.length === 0) ? (
                            /* Empty State */
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📁</div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Saved Results Yet
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Start using our tools and save your calculations to see them here.
                                </p>
                                <Link
                                    href="/tools"
                                    className="bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors"
                                >
                                    Go to Tools
                                </Link>
                            </div>
                        ) : (
                            /* Results Grid */
                            <>
                                {/* Results Summary Header */}
                                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                                Your Saved Calculations
                                            </h2>
                                            <p className="text-gray-600">
                                                {savedResults.meta?.total || savedResults.total || savedResults.data.length} total calculations saved
                                                {(savedResults.meta?.last_page || savedResults.last_page || 1) > 1 && 
                                                    ` • Page ${savedResults.meta?.current_page || savedResults.current_page || 1} of ${savedResults.meta?.last_page || savedResults.last_page || 1}`
                                                }
                                            </p>
                                        </div>
                                        
                                        {/* Quick Stats & Actions */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-2 h-2 bg-[#17B7C7] rounded-full"></span>
                                                    <span>15 per page</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    <span>Auto-saved</span>
                                                </div>
                                            </div>
                                            
                                            {/* Performance indicator */}
                                            {(savedResults.meta?.total || savedResults.total || 0) > 15 && (
                                                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                                    📊 Optimized for {savedResults.meta?.total || savedResults.total} results
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {savedResults.data.map((result) => (
                                        <div
                                            key={result.id}
                                            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">
                                                        {getToolIcon(result.tool_type)}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-sm">
                                                            {result.tool_display_name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(result.calculated_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(result.id)}
                                                    disabled={deletingIds.has(result.id)}
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all duration-200 disabled:opacity-50"
                                                    title="Delete saved result (no confirmation required)"
                                                >
                                                    {deletingIds.has(result.id) ? (
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Title */}
                                            <h4 className="font-medium text-gray-900 mb-3 line-clamp-2">
                                                {result.name}
                                            </h4>

                                            {/* Summary */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-gray-700">
                                                    {getResultSummary(result.tool_type, result.results)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/saved-results/${result.id}`}
                                                    className="flex-1 bg-[#17B7C7] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#139AAA] transition-colors text-center"
                                                >
                                                    View Details
                                                </Link>
                                                <Link
                                                    href={`/tools?tool=${
                                                        result.tool_type === 'mortgage' ? '0' :
                                                        result.tool_type === 'affordability' ? '1' :
                                                        result.tool_type === 'school-catchment' ? '2' :
                                                        result.tool_type === 'volume' ? '3' : '0'
                                                    }`}
                                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                                >
                                                    Use Tool
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Enhanced Pagination */}
                                {(savedResults.meta?.last_page || savedResults.last_page || 1) > 1 && (
                                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        {/* Pagination Info */}
                                        <div className="text-sm text-gray-600">
                                            Showing {savedResults.meta?.from || savedResults.from || 1} to {' '}
                                            {savedResults.meta?.to || savedResults.to || savedResults.data.length} of {' '}
                                            {savedResults.meta?.total || savedResults.total || savedResults.data.length} results
                                        </div>

                                        {/* Pagination Links */}
                                        <div className="flex items-center space-x-1">
                                            {(savedResults.links || []).map((link: any, index: number) => {
                                                // Skip ellipsis and non-clickable items for cleaner look
                                                if (!link.url && !link.active) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 text-sm text-gray-400"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }

                                                return link.url ? (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                            link.active
                                                                ? 'bg-[#17B7C7] text-white shadow-md'
                                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-[#17B7C7] hover:text-white hover:border-[#17B7C7] hover:shadow-sm'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        preserveScroll
                                                    />
                                                ) : (
                                                    <span
                                                        key={index}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                            link.active
                                                                ? 'bg-[#17B7C7] text-white shadow-md'
                                                                : 'text-gray-400 cursor-not-allowed'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <WelcomeFooter />
            </div>


        </>
    );
}