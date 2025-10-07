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
        <div className="space-y-6">
            {/* Header and Stats */}
            <div className="bg-gradient-to-r from-[#17B7C7] to-[#1A237E] rounded-xl p-6 text-white">
                <h3 className="text-2xl font-bold mb-4">Declutter List</h3>
                <p className="text-white/90 mb-6">
                    Create a list of items you're planning to declutter. Decide whether to throw away, donate, sell, or keep each item.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-white/80">Total Items</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-2xl font-bold">{stats.sell}</div>
                        <div className="text-sm text-white/80">To Sell</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-2xl font-bold">{stats.donate}</div>
                        <div className="text-sm text-white/80">To Donate</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-2xl font-bold">{stats.throw}</div>
                        <div className="text-sm text-white/80">To Throw</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-2xl font-bold">£{totalEstimatedValue}</div>
                        <div className="text-sm text-white/80">Est. Value</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                    
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900"
                    >
                        <option value="all">All Actions</option>
                        <option value="throw">Throw Away</option>
                        <option value="donate">Donate</option>
                        <option value="sell">Sell</option>
                        <option value="keep">Keep</option>
                    </select>
                </div>
                
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#17B7C7] text-white px-6 py-2 rounded-lg hover:bg-[#139AAA] transition-colors font-medium"
                >
                    Add Item
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                    <h4 className="text-xl font-semibold mb-4">
                        {editingItem ? 'Edit Item' : 'Add New Item'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent text-gray-900 placeholder-gray-500"
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
                            className="bg-[#17B7C7] text-white px-6 py-2 rounded-lg hover:bg-[#139AAA] transition-colors font-medium"
                        >
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingItem(null);
                                resetForm();
                            }}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {items.length === 0 ? 'No items yet' : 'No items match your filters'}
                        </h3>
                        <p className="text-gray-500">
                            {items.length === 0 
                                ? 'Start by adding items you want to declutter'
                                : 'Try adjusting your search or filter criteria'
                            }
                        </p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                {/* Image Display */}
                                {item.images && item.images.length > 0 ? (
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 relative">
                                            <img
                                                src={getImageUrl(item.images[0])}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => handleImageError(e, item.images?.[0] || '')}
                                                data-attempt="0"
                                            />
                                            {item.images.length > 1 && (
                                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                    +{item.images.length - 1}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 relative flex items-center justify-center">
                                            <div className="text-4xl text-gray-400">📦</div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            item.action === 'sell' ? 'bg-green-100 text-green-800' :
                                            item.action === 'donate' ? 'bg-blue-100 text-blue-800' :
                                            item.action === 'throw' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {item.action === 'throw' ? 'Throw Away' : 
                                             item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                                        </span>
                                        {item.is_listed_for_sale && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                Listed for Marketplace
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-medium">Category:</span> {item.category}</p>
                                        <p><span className="font-medium">Condition:</span> {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}</p>
                                        {item.estimated_value > 0 && (
                                            <p><span className="font-medium">Estimated Value:</span> £{item.estimated_value}</p>
                                        )}
                                        {item.location && (
                                            <p><span className="font-medium">Location:</span> {item.location}</p>
                                        )}
                                        {item.description && (
                                            <p><span className="font-medium">Description:</span> {item.description}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-2">
                                    {!item.is_listed_for_sale ? (
                                        <button
                                            onClick={() => handleListForSale(item)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                        >
                                            List for Sale
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUnlistFromSale(item)}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                        >
                                            Unlist from Marketplace
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEditItem(item)}
                                        className="bg-[#17B7C7] text-white px-4 py-2 rounded-lg hover:bg-[#139AAA] transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">💡 Decluttering Tips</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Be honest about condition - it helps set realistic expectations for selling</li>
                    <li>• Research similar items online to estimate fair market values</li>
                    <li>• Consider donation for items that are hard to sell but still usable</li>
                    <li>• Take photos of valuable items to help with selling or insurance</li>
                    <li>• List items you're unsure about as "keep" initially - you can always change later</li>
                </ul>
            </div>
        </div>
    );
}