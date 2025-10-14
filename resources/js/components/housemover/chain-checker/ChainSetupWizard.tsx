import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChainSetupWizardProps {
    onComplete: (chainData: any) => void;
    onCancel: () => void;
}

const ChainSetupWizard: React.FC<ChainSetupWizardProps> = ({ onComplete, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        move_type: 'buying' as 'buying' | 'selling' | 'both',
        chain_length: 1,
        agent_name: '',
        agent_email: '',
        estimated_completion: '',
        consent_agent_contact: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        { id: 1, title: 'Move Type', description: 'What type of move are you making?' },
        { id: 2, title: 'Chain Length', description: 'How many properties are in your chain?' },
        { id: 3, title: 'Agent Details', description: 'Tell us about your estate agent' },
        { id: 4, title: 'Timeline', description: 'When do you expect to complete?' },
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.move_type) {
                    newErrors.move_type = 'Please select a move type';
                }
                break;
            case 2:
                if (formData.chain_length < 1 || formData.chain_length > 20) {
                    newErrors.chain_length = 'Chain length must be between 1 and 20';
                }
                break;
            case 3:
                if (formData.agent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.agent_email)) {
                    newErrors.agent_email = 'Please enter a valid email address';
                }
                break;
            case 4:
                if (formData.estimated_completion && new Date(formData.estimated_completion) <= new Date()) {
                    newErrors.estimated_completion = 'Completion date must be in the future';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/chain-checker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    onComplete(data.data);
                } else {
                    setErrors({ submit: data.message || 'Failed to create chain checker' });
                }
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    setErrors({ submit: 'Failed to create chain checker' });
                }
            }
        } catch (error) {
            setErrors({ submit: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Activate Chain Checker</h2>
                            <p className="text-gray-600 mt-1">Set up your moving chain tracker in a few simple steps</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            Step {currentStep} of {steps.length}
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            {steps.map((step) => (
                                <span key={step.id} className={currentStep >= step.id ? 'text-[#00BCD4]' : ''}>
                                    {step.title}
                                </span>
                            ))}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-[#00BCD4] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / steps.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        What type of move are you making?
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        This helps us understand your chain structure and provide relevant guidance.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { value: 'buying', label: 'Buying Only', icon: '🏠', description: 'First-time buyer or cash buyer' },
                                        { value: 'selling', label: 'Selling Only', icon: '💰', description: 'Downsizing or moving abroad' },
                                        { value: 'both', label: 'Buying & Selling', icon: '🔄', description: 'Most common moving scenario' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleInputChange('move_type', option.value)}
                                            className={`
                                                p-4 border-2 rounded-lg text-left transition-all hover:shadow-md
                                                ${formData.move_type === option.value
                                                    ? 'border-[#00BCD4] bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <div className="text-2xl mb-2">{option.icon}</div>
                                            <div className="font-semibold text-gray-900">{option.label}</div>
                                            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                        </button>
                                    ))}
                                </div>
                                
                                {errors.move_type && (
                                    <p className="text-red-600 text-sm">{errors.move_type}</p>
                                )}
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        How many properties are in your chain?
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Include your property and all connected properties in the chain.
                                    </p>
                                </div>
                                
                                <div className="max-w-xs">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chain Length
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.chain_length}
                                        onChange={(e) => handleInputChange('chain_length', parseInt(e.target.value) || 1)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Typically 2-5 properties</p>
                                </div>
                                
                                {errors.chain_length && (
                                    <p className="text-red-600 text-sm">{errors.chain_length}</p>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Tell us about your estate agent
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        This allows us to send updates and coordinate with your agent (optional).
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Agent Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.agent_name}
                                            onChange={(e) => handleInputChange('agent_name', e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                            placeholder="e.g., John Smith"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Agent Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.agent_email}
                                            onChange={(e) => handleInputChange('agent_email', e.target.value)}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                            placeholder="agent@estate-agency.com"
                                        />
                                    </div>
                                </div>
                                
                                {formData.agent_email && (
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id="consent"
                                            checked={formData.consent_agent_contact}
                                            onChange={(e) => handleInputChange('consent_agent_contact', e.target.checked)}
                                            className="mt-1 h-4 w-4 text-[#00BCD4] focus:ring-[#00BCD4] border-gray-300 rounded"
                                        />
                                        <label htmlFor="consent" className="text-sm text-gray-700">
                                            I consent to Moovey contacting my agent to request chain updates and coordinate the moving process.
                                        </label>
                                    </div>
                                )}
                                
                                {errors.agent_email && (
                                    <p className="text-red-600 text-sm">{errors.agent_email}</p>
                                )}
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        When do you expect to complete?
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        This helps us track progress and send timely reminders (optional).
                                    </p>
                                </div>
                                
                                <div className="max-w-xs">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expected Completion Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.estimated_completion}
                                        onChange={(e) => handleInputChange('estimated_completion', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                    />
                                </div>
                                
                                {errors.estimated_completion && (
                                    <p className="text-red-600 text-sm">{errors.estimated_completion}</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                    
                    {errors.submit && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={onCancel}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    
                    <div className="flex items-center space-x-3">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Back
                            </button>
                        )}
                        
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="px-6 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>
                                {currentStep === steps.length ? 'Activate Chain Checker' : 'Next'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChainSetupWizard;