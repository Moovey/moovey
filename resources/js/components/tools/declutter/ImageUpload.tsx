import { useRef } from 'react';
import { handleImageError } from './utils';

interface ImageUploadProps {
    imagePreviewUrls: string[];
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
    isEditing?: boolean;
}

export default function ImageUpload({
    imagePreviewUrls,
    onImageSelect,
    onRemoveImage,
    isEditing = false
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="mt-3 sm:mt-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-[#17B7C7] transition-colors">
                <div className="text-center">
                    <div className="text-3xl sm:text-4xl mb-2">📷</div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Add up to 4 photos of your item</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onImageSelect}
                        multiple
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#17B7C7] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        disabled={imagePreviewUrls.length >= 4}
                    >
                        Choose Photos ({4 - imagePreviewUrls.length} slots left)
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        Maximum 4 images, 2MB each. JPG, PNG supported.
                    </p>
                </div>
            </div>

            {/* Image Previews */}
            {imagePreviewUrls.length > 0 && (
                <div className="mt-3 sm:mt-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        {isEditing ? 'Current & New Photos' : 'Selected Photos'}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-20 sm:h-24 object-cover rounded-md sm:rounded-lg border border-gray-300"
                                    onError={(e) => {
                                        // If it's an existing image URL and it fails, try fallback paths
                                        if (isEditing && !url.startsWith('blob:')) {
                                            handleImageError(e, url.split('/').pop() || '');
                                        }
                                    }}
                                />
                                {isEditing && !url.startsWith('blob:') && (
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
                                    onClick={() => onRemoveImage(index)}
                                    className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    {isEditing && (
                        <p className="text-xs text-gray-500 mt-2">
                            Note: When editing, only new images will be saved. Existing images will be replaced.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
