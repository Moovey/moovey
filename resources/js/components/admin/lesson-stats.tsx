import React, { memo } from 'react';

interface Lesson {
    id: number;
    title: string;
    description: string;
    lesson_stage: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    status: 'Draft' | 'Published' | 'Archived';
    content_file_path?: string;
    thumbnail_file_path?: string;
    content_file_url?: string;
    thumbnail_file_url?: string;
    created_at: string;
    updated_at: string;
}

interface LessonStatsProps {
    lessons: Lesson[];
}

const LessonStats = memo(function LessonStats({ lessons }: LessonStatsProps) {
    const stats = React.useMemo(() => {
        const total = lessons.length;
        const published = lessons.filter(l => l.status === 'Published').length;
        const drafts = lessons.filter(l => l.status === 'Draft').length;
        const archived = lessons.filter(l => l.status === 'Archived').length;
        const beginner = lessons.filter(l => l.difficulty === 'Beginner').length;
        const intermediate = lessons.filter(l => l.difficulty === 'Intermediate').length;
        const advanced = lessons.filter(l => l.difficulty === 'Advanced').length;
        
        // Calculate average duration
        const durations = lessons
            .map(l => l.duration)
            .filter(d => d && d.includes('min'))
            .map(d => parseInt(d.replace(/\D/g, '')))
            .filter(d => !isNaN(d));
        
        const avgDuration = durations.length > 0 
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0;

        return {
            total,
            published,
            drafts,
            archived,
            beginner,
            intermediate,
            advanced,
            avgDuration
        };
    }, [lessons]);

    const statCards = [
        {
            icon: '📚',
            value: stats.total,
            label: 'Total Lessons',
            bgColor: 'bg-blue-500'
        },
        {
            icon: '✅',
            value: stats.published,
            label: 'Published',
            bgColor: 'bg-green-500'
        },
        {
            icon: '📝',
            value: stats.drafts,
            label: 'Drafts',
            bgColor: 'bg-yellow-500'
        },
        {
            icon: '📦',
            value: stats.archived,
            label: 'Archived',
            bgColor: 'bg-gray-500'
        },
        {
            icon: '🟢',
            value: stats.beginner,
            label: 'Beginner',
            bgColor: 'bg-green-600'
        },
        {
            icon: '🟡',
            value: stats.intermediate,
            label: 'Intermediate',
            bgColor: 'bg-yellow-600'
        },
        {
            icon: '🔴',
            value: stats.advanced,
            label: 'Advanced',
            bgColor: 'bg-red-600'
        },
        {
            icon: '⏱️',
            value: stats.avgDuration,
            label: 'Avg Duration (min)',
            bgColor: 'bg-purple-500'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center text-white text-lg mr-3`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

export default LessonStats;