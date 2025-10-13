import { Head, Link } from '@inertiajs/react';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Helper function to get the correct image URL for cloud hosting
    const getImageUrl = (imagePath: string) => {
        const url = `/storage-file/${imagePath}`;
        return url;
    };

    // Enhanced error handler that tries alternative paths
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, imagePath: string) => {
        const target = e.target as HTMLImageElement;
        
        const alternativePaths = [
            `/storage/${imagePath}`,
            `/public/storage/${imagePath}`,
            `/${imagePath}`
        ];
        
        const currentAttempt = parseInt(target.dataset.attempt || '0');
        
        if (currentAttempt < alternativePaths.length) {
            target.dataset.attempt = (currentAttempt + 1).toString();
            target.src = alternativePaths[currentAttempt];
            if (process.env.NODE_ENV === 'development') {
                console.log(`Marketplace: Trying alternative path ${currentAttempt + 1}: ${alternativePaths[currentAttempt]} for image: ${imagePath}`);
            }
        } else {
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                            <div className="aspect-square bg-gray-200"></div>
                            <div className="p-3">
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
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <div className="text-8xl mb-6">🏪</div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">No items found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Try adjusting your search criteria or browse all categories. New items are added daily!
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                        <div className="text-sm text-blue-800">
                            💡 <strong>Want to sell something?</strong> Add items to your declutter list and list them for sale in the marketplace.
                        </div>
                        <Link 
                            href="/tools?tab=declutter"
                            className="inline-block mt-3 bg-[#17B7C7] text-white px-4 py-2 rounded-lg hover:bg-[#139AAA] transition-colors text-sm font-medium"
                        >
                            Start Decluttering
                        </Link>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group cursor-pointer">
                        {/* Image Display */}
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                            {item.images && item.images.length > 0 ? (
                                <img
                                    src={getImageUrl(item.images[0])}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => handleImageError(e, item.images?.[0] || '')}
                                    data-attempt="0"
                                />
                            ) : (
                                <div className="text-4xl opacity-20">📦</div>
                            )}
                            
                            {/* Image count indicator */}
                            {item.images && item.images.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    {item.images.length}
                                </div>
                            )}
                            
                            {/* Heart/Save icon */}
                            <button className="absolute top-2 left-2 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                <svg className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            
                            {/* Condition badge */}
                            <div className="absolute bottom-2 left-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getConditionColor(item.condition)}`}>
                                    {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="p-3">
                            {/* Price - Most prominent */}
                            <div className="mb-2">
                                <span className="text-lg font-bold text-gray-900">
                                    £{item.estimated_value}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-[#17B7C7] transition-colors">
                                {item.name}
                            </h3>

                            {/* Location and Date */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                    <span className="truncate">{item.location || 'Location not specified'}</span>
                                </div>
                                <span className="flex-shrink-0 ml-2">{formatDate(item.created_at)}</span>
                            </div>

                            {/* Category tag */}
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {item.category}
                                </span>
                                
                                {/* Seller initial */}
                                <div className="w-6 h-6 bg-[#17B7C7] rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    {(item.user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
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
                        {/* Mobile Filters Toggle */}
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors w-full justify-center"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filters & Search
                                <svg className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Sidebar */}
                            <div className={`lg:w-80 flex-shrink-0 space-y-6 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                                {/* Navigation Menu */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 bg-[#17B7C7] rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">Marketplace</h3>
                                        </div>
                                        <nav className="space-y-2">
                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Browse All</div>
                                                    <div className="text-sm text-blue-600/80">Explore everything</div>
                                                </div>
                                            </button>
                                            
                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-6h6v6z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Notifications</div>
                                                    <div className="text-sm text-gray-500">Activity updates</div>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">2</span>
                                                </div>
                                            </button>
                                            
                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Inbox</div>
                                                    <div className="text-sm text-gray-500">Your messages</div>
                                                </div>
                                                <div className="ml-auto">
                                                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">3</span>
                                                </div>
                                            </button>
                                            
                                            <Link 
                                                href="/tools?tab=declutter"
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Selling</div>
                                                    <div className="text-sm text-gray-500">List items to sell</div>
                                                </div>
                                            </Link>
                                        </nav>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search marketplace..."
                                            value={filters.searchTerm}
                                            onChange={(e) => handleFiltersChange({ searchTerm: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
                                        />
                                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Location Filter */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Location</h4>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter location..."
                                                value={filters.location}
                                                onChange={(e) => handleFiltersChange({ location: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
                                            />
                                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                        </div>
                                        <div className="space-y-2">
                                            {['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'].map(city => (
                                                <button
                                                    key={city}
                                                    onClick={() => handleFiltersChange({ location: city })}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        filters.location === city 
                                                            ? 'bg-[#17B7C7] text-white' 
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {city}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Categories</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleFiltersChange({ category: 'all' })}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                filters.category === 'all' 
                                                    ? 'bg-[#17B7C7] text-white' 
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            All Categories
                                        </button>
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => handleFiltersChange({ category })}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    filters.category === category 
                                                        ? 'bg-[#17B7C7] text-white' 
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Filter */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Price Range</h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={filters.priceMin}
                                                    onChange={(e) => handleFiltersChange({ priceMin: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-sm"
                                                    placeholder="£0"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={filters.priceMax}
                                                    onChange={(e) => handleFiltersChange({ priceMax: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-sm"
                                                    placeholder="£1000"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: 'Under £10', min: 0, max: 10 },
                                                { label: '£10-50', min: 10, max: 50 },
                                                { label: '£50-100', min: 50, max: 100 },
                                                { label: '£100+', min: 100, max: 10000 }
                                            ].map(range => (
                                                <button
                                                    key={range.label}
                                                    onClick={() => handleFiltersChange({ priceMin: range.min, priceMax: range.max })}
                                                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                                        filters.priceMin === range.min && filters.priceMax === range.max
                                                            ? 'bg-[#17B7C7] text-white'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Condition Filter */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Condition</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleFiltersChange({ condition: 'all' })}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                filters.condition === 'all' 
                                                    ? 'bg-[#17B7C7] text-white' 
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            All Conditions
                                        </button>
                                        {[
                                            { value: 'excellent', label: 'Excellent', icon: '⭐' },
                                            { value: 'good', label: 'Good', icon: '👍' },
                                            { value: 'fair', label: 'Fair', icon: '👌' },
                                            { value: 'poor', label: 'Poor', icon: '🔧' }
                                        ].map(condition => (
                                            <button
                                                key={condition.value}
                                                onClick={() => handleFiltersChange({ condition: condition.value })}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                                    filters.condition === condition.value 
                                                        ? 'bg-[#17B7C7] text-white' 
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>{condition.icon}</span>
                                                {condition.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Marketplace Stats</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Total Items</span>
                                            <span className="font-semibold text-gray-900">{items.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Filtered Results</span>
                                            <span className="font-semibold text-[#17B7C7]">{filteredItems.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Average Price</span>
                                            <span className="font-semibold text-gray-900">
                                                £{filteredItems.length > 0 ? Math.round(filteredItems.reduce((sum, item) => sum + item.estimated_value, 0) / filteredItems.length) : 0}
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="text-xs text-gray-500 text-center">
                                                Updated {new Date().toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Helpful Tips */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-md font-medium text-blue-900">Buying Tips</h4>
                                    </div>
                                    <ul className="text-xs text-blue-800 space-y-2">
                                        <li>• Meet in public places for safety</li>
                                        <li>• Check item condition before buying</li>
                                        <li>• Ask questions about the item's history</li>
                                        <li>• Consider negotiating the price</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Content Area - Items Grid */}
                            <div className="flex-1">
                                {/* Header Bar */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Today's Picks
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            {filteredItems.length} items available
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFiltersChange({ sortBy: e.target.value as any })}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-sm bg-white"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="distance">Distance</option>
                                        </select>
                                        
                                        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                                            <button className="px-3 py-2 bg-[#17B7C7] text-white hover:bg-[#139AAA] transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </button>
                                            <button className="px-3 py-2 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Filters Display */}
                                {(filters.searchTerm || filters.category !== 'all' || filters.location || filters.condition !== 'all' || filters.priceMin > 0 || filters.priceMax < 1000) && (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-medium text-gray-700">Active Filters:</h4>
                                            <button
                                                onClick={() => setFilters({
                                                    category: 'all',
                                                    condition: 'all',
                                                    priceMin: 0,
                                                    priceMax: 1000,
                                                    location: '',
                                                    searchTerm: '',
                                                    sortBy: 'newest'
                                                })}
                                                className="text-xs text-[#17B7C7] hover:text-[#139AAA] transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {filters.searchTerm && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                                                    Search: "{filters.searchTerm}"
                                                    <button onClick={() => handleFiltersChange({ searchTerm: '' })} className="text-gray-400 hover:text-gray-600">×</button>
                                                </span>
                                            )}
                                            {filters.category !== 'all' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                                                    Category: {filters.category}
                                                    <button onClick={() => handleFiltersChange({ category: 'all' })} className="text-gray-400 hover:text-gray-600">×</button>
                                                </span>
                                            )}
                                            {filters.location && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                                                    Location: {filters.location}
                                                    <button onClick={() => handleFiltersChange({ location: '' })} className="text-gray-400 hover:text-gray-600">×</button>
                                                </span>
                                            )}
                                            {filters.condition !== 'all' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                                                    Condition: {filters.condition}
                                                    <button onClick={() => handleFiltersChange({ condition: 'all' })} className="text-gray-400 hover:text-gray-600">×</button>
                                                </span>
                                            )}
                                            {(filters.priceMin > 0 || filters.priceMax < 1000) && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm border">
                                                    Price: £{filters.priceMin}-£{filters.priceMax}
                                                    <button onClick={() => handleFiltersChange({ priceMin: 0, priceMax: 1000 })} className="text-gray-400 hover:text-gray-600">×</button>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

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