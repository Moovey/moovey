import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

interface Property {
    id: number;
    rightmove_url: string;
    property_title: string;
    property_photos?: string[];
    address?: string;
    price?: number;
    property_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    basket_count: number;
    formatted_price?: string;
    summary?: string;
}

interface BasketProperty {
    id: number;
    property: Property;
    notes?: string;
    is_favorite: boolean;
    is_claimed: boolean;
    claim_type?: 'buyer' | 'seller';
    claimed_at?: string;
    created_at: string;
}

const PropertyBasket: React.FC = () => {
    const [basketProperties, setBasketProperties] = useState<BasketProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [rightmoveUrl, setRightmoveUrl] = useState('');
    const [propertyNotes, setPropertyNotes] = useState('');
    const [propertyName, setPropertyName] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [propertyPhotos, setPropertyPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [addingProperty, setAddingProperty] = useState(false);
    const [searchResults, setSearchResults] = useState<Property[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchingProperties, setSearchingProperties] = useState(false);
    const [userChainRole, setUserChainRole] = useState<string | null>(null);
    const [autoClaimType, setAutoClaimType] = useState<'buyer' | 'seller' | null>(null);
    const [selectedPropertyPhotos, setSelectedPropertyPhotos] = useState<string[] | null>(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({
        property_title: '',
        property_address: '',
        notes: ''
    });

    useEffect(() => {
        loadBasketProperties();
        loadUserChainRole();
    }, []);

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [photoPreviewUrls]);



    const loadUserChainRole = async () => {
        try {
            const response = await fetch('/api/chain-checker', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.chain_checker) {
                    const chainRole = data.data.chain_checker.chain_role;
                    setUserChainRole(chainRole);
                    
                    // Set default claim type based on role
                    if (chainRole === 'first_time_buyer') {
                        setAutoClaimType('buyer');
                    } else if (chainRole === 'seller_only') {
                        setAutoClaimType('seller');
                    }
                    // For 'buyer_seller', we don't set a default - let user choose
                }
            }
        } catch (error) {
            console.error('Failed to load user chain role:', error);
        }
    };

    const loadBasketProperties = async () => {
        try {
            const response = await fetch('/api/properties/basket', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    // Ensure data.data is always an array
                    const properties = Array.isArray(data.data) ? data.data : [];
                    setBasketProperties(properties);
                } else {
                    console.error('API returned error:', data.message);
                    setBasketProperties([]);
                }
            } else {
                // Check if response is HTML (redirect to login)
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    console.error('Received HTML response - likely redirected to login');
                } else {
                    console.error('HTTP error:', response.status, response.statusText);
                }
                setBasketProperties([]);
            }
        } catch (error) {
            console.error('Failed to load basket properties:', error);
            setBasketProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const updatedPhotos = [...propertyPhotos, ...newFiles];
        
        // Limit to 5 photos
        if (updatedPhotos.length > 5) {
            toast.warning('You can upload a maximum of 5 photos');
            return;
        }

        setPropertyPhotos(updatedPhotos);

        // Create preview URLs
        const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
        setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };

    const removePhoto = (index: number) => {
        const updatedPhotos = propertyPhotos.filter((_, i) => i !== index);
        const updatedPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index);
        
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(photoPreviewUrls[index]);
        
        setPropertyPhotos(updatedPhotos);
        setPhotoPreviewUrls(updatedPreviewUrls);
    };

    const viewPropertyPhotos = (property: Property) => {
        const photos: string[] = [];
        if (property.property_photos && property.property_photos.length > 0) {
            photos.push(...property.property_photos);
        }
        setSelectedPropertyPhotos(photos);
        setShowPhotoModal(true);
    };

    const addPropertyToBasket = async (claimAfterAdd: boolean = false) => {
        // Validate that property name is provided
        if (!propertyName.trim()) {
            toast.error('Property name is required');
            return;
        }

        // Validate Rightmove URL is required
        if (!rightmoveUrl.trim()) {
            toast.error('Rightmove URL is required');
            return;
        }
        
        if (!rightmoveUrl.includes('rightmove.co.uk')) {
            toast.error('Please enter a valid Rightmove URL');
            return;
        }

        setAddingProperty(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();
            
            // Add text fields
            formData.append('rightmove_url', rightmoveUrl);
            formData.append('property_name', propertyName);
            if (propertyAddress.trim()) {
                formData.append('property_address', propertyAddress);
            }
            if (propertyNotes.trim()) {
                formData.append('notes', propertyNotes);
            }

            // Add photos
            propertyPhotos.forEach((photo, index) => {
                formData.append(`photos[${index}]`, photo);
            });

            // First, add to basket
            const response = await fetch('/api/properties/add-to-basket', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const propertyId = data.data.property.id;
                    const basket = data.data.basket;
                    let claimSuccessful = false;
                    
                    // Auto-claim if requested and we have a default claim type
                    if (claimAfterAdd && autoClaimType && !basket.is_claimed) {
                        try {
                            claimSuccessful = await claimProperty(propertyId, autoClaimType, true);
                        } catch (error) {
                            console.warn('Auto-claim failed:', error);
                            // The error details are already handled in claimProperty function
                        }
                    }
                    
                    // Clear form
                    setRightmoveUrl('');
                    setPropertyNotes('');
                    setPropertyName('');
                    setPropertyAddress('');
                    setPropertyPhotos([]);
                    // Cleanup preview URLs
                    photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
                    setPhotoPreviewUrls([]);
                    setShowAddProperty(false);
                    loadBasketProperties();
                    
                    // Show appropriate message based on what happened
                    if (claimAfterAdd && autoClaimType) {
                        if (basket.is_claimed) {
                            toast.info(`Property added to your basket! (Already claimed as ${basket.claim_type} by you)`);
                        } else if (claimSuccessful) {
                            toast.success(`Property added to your basket and claimed as ${autoClaimType}!`);
                        } else {
                            toast.warning(`Property added to your basket! (Could not claim as ${autoClaimType})`);
                        }
                    } else {
                        toast.success('Property added to your basket!');
                    }
                } else {
                    toast.error(data.message || 'Failed to add property');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to add property');
            }
        } catch (error) {
            console.error('Failed to add property:', error);
            toast.error('Network error occurred');
        } finally {
            setAddingProperty(false);
        }
    };

    const removePropertyFromBasket = async (propertyId: number) => {
        if (!confirm('Are you sure you want to remove this property from your basket?')) {
            return;
        }

        try {
            const response = await fetch(`/api/properties/${propertyId}/remove-from-basket`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    loadBasketProperties();
                    toast.success('Property removed from basket');
                } else {
                    toast.error(data.message || 'Failed to remove property');
                }
            } else {
                toast.error('Failed to remove property');
            }
        } catch (error) {
            console.error('Failed to remove property:', error);
            toast.error('Network error occurred');
        }
    };

    const startEditProperty = (item: BasketProperty) => {
        setEditingProperty(item.property.id);
        setEditFormData({
            property_title: item.property.property_title,
            property_address: item.property.address || '',
            notes: item.notes || ''
        });
    };

    const cancelEditProperty = () => {
        setEditingProperty(null);
        setEditFormData({
            property_title: '',
            property_address: '',
            notes: ''
        });
    };

    const saveEditProperty = async (propertyId: number) => {
        try {
            const response = await fetch(`/api/properties/${propertyId}/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(editFormData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setEditingProperty(null);
                    loadBasketProperties();
                    toast.success('Property updated successfully');
                } else {
                    toast.error(data.message || 'Failed to update property');
                }
            } else {
                toast.error('Failed to update property');
            }
        } catch (error) {
            console.error('Failed to update property:', error);
            toast.error('Network error occurred');
        }
    };

    const deleteProperty = async (propertyId: number) => {
        if (!confirm('Are you sure you want to delete this property completely? This will remove it from all users\' baskets.')) {
            return;
        }

        try {
            const response = await fetch(`/api/properties/${propertyId}/delete`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    loadBasketProperties();
                    toast.success('Property deleted successfully');
                } else {
                    toast.error(data.message || 'Failed to delete property');
                }
            } else {
                toast.error('Failed to delete property');
            }
        } catch (error) {
            console.error('Failed to delete property:', error);
            toast.error('Network error occurred');
        }
    };

    const claimProperty = async (propertyId: number, claimType: 'buyer' | 'seller', skipConfirmation: boolean = false): Promise<boolean> => {
        if (!skipConfirmation && !confirm(`Are you sure you want to claim this property as a ${claimType}?`)) {
            return false;
        }

        try {
            const response = await fetch(`/api/properties/${propertyId}/claim`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ claim_type: claimType }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    loadBasketProperties();
                    if (!skipConfirmation) {
                        toast.success(`Property claimed as ${claimType}!`);
                    }
                    return true;
                } else {
                    if (!skipConfirmation) {
                        toast.error(data.message || 'Failed to claim property');
                    }
                    return false;
                }
            }
            return false;
        } catch (error) {
            console.error('Failed to claim property:', error);
            if (!skipConfirmation) {
                toast.error('Failed to claim property');
            }
            return false;
        }
    };

    const searchProperties = async () => {
        if (!searchQuery.trim()) return;

        setSearchingProperties(true);
        try {
            const response = await fetch(`/api/properties/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSearchResults(data.data || []);
                }
            }
        } catch (error) {
            console.error('Failed to search properties:', error);
        } finally {
            setSearchingProperties(false);
        }
    };

    const addExistingPropertyToBasket = async (property: Property, claimAfterAdd: boolean = false) => {
        try {
            // First, add to basket
            const response = await fetch('/api/properties/add-to-basket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    rightmove_url: property.rightmove_url,
                    notes: '',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    let claimSuccessful = false;
                    
                    // Auto-claim if requested and we have a default claim type
                    if (claimAfterAdd && autoClaimType) {
                        try {
                            claimSuccessful = await claimProperty(property.id, autoClaimType, true);
                        } catch (error) {
                            console.warn('Auto-claim failed:', error);
                        }
                    }
                    
                    loadBasketProperties();
                    
                    // Show appropriate message based on what happened
                    if (claimAfterAdd && autoClaimType) {
                        if (claimSuccessful) {
                            toast.success(`Property added to your basket and claimed as ${autoClaimType}!`);
                        } else {
                            toast.warning(`Property added to your basket! (Could not claim as ${autoClaimType})`);
                        }
                    } else {
                        toast.success('Property added to your basket!');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to add property:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00BCD4]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Add Property Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="font-semibold text-gray-900">Add Property to Basket</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Add properties with Rightmove URL, custom name, and optional photos
                        </p>
                        {userChainRole && autoClaimType && (
                            <p className="text-xs text-gray-500 mt-1">
                                Based on your chain role ({userChainRole.replace('_', ' ')}), properties can be auto-claimed as {autoClaimType}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAddProperty(!showAddProperty)}
                        className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                    >
                        {showAddProperty ? 'Cancel' : 'Add Property'}
                    </button>
                </div>

                <AnimatePresence>
                    {showAddProperty && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rightmove Property URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    value={rightmoveUrl}
                                    onChange={(e) => setRightmoveUrl(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                    placeholder="https://www.rightmove.co.uk/properties/..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={propertyName}
                                    onChange={(e) => setPropertyName(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                    placeholder="e.g., 3 Bedroom House on Oak Street"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Address
                                </label>
                                <input
                                    type="text"
                                    value={propertyAddress}
                                    onChange={(e) => setPropertyAddress(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                    placeholder="e.g., 123 Oak Street, London, SW1A 1AA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Property Photos (Optional - Max 5)
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoUpload}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#00BCD4] file:text-white hover:file:bg-[#00ACC1] file:cursor-pointer"
                                    />
                                    
                                    {photoPreviewUrls.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                            {photoPreviewUrls.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Property photo ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        type="button"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={propertyNotes}
                                    onChange={(e) => setPropertyNotes(e.target.value)}
                                    rows={2}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                    placeholder="Add any notes about this property..."
                                />
                            </div>

                            {autoClaimType && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800">
                                        💡 <strong>Auto-Claim Tip:</strong> Based on your chain role ({userChainRole?.replace('_', ' ')}), 
                                        you can use "Add & Claim" to automatically claim this property as {autoClaimType}. 
                                        This will only work if the property isn't already claimed by another user.
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => addPropertyToBasket(false)}
                                        disabled={addingProperty || !propertyName.trim() || !rightmoveUrl.trim()}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {addingProperty && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                                        )}
                                        <span>Add to Basket</span>
                                    </button>
                                    
                                    {autoClaimType && (
                                        <button
                                            onClick={() => addPropertyToBasket(true)}
                                            disabled={addingProperty || !propertyName.trim() || !rightmoveUrl.trim()}
                                            className="px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                            title={`Add to basket and attempt to claim as ${autoClaimType}. Will only succeed if property is not already claimed.`}
                                        >
                                            {addingProperty && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            )}
                                            <span>Add & Claim as {autoClaimType === 'buyer' ? 'Buyer' : 'Seller'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search Existing Properties */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Search Existing Properties</h4>
                
                <div className="flex items-center space-x-3 mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchProperties()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                        placeholder="Search by address, title, or URL..."
                    />
                    <button
                        onClick={searchProperties}
                        disabled={searchingProperties}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {searchingProperties ? '🔍' : 'Search'}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="space-y-3">
                        {searchResults.map((property) => (
                            <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{property.property_title}</div>
                                    <div className="text-sm text-gray-600">
                                        {property.formatted_price} • {property.summary}
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                        <span>{property.basket_count} users interested</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => addExistingPropertyToBasket(property, false)}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Add
                                    </button>
                                    {autoClaimType && (
                                        <button
                                            onClick={() => addExistingPropertyToBasket(property, true)}
                                            className="px-3 py-1 text-sm bg-[#00BCD4] text-white rounded hover:bg-[#00ACC1] transition-colors"
                                        >
                                            Add & Claim
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Basket Properties */}
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                    Your Property Basket ({Array.isArray(basketProperties) ? basketProperties.length : 0})
                </h4>

                {!Array.isArray(basketProperties) || basketProperties.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">🏠</div>
                        <p className="text-gray-600">No properties in your basket yet.</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Add properties from Rightmove to track interest and claim listings.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {Array.isArray(basketProperties) && basketProperties.map((item) => (
                            <motion.div
                                key={item.id}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Property Image(s) */}
                                    <div className="flex-shrink-0">
                                        <div 
                                            className={`w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative ${
                                                (item.property.property_photos && item.property.property_photos.length > 0) 
                                                    ? 'cursor-pointer hover:opacity-80 transition-opacity' 
                                                    : ''
                                            }`}
                                            onClick={() => (item.property.property_photos && item.property.property_photos.length > 0) && viewPropertyPhotos(item.property)}
                                        >
                                            {(item.property.property_photos && item.property.property_photos.length > 0) ? (
                                                <>
                                                    <img
                                                        src={item.property.property_photos[0].startsWith('http') ? item.property.property_photos[0] : `${window.location.origin}${item.property.property_photos[0]}`}
                                                        alt={item.property.property_title}
                                                        className="w-full h-full object-cover rounded-lg"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML = '<div class="w-full h-full bg-red-100 flex items-center justify-center rounded-lg"><span class="text-red-500 text-xs">Error</span></div>';
                                                            }
                                                        }}
                                                    />
                                                    {item.property.property_photos && item.property.property_photos.length > 1 && (
                                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                            +{item.property.property_photos.length - 1}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 hover:bg-black hover:bg-opacity-20 transition-colors flex items-center justify-center">
                                                        <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">👁️</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center border border-gray-400 rounded-lg">
                                                    <div className="text-2xl mb-1">🏠</div>
                                                    <div className="text-xs text-gray-600 text-center px-1">No Image</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Details */}
                                    <div className="flex-1 min-w-0">
                                        {editingProperty === item.property.id ? (
                                            /* Edit Mode */
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.property_title}
                                                        onChange={(e) => setEditFormData({...editFormData, property_title: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.property_address}
                                                        onChange={(e) => setEditFormData({...editFormData, property_address: e.target.value})}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                                    <textarea
                                                        value={editFormData.notes}
                                                        onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900 bg-white"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => saveEditProperty(item.property.id)}
                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEditProperty}
                                                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Display Mode */
                                            <>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 truncate">
                                                            {item.property.property_title}
                                                        </h5>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {item.property.formatted_price} • {item.property.summary}
                                                        </div>
                                                        {item.property.address && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {item.property.address}
                                                            </div>
                                                        )}
                                                        
                                                        {/* Interest Stats */}
                                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                            <span>👥 {item.property.basket_count} interested</span>
                                                            {item.is_claimed && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                                                    You claimed as {item.claim_type}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Notes */}
                                                        {item.notes && (
                                                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                                                                <span className="font-medium">Notes:</span> {item.notes}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <button
                                                            onClick={() => startEditProperty(item)}
                                                            className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                                            title="Edit Property"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProperty(item.property.id)}
                                                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                                            title="Delete Property"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Action Buttons - Only show when not editing */}
                                        {editingProperty !== item.property.id && (
                                            <div className="flex items-center space-x-3 mt-3">
                                                <a
                                                    href={item.property.rightmove_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                                                >
                                                    View on Rightmove
                                                </a>
                                                
                                                {!item.is_claimed && (
                                                    <>
                                                        {/* Show role-appropriate claim options */}
                                                        {userChainRole === 'first_time_buyer' ? (
                                                            <button
                                                                onClick={() => claimProperty(item.property.id, 'buyer', false)}
                                                                className="text-sm text-green-600 hover:text-green-700 transition-colors font-medium"
                                                            >
                                                                Claim as Buyer
                                                            </button>
                                                        ) : userChainRole === 'seller_only' ? (
                                                            <button
                                                                onClick={() => claimProperty(item.property.id, 'seller', false)}
                                                                className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                                                            >
                                                                Claim as Seller
                                                            </button>
                                                        ) : (
                                                            /* For buyer_seller or unknown role, show both options */
                                                            <>
                                                                <button
                                                                    onClick={() => claimProperty(item.property.id, 'buyer', false)}
                                                                    className="text-sm text-green-600 hover:text-green-700 transition-colors"
                                                                >
                                                                    Claim as Buyer
                                                                </button>
                                                                <button
                                                                    onClick={() => claimProperty(item.property.id, 'seller', false)}
                                                                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                                                >
                                                                    Claim as Seller
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                
                                                <button
                                                    onClick={() => removePropertyFromBasket(item.property.id)}
                                                    className="text-sm text-orange-600 hover:text-orange-700 transition-colors"
                                                >
                                                    Remove from Basket
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Photo Modal */}
            {showPhotoModal && selectedPropertyPhotos && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Property Photos</h3>
                            <button
                                onClick={() => {
                                    setShowPhotoModal(false);
                                    setSelectedPropertyPhotos(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedPropertyPhotos.map((photo, index) => (
                                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={photo}
                                            alt={`Property photo ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                            onClick={() => window.open(photo, '_blank')}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyBasket;