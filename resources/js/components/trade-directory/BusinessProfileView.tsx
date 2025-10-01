import { Head } from '@inertiajs/react';
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
                                            <span className="text-white text-2xl sm:text-3xl">
                                                {profile.services?.some(s => s.toLowerCase().includes('moving') || s.toLowerCase().includes('removal')) ? '🚚' :
                                                 profile.services?.some(s => s.toLowerCase().includes('packing')) ? '📦' :
                                                 profile.services?.some(s => s.toLowerCase().includes('cleaning')) ? '🧽' :
                                                 profile.services?.some(s => s.toLowerCase().includes('storage')) ? '📁' :
                                                 '🏢'}
                                            </span>
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
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    ✓ Verified
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
                                                        <span className="text-[#17B7C7] text-lg">✓</span>
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
                                        <button className="w-full bg-[#17B7C7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors">
                                            Connect Now
                                        </button>
                                        <button className="w-full border-2 border-[#17B7C7] text-[#17B7C7] px-6 py-3 rounded-lg font-semibold hover:bg-[#17B7C7] hover:text-white transition-colors">
                                            Get Quote
                                        </button>
                                        <button className="w-full text-gray-600 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                                            Save Business
                                        </button>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-400">⏱️</span>
                                                <span className="text-gray-700">{profile.response_time}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="text-gray-400">📅</span>
                                                <span className="text-gray-700">{profile.availability}</span>
                                            </div>
                                            {profile.contact?.phone && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-gray-400">📞</span>
                                                    <span className="text-gray-700">{profile.contact.phone}</span>
                                                </div>
                                            )}
                                            {profile.contact?.address && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-gray-400">📍</span>
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