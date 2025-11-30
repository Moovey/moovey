import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import HousemoverNavigation from '@/components/housemover/HousemoverNavigation';
import { useMoveProgress } from '@/hooks/useMoveProgress';
import SavedProvidersSection from '@/components/connections/SavedProvidersSection';
import ConnectionRequestsSection from '@/components/connections/ConnectionRequestsSection';
import RecommendedConnectionsSection from '@/components/connections/RecommendedConnectionsSection';
import NetworkStatsSection from '@/components/connections/NetworkStatsSection';
import QuickActionsSection from '@/components/connections/QuickActionsSection';
import BusinessConnectionsGrid from '@/components/connections/BusinessConnectionsGrid';
import CommunityMembersSection from '@/components/connections/CommunityMembersSection';
import ProfessionalServicesSection from '@/components/connections/ProfessionalServicesSection';

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
    friendship_id: number;
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
    business_profile_id: number;
    name: string;
    avatar: string;
    logo_url?: string | null;
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

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSavedProviders {
    current_page: number;
    data: SavedProvider[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLinks[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface ConnectionsProps {
    savedProviders: PaginatedSavedProviders;
    connectionRequests: ConnectionRequest[];
}

export default function Connections({ savedProviders, connectionRequests }: ConnectionsProps) {
    const { taskData } = useMoveProgress();

    // Listen for friendship updates (when new requests are sent from other pages)
    useEffect(() => {
        const handleFriendshipUpdate = () => {
            router.reload({ only: ['connectionRequests'] });
        };

        window.addEventListener('friendshipUpdated', handleFriendshipUpdate);
        
        return () => {
            window.removeEventListener('friendshipUpdated', handleFriendshipUpdate);
        };
    }, []);

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

    // Remove hardcoded connectionRequests - now using real data from backend props

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

    // Remove the hardcoded savedProviders state - now using initialSavedProviders from backend

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

    const handleAcceptRequest = async (requestId: string) => {
        const request = connectionRequests.find(r => r.id === requestId);
        if (!request) return;

        const requesterName = request.name.split(' - ')[0];

        router.post('/api/friendships/accept', 
            { friend_id: requestId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Show success notification
                    toast.success(`You are now connected with ${requesterName}! 🎉`, {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    // Reload connection requests to update the list
                    router.reload({ only: ['connectionRequests'] });
                },
                onError: (errors) => {
                    console.error('Error accepting request:', errors);
                    toast.error('Failed to accept connection request. Please try again.', {
                        position: "top-right",
                        autoClose: 4000,
                    });
                }
            }
        );
    };

    const handleDeclineRequest = async (requestId: string) => {
        const request = connectionRequests.find(r => r.id === requestId);
        if (!request) return;

        const requesterName = request.name.split(' - ')[0];

        router.post('/api/friendships/decline', 
            { friend_id: requestId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Show info notification
                    toast.info(`Connection request from ${requesterName} declined`, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    // Reload connection requests to update the list
                    router.reload({ only: ['connectionRequests'] });
                },
                onError: (errors) => {
                    console.error('Error declining request:', errors);
                    toast.error('Failed to decline connection request. Please try again.', {
                        position: "top-right",
                        autoClose: 4000,
                    });
                }
            }
        );
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

    // Service categories data
    const preMoveServices = [
        {
            icon: 'home',
            title: 'Estate Agents',
            description: 'Property search & viewings',
            connected: 0,
            available: 18,
            buttonText: 'Find Estate Agents'
        },
        {
            icon: 'currency',
            title: 'Mortgage Brokers',
            description: 'Financial advice & mortgages',
            connected: 0,
            available: 14,
            buttonText: 'Find Mortgage Brokers'
        },
        {
            icon: 'scale',
            title: 'Solicitors',
            description: 'Legal support & conveyancing',
            connected: 0,
            available: 22,
            buttonText: 'Find Solicitors'
        }
    ];

    const moveDayServices = [
        {
            icon: 'truck',
            title: 'Removal Companies',
            description: 'Professional moving services',
            connected: 1,
            available: 35,
            buttonText: 'Find Removal Companies'
        },
        {
            icon: 'van',
            title: 'Man & Van',
            description: 'Small moves & single items',
            connected: 0,
            available: 42,
            buttonText: 'Find Man & Van'
        },
        {
            icon: 'warehouse',
            title: 'Storage Solutions',
            description: 'Temporary & long-term storage',
            connected: 0,
            available: 28,
            buttonText: 'Explore Storage'
        }
    ];

    const postMoveServices = [
        {
            icon: 'sparkles',
            title: 'Cleaning Services',
            description: 'End of tenancy & deep cleaning',
            connected: 0,
            available: 19,
            buttonText: 'Find Cleaning Services'
        },
        {
            icon: 'lightning',
            title: 'Utility Setup',
            description: 'Gas, electric, broadband & more',
            connected: 0,
            available: 25,
            buttonText: 'Setup Utilities'
        },
        {
            icon: 'tools',
            title: 'Home Services',
            description: 'Handyman, decorating & repairs',
            connected: 0,
            available: 31,
            buttonText: 'Find Home Services'
        }
    ];

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
                    <SavedProvidersSection 
                        savedProviders={savedProviders}
                    />
                    <ConnectionRequestsSection 
                        connectionRequests={connectionRequests}
                        onAcceptRequest={handleAcceptRequest}
                        onDeclineRequest={handleDeclineRequest}
                    />
                </div>

                {/* Second Row - Secondary Sections */}
                <div className="grid grid-cols-12 gap-6 mb-6">
                    <RecommendedConnectionsSection 
                        recommendedConnections={recommendedConnections}
                        onConnectRecommended={handleConnectRecommended}
                    />
                    <NetworkStatsSection 
                        totalConnections={12}
                        savedProvidersCount={savedProviders.total}
                        activeChats={8}
                        pendingRequests={connectionRequests.length}
                    />
                    <QuickActionsSection />
                </div>

                {/* Third Row - Service Categories (Condensed Grid) */}
                <BusinessConnectionsGrid 
                    businessConnections={businessConnections}
                    onChatRequest={handleChatRequest}
                />

                {/* Fourth Row - Community Section */}
                <CommunityMembersSection 
                    communityMembers={communityMembers}
                    onConnectMember={handleConnectMember}
                    onChatMember={handleChatMember}
                />

                {/* Fifth Row - Professional Services Sections */}
                <div className="space-y-8 mt-8">
                    <ProfessionalServicesSection 
                        title="Pre-Move Services"
                        sectionIcon="📋"
                        categories={preMoveServices}
                    />
                    <ProfessionalServicesSection 
                        title="Move Day Services"
                        sectionIcon="🚚"
                        categories={moveDayServices}
                    />
                    <ProfessionalServicesSection 
                        title="Post-Move Services"
                        sectionIcon="🏡"
                        categories={postMoveServices}
                    />
                </div>
                {/* End of Bento Grid Layout */}
            </div>

        </DashboardLayout>
    );
};
