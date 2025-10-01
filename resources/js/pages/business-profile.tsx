import { Head } from '@inertiajs/react';
import BusinessProfileView from '@/components/trade-directory/BusinessProfileView';

interface BusinessProfilePageProps {
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

export default function BusinessProfilePage({ profile }: BusinessProfilePageProps) {
    return <BusinessProfileView profile={profile} />;
}