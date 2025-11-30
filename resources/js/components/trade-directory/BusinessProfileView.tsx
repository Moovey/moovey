import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'react-toastify';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';

interface BusinessProfileProps {
    profile: {
        id: number;
        name: string;
        description: string;
        services: string[];
        logo_url: string | null;
        plan: string;
        user_name: string;
        rating: number;
        verified: boolean;
        response_time: string;
        availability: string;
        is_saved?: boolean;
        contact?: {
            email?: string;
            phone?: string;
            address?: string;
        };
        portfolio?: Array<{
            id: number;
            title: string;
            image_url: string;
            description: string;
        }>;
        reviews?: Array<{
            id: number;
            customer_name: string;
            rating: number;
            comment: string;
            date: string;
        }>;
    };
}

export default function BusinessProfileView({ profile }: BusinessProfileProps) {
    const [isSaved, setIsSaved] = useState(profile.is_saved || false);

    // Inertia form for saving provider
    const saveForm = useForm({
        business_profile_id: profile.id,
    });

    // Inertia form for unsaving provider
    const unsaveForm = useForm({});

    // Inertia form for connecting with business
    const connectForm = useForm({
        business_profile_id: profile.id,
        message: '',
    });

    const handleConnect = () => {
        connectForm.post('/api/messages/connect-business', {
            onSuccess: () => {
                toast.success('Connected! Opening conversation...');
                // Dispatch event to notify MessageDropdown and other components
                window.dispatchEvent(new CustomEvent('conversationUpdated'));
                // Inertia will handle the redirect automatically
            },
            onError: (errors) => {
                console.error('Error connecting:', errors);
                const errorMessage = (errors as any)?.message || 'Failed to connect. Please try again.';
                toast.error(errorMessage);
            },
        });
    };

    const handleSave = () => {
        if (isSaved) {
            // Unsave
            unsaveForm.delete(`/api/saved-providers/${profile.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaved(false);
                    toast.success('Business removed from saved list');
                },
                onError: (errors) => {
                    console.error('Error removing business:', errors);
                    toast.error('Failed to remove business. Please try again.');
                },
            });
        } else {
            // Save
            saveForm.post('/api/saved-providers', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaved(true);
                    toast.success('Business saved successfully!');
                },
                onError: (errors) => {
                    console.error('Error saving business:', errors);
                    toast.error('Failed to save business. Please try again.');
                },
            });
        }
    };

    const isSaving = saveForm.processing || unsaveForm.processing;
    const isConnecting = connectForm.processing;
    
    return (
        <>
            <Head title={`${profile.name} - Business Profile`} />
            <GlobalHeader />
            
            <main className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                    {/* Logo */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#17B7C7] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {profile.logo_url ? (
                                            <img src={profile.logo_url} alt={`${profile.name} logo`} className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                {profile.services?.some(s => s.toLowerCase().includes('moving') || s.toLowerCase().includes('removal')) ? (
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m0 0v6m0-6a2 2 0 012 2v4m-2-6a2 2 0 00-2-2H8a2 2 0 00-2 2m0 0v6m0-6h8m-8 6H4m4 0v4m0-4h8m0 0v4m0-4h4m-12 4h.01M16 17h.01" />
                                                    </svg>
                                                ) : profile.services?.some(s => s.toLowerCase().includes('packing')) ? (
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                ) : profile.services?.some(s => s.toLowerCase().includes('cleaning')) ? (
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                ) : profile.services?.some(s => s.toLowerCase().includes('storage')) ? (
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" />
                                                    </svg>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`text-lg ${i < profile.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                        ★
                                                    </span>
                                                ))}
                                                <span className="ml-2 text-sm text-gray-600">({profile.rating}/5)</span>
                                            </div>
                                            {profile.verified && (
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Verified
                                                </span>
                                            )}
                                            {profile.plan === 'premium' && (
                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    Premium
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                                        <p className="text-gray-600 mb-2">Run by {profile.user_name}</p>
                                        <p className="text-sm text-gray-500">{profile.availability}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                                    <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                                </div>

                                {/* Services */}
                                {profile.services && profile.services.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Services Offered</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {profile.services.map((service, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg border">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#17B7C7" viewBox="0 0 24 24" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="font-medium text-gray-900">{service}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Portfolio/Gallery (if available) */}
                                {profile.portfolio && profile.portfolio.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Portfolio</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {profile.portfolio.map((item) => (
                                                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                                    <img 
                                                        src={item.image_url} 
                                                        alt={item.title} 
                                                        className="w-full h-32 object-cover"
                                                    />
                                                    <div className="p-3">
                                                        <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reviews (if available) */}
                                {profile.reviews && profile.reviews.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
                                        <div className="space-y-4">
                                            {profile.reviews.map((review) => (
                                                <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-[#17B7C7] rounded-full flex items-center justify-center text-white font-medium">
                                                                {review.customer_name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{review.customer_name}</p>
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                                            ★
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-gray-500">{review.date}</span>
                                                    </div>
                                                    <p className="text-gray-700">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Action Panel */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                                    <div className="space-y-4">
                                        <button 
                                            onClick={handleConnect}
                                            disabled={isConnecting}
                                            className={`w-full bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors ${
                                                isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {isConnecting ? 'Connecting...' : 'Connect Now'}
                                        </button>
                                        <button className="w-full border-2 border-[#17B7C7] text-[#17B7C7] px-6 py-3 rounded-lg font-semibold hover:bg-[#17B7C7] hover:text-white transition-colors">
                                            Get Quote
                                        </button>
                                        <button 
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                                                isSaved
                                                    ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                                                    : 'text-gray-600 border border-gray-300 hover:bg-gray-50'
                                            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save Business'}
                                        </button>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-gray-700">{profile.response_time}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-700">{profile.availability}</span>
                                            </div>
                                            {profile.contact?.phone && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span className="text-gray-700">{profile.contact.phone}</span>
                                                </div>
                                            )}
                                            {profile.contact?.address && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-gray-700">{profile.contact.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Share */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-900 mb-3">Share this business</p>
                                        <div className="flex gap-2">
                                            <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors">
                                                Facebook
                                            </button>
                                            <button className="flex-1 bg-blue-400 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-500 transition-colors">
                                                Twitter
                                            </button>
                                            <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-gray-700 transition-colors">
                                                Copy Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <WelcomeFooter />
        </>
    );
}