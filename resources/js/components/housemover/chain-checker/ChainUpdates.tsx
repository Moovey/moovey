import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChainUpdatesProps {
    chainData: any;
    onRefresh: () => void;
}

interface Update {
    id: number;
    update_type: string;
    title: string;
    description: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
    data?: any;
}

const ChainUpdates: React.FC<ChainUpdatesProps> = ({ chainData, onRefresh }) => {
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);
    const [requestingUpdate, setRequestingUpdate] = useState(false);

    useEffect(() => {
        loadUpdates();
    }, [chainData.id]);

    const loadUpdates = async () => {
        try {
            const response = await fetch(`/api/chain-checker/${chainData.id}/updates`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUpdates(data.data.data || []);
                }
            }
        } catch (error) {
            // Handle error silently
        } finally {
            setLoading(false);
        }
    };

    const requestAgentUpdate = async () => {
        if (!chainData.agent_email) {
            alert('No agent email configured. Please add agent details first.');
            return;
        }

        setRequestingUpdate(true);
        try {
            const response = await fetch(`/api/chain-checker/${chainData.id}/request-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert('Update request sent to your agent!');
                    loadUpdates();
                }
            }
        } catch (error) {
            // Handle error silently
            alert('Failed to send update request');
        } finally {
            setRequestingUpdate(false);
        }
    };

    const getUpdateIcon = (updateType: string) => {
        switch (updateType) {
            case 'chain_created': return '🎯';
            case 'status_change': return '📊';
            case 'agent_update': return '🏘️';
            case 'property_added': return '🏠';
            case 'property_claimed': return '🔑';
            case 'update_request': return '📧';
            case 'chain_completed': return '🎉';
            default: return '📋';
        }
    };

    const getUpdateColor = (updateType: string) => {
        switch (updateType) {
            case 'chain_created': return 'bg-blue-50 border-blue-200';
            case 'status_change': return 'bg-green-50 border-green-200';
            case 'agent_update': return 'bg-purple-50 border-purple-200';
            case 'property_added': return 'bg-indigo-50 border-indigo-200';
            case 'property_claimed': return 'bg-yellow-50 border-yellow-200';
            case 'update_request': return 'bg-orange-50 border-orange-200';
            case 'chain_completed': return 'bg-green-50 border-green-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BCD4]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
                    <button
                        onClick={loadUpdates}
                        className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                    >
                        Refresh
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    {chainData.agent_email && (
                        <button
                            onClick={requestAgentUpdate}
                            disabled={requestingUpdate}
                            className="px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {requestingUpdate && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>📧</span>
                            <span>Request Agent Update</span>
                        </button>
                    )}
                    
                    <button
                        onClick={onRefresh}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <span>🔄</span>
                        <span className="ml-2">Refresh Chain</span>
                    </button>
                </div>
            </div>

            {/* Updates Timeline */}
            <div className="space-y-4">
                {updates.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
                        <div className="text-4xl mb-4">📭</div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Updates Yet</h4>
                        <p className="text-gray-600">
                            Updates will appear here as your chain progresses. Start by updating your stage progress or requesting an agent update.
                        </p>
                    </div>
                ) : (
                    updates.map((update, index) => (
                        <motion.div
                            key={update.id}
                            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${getUpdateColor(update.update_type)}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="p-6">
                                <div className="flex items-start space-x-4">
                                    {/* Update Icon */}
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-white rounded-full border-2 border-current flex items-center justify-center text-lg">
                                            {getUpdateIcon(update.update_type)}
                                        </div>
                                    </div>
                                    
                                    {/* Update Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {update.title}
                                                </h4>
                                                <p className="text-gray-700 mt-1">
                                                    {update.description}
                                                </p>
                                                
                                                {/* Additional Data */}
                                                {update.data && (
                                                    <div className="mt-3 p-3 bg-white/50 rounded-lg">
                                                        {update.update_type === 'agent_update' && update.data.agent_name && (
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Agent:</span> {update.data.agent_name}
                                                            </p>
                                                        )}
                                                        {update.data.updated_stages && (
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Updated stages:</span> {update.data.updated_stages.join(', ')}
                                                            </p>
                                                        )}
                                                        {update.data.stage && (
                                                            <p className="text-sm text-gray-600">
                                                                <span className="font-medium">Stage:</span> {update.data.stage.replace('_', ' ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Timestamp */}
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(update.created_at)}
                                                </div>
                                                {update.user && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        by {update.user.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-[#00BCD4] focus:ring-[#00BCD4] border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Email notifications for agent updates</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-[#00BCD4] focus:ring-[#00BCD4] border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Push notifications for chain progress</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-[#00BCD4] focus:ring-[#00BCD4] border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Weekly progress summary emails</span>
                    </label>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors">
                        Save Preferences
                    </button>
                </div>
            </div>

            {/* Agent Contact Card */}
            {chainData.agent_name && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                        <span>🏘️</span>
                        <span>Your Agent</span>
                    </h3>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-900">{chainData.agent_name}</div>
                            {chainData.agent_email && (
                                <div className="text-sm text-gray-600">{chainData.agent_email}</div>
                            )}
                        </div>
                        
                        <div className="text-right">
                            <div className="text-sm text-gray-600">
                                Last update: {updates.find(u => u.update_type === 'agent_update') 
                                    ? formatDate(updates.find(u => u.update_type === 'agent_update')!.created_at)
                                    : 'Never'
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center space-x-4">
                        <button
                            onClick={requestAgentUpdate}
                            disabled={requestingUpdate}
                            className="text-sm text-purple-700 hover:text-purple-800 transition-colors disabled:opacity-50"
                        >
                            Request Update
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                            Edit Agent Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChainUpdates;