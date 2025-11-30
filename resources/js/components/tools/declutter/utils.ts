// Helper function to get the correct image URL
export const getImageUrl = (imagePath: string): string => {
    // For cloud hosting, try the Laravel route fallback first as it's more likely to work
    const url = `/storage-file/${imagePath}`;
    return url;
};

// Enhanced error handler that tries alternative paths
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, imagePath: string): void => {
    const target = e.target as HTMLImageElement;
    
    // Alternative paths to try if the primary path fails
    const alternativePaths = [
        `/storage/${imagePath}`, // Standard Laravel storage link
        `/public/storage/${imagePath}`, // Direct public path
        `/${imagePath}` // Direct image path
    ];
    
    // Get the current attempt from a data attribute
    const currentAttempt = parseInt(target.dataset.attempt || '0');
    
    if (currentAttempt < alternativePaths.length) {
        // Try the next alternative path
        target.dataset.attempt = (currentAttempt + 1).toString();
        target.src = alternativePaths[currentAttempt];
        // Only log if we're in development mode
        if (process.env.NODE_ENV === 'development') {
            console.log(`Trying alternative path ${currentAttempt + 1}: ${alternativePaths[currentAttempt]} for image: ${imagePath}`);
        }
    } else {
        // All paths failed, show fallback
        console.error(`All image paths failed for: ${imagePath}`);
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl text-gray-400">📦</div>';
        }
    }
};
