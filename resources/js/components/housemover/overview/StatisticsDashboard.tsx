import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

interface Statistic {
    id: string;
    title: string;
    value: number | string;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    icon: string;
    category: string;
    description?: string;
    unit?: string;
    target?: number;
}

interface ChartData {
    labels: string[];
    values: number[];
    type: 'line' | 'bar' | 'pie';
}

interface StatisticsDashboardProps {
    statistics?: Statistic[];
    chartData?: ChartData[];
    timeRange?: '7d' | '30d' | '90d' | '1y';
    onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export default function StatisticsDashboard({
    statistics = [],
    chartData = [],
    timeRange = '30d',
    onTimeRangeChange
}: StatisticsDashboardProps) {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [selectedStat, setSelectedStat] = useState<string | null>(null);

    // Default statistics if none provided
    const defaultStats: Statistic[] = [
        {
            id: 'tasks-completed',
            title: 'Tasks Completed',
            value: 24,
            change: 12,
            changeType: 'increase',
            icon: '✅',
            category: 'tasks',
            description: 'Total moving tasks completed',
            target: 50
        },
        {
            id: 'progress-overall',
            title: 'Overall Progress',
            value: '78%',
            change: 5,
            changeType: 'increase',
            icon: '📊',
            category: 'progress',
            description: 'House move progress tracker'
        },
        {
            id: 'money-saved',
            title: 'Money Saved',
            value: 1247,
            change: 8,
            changeType: 'increase',
            icon: '💰',
            category: 'financial',
            description: 'Total savings from vouchers and deals',
            unit: '$'
        },
        {
            id: 'days-remaining',
            title: 'Days to Move',
            value: 45,
            change: -1,
            changeType: 'decrease',
            icon: '📅',
            category: 'timeline',
            description: 'Days remaining until moving date'
        },
        {
            id: 'lessons-completed',
            title: 'Lessons Completed',
            value: 8,
            change: 3,
            changeType: 'increase',
            icon: '📚',
            category: 'learning',
            description: 'Academy lessons completed',
            target: 15
        },
        {
            id: 'community-points',
            title: 'Community Points',
            value: 2840,
            change: 150,
            changeType: 'increase',
            icon: '⭐',
            category: 'community',
            description: 'Points earned from community activities'
        }
    ];

    const displayStats = statistics.length > 0 ? statistics : defaultStats;
    const categories = ['all', ...new Set(displayStats.map(stat => stat.category))];
    const filteredStats = activeCategory === 'all' 
        ? displayStats 
        : displayStats.filter(stat => stat.category === activeCategory);

    const formatValue = (stat: Statistic): string => {
        if (typeof stat.value === 'string') return stat.value;
        if (stat.unit === '$') return `$${stat.value.toLocaleString()}`;
        if (stat.unit === '%') return `${stat.value}%`;
        return stat.value.toLocaleString();
    };

    const getChangeColor = (changeType?: string): string => {
        switch (changeType) {
            case 'increase': return 'text-green-600';
            case 'decrease': return 'text-red-600';
            case 'neutral': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getChangeIcon = (changeType?: string): string => {
        switch (changeType) {
            case 'increase': return '↗️';
            case 'decrease': return '↘️';
            case 'neutral': return '→';
            default: return '';
        }
    };

    const getCategoryColor = (category: string): string => {
        const colors: Record<string, string> = {
            'tasks': 'bg-blue-100 text-blue-800',
            'progress': 'bg-green-100 text-green-800',
            'financial': 'bg-yellow-100 text-yellow-800',
            'timeline': 'bg-purple-100 text-purple-800',
            'learning': 'bg-indigo-100 text-indigo-800',
            'community': 'bg-pink-100 text-pink-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getProgressPercentage = (stat: Statistic): number => {
        if (!stat.target || typeof stat.value !== 'number') return 0;
        return Math.min((stat.value / stat.target) * 100, 100);
    };

    return (
        <section className="bg-white rounded-xl shadow-lg p-6">
            {/* Statistics Dashboard Section - Blue Container */}
            <div className="bg-[#E3F2FD] rounded-xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                            <span className="text-3xl mr-3">📊</span>
                            Statistics Dashboard
                        </h2>
                        <p className="text-lg font-medium text-gray-700">
                            Track your moving progress and achievements
                        </p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                        {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => onTimeRangeChange && onTimeRangeChange(range)}
                                className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                                    timeRange === range
                                        ? 'bg-[#1A237E] text-white'
                                        : 'text-[#1A237E] hover:bg-[#E3F2FD]'
                                }`}
                            >
                                {range === '7d' && '7 Days'}
                                {range === '30d' && '30 Days'}
                                {range === '90d' && '90 Days'}
                                {range === '1y' && '1 Year'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                activeCategory === category
                                    ? 'bg-[#1A237E] text-white shadow-sm'
                                    : 'bg-white text-[#1A237E] hover:bg-[#E3F2FD] border border-gray-200'
                            }`}
                        >
                            {category === 'all' ? 'All Stats' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredStats.map((stat) => (
                        <div
                            key={stat.id}
                            onClick={() => setSelectedStat(selectedStat === stat.id ? null : stat.id)}
                            className={`bg-white rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                selectedStat === stat.id ? 'border-2 border-[#1A237E]' : 'border border-gray-200'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-[#E3F2FD] flex items-center justify-center text-2xl">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#1A237E]">{stat.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(stat.category)}`}>
                                            {stat.category}
                                        </span>
                                    </div>
                                </div>
                                
                                {stat.change !== undefined && (
                                    <div className={`text-sm font-semibold ${getChangeColor(stat.changeType)}`}>
                                        {getChangeIcon(stat.changeType)} {Math.abs(stat.change)}
                                        {stat.changeType !== 'neutral' && (
                                            <span className="text-xs ml-1">
                                                ({timeRange})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mb-3">
                                <div className="text-3xl font-bold text-[#1A237E] mb-1">
                                    {formatValue(stat)}
                                </div>
                                {stat.description && (
                                    <p className="text-sm text-gray-600">{stat.description}</p>
                                )}
                            </div>

                            {/* Progress Bar for stats with targets */}
                            {stat.target && typeof stat.value === 'number' && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{stat.value} / {stat.target}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-[#1A237E] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${getProgressPercentage(stat)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Expanded Details */}
                            {selectedStat === stat.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Category:</span>
                                            <span className="font-medium">{stat.category}</span>
                                        </div>
                                        {stat.change !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Change ({timeRange}):</span>
                                                <span className={`font-medium ${getChangeColor(stat.changeType)}`}>
                                                    {stat.changeType === 'increase' ? '+' : stat.changeType === 'decrease' ? '-' : ''}
                                                    {Math.abs(stat.change)}
                                                </span>
                                            </div>
                                        )}
                                        {stat.target && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Target:</span>
                                                <span className="font-medium">{stat.target}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Quick Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Performance Summary */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                            <span className="text-xl mr-2">🎯</span>
                            Performance Summary
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-600">📈</span>
                                    <span className="text-sm font-medium">Improving Areas</span>
                                </div>
                                <span className="text-sm font-bold text-green-600">
                                    {filteredStats.filter(s => s.changeType === 'increase').length}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span className="text-red-600">📉</span>
                                    <span className="text-sm font-medium">Declining Areas</span>
                                </div>
                                <span className="text-sm font-bold text-red-600">
                                    {filteredStats.filter(s => s.changeType === 'decrease').length}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span className="text-blue-600">🎯</span>
                                    <span className="text-sm font-medium">Goals with Targets</span>
                                </div>
                                <span className="text-sm font-bold text-blue-600">
                                    {filteredStats.filter(s => s.target).length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements & Milestones */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                            <span className="text-xl mr-2">🏆</span>
                            Recent Achievements
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                <span className="text-2xl">🎉</span>
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">Task Master</div>
                                    <div className="text-xs text-gray-600">Completed 25+ tasks</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                <span className="text-2xl">💰</span>
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">Money Saver</div>
                                    <div className="text-xs text-gray-600">Saved over $1000</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                <span className="text-2xl">📚</span>
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">Learning Enthusiast</div>
                                    <div className="text-xs text-gray-600">Completed 8 lessons</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link
                        href="/analytics/detailed"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">📊</span>
                        <span>Detailed Analytics</span>
                    </Link>
                    
                    <Link
                        href="/reports/export"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">📄</span>
                        <span>Export Report</span>
                    </Link>
                    
                    <Link
                        href="/goals/set"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">🎯</span>
                        <span>Set Goals</span>
                    </Link>
                    
                    <Link
                        href="/achievements"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">🏆</span>
                        <span>Achievements</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}