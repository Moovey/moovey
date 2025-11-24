import { useState, useCallback, useRef, useEffect } from 'react';
import { CommunityPost } from '@/types/community';
import { toast } from 'react-toastify';
import LocationAutocomplete from './LocationAutocomplete';

// Professional SVG icons for Post Creation Form
const getPostCreationIcon = (name: string, className: string = "w-5 h-5") => {
    const icons: Record<string, React.JSX.Element> = {
        photo: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        video: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        ),
        location: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        emoji: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        close: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        post: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
        ),
        login: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
        ),
        community: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        )
    };
    
    return icons[name] || icons.post;
};

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
    const [showLocationField, setShowLocationField] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Make sure the primary text input is the first interactive element
    useEffect(() => {
        if (isAuthenticated) {
            textareaRef.current?.focus();
        }
    }, [isAuthenticated]);

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
            <div className={`bg-white rounded-xl border border-gray-200 shadow-lg p-4 sm:p-6 text-center ${className}`}>
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-[#17B7C7] rounded-xl flex items-center justify-center shadow-lg">
                        {getPostCreationIcon('community', 'w-6 h-6 text-white')}
                    </div>
                </div>
                <p className="text-gray-600 mb-4 font-medium">Want to share with the community?</p>
                <a 
                    href="/login" 
                    className="bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-all duration-200 shadow-lg inline-flex items-center space-x-2 transform hover:scale-105"
                >
                    {getPostCreationIcon('login', 'w-5 h-5')}
                    <span>Log In</span>
                </a>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 sm:p-6">
                    <textarea
                        ref={textareaRef}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-3 border-none resize-none focus:outline-none text-gray-900 text-sm sm:text-base lg:text-lg placeholder-gray-500"
                        rows={3}
                        disabled={isSubmitting}
                        aria-label="What's on your mind?"
                    />

                    {showLocationInput && showLocationField && (
                        <div className="mt-2">
                            <LocationAutocomplete
                                value={newPostLocation}
                                onChange={setNewPostLocation}
                                placeholder="📍 Add location (optional)"
                                disabled={isSubmitting}
                                onHide={() => setShowLocationField(false)}
                            />
                        </div>
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
                                                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-90 transition-all duration-200 hover:scale-110"
                                                >
                                                    {getPostCreationIcon('close', 'w-4 h-4')}
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
                                            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-90 transition-all duration-200 hover:scale-110"
                                        >
                                            {getPostCreationIcon('close', 'w-4 h-4')}
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
                            <label className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0 hover:text-[#17B7C7] group">
                                <div className="w-6 h-6 text-[#17B7C7] group-hover:scale-110 transition-transform duration-200">
                                    {getPostCreationIcon('photo', 'w-5 h-5')}
                                </div>
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
                            
                            <label className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0 hover:text-[#00BCD4] group">
                                <div className="w-6 h-6 text-[#00BCD4] group-hover:scale-110 transition-transform duration-200">
                                    {getPostCreationIcon('video', 'w-5 h-5')}
                                </div>
                                <span className="text-sm font-medium">Video</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoSelect}
                                    className="hidden"
                                    disabled={isSubmitting || selectedImages.length > 0}
                                />
                            </label>
                            
                            {showLocationInput && (
                                <button
                                    type="button"
                                    onClick={() => setShowLocationField((v) => !v)}
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0 hover:text-[#1A237E] group"
                                    disabled={isSubmitting}
                                    aria-expanded={showLocationField}
                                    aria-controls="post-location-input"
                                >
                                    <div className="w-6 h-6 text-[#1A237E] group-hover:scale-110 transition-transform duration-200">
                                        {getPostCreationIcon('location', 'w-5 h-5')}
                                    </div>
                                    <span className="text-sm font-medium">{showLocationField ? 'Hide location' : 'Add location'}</span>
                                </button>
                            )}

                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex-shrink-0 hover:text-yellow-500 group"
                                disabled={isSubmitting}
                            >
                                <div className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform duration-200">
                                    {getPostCreationIcon('emoji', 'w-5 h-5')}
                                </div>
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