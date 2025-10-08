<?php

if (!function_exists('avatar_url')) {
    /**
     * Generate the correct URL for serving avatar files
     * 
     * @param string|null $avatarPath The avatar path stored in database
     * @return string|null
     */
    function avatar_url($avatarPath)
    {
        if (!$avatarPath) {
            return null;
        }
        
        // Extract just the filename from the path
        $filename = basename($avatarPath);
        
        // Return the new file serving route
        return url('/files/avatars/' . $filename);
    }
}

if (!function_exists('storage_file_url')) {
    /**
     * Generate the correct URL for serving any storage files
     * 
     * @param string $filePath The file path in storage
     * @return string
     */
    function storage_file_url($filePath)
    {
        // Split the path to get folder and filename
        $pathParts = explode('/', $filePath);
        $filename = array_pop($pathParts);
        $folder = implode('/', $pathParts);
        
        // Return the new file serving route
        return url('/files/' . $folder . '/' . $filename);
    }
}