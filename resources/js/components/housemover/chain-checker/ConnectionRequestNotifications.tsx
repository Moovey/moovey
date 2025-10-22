import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface ConnectionRequest {
    id: number;
    title: string;
    message: string;
    data: {
        property_id: number;
        property_title: string;
        initiating_user_id: number;
        initiating_user_name: string;
        user_message: string;
        contact_type: string;
        property_details?: {
            title: string;
            address?: string;
            price: string;
            main_image?: string;
            rightmove_url: string;
        };
    };
    created_at: string;
    action_url: string;
}

interface ConnectionRequestNotificationsProps {
    onRequestAccepted?: () => void;
    onRequestDeclined?: () => void;
}

const ConnectionRequestNotifications: React.FC<ConnectionRequestNotificationsProps> = ({
    onRequestAccepted,
    onRequestDeclined
}) => {
    const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);

    useEffect(() => {
        loadConnectionRequests();
        
        // Poll for new connection requests every 30 seconds
        const interval = setInterval(loadConnectionRequests, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadConnectionRequests = async () => {
        try {
            const response = await fetch('/api/connections/requests', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setConnectionRequests(data.data || []);
                }
            }
        } catch (error) {
            // Handle error silently
        } finally {
            setLoading(false);
        }
    };

    const acceptConnectionRequest = async (request: ConnectionRequest) => {
        setProcessingId(request.id);
        
        try {
            const response = await fetch('/api/connections/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    notification_id: request.id,
                    property_id: request.data.property_id,
                    initiating_user_id: request.data.initiating_user_id
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Connection accepted! You are now linked in the chain. 🎉');
                setConnectionRequests(prev => prev.filter(req => req.id !== request.id));
                onRequestAccepted?.();
                setShowModal(false);
            } else {
                toast.error(data.message || 'Failed to accept connection request');
            }
        } catch (error) {
            // Handle error silently
            toast.error('Failed to accept connection request. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const declineConnectionRequest = async (request: ConnectionRequest) => {
        setProcessingId(request.id);
        
        try {
            const response = await fetch('/api/connections/decline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    notification_id: request.id
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.info('Connection request declined');
                setConnectionRequests(prev => prev.filter(req => req.id !== request.id));
                onRequestDeclined?.();
                setShowModal(false);
            } else {
                toast.error(data.message || 'Failed to decline connection request');
            }
        } catch (error) {
            // Handle error silently
            toast.error('Failed to decline connection request. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const openRequestModal = (request: ConnectionRequest) => {
        setSelectedRequest(request);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00BCD4]"></div>
                <span className="ml-2 text-sm text-gray-600">Loading connection requests...</span>
            </div>
        );
    }

    if (connectionRequests.length === 0) {
        return null;
    }

    return (
        <>
            <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🤝</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Connection Requests</h4>
                            <p className="text-sm text-gray-300">
                                {connectionRequests.length} user{connectionRequests.length !== 1 ? 's' : ''} want{connectionRequests.length === 1 ? 's' : ''} to connect with you!
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {connectionRequests.slice(0, 3).map((request) => (
                            <motion.div
                                key={request.id}
                                className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h5 className="font-bold text-white">
                                                {request.data.initiating_user_name}
                                            </h5>
                                            <span className="px-2 py-1 bg-purple-600 rounded-full text-xs font-medium text-white">
                                                wants to connect
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-gray-200 font-medium mb-2">
                                            About: {request.data.property_title}
                                        </p>
                                        
                                        <p className="text-xs text-gray-300 line-clamp-2">
                                            "{request.data.user_message}"
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => openRequestModal(request)}
                                        className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-bold shadow-sm"
                                    >
                                        Respond
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {connectionRequests.length > 3 && (
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => {
                                        window.location.href = '/housemover/connections?tab=requests';
                                    }}
                                    className="text-sm text-white font-medium hover:text-gray-200 transition-colors underline decoration-2 underline-offset-2"
                                >
                                    View all {connectionRequests.length} requests →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Connection Request Details Modal */}
            <AnimatePresence>
                {showModal && selectedRequest && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="flex items-center justify-between p-6 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">Connection Request</h3>
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
                                {/* User Details */}
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">From</h4>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-purple-600 font-medium">
                                                {selectedRequest.data.initiating_user_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {selectedRequest.data.initiating_user_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Wants to connect for chain linking
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Property</h4>
                                    <div className="flex items-start space-x-3">
                                        {selectedRequest.data.property_details?.main_image && (
                                            <img
                                                src={selectedRequest.data.property_details.main_image}
                                                alt="Property"
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {selectedRequest.data.property_title}
                                            </p>
                                            {selectedRequest.data.property_details?.address && (
                                                <p className="text-sm text-gray-600">
                                                    {selectedRequest.data.property_details.address}
                                                </p>
                                            )}
                                            {selectedRequest.data.property_details?.price && (
                                                <p className="text-sm text-gray-800 font-medium">
                                                    {selectedRequest.data.property_details.price}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <p className="text-gray-700 italic">
                                            "{selectedRequest.data.user_message}"
                                        </p>
                                    </div>
                                </div>

                                {/* Connection Benefits */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-2">
                                        <span className="text-green-600 text-lg">🌟</span>
                                        <div>
                                            <h5 className="font-medium text-green-800">Benefits of Connecting</h5>
                                            <ul className="text-sm text-green-700 mt-1 space-y-1">
                                                <li>• Coordinate your property transactions</li>
                                                <li>• Share chain progress and updates</li>
                                                <li>• Reduce moving stress through collaboration</li>
                                                <li>• Potentially speed up completion times</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Request Time */}
                                <div className="text-center text-sm text-gray-500">
                                    Request sent on {new Date(selectedRequest.created_at).toLocaleDateString()} at {new Date(selectedRequest.created_at).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                                <button
                                    onClick={() => declineConnectionRequest(selectedRequest)}
                                    disabled={processingId === selectedRequest.id}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {processingId === selectedRequest.id ? 'Processing...' : 'Decline'}
                                </button>
                                <button
                                    onClick={() => acceptConnectionRequest(selectedRequest)}
                                    disabled={processingId === selectedRequest.id}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {processingId === selectedRequest.id && (
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

export default ConnectionRequestNotifications;