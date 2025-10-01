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
    created_at: string;
}

interface SavedResultDetailProps {
    savedResult: SavedResult;
}

export default function SavedResultDetail({ savedResult }: SavedResultDetailProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        
        router.delete(`/saved-results/${savedResult.id}`, {
            onSuccess: () => {
                toast.success('Calculation deleted successfully! Redirecting...', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true
                });
                
                // Redirect after showing toast
                setTimeout(() => {
                    router.visit('/saved-results');
                }, 1500);
            },
            onError: (errors) => {
                console.error('Delete failed:', errors);
                toast.error('Failed to delete calculation. Please try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    const renderMortgageResults = (results: any, formData: any) => (
        <div className="space-y-6">
            {/* Main Result */}
            <div className="bg-[#17B7C7] text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Monthly Payment</h3>
                <p className="text-3xl font-bold">
                    £{results.monthlyPayment?.toLocaleString('en-GB', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }) || 'N/A'}
                </p>
            </div>

            {/* Input Parameters */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Loan Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Loan Amount:</span>
                        <p className="font-medium">£{parseFloat(formData.loanAmount || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Interest Rate:</span>
                        <p className="font-medium">{formData.interestRate || 'N/A'}%</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Loan Term:</span>
                        <p className="font-medium">{formData.loanTerm || 'N/A'} years</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Down Payment:</span>
                        <p className="font-medium">£{parseFloat(formData.downPayment || '0').toLocaleString('en-GB')}</p>
                    </div>
                </div>
            </div>

            {/* Results Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Total Interest</h5>
                    <p className="text-lg font-bold text-orange-600">
                        £{results.totalInterest?.toLocaleString('en-GB', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                        }) || 'N/A'}
                    </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Total Amount</h5>
                    <p className="text-lg font-bold text-gray-900">
                        £{results.totalAmount?.toLocaleString('en-GB', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                        }) || 'N/A'}
                    </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-1">LTV Ratio</h5>
                    <p className="text-lg font-bold text-blue-600">
                        {results.loanToValue?.toFixed(1) || 'N/A'}%
                    </p>
                </div>
            </div>
        </div>
    );

    const renderAffordabilityResults = (results: any, formData: any) => (
        <div className="space-y-6">
            {/* Main Result */}
            <div className="bg-[#17B7C7] text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Maximum House Price</h3>
                <p className="text-3xl font-bold">
                    £{results.maxHousePrice?.toLocaleString('en-GB') || 'N/A'}
                </p>
            </div>

            {/* Input Parameters */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Financial Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Annual Income:</span>
                        <p className="font-medium">£{parseFloat(formData.grossAnnualIncome || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Monthly Debt:</span>
                        <p className="font-medium">£{parseFloat(formData.monthlyDebtPayments || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Down Payment:</span>
                        <p className="font-medium">£{parseFloat(formData.downPayment || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Interest Rate:</span>
                        <p className="font-medium">{formData.interestRate || 'N/A'}%</p>
                    </div>
                </div>
            </div>

            {/* Financial Ratios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Housing-to-Income Ratio</h5>
                    <p className="text-2xl font-bold text-green-600">
                        {results.housingToIncomeRatio?.toFixed(1) || 'N/A'}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        {(results.housingToIncomeRatio || 0) <= 28 ? 'Good ratio' : 'Recommended: ≤28%'}
                    </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Debt-to-Income Ratio</h5>
                    <p className="text-2xl font-bold text-purple-600">
                        {results.debtToIncomeRatio?.toFixed(1) || 'N/A'}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        {(results.debtToIncomeRatio || 0) <= 36 ? 'Good ratio' : 'Recommended: ≤36%'}
                    </p>
                </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">💡 Recommendations</h4>
                    <ul className="space-y-2">
                        {results.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start text-sm">
                                <span className="text-amber-600 mr-2">•</span>
                                <span className="text-gray-700">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderVolumeResults = (results: any, formData: any) => (
        <div className="space-y-6">
            {/* Main Result */}
            <div className="bg-[#17B7C7] text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Total Volume & Recommended Truck</h3>
                <p className="text-2xl font-bold mb-2">
                    {results.totalVolume?.toFixed(1) || 'N/A'} m³
                </p>
                <p className="text-lg">
                    🚚 {results.recommendedTruck?.name || 'N/A'} - {results.recommendedTruck?.price || 'N/A'}
                </p>
            </div>

            {/* Room Breakdown */}
            {results.roomBreakdown && (
                <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Room Breakdown</h4>
                    <div className="space-y-4">
                        {results.roomBreakdown.map((room: any, index: number) => (
                            <div key={index} className="border-l-4 border-[#17B7C7] pl-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium text-gray-900">{room.name}</h5>
                                    <span className="text-sm font-semibold text-[#17B7C7]">
                                        {room.totalVolume?.toFixed(1) || '0'} m³
                                    </span>
                                </div>
                                {room.items && room.items.length > 0 && (
                                    <div className="space-y-1">
                                        {room.items.map((item: any, itemIndex: number) => (
                                            <div key={itemIndex} className="flex justify-between text-sm text-gray-600">
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>{item.volume?.toFixed(1) || '0'} m³</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderSchoolCatchmentResults = (results: any, formData: any) => (
        <div className="space-y-6">
            {/* Main Result */}
            <div className="bg-[#17B7C7] text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">School Catchment Analysis</h3>
                <p className="text-lg mb-2">📍 {results.searchedAddress || 'Unknown location'}</p>
                <p className="text-2xl font-bold">{results.totalCircles || 0} radius circles analyzed</p>
            </div>

            {/* Summary */}
            {results.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Primary Schools</h5>
                        <p className="text-2xl font-bold text-blue-600">
                            {results.summary.primarySchoolCircles || 0}
                        </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Secondary Schools</h5>
                        <p className="text-2xl font-bold text-green-600">
                            {results.summary.secondarySchoolCircles || 0}
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Amenities</h5>
                        <p className="text-2xl font-bold text-yellow-600">
                            {results.summary.amenityCircles || 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Circles Details */}
            {results.circles && results.circles.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Radius Circles</h4>
                    <div className="space-y-3">
                        {results.circles.map((circle: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{ 
                                            borderColor: circle.color,
                                            backgroundColor: `${circle.color}40`
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{circle.label}</p>
                                        <p className="text-sm text-gray-600">{circle.radius}km radius</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderResults = () => {
        switch (savedResult.tool_type) {
            case 'mortgage':
                return renderMortgageResults(savedResult.results, savedResult.form_data);
            case 'affordability':
                return renderAffordabilityResults(savedResult.results, savedResult.form_data);
            case 'volume':
                return renderVolumeResults(savedResult.results, savedResult.form_data);
            case 'school-catchment':
                return renderSchoolCatchmentResults(savedResult.results, savedResult.form_data);
            default:
                return (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">Results not available for this tool type.</p>
                    </div>
                );
        }
    };

    return (
        <>
            <Head title={`${savedResult.name} - Saved Results`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="tools" />

                {/* Header Section */}
                <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/saved-results"
                                    className="text-gray-600 hover:text-[#17B7C7] transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-3xl">{getToolIcon(savedResult.tool_type)}</span>
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                                {savedResult.name}
                                            </h1>
                                            <p className="text-gray-600">
                                                {savedResult.tool_display_name} • Saved on {formatDate(savedResult.calculated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={`/tools?tool=${
                                        savedResult.tool_type === 'mortgage' ? '0' :
                                        savedResult.tool_type === 'affordability' ? '1' :
                                        savedResult.tool_type === 'school-catchment' ? '2' :
                                        savedResult.tool_type === 'volume' ? '3' : '0'
                                    }`}
                                    className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors text-sm"
                                >
                                    Use Tool Again
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-red-600 hover:text-red-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                                    title="Delete calculation (no confirmation required)"
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            🗑️ Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {renderResults()}
                    </div>
                </section>

                <WelcomeFooter />
            </div>
        </>
    );
}