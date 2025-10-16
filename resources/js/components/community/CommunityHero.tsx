export default function CommunityHero() {
    return (
        <section className="py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left">
                    <span className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-0 sm:mr-3 lg:mr-4">👥</span>
                    <div className="space-y-1 sm:space-y-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                            <span className="text-[#17B7C7]">Moovey Community</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-medium">
                            Connect, Share, Support
                        </p>
                    </div>
                </div>
                
                {/* Mobile-friendly subtitle */}
                <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of movers sharing experiences, tips, and support throughout their moving journey
                    </p>
                </div>
            </div>
        </section>
    );
}