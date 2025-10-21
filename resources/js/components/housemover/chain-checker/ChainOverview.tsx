import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropertyBasket from './PropertyBasket';

interface PropertyHouseBlockProps {
    title: string;
    linkHealth: number;
    isUserOwned: boolean;
    isEditable: boolean;
    type: 'buying' | 'selling' | 'unknown';
    isUnknown?: boolean;
}

const PropertyHouseBlock: React.FC<PropertyHouseBlockProps> = ({
    title,
    linkHealth,
    isUserOwned,
    isEditable,
    type,
    isUnknown = false
}) => {
    const [showModal, setShowModal] = useState(false);

    // Mock stage data with percentage-based progress - replace with real data later
    const stages = [
        { name: 'Offer Accepted', progress: isUnknown ? 0 : (type === 'buying' ? 100 : type === 'selling' ? 100 : 0), color: 'green' },
        { name: 'Mortgage Approved', progress: isUnknown ? 0 : (type === 'buying' ? 100 : type === 'selling' ? 75 : 0), color: 'orange' },
        { name: 'Searches Complete', progress: isUnknown ? 0 : (type === 'buying' ? 50 : type === 'selling' ? 50 : 0), color: 'orange' },
        { name: 'Surveys Complete', progress: isUnknown ? 0 : (type === 'buying' ? 50 : type === 'selling' ? 50 : 0), color: 'orange' },
        { name: 'Contracts Exchanged', progress: isUnknown ? 0 : 0, color: 'red' },
        { name: 'Completion Achieved', progress: isUnknown ? 0 : 0, color: 'red' },
    ];

    const getButtonText = () => {
        if (isUnknown) return 'Build this Link';
        if (isEditable && isUserOwned) return 'Update my Link';
        return 'Contact Link Owner';
    };

    const getButtonAction = () => {
        if (isUnknown || (isEditable && isUserOwned)) {
            setShowModal(true);
        } else {
            // Contact link owner logic
            setShowModal(true);
        }
    };

    const getHealthColor = (health: number) => {
        if (health >= 75) return 'text-green-500';
        if (health >= 50) return 'text-yellow-500';
        if (health >= 25) return 'text-orange-500';
        return 'text-red-500';
    };

    const getProgressBarColor = (progress: number) => {
        if (progress >= 100) return 'bg-green-500';
        if (progress >= 75) return 'bg-blue-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 25) return 'bg-orange-500';
        if (progress > 0) return 'bg-red-500';
        return 'bg-gray-300';
    };

    const getProgressLabel = (progress: number) => {
        if (progress >= 100) return 'Complete';
        if (progress >= 75) return 'Pending';
        if (progress >= 50) return 'Awaiting';
        if (progress >= 25) return 'Progress';
        if (progress > 0) return 'Started';
        return 'Not Started';
    };

    return (
        <motion.div
            className={`relative bg-white rounded-xl shadow-lg border-2 p-4 sm:p-6 w-[240px] sm:w-[280px] flex-shrink-0 hover:shadow-xl transition-all duration-300 ${
                isUnknown ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
            }`}
            style={{
                clipPath: 'polygon(0 20%, 20% 0, 80% 0, 100% 20%, 100% 100%, 0 100%)'
            }}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* House Title */}
            <div className="text-center mb-3 sm:mb-4">
                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">{title}</h4>
            </div>

            {/* Link Health Circle */}
            <div className="flex flex-col items-center mb-3 sm:mb-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                    <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                        />
                        <path
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={isUnknown ? '#9ca3af' : linkHealth >= 75 ? '#22c55e' : linkHealth >= 50 ? '#eab308' : linkHealth >= 25 ? '#f97316' : '#ef4444'}
                            strokeWidth="2"
                            strokeDasharray={`${linkHealth}, 100`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm sm:text-lg font-bold ${isUnknown ? 'text-gray-400' : getHealthColor(linkHealth)}`}>
                            {isUnknown ? '?' : `${linkHealth}%`}
                        </span>
                    </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">Link Health</div>
            </div>

            {/* Progress Stages with Percentage-based Display */}
            <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                <div className="text-xs font-medium text-gray-700 mb-2">Link Progress</div>
                {stages.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 flex-1">
                            <div className={`w-2 h-2 rounded-full ${
                                stage.progress >= 100 ? 'bg-green-500' :
                                stage.progress >= 75 ? 'bg-blue-500' :
                                stage.progress >= 50 ? 'bg-yellow-500' :
                                stage.progress >= 25 ? 'bg-orange-500' :
                                stage.progress > 0 ? 'bg-red-500' : 'bg-gray-300'
                            }`}></div>
                            <span className="text-gray-700 truncate text-xs">{stage.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                            <div className="w-8 sm:w-12 h-1 bg-gray-200 rounded-full">
                                <div
                                    className={`h-1 rounded-full transition-all duration-300 ${getProgressBarColor(stage.progress)}`}
                                    style={{ width: `${isUnknown ? 0 : stage.progress}%` }}
                                ></div>
                            </div>
                            <span className="text-gray-600 w-6 sm:w-8 text-right text-xs">
                                {isUnknown ? '?' : `${stage.progress}%`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            <button
                onClick={getButtonAction}
                className={`w-full py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isUnknown
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isEditable && isUserOwned
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
            >
                {getButtonText()}
            </button>

            {/* Modal for editing/building links */}
            {showModal && (
                <PropertyModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={title}
                    type={type}
                    isUnknown={isUnknown}
                    isEditable={isEditable}
                />
            )}
        </motion.div>
    );
};

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: 'buying' | 'selling' | 'unknown';
    isUnknown: boolean;
    isEditable: boolean;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
    isOpen,
    onClose,
    title,
    type,
    isUnknown,
    isEditable
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
                        {isUnknown ? 'Build Link' : isEditable ? 'Update Progress' : 'Contact Link Owner'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {isUnknown ? (
                        <>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Property Rightmove Link
                                </label>
                                <input
                                    type="url"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                                    placeholder="https://rightmove.co.uk/properties/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Estate Agent Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                                    placeholder="Agent name (if known)"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Agent Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                                    placeholder="agent@agency.com"
                                />
                            </div>
                        </>
                    ) : isEditable ? (
                        <div>
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Update Stage Progress</h4>
                            <div className="space-y-2 sm:space-y-3">
                                {['Offer Accepted', 'Mortgage Approved', 'Searches Complete', 'Surveys Complete', 'Contracts Exchanged', 'Completion Achieved'].map((stage, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm text-gray-700 flex-1 mr-3">{stage}</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            className="w-16 sm:w-24"
                                            defaultValue={index < 2 ? "100" : index < 4 ? "50" : "0"}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Send Message</h4>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={4}
                                placeholder="Request an update on the property progress..."
                            ></textarea>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        {isUnknown ? 'Build Link' : isEditable ? 'Update' : 'Send Message'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Mobile version of the PropertyHouseBlock component
const PropertyHouseBlockMobile: React.FC<PropertyHouseBlockProps> = ({
    title,
    linkHealth,
    isUserOwned,
    isEditable,
    type,
    isUnknown = false
}) => {
    const [showModal, setShowModal] = useState(false);

    const getButtonText = () => {
        if (isUnknown) return 'Build this Link';
        if (isEditable && isUserOwned) return 'Update my Link';
        return 'Contact Link Owner';
    };

    const getButtonAction = () => {
        if (isUnknown || (isEditable && isUserOwned)) {
            setShowModal(true);
        } else {
            setShowModal(true);
        }
    };

    const houseColor = type === 'buying' ? '#10B981' :
                      type === 'selling' ? '#F59E0B' :
                      '#6B7280';

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-xl p-4 border-2 ${
                isUnknown ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
            }`}
        >
            <div className="flex items-center space-x-4">
                {/* House Icon */}
                <div className="flex-shrink-0">
                    <div className={`w-12 h-12 relative ${isUserOwned ? 'cursor-pointer' : ''}`}
                         onClick={isUserOwned ? getButtonAction : undefined}>
                        <div 
                            className="w-full h-full transition-all duration-200 hover:scale-105"
                            style={{
                                background: isUnknown ? '#9CA3AF' : houseColor,
                                clipPath: 'polygon(50% 0%, 0% 70%, 15% 70%, 15% 100%, 85% 100%, 85% 70%, 100% 70%)',
                                opacity: isUnknown ? 0.6 : 1
                            }}
                        />
                        
                        {/* Door and Windows */}
                        {!isUnknown && (
                            <>
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-2 bg-white/30 rounded-sm"></div>
                                <div className="absolute top-5 left-2 w-1 h-1 bg-white/40 rounded-sm"></div>
                                <div className="absolute top-5 right-2 w-1 h-1 bg-white/40 rounded-sm"></div>
                            </>
                        )}

                        {/* Question mark for unknown properties */}
                        {isUnknown && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">?</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Property Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                        Health: {isUnknown ? 'Unknown' : `${linkHealth}%`}
                    </p>
                    {isUserOwned && (
                        <button
                            onClick={getButtonAction}
                            className="mt-1 text-xs text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                        >
                            Edit Progress
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full transition-all duration-700 ease-out rounded-full"
                            style={{ 
                                width: `${isUnknown ? 0 : linkHealth}%`,
                                backgroundColor: houseColor
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 text-center">
                        {isUnknown ? '?' : `${linkHealth}%`}
                    </p>
                </div>
            </div>

            {/* Modal for editing/building links */}
            {showModal && (
                <PropertyModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={title}
                    type={type}
                    isUnknown={isUnknown}
                    isEditable={isEditable}
                />
            )}
        </motion.div>
    );
};

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
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Chain Health Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Chain Health</p>
                            <p className={`text-2xl sm:text-3xl font-bold ${getHealthColor(chainData.progress_score)}`}>
                                {chainData.progress_score}%
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">{getHealthStatus(chainData.progress_score)}</p>
                        </div>
                        <div className="text-2xl sm:text-4xl">
                            {chainData.progress_score >= 80 ? '🟢' : 
                             chainData.progress_score >= 60 ? '🟡' : 
                             chainData.progress_score >= 40 ? '🟠' : '🔴'}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Chain Length</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{chainData.chain_length}</p>
                            <p className="text-xs sm:text-sm text-gray-500">Properties</p>
                        </div>
                        <div className="text-2xl sm:text-4xl">⛓️</div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Your Role</p>
                            <p className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
                                {chainData.chain_role ? getRoleDisplay(chainData.chain_role).label : 
                                 (chainData.move_type === 'both' ? 'Buying & Selling' : 
                                  chainData.move_type === 'buying' ? 'Buying Only' : 'Selling Only')}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {chainData.buying_properties?.length > 0 && `${chainData.buying_properties.length} buying`}
                                {chainData.buying_properties?.length > 0 && chainData.selling_properties?.length > 0 && ', '}
                                {chainData.selling_properties?.length > 0 && `${chainData.selling_properties.length} selling`}
                                {(!chainData.buying_properties?.length && !chainData.selling_properties?.length) && 'No linked properties'}
                            </p>
                        </div>
                        <div className="text-2xl sm:text-4xl">
                            {chainData.chain_role ? getRoleDisplay(chainData.chain_role).icon :
                             (chainData.move_type === 'both' ? '🔄' : 
                              chainData.move_type === 'buying' ? '🏠' : '💰')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Property Chain Visualization */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Property Chain</h3>
                    <div className="flex items-center space-x-2">
                        <div className="hidden sm:block text-xs text-gray-500">
                            {chainData.chain_length > 3 && "← Scroll to see all properties →"}
                        </div>
                        <button
                            onClick={onRefresh}
                            className="text-xs sm:text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                        >
                            Refresh Status
                        </button>
                    </div>
                </div>
                
                {/* Chain Houses Container - Responsive Layout */}
                <div className="relative">
                    {/* Desktop/Tablet View - Horizontal Chain */}
                    <div className="hidden sm:block">
                        <div 
                            className="flex items-center space-x-4 lg:space-x-6 overflow-x-auto pb-4 px-2"
                            style={{ 
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#cbd5e1 #f1f5f9',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            {/* Generate chain based on user role */}
                        {chainData.chain_role === 'first_time_buyer' && (
                            <>
                                {/* User's Buying Property */}
                                <PropertyHouseBlock
                                    title="The house I'm buying"
                                    linkHealth={50}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="buying"
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded flex-shrink-0"></div>
                                {/* Unknown/Seller's Property */}
                                <PropertyHouseBlock
                                    title="Seller's onward property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                            </>
                        )}

                        {chainData.chain_role === 'seller_only' && (
                            <>
                                {/* Unknown/Buyer's Property */}
                                <PropertyHouseBlock
                                    title="Buyer's onward property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded flex-shrink-0"></div>
                                {/* User's Selling Property */}
                                <PropertyHouseBlock
                                    title="The house I'm selling"
                                    linkHealth={30}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="selling"
                                />
                            </>
                        )}

                        {chainData.chain_role === 'buyer_seller' && (
                            <>
                                {/* Unknown Down Chain */}
                                <PropertyHouseBlock
                                    title="Down chain property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded flex-shrink-0"></div>
                                {/* User's Selling Property */}
                                <PropertyHouseBlock
                                    title="The house I'm selling"
                                    linkHealth={30}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="selling"
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded flex-shrink-0"></div>
                                {/* User's Buying Property */}
                                <PropertyHouseBlock
                                    title="The house I'm buying"
                                    linkHealth={50}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="buying"
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded flex-shrink-0"></div>
                                {/* Unknown Up Chain */}
                                <PropertyHouseBlock
                                    title="Up chain property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                            </>
                        )}
                        </div>
                    </div>

                    {/* Mobile View - Vertical Chain */}
                    <div className="sm:hidden space-y-4">
                        {chainData.chain_role === 'first_time_buyer' && (
                            <>
                                <PropertyHouseBlockMobile
                                    title="The house I'm buying"
                                    linkHealth={50}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="buying"
                                />
                                <div className="flex justify-center">
                                    <div className="w-1 h-8 bg-gray-300 rounded"></div>
                                </div>
                                <PropertyHouseBlockMobile
                                    title="Seller's onward property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                            </>
                        )}

                        {chainData.chain_role === 'seller_only' && (
                            <>
                                <PropertyHouseBlockMobile
                                    title="Buyer's onward property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                                <div className="flex justify-center">
                                    <div className="w-1 h-8 bg-gray-300 rounded"></div>
                                </div>
                                <PropertyHouseBlockMobile
                                    title="The house I'm selling"
                                    linkHealth={30}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="selling"
                                />
                            </>
                        )}

                        {chainData.chain_role === 'buyer_seller' && (
                            <>
                                <PropertyHouseBlockMobile
                                    title="Down chain property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                                <div className="flex justify-center">
                                    <div className="w-1 h-8 bg-gray-300 rounded"></div>
                                </div>
                                <PropertyHouseBlockMobile
                                    title="The house I'm selling"
                                    linkHealth={30}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="selling"
                                />
                                <div className="flex justify-center">
                                    <div className="w-1 h-8 bg-gray-300 rounded"></div>
                                </div>
                                <PropertyHouseBlockMobile
                                    title="The house I'm buying"
                                    linkHealth={50}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="buying"
                                />
                                <div className="flex justify-center">
                                    <div className="w-1 h-8 bg-gray-300 rounded"></div>
                                </div>
                                <PropertyHouseBlockMobile
                                    title="Up chain property"
                                    linkHealth={0}
                                    isUserOwned={false}
                                    isEditable={false}
                                    type="unknown"
                                    isUnknown={true}
                                />
                            </>
                        )}
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