// Shared types for marketplace components
export interface MarketplaceItem {
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

export interface Filters {
    category: string;
    condition: string;
    priceMin: number;
    priceMax: number;
    location: string;
    searchTerm: string;
    sortBy: 'newest' | 'price-low' | 'price-high' | 'distance';
}

export interface MarketplaceStats {
    totalItems: number;
    categoriesCount: number;
    activeListings: number;
}