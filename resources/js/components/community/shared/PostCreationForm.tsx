import { useState, useCallback } from 'react';
import { CommunityPost } from '@/types/community';
import { toast } from 'react-toastify';

interface PostCreationFormProps {
    onPostCreated: (post: CommunityPost) => void;
    isAuthenticated: boolean;
    placeholder?: string;
    showLocationInput?: boolean;
    className?: string;
}

export default function PostCreationForm({
    onPostCreated,
    isAuthenticated,
    placeholder = "What's on your mind? Share your moving experience, ask questions, or offer advice to fellow movers...",
    showLocationInput = true,
    className = "",
}: PostCreationFormProps) {
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        if (files.length + selectedImages.length > 4) {
            toast.warn('You can only upload up to 4 images per post');
            return;
        }
        
        const maxSize = 2 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > maxSize);
        
        if (oversizedFiles.length > 0) {
            toast.error('Some images are too large. Please select images under 2MB each.', {
                position: 'top-right',
                autoClose: 5000,
            });
            return;
        }
        
        setSelectedImages(prev => [...prev, ...files]);
        setSelectedVideo(null);
        e.target.value = '';
    }, [selectedImages.length]);

    const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 7 * 1024 * 1024;
            
            if (file.size > maxSize) {
                toast.error('Video file is too large. Please select a video under 7MB.', {
                    position: 'top-right',
                    autoClose: 5000,
                });
                e.target.value = '';
                return;
            }
            
            setSelectedVideo(file);
            setSelectedImages([]);
        }
        e.target.value = '';
    }, []);

    const removeImage = useCallback((index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    const removeVideo = useCallback(() => {
        setSelectedVideo(null);
    }, []);

    const addEmoji = useCallback((emoji: string) => {
        setNewPostContent(prev => prev + emoji);
        setShowEmojiPicker(false);
    }, []);

    const handleCreatePost = useCallback(async () => {
        if (!isAuthenticated) {
            toast.info('🔐 Please log in to create posts', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (!newPostContent.trim()) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (newPostLocation && showLocationInput) formData.append('location', newPostLocation);
            
            selectedImages.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });
            
            if (selectedVideo) {
                formData.append('video', selectedVideo);
            }

            const response = await fetch('/api/community/posts', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const textContent = await response.text();
                
                if (textContent.includes('Page Expired') || textContent.includes('419')) {
                    throw new Error('CSRF token expired. Please refresh the page and try again.');
                } else if (textContent.includes('Unauthenticated') || textContent.includes('401')) {
                    throw new Error('You need to be logged in to create posts.');
                } else {
                    throw new Error('Server returned an unexpected response. Please try again.');
                }
            }
            
            if (data.success) {
                onPostCreated(data.post);
                
                // Clear form
                setNewPostContent('');
                setNewPostLocation('');
                setSelectedImages([]);
                setSelectedVideo(null);
                setShowEmojiPicker(false);
                
                toast.success('🎉 Your post has been shared with the community!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            } else {
                throw new Error(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create post', {
                position: 'top-right',
                autoClose: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isAuthenticated,
        newPostContent,
        newPostLocation,
        selectedImages,
        selectedVideo,
        showLocationInput,
        onPostCreated
    ]);

    const resetForm = useCallback(() => {
        setNewPostContent('');
        setNewPostLocation('');
        setSelectedImages([]);
        setSelectedVideo(null);
        setShowEmojiPicker(false);
    }, []);

    if (!isAuthenticated) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6 text-center ${className}`}>
                <p className="text-gray-600 mb-4">Want to create posts?</p>
                <a 
                    href="/login" 
                    className="bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors shadow-lg inline-block"
                >
                    Log In
                </a>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 sm:p-6">
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-3 border-none resize-none focus:outline-none text-gray-900 text-sm sm:text-base lg:text-lg placeholder-gray-500"
                        rows={3}
                        disabled={isSubmitting}
                    />
                    
                    {showLocationInput && (
                        <input
                            type="text"
                            value={newPostLocation}
                            onChange={(e) => setNewPostLocation(e.target.value)}
                            placeholder="📍 Add location (optional)"
                            className="w-full p-3 mt-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 text-sm sm:text-base"
                            disabled={isSubmitting}
                        />
                    )}
                        
                        {/* Media Preview */}
                        {(selectedImages.length > 0 || selectedVideo) && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                {selectedImages.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {selectedImages.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 sm:h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-90 text-sm"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {selectedVideo && (
                                    <div className="relative">
                                        <video
                                            src={URL.createObjectURL(selectedVideo)}
                                            className="w-full h-36 sm:h-48 object-cover rounded-lg"
                                            controls
                                        />
                                        <button
                                            onClick={removeVideo}
                                            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-90 text-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="px-4 sm:px-6 pb-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                    {['😀', '😂', '😊', '😍', '🤔', '😢', '😮', '👍', '👎', '❤️', '🎉', '🏠', '📦', '🚚', '✨', '💪'].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => addEmoji(emoji)}
                                            className="text-lg sm:text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Action Bar */}
                    <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
                            <label className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors flex-shrink-0">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium">Photo</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={isSubmitting || selectedVideo !== null}
                                />
                            </label>
                            
                            <label className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors flex-shrink-0">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                <span className="text-sm font-medium">Video</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoSelect}
                                    className="hidden"
                                    disabled={isSubmitting || selectedImages.length > 0}
                                />
                            </label>
                            
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                disabled={isSubmitting}
                            >
                                <span className="text-lg">😊</span>
                                <span className="text-sm font-medium">Emoji</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                            <button
                                onClick={resetForm}
                                className="flex-1 sm:flex-none px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm sm:text-base"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePost}
                                disabled={!newPostContent.trim() || isSubmitting}
                                className="flex-1 sm:flex-none bg-[#17B7C7] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
}