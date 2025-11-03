import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { router } from '@inertiajs/react';

interface DeclutterItem {
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

const conditions = [
    { value: 'excellent', label: 'Excellent', description: 'Like new, minimal wear' },
    { value: 'good', label: 'Good', description: 'Minor wear, fully functional' },
    { value: 'fair', label: 'Fair', description: 'Noticeable wear, still usable' },
    { value: 'poor', label: 'Poor', description: 'Heavy wear, may need repair' }
];

export default function DeclutterList() {
    const [items, setItems] = useState<DeclutterItem[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<DeclutterItem | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterAction, setFilterAction] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to get the correct image URL
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
                console.log(`Trying alternative path ${currentAttempt + 1}: ${alternativePaths[currentAttempt]} for image: ${imagePath}`);
            }
        } else {
            // All paths failed, show fallback
            console.error(`All image paths failed for: ${imagePath}`);
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl text-gray-400">📦</div>';
            }
        }
    };

    // Form state
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        category: string;
        condition: 'excellent' | 'good' | 'fair' | 'poor';
        estimated_value: number;
        location: string;
        action: 'throw' | 'donate' | 'sell' | 'keep';
    }>({
        name: '',
        description: '',
        category: 'Other',
        condition: 'good',
        estimated_value: 0,
        location: '',
        action: 'throw'
    });

    // Photo upload state
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    // File input ref for photo upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if user is authenticated (simple check)
    const isAuthenticated = document.querySelector('meta[name="csrf-token"]') !== null;
    const [authCheckComplete, setAuthCheckComplete] = useState(false);

    // Load items from API on component mount (only if authenticated)
    useEffect(() => {
        if (isAuthenticated) {
            fetchItems();
        }
        setAuthCheckComplete(true);
    }, [isAuthenticated]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showAddForm) {
                setShowAddForm(false);
                setEditingItem(null);
                resetForm();
            }
        };

        if (showAddForm) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showAddForm]);

    const fetchItems = async () => {
        // Skip API call if user is not authenticated
        if (!isAuthenticated) {
            toast.info('Please log in to view your declutter items');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            return;
        }

        try {
            const response = await fetch('/api/declutter-items', {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            });
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // If not JSON, likely an HTML error page or redirect
                if (response.status === 401 || response.status === 419) {
                    toast.info('Session expired. Please log in again.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                    return;
                } else {
                    const textContent = await response.text();
                    console.error('Non-JSON response:', textContent.substring(0, 200));
                    toast.error('Server error. Please try again later.');
                    return;
                }
            }
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setItems(data.items);
                } else {
                    toast.error(data.message || 'Failed to load items');
                }
            } else if (response.status === 401) {
                toast.info('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                toast.error('Failed to load items');
            }
        } catch (error) {
            console.error('Failed to load declutter items:', error);
            if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
                toast.error('Session expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                toast.error('Network error. Please check your connection.');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'Other',
            condition: 'good',
            estimated_value: 0,
            location: '',
            action: 'throw'
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        // Check total number of images (max 4) - count both existing preview URLs and new images
        const totalImages = imagePreviewUrls.length + files.length;
        if (totalImages > 4) {
            toast.warn('You can only have up to 4 images per item total');
            return;
        }
        
        // Check file sizes (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        const oversizedFiles = files.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
            toast.error('Some images are too large. Please select images under 2MB each.');
            return;
        }
        
        // Create preview URLs for new files
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        
        setSelectedImages(prev => [...prev, ...files]);
        setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
        
        // Clear the input to allow re-selecting the same file
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        const urlToRemove = imagePreviewUrls[index];
        
        console.log('Removing image at index:', index, 'URL:', urlToRemove);
        console.log('Current preview URLs:', imagePreviewUrls);
        console.log('Current selected images count:', selectedImages.length);
        
        // Check if this is a new image (blob URL) or existing image (HTTP URL)
        if (urlToRemove && urlToRemove.startsWith('blob:')) {
            // This is a new image - revoke the blob URL and remove from selectedImages
            URL.revokeObjectURL(urlToRemove);
            
            // Find which selectedImage corresponds to this blob URL
            // We need to count how many blob URLs come before this index
            let selectedImageIndex = -1;
            let blobCount = 0;
            
            for (let i = 0; i <= index; i++) {
                if (imagePreviewUrls[i] && imagePreviewUrls[i].startsWith('blob:')) {
                    if (i === index) {
                        selectedImageIndex = blobCount;
                        break;
                    }
                    blobCount++;
                }
            }
            
            console.log('Removing new image at selectedImages index:', selectedImageIndex);
            
            // Remove the corresponding file from selectedImages
            if (selectedImageIndex >= 0) {
                setSelectedImages(prev => prev.filter((_, i) => i !== selectedImageIndex));
            }
        } else {
            console.log('Removing existing image (HTTP URL)');
        }
        
        // Always remove from preview URLs
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddItem = async () => {
        if (!formData.name.trim()) {
            toast.error('Please enter an item name');
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            // Add form fields
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value.toString());
            });
            
            // Add images
            selectedImages.forEach((image, index) => {
                formDataToSend.append(`images[${index}]`, image);
            });

            const response = await fetch('/api/declutter-items', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: formDataToSend,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setItems(prev => [data.item, ...prev]);
                    resetForm();
                    setShowAddForm(false);
                    toast.success('Item added to declutter list!');
                }
            } else {
                toast.error('Failed to add item');
            }
        } catch (error) {
            console.error('Failed to add item:', error);
            toast.error('Failed to add item');
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItem || !formData.name.trim()) {
            toast.error('Please enter an item name');
            return;
        }

        try {
            // Always use FormData for updates to handle both text and image data consistently
            const formDataToSend = new FormData();
            
            // Add form fields
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value.toString());
            });
            
            // Add method override for Laravel to treat this as a PUT request
            formDataToSend.append('_method', 'PUT');
            
            // Add new images if any are selected
            selectedImages.forEach((image, index) => {
                formDataToSend.append(`images[${index}]`, image);
            });

            console.log('Updating item with:', {
                itemId: editingItem.id,
                textData: Object.fromEntries(Object.entries(formData)),
                imageCount: selectedImages.length
            });

            const response = await fetch(`/api/declutter-items/${editingItem.id}`, {
                method: 'POST', // Use POST with _method override for FormData compatibility
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    // Don't set Content-Type header for FormData - browser will set it with boundary
                },
                credentials: 'same-origin',
                body: formDataToSend,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setItems(prev => prev.map(item => 
                        item.id === editingItem.id ? data.item : item
                    ));
                    resetForm();
                    setEditingItem(null);
                    setShowAddForm(false);
                    toast.success('Item updated successfully!');
                }
            } else {
                toast.error('Failed to update item');
            }
        } catch (error) {
            console.error('Failed to update item:', error);
            toast.error('Failed to update item');
        }
    };

    const handleEditItem = (item: DeclutterItem) => {
        setFormData({
            name: item.name,
            description: item.description,
            category: item.category,
            condition: item.condition,
            estimated_value: item.estimated_value,
            location: item.location || '',
            action: item.action
        });
        
        // Clear new images when editing
        setSelectedImages([]);
        
        // Show existing images as preview URLs
        if (item.images && item.images.length > 0) {
            const existingImageUrls = item.images.map(imagePath => getImageUrl(imagePath));
            setImagePreviewUrls(existingImageUrls);
        } else {
            setImagePreviewUrls([]);
        }
        
        setEditingItem(item);
        setShowAddForm(true);
    };

    const handleDeleteItem = async (id: number) => {
        try {
            const response = await fetch(`/api/declutter-items/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setItems(prev => prev.filter(item => item.id !== id));
                    toast.success('Item removed from list');
                }
            } else {
                toast.error('Failed to delete item');
            }
        } catch (error) {
            console.error('Failed to delete item:', error);
            toast.error('Failed to delete item');
        }
    };

    const handleListForSale = async (item: DeclutterItem) => {
        try {
            const response = await fetch(`/api/declutter-items/${item.id}/list-for-sale`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setItems(prev => prev.map(i => i.id === item.id ? data.item : i));
                    toast.success(`${item.name} has been listed in the marketplace!`);
                }
            } else {
                toast.error('Failed to list item for sale');
            }
        } catch (error) {
            console.error('Failed to list item for sale:', error);
            toast.error('Failed to list item for sale');
        }
    };

    const handleUnlistFromSale = async (item: DeclutterItem) => {
        try {
            const response = await fetch(`/api/declutter-items/${item.id}/unlist-from-sale`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setItems(prev => prev.map(i => i.id === item.id ? data.item : i));
                    toast.success(`${item.name} has been unlisted from the marketplace!`);
                }
            } else {
                toast.error('Failed to unlist item from marketplace');
            }
        } catch (error) {
            console.error('Failed to unlist item from marketplace:', error);
            toast.error('Failed to unlist item from marketplace');
        }
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesAction = filterAction === 'all' || item.action === filterAction;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesAction && matchesSearch;
    });

    const totalEstimatedValue = items
        .filter(item => item.action === 'sell')
        .reduce((sum, item) => sum + item.estimated_value, 0);

    const stats = {
        total: items.length,
        throw: items.filter(item => item.action === 'throw').length,
        donate: items.filter(item => item.action === 'donate').length,
        sell: items.filter(item => item.action === 'sell').length,
        keep: items.filter(item => item.action === 'keep').length,
        listed: items.filter(item => item.is_listed_for_sale).length
    };

    // Show login banner for unauthenticated users
    if (!isAuthenticated) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#17B7C7] to-[#1A237E] rounded-xl p-8 text-white text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-2xl font-bold mb-4">Please Login to Continue</h3>
                    <p className="text-white/90 mb-6">
                        You need to be logged in to access your declutter list and manage your items.
                    </p>
                    <a 
                        href="/login" 
                        className="bg-white text-[#17B7C7] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block shadow-lg"
                    >
                        Login Now
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#17B7C7] to-[#138994] rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Declutter List</h2>
                            <p className="text-sm text-gray-600">Organize and manage your moving items</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg hover:bg-[#138994] transition-colors font-medium text-sm"
                    >
                        Add Item
                    </button>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="flex flex-col lg:flex-row min-h-[600px]">
                {/* Left Column - Controls and Form */}
                <div className="lg:w-1/2 bg-white p-6 border-r border-gray-100">
                    {/* Stats Dashboard */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>📊</span>
                            <span>Overview</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-r from-[#17B7C7] to-[#138994] rounded-xl p-4 text-white text-center">
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-sm opacity-90">Total Items</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
                                <div className="text-2xl font-bold">£{totalEstimatedValue}</div>
                                <div className="text-sm opacity-90">Est. Value</div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mt-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-blue-700">{stats.sell}</div>
                                <div className="text-xs text-blue-600">Sell</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-green-700">{stats.donate}</div>
                                <div className="text-xs text-green-600">Donate</div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-red-700">{stats.throw}</div>
                                <div className="text-xs text-red-600">Throw</div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-gray-700">{stats.keep}</div>
                                <div className="text-xs text-gray-600">Keep</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🔍</span>
                            <span>Filter Items</span>
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white font-medium"
                            />
                            
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 bg-white font-medium"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 bg-white font-medium"
                            >
                                <option value="all">All Actions</option>
                                <option value="throw">Throw Away</option>
                                <option value="donate">Donate</option>
                                <option value="sell">Sell</option>
                                <option value="keep">Keep</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span>⚡</span>
                            <span>Quick Actions</span>
                        </h3>
                        <div className="space-y-2">
                            <div className="text-sm text-gray-600 mb-3">
                                <strong>{stats.listed}</strong> items currently listed in marketplace
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 Pro Tips</h4>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>• Research prices online for accurate estimates</li>
                                    <li>• Take photos to help with selling decisions</li>
                                    <li>• Consider donation for tax benefits</li>
                                    <li>• List valuable items early for best results</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Items List */}
                <div className="lg:w-1/2 bg-gray-50">
                    <div className="p-6 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Items List ({filteredItems.length})</h3>
                            {filteredItems.length > 0 && (
                                <div className="text-sm text-gray-600">
                                    Showing {filteredItems.length} of {items.length} items
                                </div>
                            )}
                        </div>

                        {/* Items Display */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                    <div className="text-4xl mb-4">📦</div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        {items.length === 0 ? 'No items yet' : 'No items match your filters'}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {items.length === 0 
                                            ? 'Start by adding items you want to declutter'
                                            : 'Try adjusting your search or filter criteria'
                                        }
                                    </p>
                                </div>
                            ) : (
                                filteredItems.map(item => (
                                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-3">
                                            {/* Image Display */}
                                            {item.images && item.images.length > 0 ? (
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative">
                                                        <img
                                                            src={getImageUrl(item.images[0])}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => handleImageError(e, item.images?.[0] || '')}
                                                            data-attempt="0"
                                                        />
                                                        {item.images.length > 1 && (
                                                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-tl">
                                                                +{item.images.length - 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <div className="text-2xl text-gray-400">📦</div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                item.action === 'sell' ? 'bg-green-100 text-green-800' :
                                                                item.action === 'donate' ? 'bg-blue-100 text-blue-800' :
                                                                item.action === 'throw' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {item.action === 'throw' ? 'Throw' : 
                                                                 item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                                                            </span>
                                                            {item.is_listed_for_sale && (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                    Listed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                                                            <div>{item.category} • {item.condition}</div>
                                                            {item.estimated_value > 0 && (
                                                                <div>Est. Value: £{item.estimated_value}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1 ml-2">
                                                        <button
                                                            onClick={() => handleEditItem(item)}
                                                            className="bg-[#17B7C7] text-white px-2 py-1 rounded text-xs hover:bg-[#138994] transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        {!item.is_listed_for_sale && item.action === 'sell' ? (
                                                            <button
                                                                onClick={() => handleListForSale(item)}
                                                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                                            >
                                                                List
                                                            </button>
                                                        ) : item.is_listed_for_sale ? (
                                                            <button
                                                                onClick={() => handleUnlistFromSale(item)}
                                                                className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
                                                            >
                                                                Unlist
                                                            </button>
                                                        ) : null}
                                                        <button
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                                        >
                                                            Del
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn"
                    onClick={() => {
                        setShowAddForm(false);
                        setEditingItem(null);
                        resetForm();
                    }}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h4 className="text-xl font-semibold text-gray-900">
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </h4>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingItem(null);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white font-medium"
                                placeholder="e.g., Old Coffee Table, Dining Chair, Laptop"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 bg-white font-medium"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition
                            </label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 bg-white font-medium"
                            >
                                {conditions.map(condition => (
                                    <option key={condition.value} value={condition.value}>
                                        {condition.label} - {condition.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Value (£)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.estimated_value}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white font-medium"
                                placeholder="e.g., 25.00, 150.00"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seller Location (optional)
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white font-medium"
                                placeholder="e.g., Manchester, Birmingham, London SE1"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Action
                            </label>
                            <select
                                value={formData.action}
                                onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value as any }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 bg-white font-medium"
                            >
                                <option value="throw">Throw Away</option>
                                <option value="donate">Donate</option>
                                <option value="sell">Sell</option>
                                <option value="keep">Keep</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white font-medium resize-none"
                            placeholder="e.g., Brown leather sofa with minor scratches, 3-seater, good cushions. Dimensions: 200cm x 90cm"
                        />
                    </div>

                    {/* Photo Upload Section */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photos (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#17B7C7] transition-colors">
                            <div className="text-center">
                                <div className="text-4xl mb-2">📷</div>
                                <p className="text-gray-600 mb-4">Add up to 4 photos of your item</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={imagePreviewUrls.length >= 4}
                                >
                                    Choose Photos ({4 - imagePreviewUrls.length} slots left)
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                    Maximum 4 images, 2MB each. JPG, PNG supported.
                                </p>
                            </div>
                        </div>

                        {/* Image Previews */}
                        {imagePreviewUrls.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    {editingItem ? 'Current & New Photos' : 'Selected Photos'}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {imagePreviewUrls.map((url, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                                onError={(e) => {
                                                    // If it's an existing image URL and it fails, try fallback paths
                                                    if (editingItem && !url.startsWith('blob:')) {
                                                        handleImageError(e, url.split('/').pop() || '');
                                                    }
                                                }}
                                            />
                                            {editingItem && !url.startsWith('blob:') && (
                                                <div className="absolute bottom-1 left-1 bg-blue-500 bg-opacity-75 text-white text-xs px-1 rounded">
                                                    Current
                                                </div>
                                            )}
                                            {url.startsWith('blob:') && (
                                                <div className="absolute bottom-1 left-1 bg-green-500 bg-opacity-75 text-white text-xs px-1 rounded">
                                                    New
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {editingItem && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Note: When editing, only new images will be saved. Existing images will be replaced.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={editingItem ? handleUpdateItem : handleAddItem}
                            className="bg-[#17B7C7] text-white px-6 py-3 rounded-xl hover:bg-[#138994] transition-all duration-200 font-semibold shadow-md"
                        >
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingItem(null);
                                resetForm();
                            }}
                            className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold shadow-md"
                        >
                            Cancel
                        </button>
                    </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}