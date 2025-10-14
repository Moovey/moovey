import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChainStagesProps {
    chainData: any;
    onUpdate: () => void;
}

const ChainStages: React.FC<ChainStagesProps> = ({ chainData, onUpdate }) => {
    const [updatingStage, setUpdatingStage] = useState<string | null>(null);
    const [stageNotes, setStageNotes] = useState<Record<string, string>>({});

    const stages = [
        {
            id: 'offer_accepted',
            title: 'Offer Accepted',
            description: 'Your offer has been accepted by the seller',
            icon: '🤝',
            tips: ['Celebrate this milestone!', 'Start arranging mortgage', 'Book property survey']
        },
        {
            id: 'searches_surveys',
            title: 'Searches & Surveys',
            description: 'Legal searches and property survey completed',
            icon: '🔍',
            tips: ['Chase solicitor for updates', 'Review survey results', 'Negotiate if issues found']
        },
        {
            id: 'mortgage_approval',
            title: 'Mortgage Approval',
            description: 'Mortgage application approved and offer issued',
            icon: '💰',
            tips: ['Submit all required documents', 'Arrange building insurance', 'Confirm completion date']
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
            title: 'Completion',
            description: 'Keys collected and move completed',
            icon: '🔑',
            tips: ['Final walk-through', 'Collect keys', 'Update address everywhere']
        }
    ];

    const getStageStatus = (stageId: string) => {
        const status = chainData.chain_status?.[stageId];
        return {
            completed: status?.completed || false,
            notes: status?.notes || '',
            updated_at: status?.updated_at,
        };
    };

    const handleStageToggle = async (stageId: string, completed: boolean) => {
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
                    completed: completed,
                    notes: stageNotes[stageId] || '',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    onUpdate();
                    setStageNotes(prev => ({ ...prev, [stageId]: '' }));
                }
            }
        } catch (error) {
            console.error('Failed to update stage:', error);
        } finally {
            setUpdatingStage(null);
        }
    };

    const calculateOverallProgress = () => {
        const completedStages = stages.filter(stage => 
            getStageStatus(stage.id).completed
        ).length;
        return Math.round((completedStages / stages.length) * 100);
    };

    return (
        <div className="space-y-8">
            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                    <span className="text-sm text-gray-600">
                        {stages.filter(s => getStageStatus(s.id).completed).length} of {stages.length} stages completed
                    </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                        className="bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${calculateOverallProgress()}%` }}
                    ></div>
                </div>
                
                <div className="text-center text-2xl font-bold text-gray-900">
                    {calculateOverallProgress()}% Complete
                </div>
            </div>

            {/* Stages List */}
            <div className="space-y-4">
                {stages.map((stage, index) => {
                    const status = getStageStatus(stage.id);
                    const isUpdating = updatingStage === stage.id;
                    
                    return (
                        <motion.div
                            key={stage.id}
                            className={`
                                bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
                                ${status.completed ? 'ring-2 ring-green-500 ring-opacity-20' : ''}
                            `}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="p-6">
                                <div className="flex items-start space-x-4">
                                    {/* Stage Icon & Status */}
                                    <div className="flex-shrink-0">
                                        <div className={`
                                            w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl
                                            ${status.completed 
                                                ? 'border-green-500 bg-green-50' 
                                                : 'border-gray-300 bg-gray-50'
                                            }
                                        `}>
                                            {status.completed ? '✅' : stage.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Stage Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {stage.title}
                                                </h4>
                                                <p className="text-gray-600 mt-1">
                                                    {stage.description}
                                                </p>
                                                
                                                {status.updated_at && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Last updated: {new Date(status.updated_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            {/* Toggle Button */}
                                            <button
                                                onClick={() => handleStageToggle(stage.id, !status.completed)}
                                                disabled={isUpdating}
                                                className={`
                                                    px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50
                                                    ${status.completed
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-[#00BCD4] text-white hover:bg-[#00ACC1]'
                                                    }
                                                `}
                                            >
                                                {isUpdating ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                                        <span>Updating...</span>
                                                    </div>
                                                ) : (
                                                    status.completed ? 'Mark as Pending' : 'Mark as Complete'
                                                )}
                                            </button>
                                        </div>
                                        
                                        {/* Stage Notes */}
                                        {status.notes && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-medium">Notes:</span> {status.notes}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Add Notes Section */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Add notes for this stage (optional):
                                            </label>
                                            <textarea
                                                value={stageNotes[stage.id] || ''}
                                                onChange={(e) => setStageNotes(prev => ({
                                                    ...prev,
                                                    [stage.id]: e.target.value
                                                }))}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm text-gray-900"
                                                rows={2}
                                                placeholder="Any updates or comments about this stage..."
                                            />
                                        </div>
                                        
                                        {/* Tips */}
                                        <div className="mt-4">
                                            <details className="group">
                                                <summary className="cursor-pointer text-sm font-medium text-[#00BCD4] hover:text-[#00ACC1] transition-colors">
                                                    💡 Tips for this stage
                                                </summary>
                                                <div className="mt-2 ml-4">
                                                    <ul className="space-y-1">
                                                        {stage.tips.map((tip, tipIndex) => (
                                                            <li key={tipIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                                                                <span className="text-[#00BCD4] mt-0.5">•</span>
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

            {/* Next Steps Recommendations */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Recommended Next Steps</span>
                </h3>
                
                <div className="space-y-3">
                    {(() => {
                        const nextStage = stages.find(stage => !getStageStatus(stage.id).completed);
                        if (!nextStage) {
                            return (
                                <div className="bg-green-100 rounded-lg p-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl">🎉</span>
                                        <div>
                                            <div className="font-semibold text-green-800">Congratulations!</div>
                                            <div className="text-green-700">All stages completed. Your move is done!</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        
                        return (
                            <div className="bg-white rounded-lg p-4 border border-yellow-300">
                                <div className="flex items-start space-x-3">
                                    <div className="text-2xl">{nextStage.icon}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            Focus on: {nextStage.title}
                                        </div>
                                        <div className="text-gray-700 mt-1">
                                            {nextStage.description}
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-sm font-medium text-gray-700 mb-1">Action items:</div>
                                            <ul className="space-y-1">
                                                {nextStage.tips.slice(0, 2).map((tip, index) => (
                                                    <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                                        <span className="text-yellow-600 mt-0.5">•</span>
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Complete Chain Button */}
            {calculateOverallProgress() === 100 && (
                <div className="text-center">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to mark your entire chain as completed? This will close your chain tracker.')) {
                                // Handle chain completion
                            }
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg"
                    >
                        🎉 Mark Move Complete
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChainStages;