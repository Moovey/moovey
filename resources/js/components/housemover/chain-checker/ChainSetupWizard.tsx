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
        
        // Selling side chain data
        selling_property_details: {
            rightmove_link: '',
            estate_agent: { name: '', email: '', phone: '', firm: '' },
            solicitor: { name: '', email: '', phone: '', firm: '' },
            known_buyer_agent: { name: '', email: '', phone: '', firm: '' },
            known_buyer_solicitor: { name: '', email: '', phone: '', firm: '' },
            buyer_property_agent: { name: '', email: '', phone: '', firm: '' },
            buyer_property_solicitor: { name: '', email: '', phone: '', firm: '' },
            unknown_buyer_details: false,
            unknown_buyer_chain_up: false
        },
        
        // Buying side chain data
        buying_property_details: {
            rightmove_link: '',
            seller_estate_agent: { name: '', email: '', phone: '', firm: '' },
            seller_solicitor: { name: '', email: '', phone: '', firm: '' },
            my_solicitor: { name: '', email: '', phone: '', firm: '' },
            known_seller_chain_agent: { name: '', email: '', phone: '', firm: '' },
            known_seller_chain_solicitor: { name: '', email: '', phone: '', firm: '' },
            seller_onward_chain_agent: { name: '', email: '', phone: '', firm: '' },
            seller_onward_chain_solicitor: { name: '', email: '', phone: '', firm: '' },
            unknown_seller_chain: false,
            unknown_seller_chain_down: false
        },
        
        // Legacy fields for backward compatibility
        agent_name: '',
        agent_email: '',
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

    // Load properties when role changes
    useEffect(() => {
        if (formData.chain_role) {
            loadAvailableProperties();
        }
    }, [formData.chain_role]);

    const loadAvailableProperties = async () => {
        setLoadingProperties(true);
        try {
            let url = '/api/properties/basket';
            
            // Add claim type filtering based on selected role
            if (formData.chain_role) {
                const params = new URLSearchParams();
                
                if (formData.chain_role === 'first_time_buyer') {
                    params.append('claim_type', 'buyer');
                } else if (formData.chain_role === 'seller_only') {
                    params.append('claim_type', 'seller');
                } else if (formData.chain_role === 'buyer_seller') {
                    // For buyer_seller, we want to show all properties (both buyer and seller)
                    // No claim_type filter needed
                }
                
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
            }

            const response = await fetch(url, {
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
        { id: 3, title: 'Professional Details', description: 'Agent and solicitor information' },
        { id: 4, title: 'Timeline', description: 'When do you expect to complete?' },
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
        setFormData(prev => {
            if (type === 'buying_agent') {
                return {
                    ...prev,
                    selling_property_details: {
                        ...prev.selling_property_details,
                        estate_agent: {
                            ...prev.selling_property_details.estate_agent,
                            [field]: value
                        }
                    }
                };
            } else if (type === 'buying_solicitor') {
                return {
                    ...prev,
                    selling_property_details: {
                        ...prev.selling_property_details,
                        solicitor: {
                            ...prev.selling_property_details.solicitor,
                            [field]: value
                        }
                    }
                };
            } else if (type === 'selling_agent') {
                return {
                    ...prev,
                    buying_property_details: {
                        ...prev.buying_property_details,
                        seller_estate_agent: {
                            ...prev.buying_property_details.seller_estate_agent,
                            [field]: value
                        }
                    }
                };
            } else if (type === 'selling_solicitor') {
                return {
                    ...prev,
                    buying_property_details: {
                        ...prev.buying_property_details,
                        my_solicitor: {
                            ...prev.buying_property_details.my_solicitor,
                            [field]: value
                        }
                    }
                };
            }
            return prev;
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
                // Role-based property validation
                if (formData.chain_role === 'first_time_buyer') {
                    if (getPropertiesByClaimType('buyer').length === 0) {
                        newErrors.properties = 'You need to claim a property as a buyer first. Go to Property Basket to claim a property.';
                    } else if (formData.buying_properties.length === 0) {
                        newErrors.properties = 'You need to select the property you are buying to continue.';
                    }
                } else if (formData.chain_role === 'seller_only') {
                    if (getPropertiesByClaimType('seller').length === 0) {
                        newErrors.properties = 'You need to claim a property as a seller first. Go to Property Basket to claim a property.';
                    } else if (formData.selling_properties.length === 0) {
                        newErrors.properties = 'You need to select the property you are selling to continue.';
                    }
                } else if (formData.chain_role === 'buyer_seller') {
                    const buyerProperties = getPropertiesByClaimType('buyer');
                    const sellerProperties = getPropertiesByClaimType('seller');
                    
                    if (buyerProperties.length === 0 && sellerProperties.length === 0) {
                        newErrors.properties = 'You need to claim properties as both buyer and seller first. Go to Property Basket to claim properties.';
                    } else if (buyerProperties.length === 0) {
                        newErrors.properties = 'You need to claim a property as a buyer first. Go to Property Basket to claim a property.';
                    } else if (sellerProperties.length === 0) {
                        newErrors.properties = 'You need to claim a property as a seller first. Go to Property Basket to claim a property.';
                    } else if (formData.buying_properties.length === 0 && formData.selling_properties.length === 0) {
                        newErrors.properties = 'You need to select both the property you are buying and the property you are selling to continue.';
                    } else if (formData.buying_properties.length === 0) {
                        newErrors.properties = 'You need to select the property you are buying to continue.';
                    } else if (formData.selling_properties.length === 0) {
                        newErrors.properties = 'You need to select the property you are selling to continue.';
                    }
                }
                break;
            case 3:
                // Agent/solicitor details are optional
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
            // Calculate chain length based on role
            let calculatedChainLength = 1; // Default minimum
            if (formData.chain_role === 'buyer_seller') {
                calculatedChainLength = 2; // Both buying and selling
            } else if (formData.chain_role === 'first_time_buyer') {
                calculatedChainLength = 1; // Just buying
            } else if (formData.chain_role === 'seller_only') {
                calculatedChainLength = 1; // Just selling
            }

            // Transform the new nested structure to the expected backend format
            const transformedData = {
                chain_role: formData.chain_role,
                move_type: formData.move_type,
                buying_properties: formData.buying_properties,
                selling_properties: formData.selling_properties,
                chain_length: calculatedChainLength, // Add required field
                estimated_completion: formData.estimated_completion,
                consent_agent_contact: formData.consent_agent_contact,
                
                // Transform selling property details to legacy format
                agent_name: formData.selling_property_details.estate_agent.name || formData.agent_name,
                agent_email: formData.selling_property_details.estate_agent.email || formData.agent_email,
                
                // Buying agent details (for selling property's estate agent)
                buying_agent_details: {
                    name: formData.selling_property_details.estate_agent.name,
                    email: formData.selling_property_details.estate_agent.email,
                    phone: formData.selling_property_details.estate_agent.phone,
                    firm: formData.selling_property_details.estate_agent.firm
                },
                
                // Buying solicitor details (for selling property's solicitor)
                buying_solicitor_details: {
                    name: formData.selling_property_details.solicitor.name,
                    email: formData.selling_property_details.solicitor.email,
                    phone: formData.selling_property_details.solicitor.phone,
                    firm: formData.selling_property_details.solicitor.firm
                },
                
                // Selling agent details (for buying property's seller agent)
                selling_agent_details: {
                    name: formData.buying_property_details.seller_estate_agent.name,
                    email: formData.buying_property_details.seller_estate_agent.email,
                    phone: formData.buying_property_details.seller_estate_agent.phone,
                    firm: formData.buying_property_details.seller_estate_agent.firm
                },
                
                // Selling solicitor details (for buying property's my solicitor)
                selling_solicitor_details: {
                    name: formData.buying_property_details.my_solicitor.name,
                    email: formData.buying_property_details.my_solicitor.email,
                    phone: formData.buying_property_details.my_solicitor.phone,
                    firm: formData.buying_property_details.my_solicitor.firm
                }
            };

            console.log('Submitting data:', transformedData); // Debug log

            const response = await fetch('/api/chain-checker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(transformedData),
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
                console.error('API Error:', errorData);
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    setErrors({ submit: errorData.message || 'Failed to create chain checker' });
                }
            }
        } catch (error) {
            console.error('Network error:', error);
            setErrors({ submit: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get dynamic prompt message based on role
    const getPropertyPromptMessage = (): string => {
        switch (formData.chain_role) {
            case 'first_time_buyer':
                return 'You need to claim the property you are buying in order to continue.';
            case 'seller_only':
                return 'You need to claim the property you are selling in order to continue.';
            case 'buyer_seller':
                return 'You need to claim both the property you are selling and the property you are buying in order to continue.';
            default:
                return 'You need to claim your properties in order to continue.';
        }
    };

    // Helper function to check if user has the required properties for their role
    const hasRequiredProperties = (): boolean => {
        switch (formData.chain_role) {
            case 'first_time_buyer':
                return formData.buying_properties.length > 0 && getPropertiesByClaimType('buyer').length > 0;
            case 'seller_only':
                return formData.selling_properties.length > 0 && getPropertiesByClaimType('seller').length > 0;
            case 'buyer_seller':
                return formData.buying_properties.length > 0 && 
                       formData.selling_properties.length > 0 && 
                       getPropertiesByClaimType('buyer').length > 0 && 
                       getPropertiesByClaimType('seller').length > 0;
            default:
                return false;
        }
    };

    // Function to navigate to Property Basket
    const goToPropertyBasket = () => {
        // Navigate to the dashboard page which has the Property Basket component
        window.location.href = '/housemover/dashboard';
    };

    // Helper function to filter properties by claim type
    const getPropertiesByClaimType = (claimType: 'buyer' | 'seller') => {
        return availableProperties.filter(property => property.claim_type === claimType);
    };

    // Helper function to get all properties (for buyer_seller role)
    const getAllClaimedProperties = () => {
        return availableProperties.filter(property => property.is_claimed);
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
                                        <p className="text-gray-600 mb-6">{getPropertyPromptMessage()}</p>
                                        <button
                                            onClick={goToPropertyBasket}
                                            className="inline-flex items-center px-6 py-3 bg-[#00BCD4] text-white font-medium rounded-lg hover:bg-[#00ACC1] transition-colors"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Go to Property Basket
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                        {(formData.chain_role === 'buyer_seller' || formData.chain_role === 'first_time_buyer') && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Properties You're Buying</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(formData.chain_role === 'buyer_seller' 
                                        ? getPropertiesByClaimType('buyer')
                                        : getPropertiesByClaimType('buyer')).map((property) => (
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
                                            <div className="flex items-start space-x-3">
                                                {/* Property Photo */}
                                                <div className="flex-shrink-0">
                                                    {property.property_photos && property.property_photos.length > 0 ? (
                                                        <img
                                                            src={property.property_photos[0]}
                                                            alt="Property"
                                                            className="w-12 h-12 object-cover rounded-md"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/images/placeholder-property.svg';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Property Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {property.property_title || property.address || 'Property'}
                                                    </div>
                                                    {property.address && property.property_title && (
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {property.address}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-600">
                                                        {property.formatted_price || `£${property.price?.toLocaleString() || 'Price on request'}`}
                                                    </div>
                                                    {property.summary && (
                                                        <div className="text-xs text-gray-500">
                                                            {property.summary}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selection Indicator */}
                                                <div className="flex-shrink-0">
                                                    {formData.buying_properties.includes(property.id) && (
                                                        <div className="text-[#00BCD4]">✓</div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {(formData.chain_role === 'first_time_buyer' || formData.chain_role === 'buyer_seller') && 
                                 getPropertiesByClaimType('buyer').length === 0 && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-blue-800 text-sm">
                                            No properties claimed as 'buyer' found. You need to claim a property as a buyer first.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {(formData.chain_role === 'buyer_seller' || formData.chain_role === 'seller_only') && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Properties You're Selling</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {getPropertiesByClaimType('seller').map((property) => (
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
                                            <div className="flex items-start space-x-3">
                                                {/* Property Photo */}
                                                <div className="flex-shrink-0">
                                                    {property.property_photos && property.property_photos.length > 0 ? (
                                                        <img
                                                            src={property.property_photos[0]}
                                                            alt="Property"
                                                            className="w-12 h-12 object-cover rounded-md"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/images/placeholder-property.svg';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Property Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {property.property_title || property.address || 'Property'}
                                                    </div>
                                                    {property.address && property.property_title && (
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {property.address}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-gray-600">
                                                        {property.formatted_price || `£${property.price?.toLocaleString() || 'Price on request'}`}
                                                    </div>
                                                    {property.summary && (
                                                        <div className="text-xs text-gray-500">
                                                            {property.summary}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selection Indicator */}
                                                <div className="flex-shrink-0">
                                                    {formData.selling_properties.includes(property.id) && (
                                                        <div className="text-[#00BCD4]">✓</div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {(formData.chain_role === 'seller_only' || formData.chain_role === 'buyer_seller') && 
                                 getPropertiesByClaimType('seller').length === 0 && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 text-sm">
                                            No properties claimed as 'seller' found. You need to claim a property as a seller first.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                                        {/* Show error message and CTA if validation fails */}
                                        {availableProperties.length > 0 && !hasRequiredProperties() && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-yellow-800 mb-3">
                                                            {getPropertyPromptMessage()}
                                                        </p>
                                                        <button
                                                            onClick={goToPropertyBasket}
                                                            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                            Go to Property Basket
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.properties && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-800 mb-3">{errors.properties}</p>
                                                <button
                                                    onClick={goToPropertyBasket}
                                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Go to Property Basket
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Build Your Chain
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Help us map your complete moving chain by providing property links and professional details. The more information you provide, the better we can track progress and coordinate with all parties.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h4 className="text-sm font-medium text-blue-800">How Smart Chain Building Works</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    We'll use Rightmove links, agent details, and solicitor information to automatically detect connections between users and build your complete chain. Missing links appear greyed out until more information is available.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
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
                                                        value={formData.selling_property_details.estate_agent.name}
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
                                                        value={formData.selling_property_details.estate_agent.email}
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
                                                        value={formData.selling_property_details.estate_agent.phone}
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
                                                        value={formData.selling_property_details.estate_agent.firm}
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
                                                        value={formData.selling_property_details.solicitor.name}
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
                                                        value={formData.selling_property_details.solicitor.email}
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
                                                        value={formData.selling_property_details.solicitor.phone}
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
                                                        value={formData.selling_property_details.solicitor.firm}
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
                                                        value={formData.buying_property_details.seller_estate_agent.name}
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
                                                        value={formData.buying_property_details.seller_estate_agent.email}
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
                                                        value={formData.buying_property_details.seller_estate_agent.phone}
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
                                                        value={formData.buying_property_details.seller_estate_agent.firm}
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
                                                        value={formData.buying_property_details.my_solicitor.name}
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
                                                        value={formData.buying_property_details.my_solicitor.email}
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
                                                        value={formData.buying_property_details.my_solicitor.phone}
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
                                                        value={formData.buying_property_details.my_solicitor.firm}
                                                        onChange={(e) => handleProfessionalDetailsChange('selling_solicitor', 'firm', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                        placeholder="Brown & Co"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Extended Chain Knowledge Section */}
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg mt-8">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="text-purple-500 mr-2">🔗</span>
                                        Extended Chain Knowledge
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-6">
                                        If you know details about other properties further up or down the chain, add them here to build a more complete picture.
                                    </p>

                                    {/* Selling Side Extended Chain */}
                                    {(formData.chain_role === 'seller_only' || formData.chain_role === 'buyer_seller') && (
                                        <div className="mb-6">
                                            <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                                <span className="text-green-500 mr-2">📈</span>
                                                Your Buyer's Chain (Up the Chain)
                                            </h5>
                                            
                                            <div className="flex items-center mb-4">
                                                <input
                                                    type="checkbox"
                                                    id="unknown_buyer_chain"
                                                    checked={formData.selling_property_details.unknown_buyer_chain_up}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        selling_property_details: {
                                                            ...prev.selling_property_details,
                                                            unknown_buyer_chain_up: e.target.checked
                                                        }
                                                    }))}
                                                    className="h-4 w-4 text-[#00BCD4] focus:ring-[#00BCD4] border-gray-300 rounded"
                                                />
                                                <label htmlFor="unknown_buyer_chain" className="ml-2 text-sm text-gray-700">
                                                    I don't know the details of my buyer's onward chain yet
                                                </label>
                                            </div>

                                            {!formData.selling_property_details.unknown_buyer_chain_up && (
                                                <div className="bg-white rounded-lg p-4 space-y-4">
                                                    <h6 className="text-sm font-medium text-gray-800">Your Buyer's Property Details</h6>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Buyer's Estate Agent
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.selling_property_details.buyer_property_agent.name}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    selling_property_details: {
                                                                        ...prev.selling_property_details,
                                                                        buyer_property_agent: {
                                                                            ...prev.selling_property_details.buyer_property_agent,
                                                                            name: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="Agent name (if known)"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Agent Email
                                                            </label>
                                                            <input
                                                                type="email"
                                                                value={formData.selling_property_details.buyer_property_agent.email}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    selling_property_details: {
                                                                        ...prev.selling_property_details,
                                                                        buyer_property_agent: {
                                                                            ...prev.selling_property_details.buyer_property_agent,
                                                                            email: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="agent@agency.com"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Buyer's Solicitor
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.selling_property_details.buyer_property_solicitor.name}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    selling_property_details: {
                                                                        ...prev.selling_property_details,
                                                                        buyer_property_solicitor: {
                                                                            ...prev.selling_property_details.buyer_property_solicitor,
                                                                            name: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="Solicitor name (if known)"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Solicitor Email
                                                            </label>
                                                            <input
                                                                type="email"
                                                                value={formData.selling_property_details.buyer_property_solicitor.email}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    selling_property_details: {
                                                                        ...prev.selling_property_details,
                                                                        buyer_property_solicitor: {
                                                                            ...prev.selling_property_details.buyer_property_solicitor,
                                                                            email: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="solicitor@lawfirm.com"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Buying Side Extended Chain */}
                                    {(formData.chain_role === 'first_time_buyer' || formData.chain_role === 'buyer_seller') && (
                                        <div className="mb-6">
                                            <h5 className="font-medium text-gray-900 mb-4 flex items-center">
                                                <span className="text-blue-500 mr-2">📉</span>
                                                Your Seller's Chain (Down the Chain)
                                            </h5>
                                            
                                            <div className="flex items-center mb-4">
                                                <input
                                                    type="checkbox"
                                                    id="unknown_seller_chain"
                                                    checked={formData.buying_property_details.unknown_seller_chain_down}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        buying_property_details: {
                                                            ...prev.buying_property_details,
                                                            unknown_seller_chain_down: e.target.checked
                                                        }
                                                    }))}
                                                    className="h-4 w-4 text-[#00BCD4] focus:ring-[#00BCD4] border-gray-300 rounded"
                                                />
                                                <label htmlFor="unknown_seller_chain" className="ml-2 text-sm text-gray-700">
                                                    I don't know the details of my seller's onward chain yet
                                                </label>
                                            </div>

                                            {!formData.buying_property_details.unknown_seller_chain_down && (
                                                <div className="bg-white rounded-lg p-4 space-y-4">
                                                    <h6 className="text-sm font-medium text-gray-800">Your Seller's Onward Property Details</h6>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Seller's Onward Agent
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.buying_property_details.seller_onward_chain_agent.name}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    buying_property_details: {
                                                                        ...prev.buying_property_details,
                                                                        seller_onward_chain_agent: {
                                                                            ...prev.buying_property_details.seller_onward_chain_agent,
                                                                            name: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="Agent name (if known)"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Agent Email
                                                            </label>
                                                            <input
                                                                type="email"
                                                                value={formData.buying_property_details.seller_onward_chain_agent.email}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    buying_property_details: {
                                                                        ...prev.buying_property_details,
                                                                        seller_onward_chain_agent: {
                                                                            ...prev.buying_property_details.seller_onward_chain_agent,
                                                                            email: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="agent@agency.com"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Seller's Onward Solicitor
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.buying_property_details.seller_onward_chain_solicitor.name}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    buying_property_details: {
                                                                        ...prev.buying_property_details,
                                                                        seller_onward_chain_solicitor: {
                                                                            ...prev.buying_property_details.seller_onward_chain_solicitor,
                                                                            name: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="Solicitor name (if known)"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Solicitor Email
                                                            </label>
                                                            <input
                                                                type="email"
                                                                value={formData.buying_property_details.seller_onward_chain_solicitor.email}
                                                                onChange={(e) => setFormData(prev => ({
                                                                    ...prev,
                                                                    buying_property_details: {
                                                                        ...prev.buying_property_details,
                                                                        seller_onward_chain_solicitor: {
                                                                            ...prev.buying_property_details.seller_onward_chain_solicitor,
                                                                            email: e.target.value
                                                                        }
                                                                    }
                                                                }))}
                                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                                                placeholder="solicitor@lawfirm.com"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Chain Visualization Preview */}
                                    <div className="bg-white rounded-lg p-4 mt-6">
                                        <h6 className="text-sm font-medium text-gray-800 mb-3">Chain Preview</h6>
                                        <div className="flex items-center space-x-2 overflow-x-auto">
                                            {/* Generate chain visualization based on role and known data */}
                                            {formData.chain_role === 'first_time_buyer' && (
                                                <>
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">YOU</div>
                                                        <div className="text-xs mt-1">Buying</div>
                                                    </div>
                                                    <div className="w-4 h-0.5 bg-gray-300"></div>
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                                            formData.buying_property_details.unknown_seller_chain_down ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white'
                                                        }`}>?</div>
                                                        <div className="text-xs mt-1">Seller</div>
                                                    </div>
                                                </>
                                            )}
                                            
                                            {formData.chain_role === 'seller_only' && (
                                                <>
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                                            formData.selling_property_details.unknown_buyer_chain_up ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white'
                                                        }`}>?</div>
                                                        <div className="text-xs mt-1">Buyer</div>
                                                    </div>
                                                    <div className="w-4 h-0.5 bg-gray-300"></div>
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">YOU</div>
                                                        <div className="text-xs mt-1">Selling</div>
                                                    </div>
                                                </>
                                            )}
                                            
                                            {formData.chain_role === 'buyer_seller' && (
                                                <>
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                                            formData.buying_property_details.unknown_seller_chain_down ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white'
                                                        }`}>?</div>
                                                        <div className="text-xs mt-1">Down</div>
                                                    </div>
                                                    <div className="w-4 h-0.5 bg-gray-300"></div>
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">YOU</div>
                                                        <div className="text-xs mt-1">Both</div>
                                                    </div>
                                                    <div className="w-4 h-0.5 bg-gray-300"></div>
                                                    <div className="flex-shrink-0 text-center">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                                            formData.selling_property_details.unknown_buyer_chain_up ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 text-white'
                                                        }`}>?</div>
                                                        <div className="text-xs mt-1">Up</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
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