export interface FurnitureItem {
    id: string;
    name: string;
    volume: number; // in cubic meters
    category: string;
    icon: string;
    image?: string;
}

export interface Room {
    id: string;
    name: string;
    items: { [itemId: string]: number }; // itemId: quantity
}

export interface TruckSize {
    name: string;
    volume: number;
    description: string;
    icon: string;
    price: string;
}

export interface UnassignedItem {
    itemId: string;
    quantity: number;
}

export interface RoomSelectionModal {
    isOpen: boolean;
    selectedItem: FurnitureItem | null;
}
