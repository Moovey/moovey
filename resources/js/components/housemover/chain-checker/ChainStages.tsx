import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChainStagesProps {
    chainData: any;
    onUpdate: () => void;
}

const ChainStages: React.FC<ChainStagesProps> = ({ chainData, onUpdate }) => {
    const [updatingStage, setUpdatingStage] = useState<string | null>(null);
    const [stageProgress, setStageProgress] = useState<Record<string, number>>({});

    const stages = [
        {
            id: 'offer_accepted',
            title: 'Offer Accepted',
            description: 'Your offer has been accepted by the seller',
            icon: '🤝',
            tips: ['Celebrate this milestone!', 'Start arranging mortgage', 'Book property survey']
        },
        {
            id: 'mortgage_approved',
            title: 'Mortgage Approved',
            description: 'Mortgage application approved and offer issued',
            icon: '💰',
            tips: ['Submit all required documents', 'Arrange building insurance', 'Confirm completion date']
        },
        {
            id: 'searches_complete',
            title: 'Searches Complete',
            description: 'Legal searches and property survey completed',
            icon: '🔍',
            tips: ['Chase solicitor for updates', 'Review search results', 'Negotiate if issues found']
        },
        {
            id: 'surveys_complete',
            title: 'Surveys Complete',
            description: 'Property survey and valuation completed',
            icon: '🏠',
            tips: ['Review survey report', 'Address any issues found', 'Renegotiate if necessary']
        },
        {
            id: 'contracts_exchanged',
            title: 'Contracts Exchanged',
            description: 'Legal contracts signed and exchanged',
            icon: '📝',
            tips: ['You are now legally committed', 'Transfer deposit funds', 'Arrange removal company']
        },
        {
            id: 'completion',
            title: 'Completion Achieved',
            description: 'Keys collected and move completed',
            icon: '🔑',
            tips: ['Final walk-through', 'Collect keys', 'Update address everywhere']
        }
    ];

    const progressOptions = [
        { value: 0, label: 'Not Started', color: 'text-red-600', bgColor: 'bg-red-500' },
        { value: 25, label: 'In Progress', color: 'text-orange-600', bgColor: 'bg-orange-500' },
        { value: 50, label: 'Awaiting Response', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
        { value: 75, label: 'Pending Completion', color: 'text-blue-600', bgColor: 'bg-blue-500' },
        { value: 100, label: 'Complete', color: 'text-green-600', bgColor: 'bg-green-500' }
    ];

    // Initialize stage progress from chain data
    React.useEffect(() => {
        const initialProgress: Record<string, number> = {};
        stages.forEach(stage => {
            const status = chainData.chain_status?.[stage.id];
            if (status?.completed) {
                initialProgress[stage.id] = 100;
            } else {
                // Check for stored percentage progress
                initialProgress[stage.id] = status?.progress || 0;
            }
        });
        setStageProgress(initialProgress);
    }, [chainData]);

    const handleProgressUpdate = async (stageId: string, progress: number) => {
        setUpdatingStage(stageId);
        
        try {
            const response = await fetch(`/api/chain-checker/${chainData.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    stage: stageId,
                    completed: progress === 100,
                    progress: progress,
                    notes: `Progress updated to ${progress}%`,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStageProgress(prev => ({ ...prev, [stageId]: progress }));
                    onUpdate();
                }
            }
        } catch (error) {
            // Silent error handling - stage update failed
        } finally {
            setUpdatingStage(null);
        }
    };

    const calculateOverallLinkHealth = () => {
        const totalProgress = Object.values(stageProgress).reduce((sum, progress) => sum + progress, 0);
        const maxProgress = stages.length * 100;
        return Math.round((totalProgress / maxProgress) * 100);
    };

    const getProgressOption = (progress: number) => {
        return progressOptions.find(option => option.value === progress) || progressOptions[0];
    };

    const isUserOwnedProperty = () => {
        // Check if this is a property the user owns and can edit
        // For now, we'll assume user can edit if they have a chain_role
        return chainData.chain_role && (
            chainData.chain_role === 'first_time_buyer' ||
            chainData.chain_role === 'seller_only' ||
            chainData.chain_role === 'buyer_seller'
        );
    };

    if (!isUserOwnedProperty()) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    View-Only Access
                </h3>
                <p className="text-gray-600">
                    You can only view progress for properties you don't own. 
                    Contact the property owner to request updates.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Progress Tracking Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-4 sm:p-6 border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <span className="text-blue-500">📊</span>
                            <span>Progress Tracking</span>
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Update your property link progress</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                            {calculateOverallLinkHealth()}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Link Health</div>
                    </div>
                </div>
                
                {/* Overall Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-2">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 sm:h-4 rounded-full transition-all duration-500"
                        style={{ width: `${calculateOverallLinkHealth()}%` }}
                    ></div>
                </div>
                
                <div className="text-center text-xs sm:text-sm text-gray-600">
                    Overall property link completion
                </div>
            </div>

            {/* Individual Stage Progress */}
            <div className="space-y-4 sm:space-y-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Stage Progress</h4>
                
                {stages.map((stage, index) => {
                    const currentProgress = stageProgress[stage.id] || 0;
                    const isUpdating = updatingStage === stage.id;
                    const progressOption = getProgressOption(currentProgress);
                    
                    return (
                        <motion.div
                            key={stage.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start space-x-3 sm:space-x-4">
                                    {/* Stage Icon */}
                                    <div className="flex-shrink-0">
                                        <div className={`
                                            w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-lg sm:text-xl
                                            ${currentProgress === 100 
                                                ? 'border-green-500 bg-green-50' 
                                                : currentProgress > 0
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 bg-gray-50'
                                            }
                                        `}>
                                            {currentProgress === 100 ? '✅' : stage.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Stage Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                                            <div className="flex-1">
                                                <h5 className="text-base sm:text-lg font-semibold text-gray-900">
                                                    {stage.title}
                                                </h5>
                                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                                    {stage.description}
                                                </p>
                                            </div>
                                            
                                            {/* Current Status Badge */}
                                            <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${progressOption.color} bg-gray-100 text-center`}>
                                                {progressOption.label} ({currentProgress}%)
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-3 sm:mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs sm:text-sm font-medium text-gray-700">Progress</span>
                                                <span className="text-xs sm:text-sm text-gray-600">{currentProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-500 ${progressOption.bgColor}`}
                                                    style={{ width: `${currentProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Selection Radio Buttons */}
                                        <div className="space-y-2">
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                                Update Progress:
                                            </label>
                                            <div className="grid grid-cols-5 gap-1 sm:gap-2">
                                                {progressOptions.map((option) => (
                                                    <label
                                                        key={option.value}
                                                        className={`
                                                            relative flex items-center justify-center p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all
                                                            ${currentProgress === option.value
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                            }
                                                            ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`progress-${stage.id}`}
                                                            value={option.value}
                                                            checked={currentProgress === option.value}
                                                            onChange={() => handleProgressUpdate(stage.id, option.value)}
                                                            disabled={isUpdating}
                                                            className="sr-only"
                                                        />
                                                        <div className="text-center">
                                                            <div className={`text-lg font-bold ${option.color}`}>
                                                                {option.value}%
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                {option.label}
                                                            </div>
                                                        </div>
                                                        {currentProgress === option.value && (
                                                            <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                            </div>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Loading State */}
                                        {isUpdating && (
                                            <div className="flex items-center justify-center mt-4 p-2 bg-blue-50 rounded-lg">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                                <span className="text-sm text-blue-600">Updating progress...</span>
                                            </div>
                                        )}
                                        
                                        {/* Tips */}
                                        <div className="mt-4">
                                            <details className="group">
                                                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                                    💡 Tips for this stage
                                                </summary>
                                                <div className="mt-2 ml-4">
                                                    <ul className="space-y-1">
                                                        {stage.tips.map((tip, tipIndex) => (
                                                            <li key={tipIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                                                                <span className="text-blue-500 mt-0.5">•</span>
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <span>📈</span>
                    <span>Progress Summary</span>
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {stages.map((stage) => {
                        const progress = stageProgress[stage.id] || 0;
                        const option = getProgressOption(progress);
                        return (
                            <div key={stage.id} className="text-center">
                                <div className="text-2xl mb-1">{stage.icon}</div>
                                <div className="text-xs text-gray-600 mb-1">{stage.title}</div>
                                <div className={`text-sm font-bold ${option.color}`}>
                                    {progress}%
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {calculateOverallLinkHealth() === 100 && (
                    <div className="mt-6 text-center">
                        <div className="text-4xl mb-2">🎉</div>
                        <div className="text-lg font-semibold text-green-800">
                            Congratulations! Your property link is 100% complete!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChainStages;