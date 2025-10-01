interface Article {
    title: string;
    description: string;
    image: string;
}

interface ArticlesSectionProps {
    articles: Article[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
    return (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">What to Read Next</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {articles.map((article, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            {/* Article Image */}
                            <div className="h-32 sm:h-40 md:h-48 bg-orange-200 flex items-center justify-center">
                                <div className="text-4xl sm:text-5xl md:text-6xl text-orange-700">📦</div>
                            </div>
                            
                            {/* Article Content */}
                            <div className="p-4 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{article.title}</h3>
                                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{article.description}</p>
                                <button className="bg-[#17B7C7] text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors text-sm sm:text-base w-full sm:w-auto">
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