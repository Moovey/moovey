import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChainSetupWizardProps {
    onComplete: (chainData: any) => void;
    onCancel: () => void;
}

const ChainSetupWizard: React.FC<ChainSetupWizardProps> = ({ onComplete, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        chain_role: '' as 'first_time_buyer' | 'seller_only' | 'buyer_seller' | '',
        move_type: 'buying' as 'buying' | 'selling' | 'both',
        buying_properties: [] as number[],
        selling_properties: [] as number[],
        chain_length: 1,
        agent_name: '',
        agent_email: '',
        buying_agent_details: {
            name: '',
            email: '',
            phone: '',
            firm: ''
        },
        selling_agent_details: {
            name: '',
            email: '',
            phone: '',
            firm: ''
        },
        buying_solicitor_details: {
            name: '',
            email: '',
            phone: '',
            firm: ''
        },
        selling_solicitor_details: {
            name: '',
            email: '',
            phone: '',
            firm: ''
        },
        estimated_completion: '',
        consent_agent_contact: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [availableProperties, setAvailableProperties] = useState<any[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);

    useEffect(() => {
        loadAvailableProperties();
    }, []);

    const loadAvailableProperties = async () => {
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
                if (data.success) {
                    setAvailableProperties(data.data || []);
                }
            }
        } catch (error) {
            console.error('Failed to load properties:', error);
        } finally {
            setLoadingProperties(false);
        }
    };

    const steps = [
        { id: 1, title: 'Your Role', description: 'What is your position in the chain?' },
        { id: 2, title: 'Properties', description: 'Link your properties to the chain' },
        { id: 3, title: 'Chain Length', description: 'How many properties are in your chain?' },
        { id: 4, title: 'Professional Details', description: 'Agent and solicitor information' },
        { id: 5, title: 'Timeline', description: 'When do you expect to complete?' },
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePropertyToggle = (propertyId: number, type: 'buying' | 'selling') => {
        const field = type === 'buying' ? 'buying_properties' : 'selling_properties';
        const currentProperties = formData[field];
        
        if (currentProperties.includes(propertyId)) {
            handleInputChange(field, currentProperties.filter(id => id !== propertyId));
        } else {
            handleInputChange(field, [...currentProperties, propertyId]);
        }
    };

    const handleProfessionalDetailsChange = (type: 'buying_agent' | 'selling_agent' | 'buying_solicitor' | 'selling_solicitor', field: string, value: string) => {
        const detailsField = `${type}_details`;
        handleInputChange(detailsField, {
            ...formData[detailsField as keyof typeof formData] as any,
            [field]: value
        });
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.chain_role) {
                    newErrors.chain_role = 'Please select your role in the chain';
                }
                break;
            case 2:
                // Properties are optional, but warn if none selected
                if (formData.chain_role === 'buyer_seller' && 
                    formData.buying_properties.length === 0 && 
                    formData.selling_properties.length === 0) {
                    // Allow to proceed but could add warning
                }
                break;
            case 3:
                if (formData.chain_length < 1 || formData.chain_length > 20) {
                    newErrors.chain_length = 'Chain length must be between 1 and 20';
                }
                break;
            case 4:
                // Agent/solicitor details are optional
                break;
            case 5:
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
                                        What is your position in the property chain?
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        This helps us understand your role and provide the most relevant tools and guidance.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { value: 'first_time_buyer', label: 'First-Time Buyer', icon: '🏠', description: 'Buying your first property' },
                                        { value: 'seller_only', label: 'Selling Only', icon: '💰', description: 'Downsizing or moving abroad' },
                                        { value: 'buyer_seller', label: 'Buying & Selling', icon: '🔄', description: 'Most common moving scenario' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleInputChange('chain_role', option.value)}
                                            className={`
                                                p-4 border-2 rounded-lg text-left transition-all hover:shadow-md
                                                ${formData.chain_role === option.value
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
                                
                                {errors.chain_role && (
                                    <p className="text-red-600 text-sm">{errors.chain_role}</p>
                                )}
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Link Your Properties
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Connect properties from your Property Basket to this chain to track their progress.
                                    </p>
                                </div>
                                
                                {loadingProperties ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00BCD4]"></div>
                                        <span className="ml-2 text-gray-600">Loading properties...</span>
                                    </div>
                                ) : availableProperties.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-4xl mb-4">🏠</div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                                        <p className="text-gray-600">Add properties to your Property Basket first to link them to your chain.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {(formData.chain_role === 'buyer_seller' || formData.chain_role === 'first_time_buyer') && (
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Properties You're Buying</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {availableProperties.map((property) => (
                                                        <button
                                                            key={property.id}
                                                            onClick={() => handlePropertyToggle(property.id, 'buying')}
                                                            className={`
                                                                p-3 border rounded-lg text-left transition-all hover:shadow-sm
                                                                ${formData.buying_properties.includes(property.id)
                                                                    ? 'border-[#00BCD4] bg-blue-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-900">
                                                                        {property.address || 'Property Address'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        £{property.price?.toLocaleString() || 'Price on request'}
                                                                    </div>
                                                                </div>
                                                                {formData.buying_properties.includes(property.id) && (
                                                                    <div className="text-[#00BCD4]">✓</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {(formData.chain_role === 'buyer_seller' || formData.chain_role === 'seller_only') && (
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Properties You're Selling</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {availableProperties.map((property) => (
                                                        <button
                                                            key={property.id}
                                                            onClick={() => handlePropertyToggle(property.id, 'selling')}
                                                            className={`
                                                                p-3 border rounded-lg text-left transition-all hover:shadow-sm
                                                                ${formData.selling_properties.includes(property.id)
                                                                    ? 'border-[#00BCD4] bg-blue-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-900">
                                                                        {property.address || 'Property Address'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        £{property.price?.toLocaleString() || 'Price on request'}
                                                                    </div>
                                                                </div>
                                                                {formData.selling_properties.includes(property.id) && (
                                                                    <div className="text-[#00BCD4]">✓</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
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

                        {currentStep === 4 && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Professional Details
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Add your agent and solicitor information to help coordinate your move (all optional).
                                    </p>
                                </div>
                                
                                {(formData.chain_role === 'first_time_buyer' || formData.chain_role === 'buyer_seller') && (
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-4">Buying Side</h4>
                                        
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Estate Agent Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.buying_agent_details.name}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_agent', 'name', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="John Smith"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Agent Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.buying_agent_details.email}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_agent', 'email', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="agent@agency.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Agent Phone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={formData.buying_agent_details.phone}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_agent', 'phone', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="01234 567890"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Estate Agency
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.buying_agent_details.firm}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_agent', 'firm', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="ABC Estate Agents"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Solicitor Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.buying_solicitor_details.name}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_solicitor', 'name', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="Jane Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Solicitor Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.buying_solicitor_details.email}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_solicitor', 'email', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="solicitor@lawfirm.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Solicitor Phone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={formData.buying_solicitor_details.phone}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_solicitor', 'phone', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="01234 567890"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Law Firm
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.buying_solicitor_details.firm}
                                                        onChange={(e) => handleProfessionalDetailsChange('buying_solicitor', 'firm', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="Smith & Associates"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {(formData.chain_role === 'seller_only' || formData.chain_role === 'buyer_seller') && (
                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <h4 className="font-semibold text-gray-900 mb-4">Selling Side</h4>
                                        
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Estate Agent Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.selling_agent_details.name}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_agent', 'name', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="John Smith"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Agent Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.selling_agent_details.email}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_agent', 'email', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="agent@agency.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Agent Phone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={formData.selling_agent_details.phone}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_agent', 'phone', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="01234 567890"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Estate Agency
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.selling_agent_details.firm}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_agent', 'firm', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="XYZ Estate Agents"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Solicitor Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.selling_solicitor_details.name}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_solicitor', 'name', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="Jane Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Solicitor Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.selling_solicitor_details.email}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_solicitor', 'email', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="solicitor@lawfirm.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Solicitor Phone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={formData.selling_solicitor_details.phone}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_solicitor', 'phone', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="01234 567890"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Law Firm
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.selling_solicitor_details.firm}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_solicitor', 'firm', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="Brown & Co"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 5 && (
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