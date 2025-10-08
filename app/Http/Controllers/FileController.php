<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\File;

class FileController extends Controller
{
    /**
     * Serve avatar files directly from storage
     */
    public function serveAvatar($filename)
    {
        $path = 'avatars/' . $filename;
        
        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }
        
        $file = Storage::disk('public')->get($path);
        $fullPath = Storage::disk('public')->path($path);
        $mimeType = File::mimeType($fullPath);
        
        return Response::make($file, 200, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000', // Cache for 1 year
            'Expires' => gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT',
        ]);
    }
    
    /**
     * Serve any file from public storage (for other uploaded files)
     */
    public function serveFile($folder, $filename)
    {
        $path = $folder . '/' . $filename;
        
        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }
        
        $file = Storage::disk('public')->get($path);
        $fullPath = Storage::disk('public')->path($path);
        $mimeType = File::mimeType($fullPath);
        
        return Response::make($file, 200, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000', // Cache for 1 year
            'Expires' => gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT',
        ]);
    }
}