import React from 'react';
import type { HeroBannerProps } from '@/types/welcome';

const HeroBanner: React.FC<HeroBannerProps> = ({
    heroDataArray,
    heroBanners,
    currentImageIndex,
    setCurrentImageIndex
}) => {
    // Get the current hero data based on the image index
    const currentHeroData = heroDataArray[currentImageIndex] || heroDataArray[0];
    const previousImage = () => {
        setCurrentImageIndex(currentImageIndex === 0 ? heroBanners.length - 1 : currentImageIndex - 1);
    };

    const nextImage = () => {
        setCurrentImageIndex(currentImageIndex === heroBanners.length - 1 ? 0 : currentImageIndex + 1);
    };

    return (
        <section 
            className="relative overflow-hidden py-4 md:py-6 lg:py-8 min-h-[360px] flex items-center" 
            style={{ 
                background: 'linear-gradient(135deg, #8ae2eb 0%, #eafffe 100%)' 
            }}
        >
            {/* Decorative elements - responsive positioning and sizing */}
            <div className="absolute top-8 right-8 md:top-12 md:right-12 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-12 left-8 md:bottom-20 md:left-12 w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full blur-lg"></div>
            
            {/* Image Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-40">
                {heroBanners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex 
                                ? 'bg-white shadow-lg' 
                                : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={previousImage}
                className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 md:p-3 transition-all duration-300 z-40 group"
                aria-label="Previous image"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <button
                onClick={nextImage}
                className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 md:p-3 transition-all duration-300 z-40 group"
                aria-label="Next image"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-30">
                {/* Mobile and Tablet Layout: Image on top, content below */}
                <div className="flex flex-col lg:hidden items-center space-y-3 md:space-y-4 h-full">
                    {/* Image Container - Mobile/Tablet */}
                    <div className="w-full flex justify-center flex-1 items-center">
                        <div className="relative w-full max-w-xs md:max-w-sm h-32 md:h-40">
                            <img
                                src={heroBanners[currentImageIndex]}
                                alt={currentHeroData.title}
                                className="w-full h-full object-contain transition-all duration-1000 ease-in-out"
                            />
                        </div>
                    </div>
                    
                    {/* Content Container - Mobile/Tablet */}
                    <div className="text-center space-y-2 sm:space-y-3 w-full">
                        <div className="space-y-1 sm:space-y-2">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-2xl px-2">
                                {currentHeroData.title}
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed max-w-xl mx-auto drop-shadow-md px-4">
                                {currentHeroData.description}
                            </p>
                        </div>
                        
                        <div className="flex justify-center pt-1">
                            <a 
                                href={currentHeroData.ctaLink}
                                className="bg-[#17B7C7] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {currentHeroData.ctaText}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout: Side by side */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12 items-center h-full">
                    {/* Left Column - Content (Desktop) */}
                    <div className="text-left space-y-4 xl:space-y-5">
                        <div className="space-y-3 xl:space-y-4">
                            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
                                {currentHeroData.title}
                            </h1>
                            <p className="text-base xl:text-lg 2xl:text-xl text-white/90 leading-relaxed drop-shadow-md">
                                {currentHeroData.description}
                            </p>
                        </div>
                        
                        <div className="flex justify-start pt-2">
                            <a 
                                href={currentHeroData.ctaLink}
                                className="bg-[#17B7C7] text-white px-8 xl:px-10 py-3 xl:py-4 rounded-full font-bold text-base xl:text-lg hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {currentHeroData.ctaText}
                            </a>
                        </div>
                    </div>

                    {/* Right Column - Image (Desktop) */}
                    <div className="flex justify-center lg:justify-end items-center h-full">
                        <div className="relative max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl h-56 lg:h-64 xl:h-72 2xl:h-80">
                            <img
                                src={heroBanners[currentImageIndex]}
                                alt={currentHeroData.title}
                                className="w-full h-full object-contain transition-all duration-1000 ease-in-out"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;