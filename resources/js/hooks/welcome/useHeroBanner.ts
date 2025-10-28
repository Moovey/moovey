import { useState, useEffect, useMemo } from 'react';

export const useHeroBanner = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Memoized hero banner images
    const heroBanners = useMemo(() => [
        '/images/hero-banner2.png',
        '/images/hero-banner3.png',
        // Add more banner images here if needed
    ], []);

    // Auto-rotate hero banners
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === heroBanners.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [heroBanners.length]);

    // Preload images
    useEffect(() => {
        const preloadImages = () => {
            heroBanners.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        };

        preloadImages();
    }, [heroBanners]);

    const nextImage = () => {
        setCurrentImageIndex(currentImageIndex === heroBanners.length - 1 ? 0 : currentImageIndex + 1);
    };

    const previousImage = () => {
        setCurrentImageIndex(currentImageIndex === 0 ? heroBanners.length - 1 : currentImageIndex - 1);
    };

    const goToImage = (index: number) => {
        setCurrentImageIndex(index);
    };

    return {
        heroBanners,
        currentImageIndex,
        nextImage,
        previousImage,
        goToImage,
        setCurrentImageIndex
    };
};