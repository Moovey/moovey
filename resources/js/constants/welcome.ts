import type { HeroData, ValueProp } from '@/types/welcome';

export const HERO_DATA_ARRAY: HeroData[] = [
    {
        title: "New to Moving House?",
        description: "Learn how to move seamlessly with our school of moovology. The complete beginner's guide to moving house.",
        ctaText: "Start Your Free Move Plan",
        ctaLink: "/register"
    },
    {
        title: "Make Your Move!",
        description: "With our custom task builder and free toolbox to help you make your move a success.",
        ctaText: "Start Your Free Move Plan",
        ctaLink: "/register"
    },
    {
        title: "Join the Community",
        description: "And engage with other house movers, professionals and unlock loads of cool features.",
        ctaText: "Explore Trade Directory",
        ctaLink: "/trade-directory"
    }
];

export const VALUE_PROPS: ValueProp[] = [
    {
        id: 'learn',
        title: 'Learn & Plan',
        description: 'Learn how to move seamlessly with our school of movingology. The complete beginners guide to moving house.',
        color: 'blue',
        icon: 'moovey-crest',
        link: '/academy',
        linkText: 'Learn how to move'
    },
    {
        id: 'connect',
        title: 'Find Professionals',
        description: 'Find verified moving professionals, compare quotes, and connect with trusted service providers to save time and money.',
        color: 'green',
        icon: 'professionals',
        link: '/trade-directory',
        linkText: 'Browse Directory'
    },
    {
        id: 'track',
        title: 'Track & Engage',
        description: 'Stay on top of your move with our progress tracking tools and engage with a supportive community of fellow movers.',
        color: 'purple',
        icon: 'tasks',
        link: '/community',
        linkText: 'See Community Feed'
    }
];