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
        const iconProps = "w-8 h-8 text-[#17B7C7]";
        const strokeProps = { strokeWidth: 2, fill: "none", stroke: "currentColor" };
        
        switch (toolType) {
            case 'mortgage':
                return (
                    <svg className={iconProps} viewBox="0 0 24 24" {...strokeProps}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case 'affordability':
                return (
                    <svg className={iconProps} viewBox="0 0 24 24" {...strokeProps}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'volume':
                return (
                    <svg className={iconProps} viewBox="0 0 24 24" {...strokeProps}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            case 'school-catchment':
                return (
                    <svg className={iconProps} viewBox="0 0 24 24" {...strokeProps}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className={iconProps} viewBox="0 0 24 24" {...strokeProps}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
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
                        <span className="text-gray-700 font-medium">Loan Amount:</span>
                        <p className="font-semibold text-gray-900">£{parseFloat(formData.loanAmount || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Interest Rate:</span>
                        <p className="font-semibold text-gray-900">{formData.interestRate || 'N/A'}%</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Loan Term:</span>
                        <p className="font-semibold text-gray-900">{formData.loanTerm || 'N/A'} years</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Down Payment:</span>
                        <p className="font-semibold text-gray-900">£{parseFloat(formData.downPayment || '0').toLocaleString('en-GB')}</p>
                    </div>
                </div>
            </div>

            {/* Results Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-1">Total Interest</h5>
                    <p className="text-lg font-bold text-orange-600">
                        £{results.totalInterest?.toLocaleString('en-GB', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                        }) || 'N/A'}
                    </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-1">Total Amount</h5>
                    <p className="text-lg font-bold text-gray-900">
                        £{results.totalAmount?.toLocaleString('en-GB', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                        }) || 'N/A'}
                    </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-1">LTV Ratio</h5>
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
                        <span className="text-gray-700 font-medium">Annual Income:</span>
                        <p className="font-semibold text-gray-900">£{parseFloat(formData.grossAnnualIncome || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Monthly Debt:</span>
                        <p className="font-semibold text-gray-900">£{parseFloat(formData.monthlyDebtPayments || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Down Payment:</span>
                        <p className="font-semibold text-gray-900">£{parseFloat(formData.downPayment || '0').toLocaleString('en-GB')}</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Interest Rate:</span>
                        <p className="font-semibold text-gray-900">{formData.interestRate || 'N/A'}%</p>
                    </div>
                </div>
            </div>

            {/* Financial Ratios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Housing-to-Income Ratio</h5>
                    <p className="text-2xl font-bold text-green-600">
                        {results.housingToIncomeRatio?.toFixed(1) || 'N/A'}%
                    </p>
                    <p className="text-xs text-gray-800 font-medium mt-1">
                        {(results.housingToIncomeRatio || 0) <= 28 ? 'Good ratio' : 'Recommended: ≤28%'}
                    </p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Debt-to-Income Ratio</h5>
                    <p className="text-2xl font-bold text-purple-600">
                        {results.debtToIncomeRatio?.toFixed(1) || 'N/A'}%
                    </p>
                    <p className="text-xs text-gray-800 font-medium mt-1">
                        {(results.debtToIncomeRatio || 0) <= 36 ? 'Good ratio' : 'Recommended: ≤36%'}
                    </p>
                </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h4 className="font-semibold text-gray-900">Recommendations</h4>
                    </div>
                    <ul className="space-y-2">
                        {results.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start text-sm">
                                <span className="text-amber-600 mr-2">•</span>
                                <span className="text-gray-800 font-medium">{rec}</span>
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
                <div className="flex items-center gap-2 text-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{results.recommendedTruck?.name || 'N/A'} - £{results.recommendedTruck?.price || 'N/A'}</span>
                </div>
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
                                            <div key={itemIndex} className="flex justify-between text-sm text-gray-800">
                                                <span className="font-medium">{item.name} x{item.quantity}</span>
                                                <span className="font-semibold">{item.volume?.toFixed(1) || '0'} m³</span>
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
                <div className="flex items-center gap-2 text-lg mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{results.searchedAddress || 'Unknown location'}</span>
                </div>
                <p className="text-2xl font-bold">{results.totalCircles || 0} radius circles analyzed</p>
            </div>

            {/* Summary */}
            {results.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h5 className="text-sm font-semibold text-gray-800">Primary Schools</h5>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                            {results.summary.primarySchoolCircles || 0}
                        </p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h5 className="text-sm font-semibold text-gray-800">Secondary Schools</h5>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {results.summary.secondarySchoolCircles || 0}
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h5 className="text-sm font-semibold text-gray-800">Amenities</h5>
                        </div>
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
                                        <p className="font-semibold text-gray-900">{circle.label}</p>
                                        <p className="text-sm text-gray-800 font-medium">{circle.radius}km radius</p>
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
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-[#17B7C7] hover:border-[#17B7C7] hover:bg-[#17B7C7]/5 transition-all duration-200 shadow-sm hover:shadow-md"
                                    title="Back to Saved Results"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Link>
                                <div>
                                    <div className="flex items-center space-x-4 mb-2">
                                        <div className="flex-shrink-0">
                                            {getToolIcon(savedResult.tool_type)}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                                {savedResult.name}
                                            </h1>
                                            <p className="text-gray-700 font-medium">
                                                {savedResult.tool_display_name} • Saved on {formatDate(savedResult.calculated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={`/tools/${
                                        savedResult.tool_type === 'mortgage' ? 'mortgage-calculator' :
                                        savedResult.tool_type === 'affordability' ? 'affordability-calculator' :
                                        savedResult.tool_type === 'school-catchment' ? 'school-catchment-map' :
                                        savedResult.tool_type === 'volume' ? 'volume-calculator' : 'mortgage-calculator'
                                    }`}
                                    className="flex items-center gap-2 bg-[#17B7C7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors text-sm shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
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
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
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