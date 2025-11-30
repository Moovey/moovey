import { useState, useCallback } from 'react';
import { MarketplaceItem } from './types';
import { toast } from 'react-toastify';

interface ItemDetailModalProps {
    item: MarketplaceItem | null;
    isOpen: boolean;
    onClose: () => void;
    getImageUrl: (imagePath: string) => string;
    handleImageError: (e: React.SyntheticEvent<HTMLImageElement>, imagePath: string) => void;
}

export default function ItemDetailModal({ 
    item, 
    isOpen, 
    onClose, 
    getImageUrl, 
    handleImageError 
}: ItemDetailModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showMessageOptions, setShowMessageOptions] = useState(false);
    const [showCustomMessage, setShowCustomMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    if (!isOpen || !item) return null;

    const images = item.images || [];
    const hasMultipleImages = images.length > 1;

    // Predefined message options
    const messageOptions = [
        {
            id: 'availability',
            text: `Hi! Is this ${item.name} still available?`,
            icon: '❓'
        },
        {
            id: 'price',
            text: `Hi! Is the price for ${item.name} negotiable?`,
            icon: '💰'
        },
        {
            id: 'condition',
            text: `Hi! Can you tell me more about the condition of ${item.name}?`,
            icon: '🔍'
        },
        {
            id: 'pickup',
            text: `Hi! When would be a good time to pick up ${item.name}?`,
            icon: '📅'
        },
        {
            id: 'bundle',
            text: `Hi! Do you have any other similar items you'd be willing to bundle with ${item.name}?`,
            icon: '📦'
        },
        {
            id: 'custom',
            text: 'Write custom message',
            icon: '✍️'
        }
    ];

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'excellent': return 'bg-green-100 text-green-800';
            case 'good': return 'bg-blue-100 text-blue-800';
            case 'fair': return 'bg-yellow-100 text-yellow-800';
            case 'poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const nextImage = useCallback(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const handleMessageOptionSelect = useCallback((option: typeof messageOptions[0]) => {
        if (option.id === 'custom') {
            setShowCustomMessage(true);
            setMessage('');
        } else {
            setMessage(option.text);
            setShowCustomMessage(true);
        }
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setIsSendingMessage(true);
        
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    recipient_id: item.user_id,
                    message: message.trim(),
                    item_id: item.id,
                    item_name: item.name
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                const successMessage = data.data?.item_context 
                    ? `Message sent! Item details added to conversation.`
                    : 'Message sent successfully!';
                    
                toast.success(
                    <div>
                        <div>{successMessage}</div>
                        {data.data?.conversation_id && (
                            <div className="mt-2">
                                <a 
                                    href={`/messages/${data.data.conversation_id}`}
                                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                                >
                                    View conversation →
                                </a>
                            </div>
                        )}
                    </div>,
                    {
                        autoClose: 5000,
                    }
                );
                setMessage('');
                setShowMessageOptions(false);
                setShowCustomMessage(false);
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send message');
        } finally {
            setIsSendingMessage(false);
        }
    }, [message, item.user_id, item.id, item.name]);

    const handleBackToOptions = useCallback(() => {
        setShowCustomMessage(false);
        setMessage('');
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E0F7FA] transition-colors text-[#00BCD4] hover:text-[#00ACC1]"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid md:grid-cols-2 gap-6 p-6">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {images.length > 0 ? (
                                    <>
                                        <img
                                            src={getImageUrl(images[currentImageIndex])}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => handleImageError(e, images[currentImageIndex])}
                                            data-attempt="0"
                                            width={800}
                                            height={800}
                                            loading="eager"
                                            decoding="async"
                                        />
                                        
                                        {hasMultipleImages && (
                                            <>
                                                {/* Navigation arrows */}
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                                
                                                {/* Image counter */}
                                                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full">
                                                    {currentImageIndex + 1} / {images.length}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <div className="text-center">
                                            <div className="text-6xl mb-2">📦</div>
                                            <div className="text-sm">No images available</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Thumbnail gallery */}
                            {hasMultipleImages && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                                currentImageIndex === index 
                                                    ? 'border-[#17B7C7]' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={getImageUrl(image)}
                                                alt={`${item.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => handleImageError(e, image)}
                                                data-attempt="0"
                                                width={128}
                                                height={128}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Item Details */}
                        <div className="space-y-6">
                            {/* Price and Title */}
                            <div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                    £{item.estimated_value}
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                    {item.name}
                                </h1>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                                        {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)} condition
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {item.category}
                                    </span>
                                    {/* Action Badge */}
                                    {item.action && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                                            item.action === 'sell' 
                                                ? 'bg-green-100 text-green-800' 
                                                : item.action === 'donate' 
                                                ? 'bg-purple-100 text-purple-800'
                                                : item.action === 'throw'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {item.action === 'sell' && (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    For Sale
                                                </>
                                            )}
                                            {item.action === 'donate' && (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Free - Donate
                                                </>
                                            )}
                                            {item.action === 'throw' && (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Free - Throw Away
                                                </>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {item.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Location and Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
                                    <div className="flex items-center gap-1 text-gray-900">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        <span>{item.location || 'Location not specified'}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Listed</h4>
                                    <p className="text-gray-900">{formatDate(item.created_at)}</p>
                                </div>
                            </div>

                            {/* Seller Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-3">Seller</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#17B7C7] rounded-full flex items-center justify-center text-white text-lg font-medium">
                                        {(item.user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {item.user?.name || 'Anonymous Seller'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Member since {formatDate(item.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message Section */}
                            <div className="border-t pt-4">
                                {!showMessageOptions && !showCustomMessage ? (
                                    <button
                                        onClick={() => setShowMessageOptions(true)}
                                        className="w-full bg-[#00BCD4] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#00ACC1] transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {item.action === 'sell' && 'Contact Seller'}
                                        {item.action === 'donate' && 'Request Item'}
                                        {item.action === 'throw' && 'Claim Item'}
                                        {!item.action && 'Message Seller'}
                                    </button>
                                ) : showMessageOptions && !showCustomMessage ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900">Choose a message</h4>
                                            <button
                                                onClick={() => setShowMessageOptions(false)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="grid gap-2">
                                            {messageOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleMessageOptionSelect(option)}
                                                    className="text-left p-3 border border-gray-200 rounded-lg hover:border-[#17B7C7] hover:bg-blue-50 transition-all group"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-lg">{option.icon}</span>
                                                        <div className="flex-1">
                                                            <p className="text-gray-900 text-sm leading-relaxed group-hover:text-[#17B7C7] transition-colors">
                                                                {option.text}
                                                            </p>
                                                        </div>
                                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[#17B7C7] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleBackToOptions}
                                                className="text-[#17B7C7] hover:text-[#139AAA] transition-colors"
                                                disabled={isSendingMessage}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Send a message</h4>
                                                <p className="text-xs text-gray-500">Item details will be shared in the conversation</p>
                                            </div>
                                        </div>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder={`Hi! Is this ${item.name} still available?`}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                                            rows={3}
                                            disabled={isSendingMessage}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={isSendingMessage || !message.trim()}
                                                className="flex-1 bg-[#17B7C7] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#139AAA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSendingMessage ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Send Message
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowMessageOptions(false);
                                                    setShowCustomMessage(false);
                                                    setMessage('');
                                                }}
                                                disabled={isSendingMessage}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}