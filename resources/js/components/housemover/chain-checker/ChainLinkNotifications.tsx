import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface ChainLinkOpportunity {
    id: number;
    title: string;
    message: string;
    data: {
        property_id: number;
        claiming_user_id: number;
        claiming_user_name: string;
        claiming_user_role: string;
        link_type: string;
        confidence_score: number;
        property_title: string;
        property_address?: string;
        property_details?: {
            title: string;
            address?: string;
            price: string;
            main_image?: string;
            rightmove_url: string;
        };
        expires_at: string;
    };
    created_at: string;
    action_url: string;
}

interface ChainLinkNotificationsProps {
    onOpportunityAccepted?: () => void;
    onOpportunityDeclined?: () => void;
}

const ChainLinkNotifications: React.FC<ChainLinkNotificationsProps> = ({
    onOpportunityAccepted,
    onOpportunityDeclined
}) => {
    const [opportunities, setOpportunities] = useState<ChainLinkOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<ChainLinkOpportunity | null>(null);

    useEffect(() => {
        loadChainOpportunities();
        
        // Poll for new opportunities every 30 seconds
        const interval = setInterval(loadChainOpportunities, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadChainOpportunities = async () => {
        try {
            const response = await fetch('/api/chain-links/opportunities', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setOpportunities(data.data || []);
                }
            }
        } catch (error) {
            console.error('Failed to load chain opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const acceptOpportunity = async (opportunity: ChainLinkOpportunity) => {
        setProcessingId(opportunity.id);
        
        try {
            const response = await fetch('/api/chain-links/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    notification_id: opportunity.id,
                    property_id: opportunity.data.property_id,
                    initiating_user_id: opportunity.data.claiming_user_id
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Chain link established successfully! 🎉');
                setOpportunities(prev => prev.filter(opp => opp.id !== opportunity.id));
                onOpportunityAccepted?.();
                setShowModal(false);
            } else {
                toast.error(data.message || 'Failed to accept chain link');
            }
        } catch (error) {
            console.error('Failed to accept opportunity:', error);
            toast.error('Failed to accept chain link. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const declineOpportunity = async (opportunity: ChainLinkOpportunity) => {
        setProcessingId(opportunity.id);
        
        try {
            const response = await fetch('/api/chain-links/decline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    notification_id: opportunity.id
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.info('Chain link opportunity declined');
                setOpportunities(prev => prev.filter(opp => opp.id !== opportunity.id));
                onOpportunityDeclined?.();
                setShowModal(false);
            } else {
                toast.error(data.message || 'Failed to decline chain link');
            }
        } catch (error) {
            console.error('Failed to decline opportunity:', error);
            toast.error('Failed to decline chain link. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const openOpportunityModal = (opportunity: ChainLinkOpportunity) => {
        setSelectedOpportunity(opportunity);
        setShowModal(true);
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-blue-600 bg-blue-100';
        if (score >= 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-gray-600 bg-gray-100';
    };

    const getLinkTypeDescription = (linkType: string, claimingUserRole: string) => {
        switch (linkType) {
            case 'buyer_seller_match':
                return `They're buying, you could sell`;
            case 'seller_buyer_match':
                return `They're selling, you could buy`;
            default:
                return `Potential chain opportunity`;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00BCD4]"></div>
                <span className="ml-2 text-sm text-gray-600">Loading chain opportunities...</span>
            </div>
        );
    }

    if (opportunities.length === 0) {
        return null;
    }

    return (
        <>
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg p-4 text-white">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                            <span className="text-xl">⛓️</span>
                        </div>
                        <div>
                            <h4 className="font-semibold">Chain Link Opportunities</h4>
                            <p className="text-sm opacity-90">
                                {opportunities.length} potential chain connection{opportunities.length !== 1 ? 's' : ''} found!
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {opportunities.slice(0, 2).map((opportunity) => (
                            <motion.div
                                key={opportunity.id}
                                className="bg-white bg-opacity-10 rounded-lg p-3 border border-white border-opacity-20"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h5 className="font-medium text-white">
                                                {opportunity.data.claiming_user_name}
                                            </h5>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(opportunity.data.confidence_score)}`}>
                                                {opportunity.data.confidence_score}% match
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-white opacity-90 mb-2">
                                            {opportunity.data.property_title}
                                        </p>
                                        
                                        <p className="text-xs text-white opacity-75">
                                            {getLinkTypeDescription(opportunity.data.link_type, opportunity.data.claiming_user_role)}
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => openOpportunityModal(opportunity)}
                                        className="px-3 py-1 bg-white text-[#00BCD4] rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {opportunities.length > 2 && (
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        // Show all opportunities in a modal or navigate to connections page
                                        window.location.href = '/housemover/connections?tab=chain-opportunities';
                                    }}
                                    className="text-sm text-white opacity-80 hover:opacity-100 transition-opacity underline"
                                >
                                    View all {opportunities.length} opportunities →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Opportunity Details Modal */}
            <AnimatePresence>
                {showModal && selectedOpportunity && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="flex items-center justify-between p-6 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">Chain Link Opportunity</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Property Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Property</h4>
                                    <div className="flex items-start space-x-3">
                                        {selectedOpportunity.data.property_details?.main_image && (
                                            <img
                                                src={selectedOpportunity.data.property_details.main_image}
                                                alt="Property"
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {selectedOpportunity.data.property_title}
                                            </p>
                                            {selectedOpportunity.data.property_address && (
                                                <p className="text-sm text-gray-600">
                                                    {selectedOpportunity.data.property_address}
                                                </p>
                                            )}
                                            {selectedOpportunity.data.property_details?.price && (
                                                <p className="text-sm text-gray-800 font-medium">
                                                    {selectedOpportunity.data.property_details.price}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* User Details */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Potential Chain Partner</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {selectedOpportunity.data.claiming_user_name}
                                            </p>
                                            <p className="text-sm text-gray-600 capitalize">
                                                {selectedOpportunity.data.claiming_user_role.replace('_', ' ')} role
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedOpportunity.data.confidence_score)}`}>
                                                {selectedOpportunity.data.confidence_score}% match
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Opportunity Description */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Opportunity</h4>
                                    <p className="text-gray-700">
                                        {selectedOpportunity.message}
                                    </p>
                                </div>

                                {/* Link Type Explanation */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <span className="text-yellow-600 text-lg">💡</span>
                                        <div>
                                            <h5 className="font-medium text-yellow-800">How this works</h5>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                By accepting this chain link, you'll be connected with {selectedOpportunity.data.claiming_user_name}. 
                                                You can then coordinate your property transactions to potentially form a smooth moving chain.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expiry Notice */}
                                <div className="text-center text-sm text-gray-500">
                                    This opportunity expires on {new Date(selectedOpportunity.data.expires_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                                <button
                                    onClick={() => declineOpportunity(selectedOpportunity)}
                                    disabled={processingId === selectedOpportunity.id}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {processingId === selectedOpportunity.id ? 'Processing...' : 'Decline'}
                                </button>
                                <button
                                    onClick={() => acceptOpportunity(selectedOpportunity)}
                                    disabled={processingId === selectedOpportunity.id}
                                    className="px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {processingId === selectedOpportunity.id && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    <span>Accept & Connect</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChainLinkNotifications;