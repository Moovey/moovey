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

export default function VolumeCalculator() {
    // Pre-defined furniture items with average volumes (in cubic meters)
    const furnitureDatabase: FurnitureItem[] = [
        // Living Room
        { id: 'sofa_2seat', name: '2-Seat Sofa', volume: 2.5, category: 'Living Room', icon: '🛋️' },
        { id: 'sofa_3seat', name: '3-Seat Sofa', volume: 3.2, category: 'Living Room', icon: '🛋️' },
        { id: 'armchair', name: 'Armchair', volume: 1.8, category: 'Living Room', icon: '🪑' },
        { id: 'coffee_table', name: 'Coffee Table', volume: 0.8, category: 'Living Room', icon: '🪑' },
        { id: 'tv_stand', name: 'TV Stand', volume: 1.2, category: 'Living Room', icon: '📺' },
        { id: 'bookshelf', name: 'Bookshelf', volume: 1.5, category: 'Living Room', icon: '📚' },
        
        // Bedroom
        { id: 'single_bed', name: 'Single Bed', volume: 2.0, category: 'Bedroom', icon: '🛏️' },
        { id: 'double_bed', name: 'Double Bed', volume: 2.8, category: 'Bedroom', icon: '🛏️' },
        { id: 'king_bed', name: 'King Size Bed', volume: 3.5, category: 'Bedroom', icon: '🛏️' },
        { id: 'wardrobe_small', name: 'Small Wardrobe', volume: 2.5, category: 'Bedroom', icon: '👔' },
        { id: 'wardrobe_large', name: 'Large Wardrobe', volume: 4.0, category: 'Bedroom', icon: '👔' },
        { id: 'chest_drawers', name: 'Chest of Drawers', volume: 1.5, category: 'Bedroom', icon: '🗄️' },
        { id: 'bedside_table', name: 'Bedside Table', volume: 0.5, category: 'Bedroom', icon: '🪑' },
        
        // Kitchen
        { id: 'dining_table_small', name: 'Small Dining Table', volume: 1.5, category: 'Kitchen', icon: '🍽️' },
        { id: 'dining_table_large', name: 'Large Dining Table', volume: 2.5, category: 'Kitchen', icon: '🍽️' },
        { id: 'dining_chair', name: 'Dining Chair', volume: 0.6, category: 'Kitchen', icon: '🪑' },
        { id: 'fridge', name: 'Refrigerator', volume: 2.0, category: 'Kitchen', icon: '❄️' },
        { id: 'washing_machine', name: 'Washing Machine', volume: 1.5, category: 'Kitchen', icon: '🌊' },
        { id: 'dishwasher', name: 'Dishwasher', volume: 1.2, category: 'Kitchen', icon: '🍽️' },
        
        // Office
        { id: 'office_desk', name: 'Office Desk', volume: 1.8, category: 'Office', icon: '💻' },
        { id: 'office_chair', name: 'Office Chair', volume: 1.0, category: 'Office', icon: '🪑' },
        { id: 'filing_cabinet', name: 'Filing Cabinet', volume: 1.2, category: 'Office', icon: '🗄️' },
        
        // Storage & Misc
        { id: 'boxes_small', name: 'Small Boxes (10)', volume: 2.0, category: 'Storage', icon: '📦' },
        { id: 'boxes_medium', name: 'Medium Boxes (10)', volume: 4.0, category: 'Storage', icon: '📦' },
        { id: 'boxes_large', name: 'Large Boxes (10)', volume: 6.0, category: 'Storage', icon: '📦' },
        { id: 'suitcase', name: 'Suitcase', volume: 0.3, category: 'Storage', icon: '🧳' },
        { id: 'bicycle', name: 'Bicycle', volume: 1.0, category: 'Storage', icon: '🚲' }
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

    const [selectedCategory, setSelectedCategory] = useState<string>('Living Room');
    const [customItems, setCustomItems] = useState<FurnitureItem[]>([]);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [customForm, setCustomForm] = useState({
        name: '',
        length: '',
        width: '',
        height: ''
    });
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Calculate total volume
    const calculateTotalVolume = (): number => {
        let total = 0;
        rooms.forEach(room => {
            Object.entries(room.items).forEach(([itemId, quantity]) => {
                const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                if (item) {
                    total += item.volume * quantity;
                }
            });
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

    // Add item to room
    const addItemToRoom = (roomId: string, itemId: string) => {
        setRooms(prev => prev.map(room => {
            if (room.id === roomId) {
                const currentQuantity = room.items[itemId] || 0;
                return {
                    ...room,
                    items: { ...room.items, [itemId]: currentQuantity + 1 }
                };
            }
            return room;
        }));
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
        setSaveMessage(null);
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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">📦 Moving Volume Calculator</h3>
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
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
                <p className="text-gray-600 text-sm">Calculate the total volume of your belongings to estimate moving truck size and costs.</p>
                
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Total Volume</h4>
                    <p className="text-2xl font-bold text-blue-600">
                        {calculateTotalVolume().toFixed(1)} m³
                    </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Recommended Truck</h4>
                    <p className="text-lg font-bold text-green-600">
                        {getRecommendedTruck().icon} {getRecommendedTruck().name}
                    </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Estimated Cost</h4>
                    <p className="text-lg font-bold text-purple-600">
                        {getRecommendedTruck().price}
                    </p>
                </div>
            </div>

            {/* Room Management */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">🏠 Rooms</h4>
                    <button
                        onClick={addRoom}
                        className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#139AAA] transition-colors"
                    >
                        Add Room
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {rooms.map(room => (
                        <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <input
                                    type="text"
                                    value={room.name}
                                    onChange={(e) => updateRoomName(room.id, e.target.value)}
                                    className="font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                                />
                                {rooms.length > 1 && (
                                    <button
                                        onClick={() => removeRoom(room.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {Object.entries(room.items).map(([itemId, quantity]) => {
                                    const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                                    if (!item) return null;
                                    
                                    return (
                                        <div key={itemId} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-700">
                                                {item.icon} {item.name} x{quantity}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">
                                                    {(item.volume * quantity).toFixed(1)}m³
                                                </span>
                                                <button
                                                    onClick={() => removeItemFromRoom(room.id, itemId)}
                                                    className="text-red-600 hover:text-red-800 text-xs"
                                                >
                                                    −
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(room.items).length === 0 && (
                                    <p className="text-gray-500 text-sm italic">No items added yet</p>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="text-sm font-medium text-gray-900">
                                    Room Total: {Object.entries(room.items).reduce((total, [itemId, quantity]) => {
                                        const item = [...furnitureDatabase, ...customItems].find(f => f.id === itemId);
                                        return total + (item ? item.volume * quantity : 0);
                                    }, 0).toFixed(1)} m³
                                </div>
                            </div>
                        </div>
                    ))}
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
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3">Add Custom Item</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Large Bookshelf"
                                    value={customForm.name}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Length (cm)</label>
                                <input
                                    type="number"
                                    placeholder="120"
                                    value={customForm.length}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, length: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Width (cm)</label>
                                <input
                                    type="number"
                                    placeholder="80"
                                    value={customForm.width}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, width: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Height (cm)</label>
                                <input
                                    type="number"
                                    placeholder="180"
                                    value={customForm.height}
                                    onChange={(e) => setCustomForm(prev => ({ ...prev, height: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-500 focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={addCustomItem}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
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

                {/* Furniture Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredItems.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:border-[#17B7C7] transition-colors">
                            <div className="text-center">
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <h5 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h5>
                                <p className="text-xs text-gray-600 mb-2">{item.volume}m³</p>
                                
                                <div className="space-y-2">
                                    {rooms.map(room => (
                                        <button
                                            key={room.id}
                                            onClick={() => addItemToRoom(room.id, item.id)}
                                            className="w-full bg-[#17B7C7] text-white px-2 py-1 rounded text-xs font-medium hover:bg-[#139AAA] transition-colors"
                                        >
                                            + {room.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Truck Recommendations */}
            {calculateTotalVolume() > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">🚚 Truck Size Recommendations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {truckSizes.map(truck => {
                            const isRecommended = truck.volume >= calculateTotalVolume() && 
                                                (truckSizes.find(t => t.volume >= calculateTotalVolume())?.name === truck.name);
                            
                            return (
                                <div 
                                    key={truck.name}
                                    className={`p-3 rounded-lg border ${
                                        isRecommended 
                                            ? 'border-green-500 bg-green-50' 
                                            : truck.volume < calculateTotalVolume()
                                                ? 'border-red-300 bg-red-50 opacity-60'
                                                : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">{truck.icon}</div>
                                        <h5 className="font-medium text-gray-900 text-sm mb-1">
                                            {truck.name}
                                            {isRecommended && <span className="text-green-600 ml-1">✓</span>}
                                        </h5>
                                        <p className="text-xs text-gray-600 mb-1">{truck.volume}m³ capacity</p>
                                        <p className="text-xs text-gray-600 mb-1">{truck.description}</p>
                                        <p className="text-xs font-medium text-gray-900">{truck.price}</p>
                                        {truck.volume < calculateTotalVolume() && (
                                            <p className="text-xs text-red-600 mt-1">Too small</p>
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