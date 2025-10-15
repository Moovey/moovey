import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropertyBasket from './PropertyBasket';

interface ChainOverviewProps {
    chainData: any;
    onRefresh: () => void;
}

const ChainOverview: React.FC<ChainOverviewProps> = ({ chainData, onRefresh }) => {
    const [showPropertyBasket, setShowPropertyBasket] = useState(false);
    const [linkedProperties, setLinkedProperties] = useState<any>({
        buying: [],
        selling: []
    });
    const [loadingProperties, setLoadingProperties] = useState(false);

    useEffect(() => {
        if (chainData.buying_properties?.length > 0 || chainData.selling_properties?.length > 0) {
            loadLinkedProperties();
        }
    }, [chainData]);

    const loadLinkedProperties = async () => {
        setLoadingProperties(true);
        try {
            const response = await fetch('/api/properties/basket', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    const allProperties = data.data;
                    setLinkedProperties({
                        buying: allProperties.filter((p: any) => chainData.buying_properties?.includes(p.id)),
                        selling: allProperties.filter((p: any) => chainData.selling_properties?.includes(p.id))
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load linked properties:', error);
        } finally {
            setLoadingProperties(false);
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getHealthStatus = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Attention';
    };

    const getRoleDisplay = (role: string) => {
        switch (role) {
            case 'first_time_buyer': return { label: 'First-Time Buyer', icon: '🏠', color: 'blue' };
            case 'seller_only': return { label: 'Selling Only', icon: '💰', color: 'green' };
            case 'buyer_seller': return { label: 'Buying & Selling', icon: '🔄', color: 'purple' };
            default: return { label: 'Unknown', icon: '❓', color: 'gray' };
        }
    };

    const chainLinks = Array.from({ length: chainData.chain_length }, (_, index) => ({
        id: index + 1,
        title: index === 0 ? 'Your Property' : `Property ${index + 1}`,
        status: index <= chainData.progress_score / 20 ? 'completed' : 
               index === Math.floor(chainData.progress_score / 20) ? 'in-progress' : 'pending',
        type: index === 0 ? (chainData.move_type === 'selling' ? 'selling' : 'buying') : 'unknown',
    }));

    return (
        <div className="space-y-8">
            {/* Chain Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chain Health</p>
                            <p className={`text-3xl font-bold ${getHealthColor(chainData.progress_score)}`}>
                                {chainData.progress_score}%
                            </p>
                            <p className="text-sm text-gray-500">{getHealthStatus(chainData.progress_score)}</p>
                        </div>
                        <div className="text-4xl">
                            {chainData.progress_score >= 80 ? '🟢' : 
                             chainData.progress_score >= 60 ? '🟡' : 
                             chainData.progress_score >= 40 ? '🟠' : '🔴'}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chain Length</p>
                            <p className="text-3xl font-bold text-gray-900">{chainData.chain_length}</p>
                            <p className="text-sm text-gray-500">Properties</p>
                        </div>
                        <div className="text-4xl">⛓️</div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Your Role</p>
                            <p className="text-lg font-bold text-gray-900">
                                {chainData.chain_role ? getRoleDisplay(chainData.chain_role).label : 
                                 (chainData.move_type === 'both' ? 'Buying & Selling' : 
                                  chainData.move_type === 'buying' ? 'Buying Only' : 'Selling Only')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {chainData.buying_properties?.length > 0 && `${chainData.buying_properties.length} buying`}
                                {chainData.buying_properties?.length > 0 && chainData.selling_properties?.length > 0 && ', '}
                                {chainData.selling_properties?.length > 0 && `${chainData.selling_properties.length} selling`}
                                {(!chainData.buying_properties?.length && !chainData.selling_properties?.length) && 'No linked properties'}
                            </p>
                        </div>
                        <div className="text-4xl">
                            {chainData.chain_role ? getRoleDisplay(chainData.chain_role).icon :
                             (chainData.move_type === 'both' ? '🔄' : 
                              chainData.move_type === 'buying' ? '🏠' : '💰')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chain Visualization */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Chain Visualization</h3>
                    <button
                        onClick={onRefresh}
                        className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                    >
                        Refresh Status
                    </button>
                </div>
                
                <div className="relative">
                    {/* Desktop Chain View */}
                    <div className="hidden md:flex items-center justify-center space-x-4 overflow-x-auto pb-4">
                        {chainLinks.map((link, index) => (
                            <div key={link.id} className="flex items-center">
                                {/* Property Node */}
                                <motion.div
                                    className={`
                                        relative flex flex-col items-center p-4 rounded-xl border-2 min-w-[120px]
                                        ${link.status === 'completed' ? 'border-green-500 bg-green-50' :
                                          link.status === 'in-progress' ? 'border-[#00BCD4] bg-blue-50' :
                                          'border-gray-300 bg-gray-50'}
                                    `}
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="text-2xl mb-2">
                                        {link.status === 'completed' ? '✅' :
                                         link.status === 'in-progress' ? '🔄' : '⏳'}
                                    </div>
                                    <div className="text-sm font-medium text-center text-gray-900">
                                        {link.title}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 capitalize">
                                        {link.type}
                                    </div>
                                    
                                    {/* Status indicator */}
                                    <div className={`
                                        absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white
                                        ${link.status === 'completed' ? 'bg-green-500' :
                                          link.status === 'in-progress' ? 'bg-[#00BCD4]' :
                                          'bg-gray-400'}
                                    `}></div>
                                </motion.div>
                                
                                {/* Chain Link */}
                                {index < chainLinks.length - 1 && (
                                    <div className={`
                                        w-8 h-1 mx-2
                                        ${link.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                                    `}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Mobile Chain View */}
                    <div className="md:hidden space-y-4">
                        {chainLinks.map((link, index) => (
                            <div key={link.id} className="flex items-center space-x-4">
                                <div className={`
                                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                                    ${link.status === 'completed' ? 'border-green-500 bg-green-50' :
                                      link.status === 'in-progress' ? 'border-[#00BCD4] bg-blue-50' :
                                      'border-gray-300 bg-gray-50'}
                                `}>
                                    {link.status === 'completed' ? '✅' :
                                     link.status === 'in-progress' ? '🔄' : '⏳'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{link.title}</div>
                                    <div className="text-sm text-gray-500 capitalize">{link.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Linked Properties Section */}
            {(chainData.buying_properties?.length > 0 || chainData.selling_properties?.length > 0) && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Chain Properties</h3>
                    
                    {loadingProperties ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BCD4]"></div>
                            <span className="ml-2 text-gray-600">Loading properties...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Buying Properties */}
                            {linkedProperties.buying.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                        <span className="text-blue-500 mr-2">🏠</span>
                                        Properties You're Buying
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {linkedProperties.buying.map((property: any) => (
                                            <div key={property.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                                <div className="font-medium text-gray-900 mb-1">
                                                    {property.address || 'Property Address'}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    £{property.price?.toLocaleString() || 'Price on request'}
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <span className="bg-blue-100 px-2 py-1 rounded">Buying</span>
                                                    <span>Added to chain</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Selling Properties */}
                            {linkedProperties.selling.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                        <span className="text-green-500 mr-2">💰</span>
                                        Properties You're Selling
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {linkedProperties.selling.map((property: any) => (
                                            <div key={property.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                                                <div className="font-medium text-gray-900 mb-1">
                                                    {property.address || 'Property Address'}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    £{property.price?.toLocaleString() || 'Price on request'}
                                                </div>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <span className="bg-green-100 px-2 py-1 rounded">Selling</span>
                                                    <span>Added to chain</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Property Basket Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Property Basket</h3>
                    <button
                        onClick={() => setShowPropertyBasket(!showPropertyBasket)}
                        className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                    >
                        {showPropertyBasket ? 'Hide' : 'Show'} Properties
                    </button>
                </div>
                
                <p className="text-gray-600 mb-4">
                    Add properties from Rightmove to track interest and claim your listings.
                </p>
                
                {showPropertyBasket && (
                    <PropertyBasket />
                )}
            </div>

            {/* Professional Details */}
            {(chainData.buying_agent_details?.name || chainData.selling_agent_details?.name || 
              chainData.buying_solicitor_details?.name || chainData.selling_solicitor_details?.name || 
              chainData.agent_name) && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Team</h3>
                    
                    <div className="space-y-6">
                        {/* Buying Side Professionals */}
                        {(chainData.buying_agent_details?.name || chainData.buying_solicitor_details?.name) && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <span className="text-blue-500 mr-2">🏠</span>
                                    Buying Side Team
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {chainData.buying_agent_details?.name && (
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-lg">🏘️</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">Estate Agent</div>
                                                    <div className="text-sm text-gray-900">{chainData.buying_agent_details.name}</div>
                                                    {chainData.buying_agent_details.firm && (
                                                        <div className="text-xs text-gray-600">{chainData.buying_agent_details.firm}</div>
                                                    )}
                                                    {chainData.buying_agent_details.email && (
                                                        <div className="text-xs text-gray-600">{chainData.buying_agent_details.email}</div>
                                                    )}
                                                    {chainData.buying_agent_details.phone && (
                                                        <div className="text-xs text-gray-600">{chainData.buying_agent_details.phone}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {chainData.buying_solicitor_details?.name && (
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-lg">⚖️</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">Solicitor</div>
                                                    <div className="text-sm text-gray-900">{chainData.buying_solicitor_details.name}</div>
                                                    {chainData.buying_solicitor_details.firm && (
                                                        <div className="text-xs text-gray-600">{chainData.buying_solicitor_details.firm}</div>
                                                    )}
                                                    {chainData.buying_solicitor_details.email && (
                                                        <div className="text-xs text-gray-600">{chainData.buying_solicitor_details.email}</div>
                                                    )}
                                                    {chainData.buying_solicitor_details.phone && (
                                                        <div className="text-xs text-gray-600">{chainData.buying_solicitor_details.phone}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Selling Side Professionals */}
                        {(chainData.selling_agent_details?.name || chainData.selling_solicitor_details?.name) && (
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <span className="text-green-500 mr-2">💰</span>
                                    Selling Side Team
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {chainData.selling_agent_details?.name && (
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-lg">🏘️</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">Estate Agent</div>
                                                    <div className="text-sm text-gray-900">{chainData.selling_agent_details.name}</div>
                                                    {chainData.selling_agent_details.firm && (
                                                        <div className="text-xs text-gray-600">{chainData.selling_agent_details.firm}</div>
                                                    )}
                                                    {chainData.selling_agent_details.email && (
                                                        <div className="text-xs text-gray-600">{chainData.selling_agent_details.email}</div>
                                                    )}
                                                    {chainData.selling_agent_details.phone && (
                                                        <div className="text-xs text-gray-600">{chainData.selling_agent_details.phone}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {chainData.selling_solicitor_details?.name && (
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-lg">⚖️</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">Solicitor</div>
                                                    <div className="text-sm text-gray-900">{chainData.selling_solicitor_details.name}</div>
                                                    {chainData.selling_solicitor_details.firm && (
                                                        <div className="text-xs text-gray-600">{chainData.selling_solicitor_details.firm}</div>
                                                    )}
                                                    {chainData.selling_solicitor_details.email && (
                                                        <div className="text-xs text-gray-600">{chainData.selling_solicitor_details.email}</div>
                                                    )}
                                                    {chainData.selling_solicitor_details.phone && (
                                                        <div className="text-xs text-gray-600">{chainData.selling_solicitor_details.phone}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Legacy Agent Information */}
                        {chainData.agent_name && !chainData.buying_agent_details?.name && !chainData.selling_agent_details?.name && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-xl">🏘️</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{chainData.agent_name}</div>
                                        {chainData.agent_email && (
                                            <div className="text-sm text-gray-600">{chainData.agent_email}</div>
                                        )}
                                        <div className="flex items-center space-x-4 mt-3">
                                            <button className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors">
                                                Request Update
                                            </button>
                                            <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                                Edit Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors">
                        <div className="text-2xl mb-2">📋</div>
                        <div className="font-medium">Update Progress</div>
                        <div className="text-sm opacity-90">Mark stages as complete</div>
                    </button>
                    
                    <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors">
                        <div className="text-2xl mb-2">🏠</div>
                        <div className="font-medium">Add Property</div>
                        <div className="text-sm opacity-90">From Rightmove link</div>
                    </button>
                    
                    <button className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-colors">
                        <div className="text-2xl mb-2">📧</div>
                        <div className="font-medium">Contact Agent</div>
                        <div className="text-sm opacity-90">Request chain update</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChainOverview;