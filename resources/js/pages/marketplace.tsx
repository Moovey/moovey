import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, lazy, Suspense } from 'react';
import GlobalHeader from '@/components/global-header';
import {
    MarketplaceHero,
    MarketplaceItemsGrid,
    ActiveFilters,
    MobileFiltersToggle,
    ContentHeader,
    type MarketplaceItem,
    type Filters,
    type MarketplaceStats
} from '@/components/marketplace';
// Lazy-load below-the-fold components
const WelcomeFooter = lazy(() => import('@/components/welcome/welcome-footer'));
const ItemDetailModal = lazy(() => import('@/components/marketplace/ItemDetailModal'));
const LazyMarketplaceSidebar = lazy(() => import('@/components/marketplace/MarketplaceSidebar'));

// Hoisted constants to avoid re-creation on each render
const INITIAL_FILTERS = {
    category: 'all' as const,
    condition: 'all' as const,
    priceMin: 0,
    priceMax: 1000,
    location: '',
    searchTerm: '',
    sortBy: 'newest' as const
};

const CATEGORIES = [
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

export default function Marketplace() {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const [filters, setFilters] = useState<Filters>({ ...INITIAL_FILTERS });

    // Load marketplace items from API
    useEffect(() => {
        const loadItems = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/marketplace/items');
                const data = await response.json();
                if (data.success && data.items) {
                    setItems(data.items);
                    setFilteredItems(data.items);
                } else {
                    console.warn('No items found or API response format unexpected:', data);
                    setItems([]);
                    setFilteredItems([]);
                }
            } catch (error) {
                console.error('Failed to load marketplace items:', error);
                setItems([]);
                setFilteredItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, []);

    // Apply filters whenever filters or items change
    useEffect(() => {
        let filtered = [...items];

        // Search filter
        if (filters.searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Location filter
        if (filters.location) {
            filtered = filtered.filter(item =>
                item.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Condition filter
        if (filters.condition !== 'all') {
            filtered = filtered.filter(item => item.condition === filters.condition);
        }

        // Price range filter
        filtered = filtered.filter(item =>
            item.estimated_value >= filters.priceMin && item.estimated_value <= filters.priceMax
        );

        // Sorting
        if (filters.sortBy === 'price-low') {
            filtered.sort((a, b) => a.estimated_value - b.estimated_value);
        } else if (filters.sortBy === 'price-high') {
            filtered.sort((a, b) => b.estimated_value - a.estimated_value);
        } else if (filters.sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        setFilteredItems(filtered);
    }, [filters, items]);

    // Update filters
    const handleFiltersChange = (newFilters: Partial<Filters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // Categories (hoisted)
    const categories = CATEGORIES;

    // Prepare marketplace stats
    const marketplaceStats: MarketplaceStats = {
        totalItems: items.length,
        categoriesCount: categories.length,
        activeListings: items.length
    };

    // Handle filter removal
    const handleRemoveFilter = (filterType: keyof Filters, value?: any) => {
        switch (filterType) {
            case 'searchTerm':
                handleFiltersChange({ searchTerm: '' });
                break;
            case 'category':
                handleFiltersChange({ category: 'all' });
                break;
            case 'location':
                handleFiltersChange({ location: '' });
                break;
            case 'condition':
                handleFiltersChange({ condition: 'all' });
                break;
            case 'priceMin':
                handleFiltersChange({ priceMin: 0, priceMax: 1000 });
                break;
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({ ...INITIAL_FILTERS });
    };

    // Handle item click to open modal
    const handleItemClick = (item: MarketplaceItem) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    // Idle prefetch for lazies
    useEffect(() => {
        const idle = (cb: () => void) => {
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(cb);
            } else {
                setTimeout(cb, 500);
            }
        };
        idle(() => {
            import('@/components/welcome/welcome-footer');
            import('@/components/marketplace/ItemDetailModal');
            import('@/components/marketplace/MarketplaceSidebar');
        });
    }, []);

    return (
        <>
            <Head title="Moovey Marketplace - Buy & Sell Preloved Items">
                <link rel="preconnect" href="https://fonts.bunny.net" crossOrigin="" />
                <link
                    rel="preload"
                    as="style"
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap"
                />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900&display=swap"
                    rel="stylesheet"
                />
                {/* Preload hero imagery to improve LCP */}
                <link rel="preload" as="image" href="/images/marketplace-banner.webp" />
                <link rel="preload" as="image" href="/images/marketplace-background.webp" />
            </Head>
            
            <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
                <GlobalHeader currentPage="marketplace" />

                <MarketplaceHero stats={marketplaceStats} />

                {/* Main Content */}
                <section className="py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <MobileFiltersToggle 
                            sidebarOpen={sidebarOpen}
                            onToggle={() => setSidebarOpen(!sidebarOpen)}
                        />

                        <div className="flex flex-col lg:flex-row gap-8">
                            <Suspense fallback={<SidebarSkeleton isVisible={sidebarOpen} />}>
                                <LazyMarketplaceSidebar
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                    categories={categories}
                                    items={items}
                                    filteredItems={filteredItems}
                                    isVisible={sidebarOpen}
                                />
                            </Suspense>

                            {/* Right Content Area - Items Grid */}
                            <div className="flex-1">
                                <ContentHeader 
                                    filteredItemsCount={filteredItems.length}
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                />

                                <ActiveFilters 
                                    filters={filters}
                                    onRemoveFilter={handleRemoveFilter}
                                    onClearAll={clearAllFilters}
                                />

                                <MarketplaceItemsGrid
                                    items={filteredItems}
                                    loading={loading}
                                    handleImageError={handleImageError}
                                    getImageUrl={getImageUrl}
                                    onItemClick={handleItemClick}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <Suspense fallback={<div className="py-10" aria-hidden="true"></div>}>
                    <WelcomeFooter />
                </Suspense>
            </div>

            {/* Item Detail Modal */}
            {selectedItem && (
                <Suspense fallback={null}>
                    <ItemDetailModal
                        item={selectedItem}
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        getImageUrl={getImageUrl}
                        handleImageError={handleImageError}
                    />
                </Suspense>
            )}
        </>
    );
}

function SidebarSkeleton({ isVisible }: { isVisible: boolean }) {
    return (
        <div className={`lg:w-80 flex-shrink-0 space-y-6 ${isVisible ? 'block' : 'hidden lg:block'}`} aria-hidden="true">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 w-full bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-5 w-28 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-8 w-full bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-5 w-28 bg-gray-200 rounded mb-4 animate-pulse"></div>
                <div className="h-8 w-full bg-gray-100 rounded-lg animate-pulse mb-3"></div>
                <div className="h-8 w-full bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <div className="h-5 w-24 bg-blue-100 rounded mb-3 animate-pulse"></div>
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-3 w-full bg-blue-100 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}