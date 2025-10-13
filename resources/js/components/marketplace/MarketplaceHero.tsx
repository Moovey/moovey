import { MarketplaceStats } from './types';

interface MarketplaceHeroProps {
    stats: MarketplaceStats;
}

export default function MarketplaceHero({ stats }: MarketplaceHeroProps) {
    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#17B7C7] to-[#1A237E]">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    🛒 Moovey Marketplace
                </h1>
                <p className="text-xl text-white/90 mb-6">
                    Find great deals on preloved items from people who are moving and decluttering
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="bg-white/20 rounded-lg px-6 py-3">
                        <div className="text-2xl font-bold text-white">{stats.activeListings}</div>
                        <div className="text-white/80 text-sm">Active Listings</div>
                    </div>
                    <div className="bg-white/20 rounded-lg px-6 py-3">
                        <div className="text-2xl font-bold text-white">{stats.categoriesCount}</div>
                        <div className="text-white/80 text-sm">Categories</div>
                    </div>
                    <div className="bg-white/20 rounded-lg px-6 py-3">
                        <div className="text-2xl font-bold text-white">Free</div>
                        <div className="text-white/80 text-sm">Listing Fee</div>
                    </div>
                </div>
            </div>
        </section>
    );
}