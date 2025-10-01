import React from 'react';

interface Article {
    id: string;
    title: string;
    description: string;
    category: string;
    gradient: string;
    icon: 'boxes' | 'truck' | 'home';
}

interface ArticlesSectionProps {
    articles?: Article[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
    // Default articles if none provided
    const defaultArticles: Article[] = [
        {
            id: '1',
            title: 'Top 5 Packing Tips for a Stress-Free Move',
            description: 'Master your packing strategies to ensure your belongings arrive safely and your move stays organized.',
            category: 'Moving Tips',
            gradient: 'from-blue-50 to-blue-100',
            icon: 'boxes'
        },
        {
            id: '2',
            title: 'How to Choose the Right Moving Company',
            description: 'Essential strategies to find reliable movers and ensure your belongings are in safe hands.',
            category: 'Moving Companies',
            gradient: 'from-green-50 to-green-100',
            icon: 'truck'
        },
        {
            id: '3',
            title: 'Settling Into Your New Home',
            description: 'Essential steps to settle in quickly and make your new house feel like home.',
            category: 'New Home',
            gradient: 'from-purple-50 to-purple-100',
            icon: 'home'
        }
    ];

    const articlesToShow = articles || defaultArticles;

    const renderIcon = (iconType: 'boxes' | 'truck' | 'home') => {
        // For now, using the same box grid pattern for all
        // In the future, you could add different icons for each type
        return (
            <div className="flex justify-center mb-2">
                <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-amber-200 rounded-sm border border-amber-300"></div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        What to Read Next
                    </h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {articlesToShow.map((article) => (
                        <div key={article.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className={`h-48 bg-gradient-to-br ${article.gradient} flex items-center justify-center relative`}>
                                <div className="text-center">
                                    {renderIcon(article.icon)}
                                    <div className="text-sm text-gray-600 font-medium">{article.category}</div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                    {article.description}
                                </p>
                                <button className="bg-[#00BCD4] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#0097A7] transition-colors">
                                    Read More
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}