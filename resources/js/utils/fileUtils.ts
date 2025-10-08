/**
 * Utility functions for handling file URLs in a way that works with cloud hosting
 */

/**
 * Get the correct avatar URL for display
 * @param avatarPath - The avatar path from the user object
 * @returns The correct URL to display the avatar
 */
export function getAvatarUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) {
        return null;
    }
    
    // Extract just the filename from the path
    const filename = avatarPath.split('/').pop();
    
    // Return the new file serving route
    return `/files/avatars/${filename}`;
}

/**
 * Get the correct URL for any storage file
 * @param filePath - The file path from storage
 * @returns The correct URL to display the file
 */
export function getStorageFileUrl(filePath: string): string {
    // Split the path to get folder and filename
    const pathParts = filePath.split('/');
    const filename = pathParts.pop();
    const folder = pathParts.join('/');
    
    // Return the new file serving route
    return `/files/${folder}/${filename}`;
}

/**
 * Generate fallback avatar URL using UI Avatars service
 * @param name - User's name
 * @param size - Avatar size (default: 128)
 * @returns UI Avatars URL
 */
export function getFallbackAvatarUrl(name: string, size: number = 128): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00BCD4&color=white&size=${size}`;
}