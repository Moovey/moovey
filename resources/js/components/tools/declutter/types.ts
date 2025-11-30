export interface DeclutterItem {
    id: number;
    name: string;
    description: string;
    category: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    estimated_value: number;
    image?: string;
    images?: string[];
    location?: string;
    is_listed_for_sale: boolean;
    action: 'throw' | 'donate' | 'sell' | 'keep';
    created_at: string;
    updated_at: string;
    user_id: number;
}

export interface DeclutterFormData {
    name: string;
    description: string;
    category: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    estimated_value: number;
    location: string;
    action: 'throw' | 'donate' | 'sell' | 'keep';
}

export interface DeclutterStats {
    total: number;
    throw: number;
    donate: number;
    sell: number;
    keep: number;
    listed: number;
}

export const categories = [
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

export const conditions = [
    { value: 'excellent', label: 'Excellent', description: 'Like new, minimal wear' },
    { value: 'good', label: 'Good', description: 'Minor wear, fully functional' },
    { value: 'fair', label: 'Fair', description: 'Noticeable wear, still usable' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear, may need repair' }
];
