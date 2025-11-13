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
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp,bmp,tiff,ico|max:5120',
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
            Log::info('Image store attempt', ['path' => $path]);
            
            if (!$path) {
                Log::error('Failed to store image - storeAs returned false');
                throw new \Exception('Failed to store image file');
            }
            
            // Check if file was stored successfully using Laravel Storage
            if (!Storage::disk('public')->exists($path)) {
                Log::error('Image not found in storage after upload', ['path' => $path]);
                throw new \Exception('Image was not saved to storage');
            }
            
            // Generate the image URL - try multiple methods for compatibility
            $imageUrl = null;
            
            // Try to generate URL using asset() helper (works if storage symlink exists)
            $assetUrl = asset("storage/lesson_images/{$imageName}");
            
            // Check if we can access the file via the public path
            $publicPath = public_path("storage/lesson_images/{$imageName}");
            if (file_exists($publicPath)) {
                $imageUrl = $assetUrl;
                Log::info('Using asset URL - symlink exists', ['url' => $imageUrl]);
            } else {
                // Fallback to custom route for serving images
                $imageUrl = route('lesson.image', ['filename' => $imageName]);
                Log::info('Using custom route - symlink may not exist', ['url' => $imageUrl]);
            }
            
            Log::info('Image uploaded successfully', [
                'filename' => $imageName,
                'path' => $path,
                'url' => $imageUrl,
                'storage_exists' => Storage::disk('public')->exists($path)
            ]);

            return response()->json([
                'success' => true,
                'url' => $imageUrl,
                'filename' => $imageName,
                'debug' => [
                    'path' => $path,
                    'asset_url' => asset("storage/lesson_images/{$imageName}"),
                    'route_url' => route('lesson.image', ['filename' => $imageName]),
                    'storage_exists' => Storage::disk('public')->exists($path),
                    'storage_size' => Storage::disk('public')->size($path),
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