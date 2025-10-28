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
            className="h-[50vh] md:h-[60vh] relative overflow-hidden flex items-center transition-all duration-1000 ease-in-out" 
            style={{ 
                background: 'linear-gradient(135deg, #8ae2eb 0%, #eafffe 100%)' 
            }}
        >
            {/* Hero image positioned on top of gradient background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-10 transition-all duration-1000 ease-in-out"
                style={{ backgroundImage: `url('${heroBanners[currentImageIndex]}')` }}
            ></div>
            
            {/* Subtle overlay for text readability */}
            <div className="absolute inset-0 bg-black/10 z-20"></div>
            
            {/* Decorative elements - responsive positioning and sizing */}
            <div className="absolute top-8 right-8 md:top-12 md:right-12 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full blur-xl z-30"></div>
            <div className="absolute bottom-12 left-8 md:bottom-20 md:left-12 w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full blur-lg z-30"></div>
            
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
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 w-full py-8 md:py-16 relative z-30">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Left Column - Content */}
                    <div className="text-center lg:text-left space-y-4 sm:space-y-6 relative">
                        <div className="space-y-3 sm:space-y-4">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
                                {currentHeroData.title}
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-md px-2 sm:px-0">
                                {currentHeroData.description}
                            </p>
                        </div>
                        
                        <div className="flex justify-center lg:justify-start pt-4">
                            <a 
                                href={currentHeroData.ctaLink}
                                className="bg-[#17B7C7] text-white px-8 sm:px-10 lg:px-12 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {currentHeroData.ctaText}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;