import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import HousemoverNavigation from '@/components/housemover/HousemoverNavigation';
import { useMoveProgress } from '@/hooks/useMoveProgress';

interface CommunityMember {
    id: string;
    name: string;
    avatar: string;
    status: string;
    location: string;
    recentActivity: string;
    activityTime: string;
    businessType: string;
    isOnline: boolean;
    isFollowing?: boolean;
}

interface BusinessProvider {
    id: string;
    name: string;
    avatar: string;
    businessType: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    services: string[];
    isBookmarked?: boolean;
}

interface ConnectionRequest {
    id: string;
    name: string;
    avatar: string;
    businessType: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    mutualConnections: number;
    requestMessage?: string;
}

interface RecommendedConnection {
    id: string;
    name: string;
    avatar: string;
    businessType: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    recommendationReason: string;
    matchScore: number;
}

interface SavedProvider {
    id: string;
    name: string;
    avatar: string;
    businessType: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    services: string[];
    availability?: string;
    responseTime?: string;
    savedDate: string;
    notes?: string;
}

export default function Connections() {
    const { taskData } = useMoveProgress();
    const [networkFilter, setNetworkFilter] = useState<'all' | 'community' | 'business' | 'suggestions'>('all');

    const [communityMembers] = useState<CommunityMember[]>([
        {
            id: '1',
            name: 'Lisa Thompson',
            avatar: '👤',
            status: 'Fellow Mover',
            location: 'Moving to Leeds',
            recentActivity: 'Posted about packing tips',
            activityTime: '2 hours ago',
            businessType: 'Lifestyle Blogger',
            isOnline: true
        },
        {
            id: '2',
            name: 'David Chen',
            avatar: '👤',
            status: 'Fellow Mover',
            location: 'Moving to Cardiff',
            recentActivity: 'Shared moving checklist',
            activityTime: '4 hours ago',
            businessType: 'Software Developer',
            isOnline: false
        },
        {
            id: '3',
            name: 'Sophie Williams',
            avatar: '👤',
            status: 'Fellow Mover',
            location: 'Moving to Edinburgh',
            recentActivity: 'Asked about storage options',
            activityTime: '1 day ago',
            businessType: 'Teacher',
            isOnline: true
        },
        {
            id: '4',
            name: 'James Miller',
            avatar: '👤',
            status: 'Local Resident',
            location: 'Manchester',
            recentActivity: 'Shared local recommendations',
            activityTime: '3 hours ago',
            businessType: 'Local Business Owner',
            isOnline: false
        },
        {
            id: '5',
            name: 'Emma Davis',
            avatar: '👤',
            status: 'Community Leader',
            location: 'Manchester',
            recentActivity: 'Organized community event',
            activityTime: '5 hours ago',
            businessType: 'Community Organizer',
            isOnline: true
        },
        {
            id: '6',
            name: 'Tom Wilson',
            avatar: '👤',
            status: 'Fellow Mover',
            location: 'Moving to Manchester',
            recentActivity: 'Asked about schools',
            activityTime: '1 day ago',
            businessType: 'Marketing Manager',
            isOnline: false
        },
        {
            id: '7',
            name: 'Rachel Green',
            avatar: '👤',
            status: 'Local Resident',
            location: 'Manchester',
            recentActivity: 'Shared neighborhood tips',
            activityTime: '2 days ago',
            businessType: 'Nurse',
            isOnline: true
        },
        {
            id: '8',
            name: 'Mark Taylor',
            avatar: '👤',
            status: 'Community Leader',
            location: 'Manchester',
            recentActivity: 'Posted safety updates',
            activityTime: '6 hours ago',
            businessType: 'Local Councillor',
            isOnline: false
        }
    ]);

    const [businessProviders] = useState<BusinessProvider[]>([
        {
            id: '1',
            name: "Mike's Moving Services",
            avatar: '🚚',
            businessType: 'Moving Company',
            location: 'Manchester',
            rating: 4.8,
            reviewCount: 127,
            verified: true,
            services: ['Residential Moving', 'Packing', 'Storage']
        },
        {
            id: '2',
            name: 'Swift Relocations',
            avatar: '📦',
            businessType: 'Moving Company',
            location: 'London',
            rating: 4.6,
            reviewCount: 89,
            verified: true,
            services: ['Commercial Moving', 'International', 'Insurance']
        },
        {
            id: '3',
            name: 'ClearView Cleaning',
            avatar: '🧹',
            businessType: 'Cleaning Service',
            location: 'Liverpool',
            rating: 4.9,
            reviewCount: 203,
            verified: true,
            services: ['Deep Cleaning', 'Move-in/out', 'Regular Service']
        }
    ]);

    const [connectionRequests] = useState<ConnectionRequest[]>([
        {
            id: '1',
            name: 'Sarah Williams - Premier Properties',
            avatar: '🏠',
            businessType: 'Estate Agent',
            location: 'Manchester',
            rating: 4.9,
            reviewCount: 156,
            verified: true,
            mutualConnections: 3,
            requestMessage: 'Hi! I noticed you\'re moving to Manchester. I specialize in the area and would love to help you find your perfect home.'
        },
        {
            id: '2',
            name: 'David Thompson - Thompson Legal',
            avatar: '⚖️',
            businessType: 'Solicitor',
            location: 'Manchester',
            rating: 4.7,
            reviewCount: 89,
            verified: true,
            mutualConnections: 2,
            requestMessage: 'I help families with property purchases in Manchester. Happy to assist with your conveyancing needs.'
        },
        {
            id: '3',
            name: 'Emma Roberts - QuickMove Removals',
            avatar: '📦',
            businessType: 'Removal Company',
            location: 'Liverpool to Manchester',
            rating: 4.8,
            reviewCount: 234,
            verified: true,
            mutualConnections: 5,
            requestMessage: 'We specialize in Liverpool to Manchester moves. Competitive rates and excellent service guaranteed!'
        }
    ]);

    const [recommendedConnections] = useState<RecommendedConnection[]>([
        {
            id: '1',
            name: 'Alex Turner - TurnerFinance',
            avatar: '💰',
            businessType: 'Mortgage Broker',
            location: 'Manchester',
            rating: 4.8,
            reviewCount: 92,
            verified: true,
            recommendationReason: 'Specializes in first-time buyers in your area',
            matchScore: 94
        },
        {
            id: '2',
            name: 'Maria Rodriguez - Rodriguez & Associates',
            avatar: '⚖️',
            businessType: 'Conveyancing Solicitor',
            location: 'Manchester',
            rating: 4.9,
            reviewCount: 178,
            verified: true,
            recommendationReason: 'Highly rated for fast, efficient property transactions',
            matchScore: 89
        },
        {
            id: '3',
            name: 'James Mitchell - HomeGuru',
            avatar: '🔧',
            businessType: 'Home Inspector',
            location: 'Greater Manchester',
            rating: 4.7,
            reviewCount: 134,
            verified: true,
            recommendationReason: 'Recommended by other movers in your network',
            matchScore: 87
        }
    ]);

    const [savedProviders] = useState<SavedProvider[]>([
        {
            id: '1',
            name: 'Swift Relocations Ltd',
            avatar: '🚚',
            businessType: 'Moving Company',
            location: 'Manchester',
            rating: 4.8,
            reviewCount: 156,
            verified: true,
            services: ['Full Service Moving', 'Packing', 'Storage', 'Insurance'],
            availability: 'Available: Next 2 weeks',
            responseTime: 'Usually responds within 2 hours',
            savedDate: '2 days ago',
            notes: 'Highly recommended by previous customers'
        },
        {
            id: '2',
            name: 'ClearView Professional Cleaning',
            avatar: '🧽',
            businessType: 'Cleaning Service',
            location: 'Manchester',
            rating: 4.9,
            reviewCount: 203,
            verified: true,
            services: ['Deep Cleaning', 'Move-in/out', 'Regular Service'],
            availability: 'Available: Weekdays and Sundays',
            responseTime: 'Usually responds within 3 hours',
            savedDate: '1 week ago',
            notes: 'Excellent reviews for move-out cleaning'
        },
        {
            id: '3',
            name: 'Manchester Storage Solutions',
            avatar: '🏢',
            businessType: 'Storage Facility',
            location: 'Manchester',
            rating: 4.6,
            reviewCount: 143,
            verified: true,
            services: ['Self Storage', 'Climate Controlled', 'Business Storage'],
            availability: 'Available: 24/7 Access',
            responseTime: 'Usually responds within 1 hour',
            savedDate: '3 days ago'
        }
    ]);

    // Business connections data for the service categories grid
    const [businessConnections] = useState([
        {
            id: '1',
            name: 'Premier Properties',
            avatar: '🏠',
            businessType: 'Estate Agent',
            rating: 4.9
        },
        {
            id: '2',
            name: 'Thompson Legal',
            avatar: '⚖️',
            businessType: 'Solicitor',
            rating: 4.7
        },
        {
            id: '3',
            name: 'QuickMove Removals',
            avatar: '📦',
            businessType: 'Removal Company',
            rating: 4.8
        },
        {
            id: '4',
            name: 'ClearView Cleaning',
            avatar: '🧹',
            businessType: 'Cleaning Service',
            rating: 4.9
        },
        {
            id: '5',
            name: 'SecureStore',
            avatar: '🏢',
            businessType: 'Storage Facility',
            rating: 4.6
        },
        {
            id: '6',
            name: 'FastFinance',
            avatar: '💰',
            businessType: 'Mortgage Broker',
            rating: 4.5
        }
    ]);

    const handleAcceptRequest = (requestId: string) => {
        console.log('Accepting connection request:', requestId);
        // In a real app, this would make an API call to accept the connection
    };

    const handleDeclineRequest = (requestId: string) => {
        console.log('Declining connection request:', requestId);
        // In a real app, this would make an API call to decline the connection
    };

    const handleConnectRecommended = (connectionId: string) => {
        console.log('Connecting to recommended:', connectionId);
        // In a real app, this would make an API call to send a connection request
    };

    const handleContactProvider = (providerId: string) => {
        console.log('Contacting saved provider:', providerId);
        // In a real app, this would open a messaging interface or redirect to contact form
    };

    const handleRemoveSavedProvider = (providerId: string) => {
        console.log('Removing saved provider:', providerId);
        // In a real app, this would remove the provider from saved list
    };

    const handleChatRequest = (connectionId: string) => {
        console.log('Starting chat with business connection:', connectionId);
        // In a real app, this would open the chat interface
    };

    const handleConnectMember = (memberId: string) => {
        console.log('Connecting to community member:', memberId);
        // In a real app, this would send a connection request
    };

    const handleChatMember = (memberId: string) => {
        console.log('Starting chat with community member:', memberId);
        // In a real app, this would open the chat interface
    };

    return (
        <DashboardLayout>
            <Head title="Connections" />
            
            <EnhancedWelcomeBanner subtitle="Connect with others to earn community coins!" showProgress={true} taskData={taskData || undefined} />

            {/* Sub-Navigation Tabs */}
            <HousemoverNavigation activeTab="connections" />

            {/* Main Content - Professional Bento Grid Layout */}
            <div className="max-w-7xl mx-auto">
                {/* Top Row - Primary Sections */}
                <div className="grid grid-cols-12 gap-6 mb-6">
                    
                    {/* Saved Providers - Primary Large Section (8 columns) */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-white rounded-3xl p-6 shadow-lg h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-[#1A237E] mb-2 flex items-center">
                                        <span className="mr-2">💾</span>
                                        Saved Providers
                                    </h3>
                                    <p className="text-gray-600 text-sm">Providers you've saved from the Trade Directory</p>
                                </div>
                                <Link 
                                    href="/trade-directory"
                                    className="bg-[#00BCD4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#00ACC1] transition-colors shadow-md text-sm"
                                >
                                    Browse More
                                </Link>
                            </div>

                            {savedProviders.length > 0 ? (
                                <div className="space-y-4">
                                    {savedProviders.slice(0, 2).map((provider) => (
                                        <div key={provider.id} className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-4 shadow-md">
                                            <div className="grid grid-cols-4 gap-4 items-center">
                                                {/* Provider Info - Compact */}
                                                <div className="col-span-3">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                            <span className="text-[#00BCD4] text-xl">{provider.avatar}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <h5 className="font-semibold text-[#1A237E] text-sm">{provider.name}</h5>
                                                                {provider.verified && (
                                                                    <span className="text-green-500 text-xs">✓</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 mb-2">{provider.businessType} • {provider.location}</p>
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="text-yellow-500 text-sm">⭐</span>
                                                                    <span className="text-sm font-medium">{provider.rating}</span>
                                                                    <span className="text-xs text-gray-500">({provider.reviewCount})</span>
                                                                </div>
                                                                <span className="text-xs text-gray-500">Saved {provider.savedDate}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {provider.services.slice(0, 3).map((service, index) => (
                                                                    <span key={index} className="bg-white text-[#1A237E] px-2 py-1 rounded-full text-xs font-medium">
                                                                        {service}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="flex flex-col space-y-2">
                                                    <button
                                                        onClick={() => handleContactProvider(provider.id)}
                                                        className="bg-[#00BCD4] text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#00ACC1] transition-colors"
                                                    >
                                                        Contact
                                                    </button>
                                                    <button className="bg-white text-[#00BCD4] border border-[#00BCD4] px-3 py-1 rounded-lg text-xs hover:bg-[#00BCD4] hover:text-white transition-colors">
                                                        Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {savedProviders.length > 2 && (
                                        <div className="text-center pt-3">
                                            <button className="text-[#00BCD4] font-medium hover:text-[#00ACC1] transition-colors text-sm">
                                                View All {savedProviders.length} Saved Providers →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3">📋</div>
                                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Saved Providers Yet</h4>
                                    <p className="text-gray-500 mb-4 text-sm">Browse the Trade Directory to save providers you're interested in.</p>
                                    <Link
                                        href="/trade-directory"
                                        className="inline-flex items-center px-4 py-2 bg-[#00BCD4] text-white rounded-lg font-medium hover:bg-[#00ACC1] transition-colors text-sm"
                                    >
                                        <span className="mr-2">🔍</span>
                                        Browse Trade Directory
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Connection Requests - Secondary Section (4 columns) */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                            <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                                <span className="mr-2">📬</span>
                                Connection Requests
                                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                            </h4>
                            <div className="space-y-3">
                                {connectionRequests.slice(0, 3).map((request) => (
                                    <div key={request.id} className="bg-[#E0F7FA] border border-[#00BCD4] rounded-xl p-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                <span className="text-[#00BCD4] text-lg">{request.avatar}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-[#1A237E] text-sm truncate">{request.name.split(' - ')[0]}</h5>
                                                <p className="text-xs text-gray-600">{request.businessType}</p>
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <span className="text-yellow-500 text-xs">⭐</span>
                                                    <span className="text-xs">{request.rating}</span>
                                                    <span className="text-xs text-gray-500">({request.reviewCount})</span>
                                                </div>
                                                <div className="flex space-x-2 mt-2">
                                                    <button
                                                        onClick={() => handleAcceptRequest(request.id)}
                                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeclineRequest(request.id)}
                                                        className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400 transition-colors"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Row - Secondary Sections */}
                <div className="grid grid-cols-12 gap-6 mb-6">
                    
                    {/* Recommended Connections - Medium Section (6 columns) */}
                    <div className="col-span-12 lg:col-span-6">
                        <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                            <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                                <span className="mr-2">🎯</span>
                                Recommended for You
                            </h4>
                            <div className="space-y-3">
                                {recommendedConnections.slice(0, 3).map((connection) => (
                                    <div key={connection.id} className="bg-[#E0F7FA] border border-[#00BCD4] rounded-xl p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                    <span className="text-[#00BCD4] text-lg">{connection.avatar}</span>
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-[#1A237E] text-sm">{connection.name.split(' - ')[0]}</h5>
                                                    <p className="text-xs text-gray-600">{connection.businessType} • {connection.location}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <div className="flex items-center space-x-1">
                                                            <span className="text-yellow-500 text-xs">⭐</span>
                                                            <span className="text-xs">{connection.rating}</span>
                                                        </div>
                                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                                            {connection.matchScore}% match
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleConnectRecommended(connection.id)}
                                                className="bg-[#00BCD4] text-white px-3 py-1 rounded text-xs hover:bg-[#00ACC1] transition-colors"
                                            >
                                                Connect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Network Stats - Compact Section (3 columns) */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                            <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                                <span className="mr-2">📊</span>
                                Your Network
                            </h4>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#00BCD4]">12</div>
                                    <p className="text-xs text-gray-600">Total Connections</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#1A237E]">{savedProviders.length}</div>
                                    <p className="text-xs text-gray-600">Saved Providers</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">8</div>
                                    <p className="text-xs text-gray-600">Active Chats</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-500">3</div>
                                    <p className="text-xs text-gray-600">Pending Requests</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - Compact Section (3 columns) */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white rounded-3xl p-5 shadow-lg h-full">
                            <h4 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                                <span className="mr-2">⚡</span>
                                Quick Actions
                            </h4>
                            <div className="space-y-3">
                                <Link
                                    href="/trade-directory"
                                    className="w-full bg-[#00BCD4] text-white p-3 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors text-center block"
                                >
                                    🔍 Find Providers
                                </Link>
                                <Link
                                    href="/community"
                                    className="w-full bg-[#1A237E] text-white p-3 rounded-lg text-sm font-medium hover:bg-[#303F9F] transition-colors text-center block"
                                >
                                    👥 Join Community
                                </Link>
                                <button className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                    📨 Send Referral
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Third Row - Service Categories (Condensed Grid) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {businessConnections.map((connection) => (
                        <div key={connection.id} className="bg-white rounded-2xl p-4 shadow-md border-2 border-[#E0F7FA] hover:border-[#00BCD4] transition-colors">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-[#00BCD4] rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-white text-lg">{connection.avatar}</span>
                                </div>
                                <h5 className="font-semibold text-[#1A237E] text-sm mb-1">{connection.name.split(' - ')[0]}</h5>
                                <p className="text-xs text-gray-600 mb-2">{connection.businessType}</p>
                                <div className="flex items-center justify-center space-x-1 mb-2">
                                    <span className="text-yellow-500 text-xs">⭐</span>
                                    <span className="text-xs">{connection.rating}</span>
                                </div>
                                <button
                                    onClick={() => handleChatRequest(connection.id)}
                                    className="w-full bg-[#00BCD4] text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-[#00ACC1] transition-colors"
                                >
                                    Chat
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fourth Row - Community Section */}
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-semibold text-[#1A237E] flex items-center">
                            <span className="mr-3">🌍</span>
                            Community Members
                        </h4>
                        <Link
                            href="/community"
                            className="bg-[#1A237E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#303F9F] transition-colors text-sm"
                        >
                            View All
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {communityMembers.slice(0, 8).map((member) => (
                            <div key={member.id} className="bg-[#E0F7FA] border border-[#00BCD4] rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-[#00BCD4] text-lg">{member.avatar}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h5 className="font-semibold text-[#1A237E] text-sm truncate">{member.name}</h5>
                                            {member.isOnline && (
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{member.businessType}</p>
                                        <p className="text-xs text-gray-500 mb-3">{member.location}</p>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleConnectMember(member.id)}
                                                className="bg-[#00BCD4] text-white px-3 py-1 rounded text-xs hover:bg-[#00ACC1] transition-colors"
                                            >
                                                Connect
                                            </button>
                                            <button
                                                onClick={() => handleChatMember(member.id)}
                                                className="bg-white text-[#00BCD4] border border-[#00BCD4] px-3 py-1 rounded text-xs hover:bg-[#00BCD4] hover:text-white transition-colors"
                                            >
                                                Chat
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fifth Row - Professional Services Sections */}
                <div className="space-y-8 mt-8">
                    
                    {/* Pre-Move Services */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg">
                        <h4 className="text-xl font-semibold text-[#1A237E] mb-6 flex items-center">
                            <span className="mr-2">📋</span>
                            Pre-Move Services
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Estate Agents */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">🏠</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Estate Agents</h5>
                                            <p className="text-sm text-gray-600">Property search & viewings</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available in your area:</span>
                                        <span className="font-semibold text-[#00BCD4]">18</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Find Estate Agents
                                    </button>
                                </div>
                            </div>

                            {/* Mortgage Brokers */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">💰</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Mortgage Brokers</h5>
                                            <p className="text-sm text-gray-600">Financial advice & mortgages</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available:</span>
                                        <span className="font-semibold text-[#00BCD4]">14</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Find Mortgage Brokers
                                    </button>
                                </div>
                            </div>

                            {/* Solicitors */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">⚖️</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Solicitors</h5>
                                            <p className="text-sm text-gray-600">Legal support & conveyancing</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available:</span>
                                        <span className="font-semibold text-[#00BCD4]">22</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Find Solicitors
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Move Day Services */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg">
                        <h4 className="text-xl font-semibold text-[#1A237E] mb-6 flex items-center">
                            <span className="mr-2">🚚</span>
                            Move Day Services
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Removal Companies */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">📦</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Removal Companies</h5>
                                            <p className="text-sm text-gray-600">Professional moving services</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">1</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available:</span>
                                        <span className="font-semibold text-[#00BCD4]">35</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Find Removal Companies
                                    </button>
                                </div>
                            </div>

                            {/* Man & Van Services */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">🚐</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Man & Van</h5>
                                            <p className="text-sm text-gray-600">Small moves & single items</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available:</span>
                                        <span className="font-semibold text-[#00BCD4]">42</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Find Man & Van
                                    </button>
                                </div>
                            </div>

                            {/* Storage Solutions */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">🏪</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Storage Solutions</h5>
                                            <p className="text-sm text-gray-600">Temporary & long-term storage</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available:</span>
                                        <span className="font-semibold text-[#00BCD4]">28</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Explore Storage
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Post-Move Services */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg">
                        <h4 className="text-xl font-semibold text-[#1A237E] mb-6 flex items-center">
                            <span className="mr-2">🏡</span>
                            Post-Move Services
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Cleaning Services */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">🧽</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Cleaning Services</h5>
                                            <p className="text-sm text-gray-600">End of tenancy & deep cleaning</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available:</span>
                                        <span className="font-semibold text-[#00BCD4]">19</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Find Cleaning Services
                                    </button>
                                </div>
                            </div>

                            {/* Utility Setup */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">⚡</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Utility Setup</h5>
                                            <p className="text-sm text-gray-600">Gas, electric, broadband & more</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available providers:</span>
                                        <span className="font-semibold text-[#00BCD4]">25</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Setup Utilities
                                    </button>
                                </div>
                            </div>

                            {/* Home Services */}
                            <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-[#00BCD4] text-xl">🔧</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-[#1A237E]">Home Services</h5>
                                            <p className="text-sm text-gray-600">Handyman, decorating & repairs</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Connected:</span>
                                        <span className="font-semibold text-[#1A237E]">0</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Available:</span>
                                        <span className="font-semibold text-[#00BCD4]">31</span>
                                    </div>
                                    <button className="w-full bg-[#00BCD4] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#00ACC1] transition-colors shadow-md">
                                        Find Home Services
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* End of Bento Grid Layout */}
            </div>

        </DashboardLayout>
    );
};
