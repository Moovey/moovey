export default function CommunityHero() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0]">
            <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                    {/* Community Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 bg-[#17B7C7] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-4xl text-white">👥</span>
                    </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Welcome to the <span className="text-[#17B7C7]">Moovey Community</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Connect with fellow movers, share experiences, get advice, and build relationships that make your moving journey easier and more enjoyable.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl mb-3">💬</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Share Experiences</h3>
                        <p className="text-gray-600 text-sm">Post about your moving journey and help others with your insights</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl mb-3">🤝</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Get Support</h3>
                        <p className="text-gray-600 text-sm">Ask questions and receive help from experienced movers</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl mb-3">🏆</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
                        <p className="text-gray-600 text-sm">Participate in the community and earn coins for your helpful contributions</p>
                    </div>
                </div>
            </div>
        </section>
    );
}