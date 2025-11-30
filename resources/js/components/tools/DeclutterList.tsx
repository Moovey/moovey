import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DeclutterItem, DeclutterFormData } from './declutter/types';
import { getImageUrl } from './declutter/utils';
import StatsOverview from './declutter/StatsOverview';
import FiltersSection from './declutter/FiltersSection';
import QuickActions from './declutter/QuickActions';
import ItemsList from './declutter/ItemsList';
import ItemFormModal from './declutter/ItemFormModal';

export default function DeclutterList() {
    const [items, setItems] = useState<DeclutterItem[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<DeclutterItem | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterAction, setFilterAction] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState<DeclutterFormData>({
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
        
        // Check total number of images (max 4)
        const totalImages = imagePreviewUrls.length + files.length;
        if (totalImages > 4) {
            toast.warn('You can only have up to 4 images per item total');
            return;
        }
        
        // Check file sizes (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 2 * 1024 * 1024;
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
        
        // Check if this is a new image (blob URL) or existing image (HTTP URL)
        if (urlToRemove && urlToRemove.startsWith('blob:')) {
            // This is a new image - revoke the blob URL and remove from selectedImages
            URL.revokeObjectURL(urlToRemove);
            
            // Find which selectedImage corresponds to this blob URL
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
            
            // Remove the corresponding file from selectedImages
            if (selectedImageIndex >= 0) {
                setSelectedImages(prev => prev.filter((_, i) => i !== selectedImageIndex));
            }
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
            const formDataToSend = new FormData();
            
            // Add form fields
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value.toString());
            });
            
            // Add method override for Laravel
            formDataToSend.append('_method', 'PUT');
            
            // Add new images if any are selected
            selectedImages.forEach((image, index) => {
                formDataToSend.append(`images[${index}]`, image);
            });

            const response = await fetch(`/api/declutter-items/${editingItem.id}`, {
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
        .reduce((sum, item) => sum + (parseFloat(item.estimated_value.toString()) || 0), 0);

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
                <div className="bg-gradient-to-r from-[#17B7C7] to-[#1A237E] rounded-lg sm:rounded-xl p-6 sm:p-8 text-white text-center">
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🔒</div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Please Login to Continue</h3>
                    <p className="text-white/90 text-sm sm:text-base mb-4 sm:mb-6 px-4">
                        You need to be logged in to access your declutter list and manage your items.
                    </p>
                    <a 
                        href="/login" 
                        className="bg-white text-[#17B7C7] px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block shadow-lg text-sm sm:text-base"
                    >
                        Login Now
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#17B7C7] to-[#138994] rounded-full flex items-center justify-center text-white flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Declutter List</h2>
                            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Organize and manage your moving items</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full sm:w-auto bg-[#17B7C7] text-white px-4 py-2 rounded-lg hover:bg-[#138994] transition-colors font-medium text-sm"
                    >
                        + Add Item
                    </button>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="flex flex-col lg:flex-row min-h-[400px] sm:min-h-[600px]">
                {/* Left Column - Controls and Form */}
                <div className="lg:w-1/2 bg-white p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                    {/* Stats Dashboard */}
                    <StatsOverview stats={stats} totalEstimatedValue={totalEstimatedValue} />

                    {/* Filters and Search */}
                    <FiltersSection
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        filterAction={filterAction}
                        setFilterAction={setFilterAction}
                    />

                    {/* Quick Actions */}
                    <QuickActions listedCount={stats.listed} />
                </div>

                {/* Right Column - Items List */}
                <ItemsList
                    filteredItems={filteredItems}
                    totalItems={items.length}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onListForSale={handleListForSale}
                    onUnlistFromSale={handleUnlistFromSale}
                />
            </div>

            {/* Add/Edit Form Modal */}
            <ItemFormModal
                isOpen={showAddForm}
                onClose={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    resetForm();
                }}
                formData={formData}
                setFormData={setFormData}
                editingItem={editingItem}
                onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                imagePreviewUrls={imagePreviewUrls}
                onImageSelect={handleImageSelect}
                onRemoveImage={removeImage}
            />
        </div>
    );
}