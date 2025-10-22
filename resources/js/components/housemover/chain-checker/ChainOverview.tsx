import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PropertyBasket from './PropertyBasket';
import ConnectionRequestNotifications from './ConnectionRequestNotifications';

interface PropertyHouseBlockProps {
    title: string;
    linkHealth: number;
    isUserOwned: boolean;
    isEditable: boolean;
    type: 'buying' | 'selling' | 'unknown' | 'linked';
    isUnknown?: boolean;
    onRefresh?: () => void;
    chainData?: any;
}

const PropertyHouseBlock: React.FC<PropertyHouseBlockProps> = ({
    title,
    linkHealth,
    isUserOwned,
    isEditable,
    type,
    isUnknown = false,
    onRefresh,
    chainData
}) => {
    const [showModal, setShowModal] = useState(false);

    // Get real stage data from chainData or use defaults
    const getStageProgress = (stage: string) => {
        if (isUnknown) return 0;
        
        const chainStatus = chainData?.chain_status || {};
        
        // For linked properties, determine the correct property type from linked user data
        let propertyType = type;
        if (type === 'linked') {
            const linkedUser = chainData?.linked_user;
            if (linkedUser) {
                // Get chain role from multiple possible sources
                const linkedUserChainRole = linkedUser.chain_role || 
                                          linkedUser.chain_data?.chain_role || 
                                          chainData?.chain_data?.chain_role;
                
                console.log('Linked user chain role:', linkedUserChainRole, 'for user:', linkedUser.user_name);
                
                // Determine property type based on chain role
                if (linkedUserChainRole === 'seller_only') {
                    propertyType = 'selling';
                } else if (linkedUserChainRole === 'first_time_buyer') {
                    propertyType = 'buying';
                } else if (linkedUserChainRole === 'buyer_seller') {
                    // For buyer_seller, we need to be smarter about which property type
                    // Default to selling, but this could be enhanced with property-specific data
                    propertyType = 'selling';
                } else {
                    // Fallback: try to determine from move_type
                    const moveType = linkedUser.chain_data?.move_type || chainData?.move_type;
                    if (moveType === 'buying') {
                        propertyType = 'buying';
                    } else if (moveType === 'selling') {
                        propertyType = 'selling';
                    }
                }
                
                console.log('Determined property type:', propertyType, 'for stage:', stage);
            }
        }
        
        // Look for progress data in the type-specific section (buying/selling)
        const typeSpecificStatus = chainStatus[propertyType] || {};
        const stageData = typeSpecificStatus[stage];
        
        console.log('Stage data for', stage, 'in', propertyType, ':', stageData);
        
        if (stageData) {
            // If we have a progress value, use it; otherwise use completed status
            return stageData.progress !== undefined ? stageData.progress : (stageData.completed ? 100 : 0);
        }
        
        // Fallback: check if there's legacy data in the root level (for backward compatibility)
        const legacyStageData = chainStatus[stage];
        if (legacyStageData) {
            return legacyStageData.progress !== undefined ? legacyStageData.progress : (legacyStageData.completed ? 100 : 0);
        }
        
        // Final fallback to mock data for stages that don't exist yet
        const fallbacks: { [key: string]: number } = {
            'offer_accepted': propertyType === 'buying' ? 100 : propertyType === 'selling' ? 100 : 0,
            'mortgage_approval': propertyType === 'buying' ? 100 : propertyType === 'selling' ? 75 : 0,
            'searches_surveys': propertyType === 'buying' ? 50 : propertyType === 'selling' ? 50 : 0,
            'surveys_complete': propertyType === 'buying' ? 50 : propertyType === 'selling' ? 50 : 0,
            'contracts_exchanged': 0,
            'completion': 0,
        };
        
        return fallbacks[stage] || 0;
    };

    // Calculate real link health based on stage progress
    const calculateLinkHealth = () => {
        if (isUnknown) return 0;
        
        const stages = [
            'offer_accepted',
            'mortgage_approval', 
            'searches_surveys',
            'surveys_complete',
            'contracts_exchanged',
            'completion'
        ];
        
        const totalProgress = stages.reduce((sum, stage) => sum + getStageProgress(stage), 0);
        const averageProgress = totalProgress / stages.length;
        
        return Math.round(averageProgress);
    };

    const actualLinkHealth = calculateLinkHealth();

    const stages = [
        { name: 'Offer Accepted', progress: getStageProgress('offer_accepted'), color: 'green' },
        { name: 'Mortgage Approved', progress: getStageProgress('mortgage_approval'), color: 'orange' },
        { name: 'Searches Complete', progress: getStageProgress('searches_surveys'), color: 'orange' },
        { name: 'Surveys Complete', progress: getStageProgress('surveys_complete'), color: 'orange' },
        { name: 'Contracts Exchanged', progress: getStageProgress('contracts_exchanged'), color: 'red' },
        { name: 'Completion Achieved', progress: getStageProgress('completion'), color: 'red' },
    ];

    const getButtonText = () => {
        if (isUnknown) return 'Build this Link';
        if (type === 'linked') return 'View Chain Partner';
        if (isEditable && isUserOwned) return 'Update my Link';
        return 'Contact Link Owner';
    };

    const getButtonAction = () => {
        if (type === 'linked') {
            // Navigate to the chain partner's profile or show their details
            const linkedUser = chainData?.linked_user;
            if (linkedUser?.user_id) {
                window.location.href = `/messages?user=${linkedUser.user_id}`;
            } else {
                toast.info('Chain partner details not available');
            }
        } else if (isUnknown || (isEditable && isUserOwned)) {
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
            className={`relative w-[240px] sm:w-[280px] flex-shrink-0 transition-all duration-300`}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* House Shape Container */}
            <div className="relative">
                {/* Triangular Roof */}
                <div 
                    className={`w-full h-8 relative ${
                        isUnknown ? 'bg-gray-400' : 
                        type === 'linked' ? 'bg-purple-400' :
                        type === 'buying' ? 'bg-blue-500' :
                        type === 'selling' ? 'bg-green-500' :
                        'bg-gray-400'
                    }`}
                    style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                    }}
                >
                    {/* Chimney */}
                    {!isUnknown && (
                        <div 
                            className={`absolute top-1 right-6 w-2 h-3 ${
                                type === 'linked' ? 'bg-purple-600' :
                                type === 'buying' ? 'bg-blue-700' :
                                type === 'selling' ? 'bg-green-700' :
                                'bg-gray-600'
                            }`}
                        ></div>
                    )}
                </div>
                
                {/* Rectangular Body */}
                <div className={`bg-white border-2 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 shadow-lg relative ${
                    isUnknown ? 'border-gray-300 bg-gray-50' : 
                    type === 'linked' ? 'border-purple-300 bg-purple-50' :
                    'border-gray-200'
                } rounded-b-xl`}
                >
                    {/* Windows and Door decorations */}
                    {!isUnknown && (
                        <>
                            {/* Windows */}
                            <div className="absolute top-2 left-4 w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm opacity-60"></div>
                            <div className="absolute top-2 right-4 w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm opacity-60"></div>
                            {/* Door */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-amber-700 rounded-t-sm opacity-70"></div>
                            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 ml-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
                        </>
                    )}
            {/* House Title */}
            <div className="text-center mb-3 sm:mb-4">
                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">
                    {type === 'linked' && <span className="text-purple-500 mr-1">🔗</span>}
                    {title}
                </h4>
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
                            stroke={isUnknown ? '#9ca3af' : actualLinkHealth >= 75 ? '#22c55e' : actualLinkHealth >= 50 ? '#eab308' : actualLinkHealth >= 25 ? '#f97316' : '#ef4444'}
                            strokeWidth="2"
                            strokeDasharray={`${actualLinkHealth}, 100`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm sm:text-lg font-bold ${isUnknown ? 'text-gray-400' : getHealthColor(actualLinkHealth)}`}>
                            {isUnknown ? '?' : `${actualLinkHealth}%`}
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
                        : type === 'linked'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : isEditable && isUserOwned
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
            >
                {getButtonText()}
            </button>
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
                    chainData={chainData}
                    onUpdate={(data) => {
                        // Handle update callback - refresh parent component
                        console.log('Property updated:', data);
                        if (onRefresh) {
                            onRefresh();
                        }
                    }}
                />
            )}
        </motion.div>
    );
};

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    type: 'buying' | 'selling' | 'unknown' | 'linked';
    isUnknown: boolean;
    isEditable: boolean;
    onUpdate?: (data: any) => void;
    chainData?: any;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
    isOpen,
    onClose,
    title,
    type,
    isUnknown,
    isEditable,
    onUpdate,
    chainData
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    // Helper function to get current progress from chainData
    const getCurrentProgress = (stage: string, fallback: number) => {
        if (!isEditable || !chainData?.chain_status) return fallback;
        
        const chainStatus = chainData.chain_status;
        
        // First check type-specific status
        const typeSpecificStatus = chainStatus[type] || {};
        const stageData = typeSpecificStatus[stage];
        if (stageData) {
            return stageData.progress !== undefined ? stageData.progress : (stageData.completed ? 100 : 0);
        }
        
        // Fallback: check legacy data in root level
        const legacyStageData = chainStatus[stage];
        if (legacyStageData) {
            return legacyStageData.progress !== undefined ? legacyStageData.progress : (legacyStageData.completed ? 100 : 0);
        }
        
        return fallback;
    };

    const [formData, setFormData] = useState({
        // For unknown properties
        rightmoveLink: '',
        agentName: '',
        agentEmail: '',
        // For progress updates - initialize with current or fallback values
        stages: {
            offerAccepted: getCurrentProgress('offer_accepted', type === 'buying' ? 100 : type === 'selling' ? 100 : 0),
            mortgageApproved: getCurrentProgress('mortgage_approval', type === 'buying' ? 100 : type === 'selling' ? 75 : 0),
            searchesComplete: getCurrentProgress('searches_surveys', type === 'buying' ? 50 : type === 'selling' ? 50 : 0),
            surveysComplete: getCurrentProgress('surveys_complete', type === 'buying' ? 50 : type === 'selling' ? 50 : 0),
            contractsExchanged: getCurrentProgress('contracts_exchanged', 0),
            completionAchieved: getCurrentProgress('completion', 0)
        },
        // For contact messages
        message: ''
    });

    const handleStageChange = (stage: string, value: number) => {
        const currentStages = formData.stages as any;
        const wasCompleted = currentStages[stage] >= 100;
        
        setFormData(prev => ({
            ...prev,
            stages: {
                ...prev.stages,
                [stage]: value
            }
        }));
        
        // Show celebration toast for newly completed stages
        if (value === 100 && !wasCompleted) {
            const stageNames: { [key: string]: string } = {
                offerAccepted: 'Offer Accepted',
                mortgageApproved: 'Mortgage Approved',
                searchesComplete: 'Searches Complete',
                surveysComplete: 'Surveys Complete',
                contractsExchanged: 'Contracts Exchanged',
                completionAchieved: 'Completion Achieved'
            };
            
            toast.success(`🎉 Congratulations! ${stageNames[stage]} completed!`, {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        
        try {
            if (isUnknown) {
                // Handle building new link
                const response = await fetch('/api/chain/build-link', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        type,
                        rightmove_link: formData.rightmoveLink,
                        agent_name: formData.agentName,
                        agent_email: formData.agentEmail
                    })
                });

                const result = await response.json();
                if (result.success) {
                    toast.success('🔗 Chain link built successfully!');
                    setTimeout(() => {
                        onUpdate?.(result.data);
                        onClose();
                    }, 1000);
                } else {
                    toast.error('❌ Failed to build link: ' + (result.message || 'Unknown error'));
                }
            } else if (isEditable) {
                // Handle progress update
                const response = await fetch('/api/chain/update-progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        type,
                        stages: formData.stages
                    })
                });

                const result = await response.json();
                if (result.success) {
                    toast.success('✅ Progress updated and synced to your chain partners!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    setTimeout(() => {
                        onUpdate?.(result.data);
                        onClose();
                    }, 1000);
                } else {
                    toast.error('❌ Failed to update progress: ' + (result.message || 'Unknown error'));
                }
            } else {
                // Handle contact message
                const response = await fetch('/api/chain/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        type,
                        message: formData.message
                    })
                });

                const result = await response.json();
                if (result.success) {
                    toast.success('💬 Message sent successfully!');
                    setTimeout(() => {
                        onClose();
                    }, 1000);
                } else {
                    toast.error('❌ Failed to send message: ' + (result.message || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('❌ An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-700 text-sm">{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700 text-sm">{errorMessage}</span>
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                    {isUnknown ? (
                        <>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Property Rightmove Link
                                </label>
                                <input
                                    type="url"
                                    value={formData.rightmoveLink}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rightmoveLink: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                                    placeholder="https://rightmove.co.uk/properties/..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                    Estate Agent Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.agentName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
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
                                    value={formData.agentEmail}
                                    onChange={(e) => setFormData(prev => ({ ...prev, agentEmail: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 placeholder-gray-500"
                                    placeholder="agent@agency.com"
                                />
                            </div>
                        </>
                    ) : isEditable ? (
                        <div>
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Update Stage Progress</h4>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-700 flex-1 mr-3">Offer Accepted</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.stages.offerAccepted}
                                            onChange={(e) => handleStageChange('offerAccepted', parseInt(e.target.value))}
                                            className="w-16 sm:w-24"
                                        />
                                        <span className="text-xs text-gray-600 w-8">{formData.stages.offerAccepted}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-700 flex-1 mr-3">Mortgage Approved</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.stages.mortgageApproved}
                                            onChange={(e) => handleStageChange('mortgageApproved', parseInt(e.target.value))}
                                            className="w-16 sm:w-24"
                                        />
                                        <span className="text-xs text-gray-600 w-8">{formData.stages.mortgageApproved}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-700 flex-1 mr-3">Searches Complete</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.stages.searchesComplete}
                                            onChange={(e) => handleStageChange('searchesComplete', parseInt(e.target.value))}
                                            className="w-16 sm:w-24"
                                        />
                                        <span className="text-xs text-gray-600 w-8">{formData.stages.searchesComplete}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-700 flex-1 mr-3">Surveys Complete</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.stages.surveysComplete}
                                            onChange={(e) => handleStageChange('surveysComplete', parseInt(e.target.value))}
                                            className="w-16 sm:w-24"
                                        />
                                        <span className="text-xs text-gray-600 w-8">{formData.stages.surveysComplete}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-700 flex-1 mr-3">Contracts Exchanged</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.stages.contractsExchanged}
                                            onChange={(e) => handleStageChange('contractsExchanged', parseInt(e.target.value))}
                                            className="w-16 sm:w-24"
                                        />
                                        <span className="text-xs text-gray-600 w-8">{formData.stages.contractsExchanged}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-700 flex-1 mr-3">Completion Achieved</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.stages.completionAchieved}
                                            onChange={(e) => handleStageChange('completionAchieved', parseInt(e.target.value))}
                                            className="w-16 sm:w-24"
                                        />
                                        <span className="text-xs text-gray-600 w-8">{formData.stages.completionAchieved}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Send Message</h4>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={4}
                                placeholder="Request an update on the property progress..."
                                required
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || (isUnknown && !formData.rightmoveLink) || (!isUnknown && !isEditable && !formData.message)}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isUnknown ? 'Building...' : isEditable ? 'Updating...' : 'Sending...'}
                            </>
                        ) : (
                            <>
                                {isUnknown ? 'Build Link' : isEditable ? 'Update Progress' : 'Send Message'}
                            </>
                        )}
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
    isUnknown = false,
    onRefresh,
    chainData
}) => {
    const [showModal, setShowModal] = useState(false);

    const getButtonText = () => {
        if (isUnknown) return 'Build this Link';
        if (type === 'linked') return 'View Chain Partner';
        if (isEditable && isUserOwned) return 'Update my Link';
        return 'Contact Link Owner';
    };

    const getButtonAction = () => {
        if (type === 'linked') {
            // Navigate to the chain partner's profile or show their details
            const linkedUser = chainData?.linked_user;
            if (linkedUser?.user_id) {
                window.location.href = `/messages?user=${linkedUser.user_id}`;
            } else {
                toast.info('Chain partner details not available');
            }
        } else if (isUnknown || (isEditable && isUserOwned)) {
            setShowModal(true);
        } else {
            setShowModal(true);
        }
    };

    // Calculate real link health for mobile version
    const calculateMobileLinkHealth = () => {
        if (isUnknown) return 0;
        
        const chainStatus = chainData?.chain_status || {};
        const typeSpecificStatus = chainStatus[type] || {};
        
        const stages = [
            'offer_accepted',
            'mortgage_approval', 
            'searches_surveys',
            'surveys_complete',
            'contracts_exchanged',
            'completion'
        ];
        
        const totalProgress = stages.reduce((sum, stage) => {
            // First check type-specific status
            const stageData = typeSpecificStatus[stage];
            if (stageData) {
                return sum + (stageData.progress !== undefined ? stageData.progress : (stageData.completed ? 100 : 0));
            }
            
            // Fallback: check legacy data in root level
            const legacyStageData = chainStatus[stage];
            if (legacyStageData) {
                return sum + (legacyStageData.progress !== undefined ? legacyStageData.progress : (legacyStageData.completed ? 100 : 0));
            }
            
            // Use same fallbacks as desktop version
            const fallbacks: { [key: string]: number } = {
                'offer_accepted': type === 'buying' ? 100 : type === 'selling' ? 100 : 0,
                'mortgage_approval': type === 'buying' ? 100 : type === 'selling' ? 75 : 0,
                'searches_surveys': type === 'buying' ? 50 : type === 'selling' ? 50 : 0,
                'surveys_complete': type === 'buying' ? 50 : type === 'selling' ? 50 : 0,
                'contracts_exchanged': 0,
                'completion': 0,
            };
            return sum + (fallbacks[stage] || 0);
        }, 0);
        
        const averageProgress = totalProgress / stages.length;
        return Math.round(averageProgress);
    };

    const actualMobileLinkHealth = calculateMobileLinkHealth();

    const houseColor = type === 'buying' ? '#10B981' :
                      type === 'selling' ? '#F59E0B' :
                      type === 'linked' ? '#8B5CF6' :
                      '#6B7280';

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            {/* House Shape Container */}
            <div className="relative">
                {/* Triangular Roof */}
                <div 
                    className={`w-full h-6 relative ${
                        isUnknown ? 'bg-gray-400' : 
                        type === 'linked' ? 'bg-purple-400' :
                        type === 'buying' ? 'bg-blue-500' :
                        type === 'selling' ? 'bg-green-500' :
                        'bg-gray-400'
                    }`}
                    style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                    }}
                >
                    {/* Small Chimney for mobile */}
                    {!isUnknown && (
                        <div 
                            className={`absolute top-0.5 right-4 w-1.5 h-2 ${
                                type === 'linked' ? 'bg-purple-600' :
                                type === 'buying' ? 'bg-blue-700' :
                                type === 'selling' ? 'bg-green-700' :
                                'bg-gray-600'
                            }`}
                        ></div>
                    )}
                </div>
                
                {/* Rectangular Body */}
                <div className={`bg-white p-4 border-2 rounded-b-xl ${
                    isUnknown ? 'border-gray-300 bg-gray-50' : 
                    type === 'linked' ? 'border-purple-300 bg-purple-50' :
                    'border-gray-200'
                }`}>
                    <div className="flex items-center space-x-4">
                        {/* House Icon - Small visual indicator */}
                        <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isUnknown ? 'bg-gray-200' : 
                                type === 'linked' ? 'bg-purple-100' :
                                type === 'buying' ? 'bg-blue-100' :
                                type === 'selling' ? 'bg-green-100' :
                                'bg-gray-100'
                            }`}>
                                {isUnknown ? (
                                    <span className="text-gray-500 text-sm font-bold">?</span>
                                ) : (
                                    <span className="text-sm">🏠</span>
                                )}
                            </div>
                        </div>

                        {/* Property Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                                Health: {isUnknown ? 'Unknown' : `${actualMobileLinkHealth}%`}
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
                                        width: `${isUnknown ? 0 : actualMobileLinkHealth}%`,
                                        backgroundColor: houseColor
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-1 text-center">
                                {isUnknown ? '?' : `${actualMobileLinkHealth}%`}
                            </p>
                        </div>
                    </div>
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
                    chainData={chainData}
                    onUpdate={(data) => {
                        // Handle update callback - refresh parent component  
                        console.log('Property updated:', data);
                        if (onRefresh) {
                            onRefresh();
                        }
                    }}
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

    // Handle refresh with toast notification
    const handleRefresh = () => {
        toast.info('🔄 Refreshing chain status...', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        onRefresh();
    };

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

            {/* Connection Request Notifications */}
            <ConnectionRequestNotifications 
                onRequestAccepted={onRefresh}
                onRequestDeclined={() => {}}
            />

            {/* Property Chain Visualization */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Property Chain</h3>
                    <div className="flex items-center space-x-2">
                        <div className="hidden sm:block text-xs text-gray-500">
                            {chainData.chain_length > 3 && "← Scroll to see all properties →"}
                        </div>
                        <button
                            onClick={handleRefresh}
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
                            {/* Generate chain based on user role and connected participants */}
                        {chainData.chain_role === 'first_time_buyer' && (
                            <>
                                {/* User's Buying Property */}
                                <PropertyHouseBlock
                                    title="The house I'm buying"
                                    linkHealth={50}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="buying"
                                    onRefresh={onRefresh}
                                    chainData={chainData}
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-green-400 rounded flex-shrink-0"></div>
                                
                                {/* Connected Participants' Properties */}
                                {chainData.chain_participants && chainData.chain_participants.map((participant: any, index: number) => (
                                    participant.properties && participant.properties.map((property: any, propIndex: number) => (
                                        <React.Fragment key={`${participant.user_id}-${propIndex}`}>
                                            <PropertyHouseBlock
                                                title={`${participant.user_name || 'Chain Partner'}'s Property`}
                                                linkHealth={property.progress_score || 0}
                                                isUserOwned={false}
                                                isEditable={false}
                                                type="linked"
                                                isUnknown={false}
                                                onRefresh={onRefresh}
                                                chainData={{
                                                    ...participant.chain_data,
                                                    linked_property: property,
                                                    linked_user: participant,
                                                    chain_status: participant.chain_status || property.chain_status || {}
                                                }}
                                            />
                                            {/* Chain Connector */}
                                            <div className="w-4 lg:w-8 h-1 bg-green-400 rounded flex-shrink-0"></div>
                                        </React.Fragment>
                                    ))
                                ))}
                                
                                {/* Unknown/Seller's Property (only if no connected participants) */}
                                {(!chainData.chain_participants || chainData.chain_participants.length === 0) && (
                                    <PropertyHouseBlock
                                        title="Seller's onward property"
                                        linkHealth={0}
                                        isUserOwned={false}
                                        isEditable={false}
                                        type="unknown"
                                        isUnknown={true}
                                        onRefresh={onRefresh}
                                        chainData={chainData}
                                    />
                                )}
                            </>
                        )}

                        {chainData.chain_role === 'seller_only' && (
                            <>
                                {/* Connected Participants' Properties (Buyers) */}
                                {chainData.chain_participants && chainData.chain_participants.map((participant: any, index: number) => (
                                    participant.properties && participant.properties.map((property: any, propIndex: number) => (
                                        <React.Fragment key={`${participant.user_id}-${propIndex}`}>
                                            <PropertyHouseBlock
                                                title={`${participant.user_name || 'Chain Partner'}'s Property`}
                                                linkHealth={property.progress_score || 0}
                                                isUserOwned={false}
                                                isEditable={false}
                                                type="linked"
                                                isUnknown={false}
                                                onRefresh={onRefresh}
                                                chainData={{
                                                    ...participant.chain_data,
                                                    linked_property: property,
                                                    linked_user: participant,
                                                    chain_status: participant.chain_status || property.chain_status || {}
                                                }}
                                            />
                                            {/* Chain Connector */}
                                            <div className="w-4 lg:w-8 h-1 bg-green-400 rounded flex-shrink-0"></div>
                                        </React.Fragment>
                                    ))
                                ))}
                                
                                {/* Unknown/Buyer's Property (only if no connected participants) */}
                                {(!chainData.chain_participants || chainData.chain_participants.length === 0) && (
                                    <>
                                        <PropertyHouseBlock
                                            title="Buyer's onward property"
                                            linkHealth={0}
                                            isUserOwned={false}
                                            isEditable={false}
                                            type="unknown"
                                            isUnknown={true}
                                            onRefresh={onRefresh}
                                            chainData={chainData}
                                        />
                                        {/* Chain Connector */}
                                        <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded flex-shrink-0"></div>
                                    </>
                                )}
                                
                                {/* User's Selling Property */}
                                <PropertyHouseBlock
                                    title="The house I'm selling"
                                    linkHealth={30}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="selling"
                                    onRefresh={onRefresh}
                                    chainData={chainData}
                                />
                            </>
                        )}

                        {chainData.chain_role === 'buyer_seller' && (
                            <>
                                {/* Down Chain Connected Participants */}
                                {chainData.chain_participants && chainData.chain_participants.filter((p: any) => p.role === 'down_chain').length > 0 ? (
                                    chainData.chain_participants.filter((p: any) => p.role === 'down_chain').map((participant: any, index: number) => (
                                        participant.properties && participant.properties.map((property: any, propIndex: number) => (
                                            <React.Fragment key={`down-${participant.user_id}-${propIndex}`}>
                                                <PropertyHouseBlock
                                                    title={`${participant.user_name || 'Down Chain'}'s Property`}
                                                    linkHealth={property.progress_score || 0}
                                                    isUserOwned={false}
                                                    isEditable={false}
                                                    type="linked"
                                                    isUnknown={false}
                                                    onRefresh={onRefresh}
                                                    chainData={{
                                                        ...participant.chain_data,
                                                        linked_property: property,
                                                        linked_user: participant,
                                                        chain_status: participant.chain_status || property.chain_status || {}
                                                    }}
                                                />
                                                {/* Chain Connector */}
                                                <div className="w-4 lg:w-8 h-1 bg-green-400 rounded flex-shrink-0"></div>
                                            </React.Fragment>
                                        ))
                                    ))
                                ) : (
                                    <>
                                        {/* Unknown Down Chain */}
                                        <PropertyHouseBlock
                                            title="Down chain property"
                                            linkHealth={0}
                                            isUserOwned={false}
                                            isEditable={false}
                                            type="unknown"
                                            isUnknown={true}
                                            onRefresh={onRefresh}
                                            chainData={chainData}
                                        />
                                        {/* Chain Connector */}
                                        <div className="w-4 lg:w-8 h-1 bg-gray-300 rounded flex-shrink-0"></div>
                                    </>
                                )}
                                
                                {/* User's Selling Property */}
                                <PropertyHouseBlock
                                    title="The house I'm selling"
                                    linkHealth={30}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="selling"
                                    onRefresh={onRefresh}
                                    chainData={chainData}
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-green-400 rounded flex-shrink-0"></div>
                                
                                {/* User's Buying Property */}
                                <PropertyHouseBlock
                                    title="The house I'm buying"
                                    linkHealth={50}
                                    isUserOwned={true}
                                    isEditable={true}
                                    type="buying"
                                    onRefresh={onRefresh}
                                    chainData={chainData}
                                />
                                {/* Chain Connector */}
                                <div className="w-4 lg:w-8 h-1 bg-green-400 rounded flex-shrink-0"></div>
                                
                                {/* Up Chain Connected Participants */}
                                {chainData.chain_participants && chainData.chain_participants.filter((p: any) => p.role === 'up_chain').length > 0 ? (
                                    chainData.chain_participants.filter((p: any) => p.role === 'up_chain').map((participant: any, index: number) => (
                                        participant.properties && participant.properties.map((property: any, propIndex: number) => (
                                            <React.Fragment key={`up-${participant.user_id}-${propIndex}`}>
                                                <PropertyHouseBlock
                                                    title={`${participant.user_name || 'Up Chain'}'s Property`}
                                                    linkHealth={property.progress_score || 0}
                                                    isUserOwned={false}
                                                    isEditable={false}
                                                    type="linked"
                                                    isUnknown={false}
                                                    onRefresh={onRefresh}
                                                    chainData={{
                                                        ...participant.chain_data,
                                                        linked_property: property,
                                                        linked_user: participant,
                                                        chain_status: participant.chain_status || property.chain_status || {}
                                                    }}
                                                />
                                            </React.Fragment>
                                        ))
                                    ))
                                ) : (
                                    <>
                                        {/* Unknown Up Chain */}
                                        <PropertyHouseBlock
                                            title="Up chain property"
                                            linkHealth={0}
                                            isUserOwned={false}
                                            isEditable={false}
                                            type="unknown"
                                            isUnknown={true}
                                            onRefresh={onRefresh}
                                            chainData={chainData}
                                        />
                                    </>
                                )}
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
                                    onRefresh={onRefresh}
                                    chainData={chainData}
                                />
                                <div className="flex justify-center">
                                    <div className="w-1 h-8 bg-green-400 rounded"></div>
                                </div>
                                
                                {/* Connected Participants' Properties */}
                                {chainData.chain_participants && chainData.chain_participants.map((participant: any, index: number) => (
                                    participant.properties && participant.properties.map((property: any, propIndex: number) => (
                                        <React.Fragment key={`mobile-${participant.user_id}-${propIndex}`}>
                                            <PropertyHouseBlockMobile
                                                title={`${participant.user_name || 'Chain Partner'}'s Property`}
                                                linkHealth={property.progress_score || 0}
                                                isUserOwned={false}
                                                isEditable={false}
                                                type="linked"
                                                isUnknown={false}
                                                onRefresh={onRefresh}
                                                chainData={{
                                                    ...participant.chain_data,
                                                    linked_property: property,
                                                    linked_user: participant,
                                                    chain_status: participant.chain_status || property.chain_status || {}
                                                }}
                                            />
                                            <div className="flex justify-center">
                                                <div className="w-1 h-8 bg-green-400 rounded"></div>
                                            </div>
                                        </React.Fragment>
                                    ))
                                ))}
                                
                                {/* Unknown/Seller's Property (only if no connected participants) */}
                                {(!chainData.chain_participants || chainData.chain_participants.length === 0) && (
                                    <PropertyHouseBlockMobile
                                        title="Seller's onward property"
                                        linkHealth={0}
                                        isUserOwned={false}
                                        isEditable={false}
                                        type="unknown"
                                        isUnknown={true}
                                        onRefresh={onRefresh}
                                        chainData={chainData}
                                    />
                                )}
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
                                    onRefresh={onRefresh}
                                    chainData={chainData}
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
                                    onRefresh={onRefresh}
                                    chainData={chainData}
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
                                    onRefresh={onRefresh}
                                    chainData={chainData}
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
                                    onRefresh={onRefresh}
                                    chainData={chainData}
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
                                    onRefresh={onRefresh}
                                    chainData={chainData}
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
                                    onRefresh={onRefresh}
                                    chainData={chainData}
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

            {/* Chain Participants Section */}
            {chainData.chain_participants && Array.isArray(chainData.chain_participants) && chainData.chain_participants.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <span className="text-xl mr-2">🔗</span>
                        Connected Chain Partners ({chainData.chain_participants.length})
                    </h3>
                    
                    <div className="space-y-4">
                        {chainData.chain_participants.map((participant: any, index: number) => (
                            <motion.div
                                key={participant.user_id || index}
                                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        {/* User Avatar */}
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-lg">
                                                {participant.user_name ? participant.user_name.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        </div>
                                        
                                        {/* User Details */}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{participant.user_name || 'Unknown User'}</h4>
                                            <p className="text-sm text-gray-600">{participant.user_email || 'No email provided'}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Connected on {participant.linked_at ? new Date(participant.linked_at).toLocaleDateString() : 'Unknown date'}
                                            </p>
                                            
                                            {/* Shared Properties */}
                                            {participant.properties && participant.properties.length > 0 && (
                                                <div className="mt-3">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Shared Properties:</h5>
                                                    <div className="space-y-2">
                                                        {participant.properties.map((property: any, propIndex: number) => (
                                                            <div key={propIndex} className="bg-white bg-opacity-60 rounded-lg p-3 border border-blue-100">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 text-sm">
                                                                            {property.property_title || 'Unknown Property'}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">
                                                                            Linked on {property.linked_at ? new Date(property.linked_at).toLocaleDateString() : 'Unknown date'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                                            🏠 Linked
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Chain Status */}
                                    <div className="text-right">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                            Active Chain
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="mt-4 flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            if (participant.user_id) {
                                                window.location.href = `/messages?user=${participant.user_id}`;
                                            } else {
                                                toast.error('User information not available');
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        💬 Message
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Share progress or updates
                                            toast.info('Progress sharing feature coming soon!');
                                        }}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                    >
                                        📊 Share Progress
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (participant.user_id) {
                                                window.location.href = `/housemover/connections?user=${participant.user_id}`;
                                            } else {
                                                toast.error('User information not available');
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        👤 View Profile
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    
                    {/* Chain Summary */}
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-900">Chain Status</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    You are connected with {chainData.chain_participants.length} chain partner{chainData.chain_participants.length !== 1 ? 's' : ''}.
                                    This creates a collaborative moving network that can help streamline your transactions.
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                                    Chain Active
                                </span>
                            </div>
                        </div>
                    </div>
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