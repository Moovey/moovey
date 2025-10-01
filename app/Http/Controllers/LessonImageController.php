<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LessonImageController extends Controller
{
    public function upload(Request $request)
    {
        Log::info('Image upload request received', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user()?->role,
            'has_file' => $request->hasFile('image'),
            'request_files' => $request->allFiles()
        ]);
        
        // Check if user is admin
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            Log::warning('Image upload failed: Admin access required', [
                'user_id' => Auth::id(),
                'user_role' => Auth::user()?->role ?? 'not authenticated'
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Admin access required'
            ], 403);
        }

        Log::info('Admin check passed, validating image...');

        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        Log::info('Image validation passed');

        try {
            $image = $request->file('image');
            Log::info('Image file details', [
                'original_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
                'is_valid' => $image->isValid(),
                'temp_path' => $image->getPathname(),
                'temp_exists' => file_exists($image->getPathname())
            ]);
            
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            Log::info('Generated image name', ['image_name' => $imageName]);
            
            // Store in storage/app/public/lesson_images using the public disk
            $path = $image->storeAs('lesson_images', $imageName, 'public');
            Log::info('Image store attempt', [
                'path' => $path, 
                'full_path' => Storage::disk('public')->path($path),
                'storage_exists' => Storage::disk('public')->exists($path)
            ]);
            
            if (!$path) {
                Log::error('Failed to store image - storeAs returned false');
                throw new \Exception('Failed to store image file');
            }
            
            $imagePath = Storage::disk('public')->path($path);
            $fileExists = file_exists($imagePath);
            $fileSize = $fileExists ? filesize($imagePath) : 0;
            
            Log::info('File existence check', [
                'image_path' => $imagePath,
                'file_exists' => $fileExists,
                'file_size' => $fileSize
            ]);
            
            if (!$fileExists) {
                Log::error('Image file not found after storage attempt', [
                    'expected_path' => $imagePath,
                    'storage_result' => $path
                ]);
                
                // Try alternative approach - move uploaded file directly
                $targetPath = Storage::disk('public')->path('lesson_images/' . $imageName);
                Log::info('Attempting manual file move', [
                    'source' => $image->getPathname(),
                    'target' => $targetPath,
                    'source_exists' => file_exists($image->getPathname()),
                    'target_dir_exists' => is_dir(dirname($targetPath)),
                    'target_dir_writable' => is_writable(dirname($targetPath))
                ]);
                
                if (!is_dir(dirname($targetPath))) {
                    mkdir(dirname($targetPath), 0755, true);
                    Log::info('Created target directory', ['dir' => dirname($targetPath)]);
                }
                
                if (move_uploaded_file($image->getPathname(), $targetPath)) {
                    Log::info('Alternative file move succeeded', ['path' => $targetPath]);
                    $fileExists = true;
                    $fileSize = filesize($targetPath);
                    $imagePath = $targetPath;
                    $path = 'lesson_images/' . $imageName; // Update path for URL generation
                } else {
                    Log::error('Manual file move failed', [
                        'source' => $image->getPathname(),
                        'target' => $targetPath,
                        'last_error' => error_get_last()
                    ]);
                    throw new \Exception('Failed to save image file using alternative method');
                }
            }
            
            // Generate the image URL using our direct serving route
            $imageUrl = route('lesson.image', ['filename' => $imageName]);
            
            Log::info('Image uploaded successfully', [
                'filename' => $imageName,
                'path' => $imagePath,
                'url' => $imageUrl,
                'file_exists' => $fileExists,
                'file_size' => $fileSize
            ]);

            return response()->json([
                'success' => true,
                'url' => $imageUrl,
                'filename' => $imageName,
                'debug' => [
                    'direct_route_url' => $imageUrl,
                    'asset_url' => asset("storage/lesson_images/{$imageName}"),
                    'storage_url' => Storage::url("lesson_images/{$imageName}"),
                    'file_path' => $imagePath,
                    'file_exists' => file_exists($imagePath),
                    'file_size' => file_exists($imagePath) ? filesize($imagePath) : 0,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Image upload exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}