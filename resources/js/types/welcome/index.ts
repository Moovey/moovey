// Welcome page types and interfaces

export interface CachedStats {
    activeMembers: string;
    dailyPosts: string;
    helpRate: string;
    successfulMoves: string;
    moneySaved: string;
    satisfactionRate: string;
    averageRating: string;
    lastUpdated: number;
}

export interface HeroData {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
}

export interface ValueProp {
    id: string;
    title: string;
    description: string;
    color: 'blue' | 'green' | 'purple';
    icon: 'book' | 'users' | 'chat' | 'moovey-crest' | 'professionals' | 'tasks';
    link: string;
    linkText: string;
}

export interface HeroBannerProps {
    heroDataArray: HeroData[];
    heroBanners: string[];
    currentImageIndex: number;
    setCurrentImageIndex: (index: number) => void;
}

export interface ValuePropsectionProps {
    valueProps: ValueProp[];
}

export interface StatsSubset {
    activeMembers?: string;
    dailyPosts?: string;
    helpRate?: string;
    successfulMoves?: string;
    moneySaved?: string;
    satisfactionRate?: string;
    averageRating?: string;
}

export interface SectionSkeletonProps {
    height?: string;
}