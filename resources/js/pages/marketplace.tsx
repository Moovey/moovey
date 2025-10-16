import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import {
    MarketplaceHero,
    MarketplaceSidebar,
    MarketplaceItemsGrid,
    ActiveFilters,
    MobileFiltersToggle,
    ContentHeader,
    type MarketplaceItem,
    type Filters,
    type MarketplaceStats
} from '@/components/marketplace';
import ItemDetailModal from '@/components/marketplace/ItemDetailModal';

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
                const response = await fetch('/api/marketplace/items');
                const data = await response.json();
                console.log('Marketplace API response:', data); // Debug log
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

    // Define categories
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
        setFilters({
            category: 'all',
            condition: 'all',
            priceMin: 0,
            priceMax: 1000,
            location: '',
            searchTerm: '',
            sortBy: 'newest'
        });
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

    return (
        <>
            <Head title="Moovey Marketplace - Buy & Sell Preloved Items">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
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
                            <MarketplaceSidebar
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                categories={categories}
                                items={items}
                                filteredItems={filteredItems}
                                isVisible={sidebarOpen}
                            />

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

                <WelcomeFooter />
            </div>

            {/* Item Detail Modal */}
            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    getImageUrl={getImageUrl}
                    handleImageError={handleImageError}
                />
            )}
        </>
    );
}