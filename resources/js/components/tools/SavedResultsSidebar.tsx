import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { usePage } from '@inertiajs/react';

interface SavedResult {
    id: string;
    name: string;
    tool_type: string;
    results: any;
    form_data: any;
    created_at: string;
    updated_at: string;
}

interface SavedResultsSidebarProps {
    toolType: string;
    className?: string;
    initialSavedResults?: SavedResult[]; // Optional prop for Inertia approach
}

export default function SavedResultsSidebar({ toolType, className = '', initialSavedResults }: SavedResultsSidebarProps) {
    const { props } = usePage();
    const sharedSavedResults = (props as any).savedResults as SavedResult[] | undefined;
    
    // Use shared results if available, otherwise use initial results
    const [savedResults, setSavedResults] = useState<SavedResult[]>(
        sharedSavedResults || initialSavedResults || []
    );
    const [loading, setLoading] = useState(!initialSavedResults && !sharedSavedResults);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Update local state when shared results change (real-time updates)
        if (sharedSavedResults) {
            // Filter results by tool type since shared results might contain all types
            const filteredResults = sharedSavedResults.filter(result => result.tool_type === toolType);
            setSavedResults(filteredResults);
            setLoading(false);
        } else if (!initialSavedResults) {
            // Only fetch if no initial results or shared results provided
            fetchSavedResults();
        }
    }, [toolType, initialSavedResults, sharedSavedResults]);

    const fetchSavedResults = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`/api/saved-results?tool_type=${toolType}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch saved results: ${response.status}`);
            }
            
            const data = await response.json();
            setSavedResults(data.data || []);
        } catch (err) {
            console.error('Error fetching saved results:', err);
            setError('Failed to load saved calculations');
        } finally {
            setLoading(false);
        }
    };

    const deleteSavedResult = async (id: string) => {
        try {
            const response = await fetch(`/api/saved-results/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to delete calculation');
            }

            const data = await response.json();
            if (data.success) {
                // Remove from local state
                setSavedResults(prev => prev.filter(result => result.id !== id));
                toast.success('Calculation deleted successfully');
            } else {
                toast.error('Failed to delete calculation');
            }
        } catch (err) {
            console.error('Error deleting saved result:', err);
            toast.error('Failed to delete calculation');
        }
    };

    const formatResult = (result: SavedResult) => {
        switch (result.tool_type) {
            case 'mortgage':
                return {
                    title: `£${result.results.monthlyPayment?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / month`,
                    subtitle: `Total Interest: £${result.results.totalInterest?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    details: `Total Payment: £${result.results.totalAmount?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                };
            case 'affordability':
                return {
                    title: `Max House: £${result.results.maxHousePrice?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    subtitle: `Max Loan: £${result.results.maxLoanAmount?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                    details: `Monthly: £${result.results.maxMonthlyPayment?.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} | Housing: ${result.results.housingToIncomeRatio?.toFixed(1)}% | Debt: ${result.results.debtToIncomeRatio?.toFixed(1)}%`
                };
            case 'volume':
                const roomsText = result.results.roomBreakdown?.length > 0 
                    ? `${result.results.roomBreakdown.length} rooms: ${result.results.roomBreakdown.map((room: any) => room.name).join(', ')}`
                    : 'No rooms';
                return {
                    title: `Volume: ${result.results.totalVolume?.toFixed(1)} m³`,
                    subtitle: `Truck: ${result.results.recommendedTruck?.name || 'N/A'} - £${result.results.recommendedTruck?.price || '0'}`,
                    details: roomsText
                };
            default:
                return {
                    title: 'Saved Calculation',
                    subtitle: new Date(result.created_at).toLocaleDateString(),
                    details: ''
                };
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Saved Calculations</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Saved Calculations</h3>
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Saved Calculations</h3>
                {savedResults.length > 0 && (
                    <span className="text-xs text-gray-500">{savedResults.length} saved</span>
                )}
            </div>

            {savedResults.length === 0 ? (
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-500">No saved calculations yet</p>
                    <p className="text-xs text-gray-400 mt-1">Save your calculations to view them here</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {savedResults.map((result) => {
                        const formatted = formatResult(result);
                        
                        // Special detailed view for volume calculations
                        if (result.tool_type === 'volume') {
                            return (
                                <div key={result.id} className="group border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 mb-1">
                                                {result.name}
                                            </p>
                                            <p className="text-sm font-bold text-blue-600">
                                                Total Volume: {result.results.totalVolume?.toFixed(1)} m³
                                            </p>
                                            <div className="flex gap-3 mt-1">
                                                <p className="text-xs text-gray-600">
                                                    Furniture: {result.results.furnitureVolume?.toFixed(1) || '0.0'} m³
                                                </p>
                                                {result.results.totalBoxes > 0 && (
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        📦 {result.results.totalBoxes} boxes ({result.results.boxVolume?.toFixed(1) || '0.0'} m³)
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-xs text-blue-600 font-medium mt-1">
                                                {result.results.recommendedTruck?.name || 'No truck'}
                                            </p>
                                            <p className="text-xs text-green-600 font-medium">
                                                Est. Cost: £{result.results.recommendedTruck?.price || '0'}
                                            </p>
                                            
                                            {result.results.roomBreakdown?.length > 0 && (
                                                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                                    <p className="text-xs font-medium text-gray-700">Rooms & Items:</p>
                                                    {result.results.roomBreakdown.map((room: any, idx: number) => (
                                                        <div key={idx} className="text-xs text-gray-600">
                                                            <p className="font-medium text-gray-700">
                                                                {room.name}
                                                                {room.boxCount > 0 && (
                                                                    <span className="text-blue-600 ml-1">
                                                                        (📦 {room.boxCount} boxes - {room.boxVolume?.toFixed(2) || '0.00'} m³)
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <div className="ml-2 mt-1 mb-2">
                                                                {room.items?.slice(0, 4).map((item: any, itemIdx: number) => (
                                                                    <div key={itemIdx} className="text-xs text-gray-500">
                                                                        • {item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                                                                    </div>
                                                                ))}
                                                                {room.items?.length > 4 && (
                                                                    <div className="text-xs text-gray-400">
                                                                        +{room.items.length - 4} more items
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(result.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => deleteSavedResult(result.id)}
                                            className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-all"
                                            title="Delete calculation"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        }
                        
                        // Standard view for other calculation types
                        return (
                            <div key={result.id} className="group border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                                            {result.name}
                                        </p>
                                        <p className="text-sm font-medium text-blue-600 truncate">
                                            {formatted.title}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">
                                            {formatted.subtitle}
                                        </p>
                                        {formatted.details && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatted.details}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(result.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteSavedResult(result.id)}
                                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-all"
                                        title="Delete calculation"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}