import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
    id: number;
    rightmove_url: string;
    property_title: string;
    property_image?: string;
    address?: string;
    price?: number;
    property_type?: string;
    bedrooms?: number;
    bathrooms?: number;
    is_claimed: boolean;
    claim_type?: 'buyer' | 'seller';
    claimed_by_user_id?: number;
    basket_count: number;
    formatted_price?: string;
    summary?: string;
}

interface BasketProperty {
    id: number;
    property: Property;
    notes?: string;
    is_favorite: boolean;
    created_at: string;
}

const PropertyBasket: React.FC = () => {
    const [basketProperties, setBasketProperties] = useState<BasketProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [rightmoveUrl, setRightmoveUrl] = useState('');
    const [propertyNotes, setPropertyNotes] = useState('');
    const [addingProperty, setAddingProperty] = useState(false);
    const [searchResults, setSearchResults] = useState<Property[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchingProperties, setSearchingProperties] = useState(false);

    useEffect(() => {
        loadBasketProperties();
    }, []);

    const loadBasketProperties = async () => {
        try {
            const response = await fetch('/api/properties/basket', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            console.log('API Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);
                
                if (data.success) {
                    // Ensure data.data is always an array
                    const properties = Array.isArray(data.data) ? data.data : [];
                    console.log('Setting basket properties:', properties);
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

    const addPropertyToBasket = async () => {
        if (!rightmoveUrl.trim()) {
            alert('Please enter a Rightmove URL');
            return;
        }

        // Basic Rightmove URL validation
        if (!rightmoveUrl.includes('rightmove.co.uk')) {
            alert('Please enter a valid Rightmove URL');
            return;
        }

        setAddingProperty(true);
        try {
            const response = await fetch('/api/properties/add-to-basket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    rightmove_url: rightmoveUrl,
                    notes: propertyNotes,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setRightmoveUrl('');
                    setPropertyNotes('');
                    setShowAddProperty(false);
                    loadBasketProperties();
                    alert('Property added to your basket!');
                } else {
                    alert(data.message || 'Failed to add property');
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to add property');
            }
        } catch (error) {
            console.error('Failed to add property:', error);
            alert('Network error occurred');
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
                    alert('Property removed from basket');
                }
            }
        } catch (error) {
            console.error('Failed to remove property:', error);
            alert('Failed to remove property');
        }
    };

    const claimProperty = async (propertyId: number, claimType: 'buyer' | 'seller') => {
        if (!confirm(`Are you sure you want to claim this property as a ${claimType}?`)) {
            return;
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
                    alert(`Property claimed as ${claimType}!`);
                } else {
                    alert(data.message || 'Failed to claim property');
                }
            }
        } catch (error) {
            console.error('Failed to claim property:', error);
            alert('Failed to claim property');
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

    const addExistingPropertyToBasket = async (property: Property) => {
        try {
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
                    loadBasketProperties();
                    alert('Property added to your basket!');
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
                    <h4 className="font-semibold text-gray-900">Add Property from Rightmove</h4>
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
                                    Rightmove Property URL
                                </label>
                                <input
                                    type="url"
                                    value={rightmoveUrl}
                                    onChange={(e) => setRightmoveUrl(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00BCD4] focus:border-[#00BCD4] text-gray-900"
                                    placeholder="https://www.rightmove.co.uk/properties/..."
                                />
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

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={addPropertyToBasket}
                                    disabled={addingProperty}
                                    className="px-4 py-2 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {addingProperty && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    <span>Add to Basket</span>
                                </button>
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
                                    <div className="text-xs text-gray-500">
                                        {property.basket_count} users interested
                                    </div>
                                </div>
                                <button
                                    onClick={() => addExistingPropertyToBasket(property)}
                                    className="px-3 py-1 text-sm bg-[#00BCD4] text-white rounded hover:bg-[#00ACC1] transition-colors"
                                >
                                    Add
                                </button>
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
                                    {/* Property Image */}
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                            {item.property.property_image ? (
                                                <img
                                                    src={item.property.property_image}
                                                    alt={item.property.property_title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-2xl">🏠</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Details */}
                                    <div className="flex-1 min-w-0">
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
                                                    {item.property.is_claimed && (
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                                            Claimed as {item.property.claim_type}
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
                                                <div className="relative">
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {/* Dropdown menu would go here */}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center space-x-3 mt-3">
                                            <a
                                                href={item.property.rightmove_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[#00BCD4] hover:text-[#00ACC1] transition-colors"
                                            >
                                                View on Rightmove
                                            </a>
                                            
                                            {!item.property.is_claimed && (
                                                <>
                                                    <button
                                                        onClick={() => claimProperty(item.property.id, 'buyer')}
                                                        className="text-sm text-green-600 hover:text-green-700 transition-colors"
                                                    >
                                                        Claim as Buyer
                                                    </button>
                                                    <button
                                                        onClick={() => claimProperty(item.property.id, 'seller')}
                                                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                                    >
                                                        Claim as Seller
                                                    </button>
                                                </>
                                            )}
                                            
                                            <button
                                                onClick={() => removePropertyFromBasket(item.property.id)}
                                                className="text-sm text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyBasket;