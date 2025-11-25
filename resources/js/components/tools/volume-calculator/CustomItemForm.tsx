import { useState } from 'react';

interface CustomItemFormProps {
    onAddItem: (name: string, length: string, width: string, height: string) => void;
}

export default function CustomItemForm({ onAddItem }: CustomItemFormProps) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        length: '',
        width: '',
        height: ''
    });

    const handleSubmit = () => {
        onAddItem(formData.name, formData.length, formData.width, formData.height);
        setFormData({ name: '', length: '', width: '', height: '' });
        setShowForm(false);
    };

    const handleCancel = () => {
        setShowForm(false);
        setFormData({ name: '', length: '', width: '', height: '' });
    };

    return (
        <div className="p-3 sm:p-4 lg:p-6 bg-white border-t border-gray-200">
            <button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-600 text-white px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors mb-3 sm:mb-4 min-h-[44px] w-full sm:w-auto"
            >
                {showForm ? 'Hide Custom Item Form' : 'Add Custom Item'}
            </button>

            {showForm && (
                <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                    <h5 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Add Custom Item</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                            <input
                                type="text"
                                placeholder="Large Bookshelf"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Length (cm)</label>
                            <input
                                type="number"
                                placeholder="120"
                                value={formData.length}
                                onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Width (cm)</label>
                            <input
                                type="number"
                                placeholder="80"
                                value={formData.width}
                                onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 min-h-[44px]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                            <input
                                type="number"
                                placeholder="180"
                                value={formData.height}
                                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 placeholder-gray-500 font-medium focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 min-h-[44px]"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                        <button
                            onClick={handleSubmit}
                            className="bg-[#17B7C7] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#139AAA] transition-all duration-300 min-h-[44px] w-full sm:w-auto"
                        >
                            Add Item
                        </button>
                        <button
                            onClick={handleCancel}
                            className="bg-gray-500 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600 transition-colors min-h-[44px] w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
