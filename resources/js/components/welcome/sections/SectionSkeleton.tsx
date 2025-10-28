import React from 'react';
import type { SectionSkeletonProps } from '@/types/welcome';

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ height = 'h-64' }) => (
    <div className={`${height} bg-gray-100 animate-pulse rounded-xl`}>
        <div className="p-8 space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
        </div>
    </div>
);

export default SectionSkeleton;