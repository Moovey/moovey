import { MarketplaceStats } from './types';

interface MarketplaceHeroProps {
    stats: MarketplaceStats;
}

export default function MarketplaceHero({ stats }: MarketplaceHeroProps) {
    return (
        <section 
            className="pt-4 px-3 xs:pt-6 xs:px-4 sm:pt-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative bg-cover bg-center bg-no-repeat min-h-[360px] flex flex-col"
            style={{
                background: `linear-gradient(135deg, #8ae2eb 0%, #eafffe 100%), url('/images/marketplace-background.webp')`,
                backgroundSize: 'cover, cover',
                backgroundPosition: 'center, center',
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundBlendMode: 'overlay'
            }}
        >
            {/* Text Content Container with horizontal padding only */}
            <div className="max-w-7xl mx-auto w-full relative z-20 flex-grow flex flex-col">
                {/* Text Content at Top Left - Compact Responsive */}
                <div className="text-left pt-2 xs:pt-3 sm:pt-4 md:pt-6 lg:pt-8">
                    <div className="inline-block bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 sm:px-6 sm:py-3">
                        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-700 mb-1 sm:mb-2 tracking-tight leading-tight" 
                            style={{ 
                                fontFamily: '"Comic Sans MS", cursive, system-ui',
                                textShadow: '2px 2px 0px rgba(255,255,255,0.3), 4px 4px 0px rgba(255,255,255,0.1)',
                                transform: 'rotate(-1.5deg)'
                            }}
                        >
                            <span className="inline-block">Explore Our Marketplace</span>
                        </h1>
                    </div>
                </div>
                
                {/* Compact Spacer to push image to bottom */}
                <div className="flex-grow min-h-[10px] sm:min-h-[15px]"></div>
            </div>
            
            {/* Banner Image at Absolute Bottom - Mobile Compact, Desktop Large */}
            <div className="w-full flex justify-center items-center absolute bottom-0 left-0 right-0 z-10">
                {/* Mobile Banner Image */}
                <img 
                    src="/images/marketplace-banner.webp" 
                    alt="Marketplace Banner" 
                    className="sm:hidden h-64 xs:h-72 w-auto object-contain max-w-[95%] block mx-auto"
                    style={{
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }}
                />
                {/* Desktop Banner Image */}
                <img 
                    src="/images/marketplace-banner.webp" 
                    alt="Marketplace Banner" 
                    className="hidden sm:block h-48 md:h-56 lg:h-64 xl:h-72 2xl:h-80 w-auto object-contain max-w-[90%] md:max-w-[85%] lg:max-w-full mx-auto"
                    style={{
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }}
                />
            </div>
        </section>
    );
}