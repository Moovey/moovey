import { DeclutterFormData, DeclutterItem, categories, conditions } from './types';
import ImageUpload from './ImageUpload';

interface ItemFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: DeclutterFormData;
    setFormData: React.Dispatch<React.SetStateAction<DeclutterFormData>>;
    editingItem: DeclutterItem | null;
    onSubmit: () => void;
    imagePreviewUrls: string[];
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
}

export default function ItemFormModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    editingItem,
    onSubmit,
    imagePreviewUrls,
    onImageSelect,
    onRemoveImage
}: ItemFormModalProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {editingItem ? 'Edit Item' : 'Add New Item'}
                    </h4>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white font-medium"
                                placeholder="e.g., Old Coffee Table, Dining Chair, Laptop"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white font-medium"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Condition
                            </label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white font-medium"
                            >
                                {conditions.map(condition => (
                                    <option key={condition.value} value={condition.value}>
                                        {condition.label} - {condition.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Estimated Value (£)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.estimated_value}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white font-medium"
                                placeholder="e.g., 25.00, 150.00"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Seller Location (optional)
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white font-medium"
                                placeholder="e.g., Manchester, Birmingham, London SE1"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                Action
                            </label>
                            <select
                                value={formData.action}
                                onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value as any }))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 bg-white font-medium"
                            >
                                <option value="throw">Throw Away</option>
                                <option value="donate">Donate</option>
                                <option value="sell">Sell</option>
                                <option value="keep">Keep</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white font-medium resize-none"
                            placeholder="e.g., Brown leather sofa with minor scratches, 3-seater, good cushions. Dimensions: 200cm x 90cm"
                        />
                    </div>

                    {/* Photo Upload Section */}
                    <ImageUpload
                        imagePreviewUrls={imagePreviewUrls}
                        onImageSelect={onImageSelect}
                        onRemoveImage={onRemoveImage}
                        isEditing={!!editingItem}
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                        <button
                            onClick={onSubmit}
                            className="w-full sm:w-auto bg-[#17B7C7] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-[#138994] transition-all duration-200 font-semibold shadow-md text-sm sm:text-base"
                        >
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold shadow-md text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
