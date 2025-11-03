import { useState } from 'react';
import SaveResultsButton from '@/components/SaveResultsButton';

interface FurnitureItem {
    id: string;
    name: string;
    volume: number; // in cubic meters
    category: string;
    icon: string;
}

interface Room {
    id: string;
    name: string;
    items: { [itemId: string]: number }; // itemId: quantity
}

interface TruckSize {
    name: string;
    volume: number;
    description: string;
    icon: string;
    price: string;
}

interface UnassignedItem {
    itemId: string;
    quantity: number;
}

interface RoomSelectionModal {
    isOpen: boolean;
    selectedItem: FurnitureItem | null;
}

export default function VolumeCalculator() {
    // Comprehensive furniture database with specific items
    const furnitureDatabase: FurnitureItem[] = [
        // Living Room - Seating
        { id: 'sofa_2seat', name: '2-Seat Sofa', volume: 2.5, category: 'Living Room', icon: '🛋️' },
        { id: 'sofa_3seat', name: '3-Seat Sofa', volume: 3.2, category: 'Living Room', icon: '🛋️' },
        { id: 'sofa_corner', name: 'Corner Sofa', volume: 4.5, category: 'Living Room', icon: '🛋️' },
        { id: 'sofa_sectional', name: 'Sectional Sofa', volume: 5.8, category: 'Living Room', icon: '🛋️' },
        { id: 'armchair', name: 'Armchair', volume: 1.8, category: 'Living Room', icon: '🪑' },
        { id: 'recliner', name: 'Recliner Chair', volume: 2.2, category: 'Living Room', icon: '🪑' },
        { id: 'ottoman', name: 'Ottoman', volume: 0.6, category: 'Living Room', icon: '🪑' },
        
        // Living Room - Tables & Storage
        { id: 'coffee_table', name: 'Coffee Table', volume: 0.8, category: 'Living Room', icon: '🪑' },
        { id: 'side_table', name: 'Side Table', volume: 0.3, category: 'Living Room', icon: '🪑' },
        { id: 'tv_stand', name: 'TV Stand', volume: 1.2, category: 'Living Room', icon: '📺' },
        { id: 'tv_unit_large', name: 'Large TV Unit', volume: 2.0, category: 'Living Room', icon: '📺' },
        { id: 'bookshelf_small', name: 'Small Bookshelf', volume: 1.0, category: 'Living Room', icon: '📚' },
        { id: 'bookshelf_large', name: 'Large Bookshelf', volume: 2.5, category: 'Living Room', icon: '📚' },
        { id: 'display_cabinet', name: 'Display Cabinet', volume: 1.8, category: 'Living Room', icon: '🗄️' },
        
        // Bedroom - Beds
        { id: 'single_bed', name: 'Single Bed', volume: 2.0, category: 'Bedroom', icon: '🛏️' },
        { id: 'double_bed', name: 'Double Bed', volume: 2.8, category: 'Bedroom', icon: '🛏️' },
        { id: 'queen_bed', name: 'Queen Size Bed', volume: 3.2, category: 'Bedroom', icon: '🛏️' },
        { id: 'king_bed', name: 'King Size Bed', volume: 3.8, category: 'Bedroom', icon: '🛏️' },
        { id: 'super_king_bed', name: 'Super King Bed', volume: 4.5, category: 'Bedroom', icon: '🛏️' },
        { id: 'four_poster_bed', name: 'Four Poster Bed', volume: 5.2, category: 'Bedroom', icon: '🛏️' },
        { id: 'bunk_bed', name: 'Bunk Bed', volume: 3.5, category: 'Bedroom', icon: '🛏️' },
        { id: 'sofa_bed', name: 'Sofa Bed', volume: 3.0, category: 'Bedroom', icon: '🛏️' },
        
        // Bedroom - Storage
        { id: 'wardrobe_small', name: 'Small Wardrobe (2 Door)', volume: 2.5, category: 'Bedroom', icon: '👔' },
        { id: 'wardrobe_medium', name: 'Medium Wardrobe (3 Door)', volume: 3.2, category: 'Bedroom', icon: '👔' },
        { id: 'wardrobe_large', name: 'Large Wardrobe (4 Door)', volume: 4.5, category: 'Bedroom', icon: '👔' },
        { id: 'wardrobe_fitted', name: 'Fitted Wardrobe Section', volume: 3.8, category: 'Bedroom', icon: '👔' },
        { id: 'chest_drawers_3', name: '3-Drawer Chest', volume: 1.2, category: 'Bedroom', icon: '🗄️' },
        { id: 'chest_drawers_5', name: '5-Drawer Chest', volume: 1.8, category: 'Bedroom', icon: '🗄️' },
        { id: 'bedside_table', name: 'Bedside Table', volume: 0.5, category: 'Bedroom', icon: '🪑' },
        { id: 'dressing_table', name: 'Dressing Table', volume: 1.5, category: 'Bedroom', icon: '🪑' },
        
        // Kitchen - Appliances (Large)
        { id: 'fridge_small', name: 'Under-Counter Fridge', volume: 1.2, category: 'Kitchen', icon: '❄️' },
        { id: 'fridge_standard', name: 'Standard Fridge', volume: 2.0, category: 'Kitchen', icon: '❄️' },
        { id: 'fridge_large', name: 'Large Fridge-Freezer', volume: 2.8, category: 'Kitchen', icon: '❄️' },
        { id: 'fridge_american', name: 'American Fridge Freezer', volume: 3.5, category: 'Kitchen', icon: '❄️' },
        { id: 'chest_freezer', name: 'Chest Freezer', volume: 1.8, category: 'Kitchen', icon: '❄️' },
        { id: 'washing_machine', name: 'Washing Machine', volume: 1.5, category: 'Kitchen', icon: '🌊' },
        { id: 'tumble_dryer', name: 'Tumble Dryer', volume: 1.5, category: 'Kitchen', icon: '�' },
        { id: 'dishwasher', name: 'Dishwasher', volume: 1.2, category: 'Kitchen', icon: '🍽️' },
        { id: 'range_cooker', name: 'Range Cooker', volume: 2.2, category: 'Kitchen', icon: '🔥' },
        
        // Kitchen - Appliances (Small)
        { id: 'microwave', name: 'Microwave', volume: 0.3, category: 'Kitchen', icon: '📻' },
        { id: 'toaster', name: 'Toaster', volume: 0.1, category: 'Kitchen', icon: '🍞' },
        { id: 'kettle', name: 'Kettle', volume: 0.05, category: 'Kitchen', icon: '�' },
        { id: 'food_processor', name: 'Food Processor', volume: 0.2, category: 'Kitchen', icon: '🍽️' },
        
        // Kitchen - Furniture
        { id: 'dining_table_2seat', name: '2-Seater Dining Table', volume: 1.2, category: 'Kitchen', icon: '🍽️' },
        { id: 'dining_table_4seat', name: '4-Seater Dining Table', volume: 2.0, category: 'Kitchen', icon: '🍽️' },
        { id: 'dining_table_6seat', name: '6-Seater Dining Table', volume: 2.8, category: 'Kitchen', icon: '🍽️' },
        { id: 'dining_table_8seat', name: '8-Seater Dining Table', volume: 3.5, category: 'Kitchen', icon: '�️' },
        { id: 'dining_chair', name: 'Dining Chair', volume: 0.6, category: 'Kitchen', icon: '🪑' },
        { id: 'bar_stool', name: 'Bar Stool', volume: 0.4, category: 'Kitchen', icon: '🪑' },
        { id: 'kitchen_island', name: 'Kitchen Island', volume: 3.0, category: 'Kitchen', icon: '�️' },
        
        // Office
        { id: 'office_desk_small', name: 'Small Desk', volume: 1.2, category: 'Office', icon: '💻' },
        { id: 'office_desk_large', name: 'Large Desk', volume: 2.2, category: 'Office', icon: '💻' },
        { id: 'bureau', name: 'Bureau/Writing Desk', volume: 1.8, category: 'Office', icon: '✍️' },
        { id: 'office_chair', name: 'Office Chair', volume: 1.0, category: 'Office', icon: '🪑' },
        { id: 'filing_cabinet_2drawer', name: '2-Drawer Filing Cabinet', volume: 0.8, category: 'Office', icon: '🗄️' },
        { id: 'filing_cabinet_4drawer', name: '4-Drawer Filing Cabinet', volume: 1.5, category: 'Office', icon: '🗄️' },
        { id: 'bookshelf_office', name: 'Office Bookshelf', volume: 1.8, category: 'Office', icon: '📚' },
        { id: 'computer_desk', name: 'Computer Desk', volume: 1.5, category: 'Office', icon: '🖥️' },
        
        // Storage & Boxes
        { id: 'box_book', name: 'Book Box', volume: 0.03, category: 'Storage', icon: '📦' },
        { id: 'box_small', name: 'Small Box', volume: 0.06, category: 'Storage', icon: '📦' },
        { id: 'box_medium', name: 'Medium Box', volume: 0.12, category: 'Storage', icon: '📦' },
        { id: 'box_large', name: 'Large Box', volume: 0.18, category: 'Storage', icon: '📦' },
        { id: 'box_extra_large', name: 'Extra Large Box', volume: 0.25, category: 'Storage', icon: '📦' },
        { id: 'wardrobe_box', name: 'Wardrobe Box', volume: 0.35, category: 'Storage', icon: '📦' },
        { id: 'suitcase_small', name: 'Small Suitcase', volume: 0.2, category: 'Storage', icon: '🧳' },
        { id: 'suitcase_large', name: 'Large Suitcase', volume: 0.4, category: 'Storage', icon: '🧳' },
        { id: 'trunk', name: 'Storage Trunk', volume: 0.8, category: 'Storage', icon: '🧳' },
        
        // Sports & Recreation
        { id: 'bicycle', name: 'Bicycle', volume: 1.0, category: 'Sports', icon: '🚲' },
        { id: 'exercise_bike', name: 'Exercise Bike', volume: 1.5, category: 'Sports', icon: '🚴' },
        { id: 'treadmill', name: 'Treadmill', volume: 3.2, category: 'Sports', icon: '🏃' },
        { id: 'golf_clubs', name: 'Set of Golf Clubs', volume: 0.3, category: 'Sports', icon: '⛳' },
        { id: 'surfboard', name: 'Surfboard', volume: 0.8, category: 'Sports', icon: '🏄' },
        { id: 'kayak', name: 'Kayak', volume: 2.5, category: 'Sports', icon: '🚣' },
        { id: 'ski_equipment', name: 'Ski Equipment Set', volume: 0.5, category: 'Sports', icon: '🎿' },
        { id: 'tennis_rackets', name: 'Tennis Racket Set', volume: 0.2, category: 'Sports', icon: '🎾' },
        
        // Musical Instruments
        { id: 'piano_upright', name: 'Upright Piano', volume: 4.5, category: 'Music', icon: '🎹' },
        { id: 'piano_digital', name: 'Digital Piano', volume: 1.8, category: 'Music', icon: '🎹' },
        { id: 'guitar', name: 'Guitar', volume: 0.3, category: 'Music', icon: '🎸' },
        { id: 'drum_kit', name: 'Drum Kit', volume: 3.0, category: 'Music', icon: '🥁' },
        { id: 'keyboard', name: 'Keyboard', volume: 0.8, category: 'Music', icon: '🎹' },
        
        // Electronics
        { id: 'tv_32inch', name: '32" TV', volume: 0.3, category: 'Electronics', icon: '�' },
        { id: 'tv_43inch', name: '43" TV', volume: 0.5, category: 'Electronics', icon: '📺' },
        { id: 'tv_55inch', name: '55" TV', volume: 0.8, category: 'Electronics', icon: '📺' },
        { id: 'tv_65inch', name: '65" TV', volume: 1.2, category: 'Electronics', icon: '📺' },
        { id: 'computer_desktop', name: 'Desktop Computer', volume: 0.4, category: 'Electronics', icon: '🖥️' },
        { id: 'laptop', name: 'Laptop', volume: 0.05, category: 'Electronics', icon: '💻' },
        { id: 'printer', name: 'Printer', volume: 0.3, category: 'Electronics', icon: '🖨️' },
        { id: 'sound_system', name: 'Sound System', volume: 1.0, category: 'Electronics', icon: '🔊' },
        
        // Garden & Outdoor
        { id: 'garden_table', name: 'Garden Table', volume: 1.5, category: 'Garden', icon: '�' },
        { id: 'garden_chair', name: 'Garden Chair', volume: 0.8, category: 'Garden', icon: '🪑' },
        { id: 'bbq_grill', name: 'BBQ Grill', volume: 1.8, category: 'Garden', icon: '🔥' },
        { id: 'lawnmower', name: 'Lawnmower', volume: 1.2, category: 'Garden', icon: '🌱' },
        { id: 'garden_shed_content', name: 'Garden Shed Contents', volume: 8.0, category: 'Garden', icon: '🏡' },
        { id: 'patio_heater', name: 'Patio Heater', volume: 0.8, category: 'Garden', icon: '🔥' },
        { id: 'garden_parasol', name: 'Garden Parasol', volume: 0.5, category: 'Garden', icon: '☂️' },
        
        // Miscellaneous
        { id: 'mirror_large', name: 'Large Mirror', volume: 0.5, category: 'Miscellaneous', icon: '🪞' },
        { id: 'artwork_large', name: 'Large Artwork/Painting', volume: 0.3, category: 'Miscellaneous', icon: '🖼️' },
        { id: 'chandelier', name: 'Chandelier', volume: 0.8, category: 'Miscellaneous', icon: '💡' },
        { id: 'vacuum_cleaner', name: 'Vacuum Cleaner', volume: 0.4, category: 'Miscellaneous', icon: '🧹' },
        { id: 'ironing_board', name: 'Ironing Board', volume: 0.3, category: 'Miscellaneous', icon: '👕' },
        { id: 'clothes_airer', name: 'Clothes Airer', volume: 0.4, category: 'Miscellaneous', icon: '👕' },
        { id: 'pet_carrier', name: 'Pet Carrier', volume: 0.2, category: 'Miscellaneous', icon: '�' }
    ];

    const truckSizes: TruckSize[] = [
        { name: 'Small Van', volume: 10, description: 'Studio apartment or 1-bedroom', icon: '🚐', price: '£80-120' },
        { name: 'Medium Van', volume: 20, description: '2-bedroom flat or small house', icon: '🚚', price: '£120-180' },
        { name: 'Large Van', volume: 35, description: '3-bedroom house', icon: '🚛', price: '£180-250' },
        { name: 'Luton Van', volume: 50, description: '4-bedroom house or large home', icon: '🚚', price: '£220-300' },
        { name: 'Removal Lorry', volume: 75, description: '5+ bedroom house or office move', icon: '🚛', price: '£300-500' }
    ];

    const [rooms, setRooms] = useState<Room[]>([
        { id: '1', name: 'Living Room', items: {} },
        { id: '2', name: 'Bedroom 1', items: {} },
        { id: '3', name: 'Kitchen', items: {} }
    ]);

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [customItems, setCustomItems] = useState<FurnitureItem[]>([]);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customForm, setCustomForm] = useState({
        name: '',
        length: '',
        width: '',
        height: ''
    });
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    // New state for unassigned items and modal
    const [unassignedItems, setUnassignedItems] = useState<UnassignedItem[]>([]);
    const [roomSelectionModal, setRoomSelectionModal] = useState<RoomSelectionModal>({
        isOpen: false,
        selectedItem: null
    });
    const [itemQuantity, setItemQuantity] = useState<number>(1);

    // Calculate total volume
    const calculateTotalVolume = (): number => {
        let total = 0;
        
        // Volume from rooms
        rooms.forEach(room => {
            Object.entries(room.items).forEach(([itemId, quantity]) => {
                const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                if (item) {
                    total += item.volume * quantity;
                }
            });
        });
        
        // Volume from unassigned items
        unassignedItems.forEach(unassignedItem => {
            const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
            if (item) {
                total += item.volume * unassignedItem.quantity;
            }
        });
        
        return total;
    };

    // Get recommended truck
    const getRecommendedTruck = (): TruckSize => {
        const totalVolume = calculateTotalVolume();
        const truck = truckSizes.find(truck => truck.volume >= totalVolume) || truckSizes[truckSizes.length - 1];
        return truck;
    };

    // Add room
    const addRoom = () => {
        const newRoom: Room = {
            id: Date.now().toString(),
            name: `Room ${rooms.length + 1}`,
            items: {}
        };
        setRooms(prev => [...prev, newRoom]);
    };

    // Remove room
    const removeRoom = (roomId: string) => {
        setRooms(prev => prev.filter(room => room.id !== roomId));
    };

    // Update room name
    const updateRoomName = (roomId: string, newName: string) => {
        setRooms(prev => prev.map(room => 
            room.id === roomId ? { ...room, name: newName } : room
        ));
    };

    // Open room selection modal
    const openRoomSelectionModal = (item: FurnitureItem) => {
        setRoomSelectionModal({
            isOpen: true,
            selectedItem: item
        });
        setItemQuantity(1);
    };
    
    // Close room selection modal
    const closeRoomSelectionModal = () => {
        setRoomSelectionModal({
            isOpen: false,
            selectedItem: null
        });
        setItemQuantity(1);
    };
    
    // Add item to specific room
    const addItemToRoom = (roomId: string, itemId: string, quantity: number = 1) => {
        setRooms(prev => prev.map(room => {
            if (room.id === roomId) {
                const currentQuantity = room.items[itemId] || 0;
                return {
                    ...room,
                    items: { ...room.items, [itemId]: currentQuantity + quantity }
                };
            }
            return room;
        }));
    };
    
    // Add item without assigning to room
    const addItemUnassigned = (itemId: string, quantity: number = 1) => {
        setUnassignedItems(prev => {
            const existingItem = prev.find(item => item.itemId === itemId);
            if (existingItem) {
                return prev.map(item => 
                    item.itemId === itemId 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prev, { itemId, quantity }];
            }
        });
    };

    // Remove item from room
    const removeItemFromRoom = (roomId: string, itemId: string) => {
        setRooms(prev => prev.map(room => {
            if (room.id === roomId) {
                const newItems = { ...room.items };
                if (newItems[itemId] > 1) {
                    newItems[itemId]--;
                } else {
                    delete newItems[itemId];
                }
                return { ...room, items: newItems };
            }
            return room;
        }));
    };
    
    // Remove unassigned item
    const removeUnassignedItem = (itemId: string) => {
        setUnassignedItems(prev => {
            const existingItem = prev.find(item => item.itemId === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prev.map(item => 
                    item.itemId === itemId 
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            } else {
                return prev.filter(item => item.itemId !== itemId);
            }
        });
    };

    // Add custom item
    const addCustomItem = () => {
        if (!customForm.name || !customForm.length || !customForm.width || !customForm.height) {
            return;
        }

        const volume = (parseFloat(customForm.length) * parseFloat(customForm.width) * parseFloat(customForm.height)) / 1000000; // Convert cm³ to m³

        const newItem: FurnitureItem = {
            id: `custom_${Date.now()}`,
            name: customForm.name,
            volume: volume,
            category: 'Custom',
            icon: '📦'
        };

        setCustomItems(prev => [...prev, newItem]);
        setCustomForm({ name: '', length: '', width: '', height: '' });
        setShowCustomForm(false);
    };

    // Clear all
    const clearAll = () => {
        setRooms([
            { id: '1', name: 'Living Room', items: {} },
            { id: '2', name: 'Bedroom 1', items: {} },
            { id: '3', name: 'Kitchen', items: {} }
        ]);
        setCustomItems([]);
        setUnassignedItems([]);
        setSaveMessage(null);
        closeRoomSelectionModal();
    };

    const handleSaveComplete = (success: boolean, message: string) => {
        setSaveMessage({
            type: success ? 'success' : 'error',
            text: message
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    };

    // Get calculation results for saving
    const getCalculationResults = () => {
        const totalVolume = calculateTotalVolume();
        const recommendedTruck = getRecommendedTruck();
        
        return {
            totalVolume: totalVolume,
            recommendedTruck: {
                name: recommendedTruck.name,
                volume: recommendedTruck.volume,
                price: recommendedTruck.price,
                description: recommendedTruck.description
            },
            roomBreakdown: rooms.map(room => ({
                name: room.name,
                items: Object.entries(room.items).map(([itemId, quantity]) => {
                    const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                    return item ? {
                        name: item.name,
                        quantity: quantity,
                        volume: item.volume * quantity,
                        category: item.category
                    } : null;
                }).filter(Boolean),
                totalVolume: Object.entries(room.items).reduce((total, [itemId, quantity]) => {
                    const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                    return total + (item ? item.volume * quantity : 0);
                }, 0)
            }))
        };
    };

    // Get form data for saving
    const getFormData = () => {
        return {
            rooms: rooms,
            customItems: customItems
        };
    };

    const categories = ['All', ...Array.from(new Set(furnitureDatabase.map(item => item.category))), 'Custom'];
    const filteredItems = selectedCategory === 'All' 
        ? [...furnitureDatabase, ...customItems]
        : [...furnitureDatabase, ...customItems].filter(item => item.category === selectedCategory);

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden font-sans">
            {/* Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-gray-700">Volume Calculator</h3>
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {calculateTotalVolume() > 0 && (
                            <SaveResultsButton
                                toolType="volume"
                                results={getCalculationResults()}
                                formData={getFormData()}
                                onSaveComplete={handleSaveComplete}
                                className="text-xs px-3 py-1"
                            />
                        )}
                        <button
                            onClick={clearAll}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
                
                {/* Save Message */}
                {saveMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                        saveMessage.type === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {saveMessage.text}
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="p-6 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Total Volume</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {calculateTotalVolume().toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-500">cubic metres</p>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Recommended Truck</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {getRecommendedTruck().icon} {getRecommendedTruck().name}
                        </p>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Estimated Cost</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {getRecommendedTruck().price}
                        </p>
                    </div>
                </div>
            </div>

            {/* Room Management - With Item Display */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-gray-700">Rooms & Items</h4>
                    <button
                        onClick={addRoom}
                        className="bg-[#17B7C7] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Add Room
                    </button>
                </div>

                <div className="space-y-4">
                    {rooms.map(room => {
                        const roomItems = Object.entries(room.items);
                        const roomVolume = roomItems.reduce((total, [itemId, quantity]) => {
                            const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                            return total + (item ? item.volume * quantity : 0);
                        }, 0);

                        return (
                            <div key={room.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                {/* Room Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={room.name}
                                            onChange={(e) => updateRoomName(room.id, e.target.value)}
                                            className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 font-medium text-sm w-32 focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none"
                                        />
                                        <span className="text-sm text-gray-600 font-medium">
                                            {roomVolume.toFixed(1)}m³ total
                                        </span>
                                    </div>
                                    {rooms.length > 1 && (
                                        <button
                                            onClick={() => removeRoom(room.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                        >
                                            Remove Room
                                        </button>
                                    )}
                                </div>

                                {/* Room Items */}
                                {roomItems.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-700 mb-2">Items in this room:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {roomItems.map(([itemId, quantity]) => {
                                                const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                                                if (!item) return null;
                                                
                                                return (
                                                    <div key={itemId} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200">
                                                        <span className="text-sm text-gray-700 flex items-center gap-1">
                                                            <span className="text-base">{item.icon}</span>
                                                            <span>{item.name}</span>
                                                            <span className="text-gray-500">×{quantity}</span>
                                                        </span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                {(item.volume * quantity).toFixed(1)}m³
                                                            </span>
                                                            <button
                                                                onClick={() => removeItemFromRoom(room.id, itemId)}
                                                                className="text-red-600 hover:text-red-800 text-sm hover:bg-red-100 w-6 h-6 rounded flex items-center justify-center transition-colors"
                                                                title="Remove one item"
                                                            >
                                                                −
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <div className="text-2xl mb-2">📦</div>
                                        <p className="text-sm">No items added to this room yet</p>
                                        <p className="text-xs">Click on furniture items above to add them here</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Furniture Selection */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">🪑 Add Furniture & Items</h4>
                    <button
                        onClick={() => setShowCustomForm(!showCustomForm)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                        Add Custom Item
                    </button>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === category
                                    ? 'bg-[#17B7C7] text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Custom Item Form */}
                {showCustomForm && (
                    <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <h5 className="font-semibold text-gray-900 mb-4">Add Custom Item</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                                <input
                                    type="text"
                                    placeholder="Large Bookshelf"
                                    value={customForm.name}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Length (cm)</label>
                                <input
                                    type="number"
                                    placeholder="120"
                                    value={customForm.length}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, length: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Width (cm)</label>
                                <input
                                    type="number"
                                    placeholder="80"
                                    value={customForm.width}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, width: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                                <input
                                    type="number"
                                    placeholder="180"
                                    value={customForm.height}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, height: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={addCustomItem}
                                className="bg-[#17B7C7] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Add Item
                            </button>
                            <button
                                onClick={() => {
                                    setShowCustomForm(false);
                                    setCustomForm({ name: '', length: '', width: '', height: '' });
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Furniture Grid - Modern Design */}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#17B7C7] hover:shadow-md transition-all duration-200 cursor-pointer group"
                             onClick={() => openRoomSelectionModal(item)}>
                            <div className="text-center">
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
                                <h5 className="font-semibold text-gray-900 text-xs mb-2 line-clamp-2">{item.name}</h5>
                                <p className="text-xs text-[#17B7C7] font-medium">{item.volume}m³</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Unassigned Items */}
            {unassignedItems.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">� Unassigned Items</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-700">
                                Items not assigned to any room
                            </p>
                            <span className="text-sm text-gray-600 font-medium">
                                {unassignedItems.reduce((total, unassignedItem) => {
                                    const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
                                    return total + (item ? item.volume * unassignedItem.quantity : 0);
                                }, 0).toFixed(1)}m³ total
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {unassignedItems.map(unassignedItem => {
                                const item = [...furnitureDatabase, ...customItems].find(f => f.id === unassignedItem.itemId);
                                if (!item) return null;
                                
                                return (
                                    <div key={unassignedItem.itemId} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-blue-200">
                                        <span className="text-sm text-gray-700 flex items-center gap-1">
                                            <span className="text-base">{item.icon}</span>
                                            <span>{item.name}</span>
                                            <span className="text-gray-500">×{unassignedItem.quantity}</span>
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500 font-medium">
                                                {(item.volume * unassignedItem.quantity).toFixed(1)}m³
                                            </span>
                                            <button
                                                onClick={() => removeUnassignedItem(unassignedItem.itemId)}
                                                className="text-red-600 hover:text-red-800 text-sm hover:bg-red-100 w-6 h-6 rounded flex items-center justify-center transition-colors"
                                                title="Remove one item"
                                            >
                                                −
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Room Selection Modal */}
            {roomSelectionModal.isOpen && roomSelectionModal.selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                            Add {roomSelectionModal.selectedItem.name}
                        </h3>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-800 mb-3">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={itemQuantity}
                                onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] focus:bg-white outline-none transition-all duration-200"
                            />
                        </div>
                        
                        <div className="mb-8">
                            <p className="text-sm font-semibold text-gray-800 mb-4">Select room or add without room:</p>
                            <div className="space-y-3">
                                {rooms.map(room => (
                                    <button
                                        key={room.id}
                                        onClick={() => {
                                            addItemToRoom(room.id, roomSelectionModal.selectedItem!.id, itemQuantity);
                                            closeRoomSelectionModal();
                                        }}
                                        className="w-full text-left px-4 py-3 bg-gray-50 text-gray-900 font-medium hover:bg-[#17B7C7] hover:text-white rounded-xl transition-all duration-200 border border-gray-200 hover:border-[#17B7C7]"
                                    >
                                        🏠 {room.name}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        addItemUnassigned(roomSelectionModal.selectedItem!.id, itemQuantity);
                                        closeRoomSelectionModal();
                                    }}
                                    className="w-full text-left px-4 py-3 bg-blue-50 text-blue-900 font-medium hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300"
                                >
                                    📦 Add without room
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeRoomSelectionModal}
                                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Truck Recommendations */}
            {calculateTotalVolume() > 0 && (
                <div className="p-6 bg-white border-t border-gray-200">
                    <h4 className="text-xl font-bold text-gray-700 mb-6">Truck Size Recommendations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {truckSizes.map(truck => {
                            const isRecommended = truck.volume >= calculateTotalVolume() && 
                                                (truckSizes.find(t => t.volume >= calculateTotalVolume())?.name === truck.name);
                            
                            return (
                                <div 
                                    key={truck.name}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                        isRecommended 
                                            ? 'border-[#17B7C7] bg-blue-50 shadow-lg transform scale-105' 
                                            : truck.volume < calculateTotalVolume()
                                                ? 'border-red-200 bg-red-50 opacity-60'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-3">{truck.icon}</div>
                                        <h5 className="font-semibold text-gray-900 text-sm mb-2">
                                            {truck.name}
                                            {isRecommended && <span className="text-[#17B7C7] ml-1 text-lg">✓</span>}
                                        </h5>
                                        <p className="text-xs text-gray-600 mb-1 font-medium">{truck.volume}m³ capacity</p>
                                        <p className="text-xs text-gray-500 mb-2">{truck.description}</p>
                                        <p className="text-sm font-bold text-gray-900">{truck.price}</p>
                                        {isRecommended && (
                                            <p className="text-xs text-[#17B7C7] font-semibold mt-2">Recommended</p>
                                        )}
                                        {truck.volume < calculateTotalVolume() && (
                                            <p className="text-xs text-red-600 mt-2 font-medium">Too small</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}