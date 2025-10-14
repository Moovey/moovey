import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface ChainCheckerData {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    move_type: string;
    chain_length: number;
    chain_status: Record<string, any>;
    estimated_completion?: string;
    notes?: string;
    agent_name?: string;
}

interface ChainUpdateFormProps {
    chainChecker: ChainCheckerData;
    token: string;
    errors?: Record<string, string>;
    success?: string;
}

const ChainUpdateForm: React.FC<ChainUpdateFormProps> = ({ 
    chainChecker, 
    token, 
    errors = {}, 
    success 
}) => {
    const [formData, setFormData] = useState({
        agent_name: chainChecker.agent_name || '',
        chain_status: chainChecker.chain_status || {},
        estimated_completion: chainChecker.estimated_completion || '',
        overall_notes: chainChecker.notes || '',
    });
    const [submitting, setSubmitting] = useState(false);

    const stages = [
        {
            id: 'offer_accepted',
            title: 'Offer Accepted',
            description: 'The buyer\'s offer has been formally accepted',
        },
        {
            id: 'searches_surveys',
            title: 'Searches & Surveys',
            description: 'Legal searches and property survey are in progress or completed',
        },
        {
            id: 'mortgage_approval',
            title: 'Mortgage Approval',
            description: 'Buyer\'s mortgage application has been approved',
        },
        {
            id: 'contracts_exchanged',
            title: 'Contracts Exchanged',
            description: 'Legal contracts have been signed and exchanged',
        },
        {
            id: 'completion',
            title: 'Completion',
            description: 'Property transaction has been completed',
        },
    ];

    const handleStageChange = (stageId: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            chain_status: {
                ...prev.chain_status,
                [stageId]: {
                    ...prev.chain_status[stageId],
                    [field]: value,
                }
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const form = e.target as HTMLFormElement;
        const formDataObj = new FormData(form);
        
        // Add chain status data
        formDataObj.append('chain_status', JSON.stringify(formData.chain_status));

        try {
            await fetch(form.action, {
                method: 'POST',
                body: formDataObj,
            });
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Chain Update Form - Moovey" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
                {/* Header */}
                <div className="bg-white shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-[#00BCD4] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">M</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">Moovey Chain Update</h1>
                                </div>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                Agent Portal
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg"
                        >
                            <div className="flex items-center space-x-2">
                                <span className="text-xl">✅</span>
                                <span>{success}</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Client Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                                <div className="mt-1 text-lg text-gray-900">{chainChecker.user.name}</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Move Type</label>
                                <div className="mt-1 text-lg text-gray-900 capitalize">
                                    {chainChecker.move_type === 'both' ? 'Buying & Selling' : chainChecker.move_type}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Chain Length</label>
                                <div className="mt-1 text-lg text-gray-900">{chainChecker.chain_length} properties</div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Progress</label>
                                <div className="mt-1">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-[#00BCD4] h-2 rounded-full"
                                                style={{ 
                                                    width: `${Object.values(chainChecker.chain_status || {})
                                                        .filter((status: any) => status.completed).length / stages.length * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {Object.values(chainChecker.chain_status || {})
                                                .filter((status: any) => status.completed).length} / {stages.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Form */}
                    <form onSubmit={handleSubmit} action={`/chain-checker/agent/${token}`} method="POST">
                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                        
                        {/* Agent Information */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h3>
                            
                            <div className="max-w-md">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    name="agent_name"
                                    value={formData.agent_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, agent_name: e.target.value }))}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4]"
                                    placeholder="Your full name"
                                />
                                {errors.agent_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.agent_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Chain Status Updates */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chain Progress Update</h3>
                            <p className="text-gray-600 mb-6">
                                Please update the status of each stage in the moving process. Your client will be notified of any changes.
                            </p>
                            
                            <div className="space-y-6">
                                {stages.map((stage, index) => {
                                    const stageStatus = formData.chain_status[stage.id] || {};
                                    
                                    return (
                                        <motion.div
                                            key={stage.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className={`
                                                        w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm
                                                        ${stageStatus.completed 
                                                            ? 'border-green-500 bg-green-50 text-green-600' 
                                                            : 'border-gray-300 bg-gray-50 text-gray-500'
                                                        }
                                                    `}>
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{stage.title}</h4>
                                                            <p className="text-sm text-gray-600">{stage.description}</p>
                                                        </div>
                                                        
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={stageStatus.completed || false}
                                                                onChange={(e) => handleStageChange(stage.id, 'completed', e.target.checked)}
                                                                className="h-4 w-4 text-[#00BCD4] focus:ring-[#00BCD4] border-gray-300 rounded"
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                                {stageStatus.completed ? 'Completed' : 'Mark as completed'}
                                                            </span>
                                                        </label>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Notes (optional)
                                                        </label>
                                                        <textarea
                                                            value={stageStatus.notes || ''}
                                                            onChange={(e) => handleStageChange(stage.id, 'notes', e.target.value)}
                                                            rows={2}
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-sm"
                                                            placeholder="Any updates or comments for this stage..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Timeline & Notes */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline & Additional Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expected Completion Date
                                    </label>
                                    <input
                                        type="date"
                                        name="estimated_completion"
                                        value={formData.estimated_completion}
                                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4]"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Overall Notes
                                </label>
                                <textarea
                                    name="overall_notes"
                                    value={formData.overall_notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, overall_notes: e.target.value }))}
                                    rows={4}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4]"
                                    placeholder="Any additional information or updates for your client..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Your client will be automatically notified of these updates.
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {submitting && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    <span>Update Chain Status</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-white border-t mt-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-[#00BCD4] rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">M</span>
                                </div>
                                <span className="font-semibold text-gray-900">Moovey</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Making moving easier for everyone
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChainUpdateForm;