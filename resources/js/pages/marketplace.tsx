import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';

interface MarketplaceItem {
    id: number;
    name: string;
    description: string;
    category: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    estimated_value: number;
    originalPrice?: number;
    image?: string;
    images?: string[];
    location: string;
    user_id: number;
    user?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    is_listed_for_sale: boolean;
    action: 'throw' | 'donate' | 'sell' | 'keep';
}

interface Filters {
    category: string;
    condition: string;
    priceMin: number;
    priceMax: number;
    location: string;
    searchTerm: string;
    sortBy: 'newest' | 'price-low' | 'price-high' | 'distance';
}

export default function Marketplace() {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper function to get the correct image URL for cloud hosting
    const getImageUrl = (imagePath: string) => {
        // For cloud hosting, try the Laravel route fallback first as it's more likely to work
        const url = `/storage-file/${imagePath}`;
        return url;
    };

    // Enhanced error handler that tries alternative paths
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, imagePath: string) => {
        const target = e.target as HTMLImageElement;
        
        // Alternative paths to try if the primary path fails
        const alternativePaths = [
            `/storage/${imagePath}`, // Standard Laravel storage link
            `/public/storage/${imagePath}`, // Direct public path
            `/${imagePath}` // Direct image path
        ];
        
        // Get the current attempt from a data attribute
        const currentAttempt = parseInt(target.dataset.attempt || '0');
        
        if (currentAttempt < alternativePaths.length) {
            // Try the next alternative path
            target.dataset.attempt = (currentAttempt + 1).toString();
            target.src = alternativePaths[currentAttempt];
            // Only log if we're in development mode
            if (process.env.NODE_ENV === 'development') {
                console.log(`Marketplace: Trying alternative path ${currentAttempt + 1}: ${alternativePaths[currentAttempt]} for image: ${imagePath}`);
            }
        } else {
            // All paths failed, show fallback
            console.error(`Marketplace: All image paths failed for: ${imagePath}`);
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl text-gray-400">📦</div>';
            }
        }
    };
    const [filters, setFilters] = useState<Filters>({
        category: 'all',
        condition: 'all',
        priceMin: 0,
        priceMax: 1000,
        location: '',
        searchTerm: '',
        sortBy: 'newest'
    });

    // Load marketplace items from API
    useEffect(() => {
        const loadItems = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/marketplace/items', {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'same-origin',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setItems(data.items);
                    }
                } else {
                    console.error('Failed to load marketplace items');
                }
            } catch (error) {
                console.error('Failed to load marketplace items:', error);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, []);

    // Apply filters whenever filters or items change
    useEffect(() => {
        let filtered = [...items];

        // Search term filter
        if (filters.searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Condition filter
        if (filters.condition !== 'all') {
            filtered = filtered.filter(item => item.condition === filters.condition);
        }

        // Price range filter
        filtered = filtered.filter(item => 
            item.estimated_value >= filters.priceMin && item.estimated_value <= filters.priceMax
        );

        // Location filter
        if (filters.location) {
            filtered = filtered.filter(item =>
                (item.location || '').toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-low':
                    return a.estimated_value - b.estimated_value;
                case 'price-high':
                    return b.estimated_value - a.estimated_value;
                case 'distance':
                    // In a real app, this would calculate actual distance
                    return (a.location || '').localeCompare(b.location || '');
                case 'newest':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        setFilteredItems(filtered);
    }, [items, filters]);

    const handleFiltersChange = (newFilters: Partial<Filters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const categories = [
        'Furniture',
        'Electronics',
        'Clothing',
        'Books',
        'Kitchen Items',
        'Home Decor',
        'Toys',
        'Sports Equipment',
        'Garden Items',
        'Other'
    ];

    // Simple MarketplaceGrid component
    const MarketplaceGrid = ({ items, loading }: { items: MarketplaceItem[], loading: boolean }) => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                            <div className="h-48 bg-gray-200"></div>
                            <div className="p-4">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="text-center py-16">
                    <div className="text-8xl mb-6">🔍</div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">No items found</h3>
                    <p className="text-gray-500 mb-6">
                        Try adjusting your search criteria or browse all categories
                    </p>
                    <div className="text-sm text-gray-400">
                        💡 Tip: Items from your declutter list will appear here when you list them for sale
                    </div>
                </div>
            );
        }

        const getConditionColor = (condition: string) => {
            switch (condition) {
                case 'excellent': return 'bg-green-100 text-green-800';
                case 'good': return 'bg-blue-100 text-blue-800';
                case 'fair': return 'bg-yellow-100 text-yellow-800';
                case 'poor': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            return date.toLocaleDateString();
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                        {/* Image Display */}
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                            {item.images && item.images.length > 0 ? (
                                <img
                                    src={getImageUrl(item.images[0])}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => handleImageError(e, item.images?.[0] || '')}
                                    data-attempt="0"
                                />
                            ) : (
                                <div className="text-6xl opacity-20">📦</div>
                            )}
                            {item.images && item.images.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    +{item.images.length - 1}
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-[#17B7C7] transition-colors line-clamp-2">
                                    {item.name}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {item.description}
                            </p>

                            {/* Details */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                                    {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                    {item.category}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.action === 'sell' ? 'bg-green-100 text-green-800' :
                                    item.action === 'donate' ? 'bg-blue-100 text-blue-800' :
                                    item.action === 'throw' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {item.action === 'throw' ? 'Throw Away' : 
                                     item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#17B7C7]">
                                        £{item.estimated_value}
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <span className="truncate">{item.location || 'Location not specified'}</span>
                                </div>
                                <span>{formatDate(item.created_at)}</span>
                            </div>

                            {/* Seller */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <div className="w-8 h-8 bg-[#17B7C7] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {(item.user?.name || 'User').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{item.user?.name || 'Anonymous'}</div>
                                    <div className="text-xs text-gray-500">Seller</div>
                                </div>
                                <button className="bg-[#17B7C7] text-white px-3 py-1.5 rounded-lg hover:bg-[#139AAA] transition-colors text-sm font-medium">
                                    Contact
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title="Moovey Marketplace - Buy & Sell Preloved Items">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
                <GlobalHeader currentPage="marketplace" />

                {/* Hero Section */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#17B7C7] to-[#1A237E]">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            🛒 Moovey Marketplace
                        </h1>
                        <p className="text-xl text-white/90 mb-6">
                            Find great deals on preloved items from people who are moving and decluttering
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <div className="bg-white/20 rounded-lg px-6 py-3">
                                <div className="text-2xl font-bold text-white">{items.length}</div>
                                <div className="text-white/80 text-sm">Active Listings</div>
                            </div>
                            <div className="bg-white/20 rounded-lg px-6 py-3">
                                <div className="text-2xl font-bold text-white">{categories.length}</div>
                                <div className="text-white/80 text-sm">Categories</div>
                            </div>
                            <div className="bg-white/20 rounded-lg px-6 py-3">
                                <div className="text-2xl font-bold text-white">Free</div>
                                <div className="text-white/80 text-sm">Listing Fee</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Filters Sidebar */}
                            {/* Filters Sidebar */}
                            <div className="lg:w-80 flex-shrink-0">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-semibold mb-4">Filters</h3>
                                    <p className="text-gray-600">Filters component coming soon...</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Showing {filteredItems.length} items
                                    </p>
                                </div>
                            </div>
                            {/* Items Grid */}
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {filters.searchTerm || filters.category !== 'all' || filters.location
                                            ? `Search Results (${filteredItems.length})`
                                            : 'All Items'
                                        }
                                    </h2>
                                    
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFiltersChange({ sortBy: e.target.value as any })}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="distance">Distance</option>
                                    </select>
                                </div>

                                <MarketplaceGrid
                                    items={filteredItems}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <WelcomeFooter />
            </div>
        </>
    );
}