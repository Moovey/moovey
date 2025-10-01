import { Head } from '@inertiajs/react';
import { useState } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import {
    CommunityHero,
    CommunityFeed,
    CommunityStats,
    CommunityGuidelines,
    CommunityCTA
} from '@/components/community';
import { CommunityPost } from '@/types/community';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface PaginationInfo {
    hasMore: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
}

interface CommunityProps {
    initialPosts: CommunityPost[];
    pagination: PaginationInfo;
}

export default function Community({ initialPosts = [], pagination }: CommunityProps) {
    const { auth } = usePage<SharedData>().props;
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialPosts);
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>(pagination);

    return (
        <>
            <Head title="Community - Connect with Fellow Movers">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800,900" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
                <GlobalHeader currentPage="community" />

                <CommunityHero />
                <CommunityFeed 
                    posts={communityPosts} 
                    onPostsChange={setCommunityPosts}
                    isAuthenticated={!!auth?.user}
                    pagination={paginationInfo}
                    onPaginationChange={setPaginationInfo}
                    currentUser={auth?.user ? {
                        ...auth.user,
                        role: auth.user.role || 'user'
                    } : undefined}
                />
                <CommunityStats />
                <CommunityGuidelines />
                <CommunityCTA />

                <WelcomeFooter />
            </div>
        </>
    );
}
