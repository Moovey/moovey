<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

Route::get('/test-upload', function () {
    return view('test-upload');
});

Route::post('/test-upload', function (Request $request) {
    $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    $image = $request->file('image');
    $imageName = time() . '_test.' . $image->getClientOriginalExtension();
    
    try {
        // Test the upload methods
        $results = [];
        
        // Method 1: storeAs
        $path1 = $image->storeAs('public/lesson_images', 'method1_' . $imageName);
        $results['storeAs'] = [
            'result' => $path1,
            'exists' => Storage::exists($path1),
            'physical_exists' => file_exists(storage_path('app/' . $path1))
        ];
        
        // Method 2: Storage::putFileAs  
        $path2 = Storage::putFileAs('public/lesson_images', $image, 'method2_' . $imageName);
        $results['putFileAs'] = [
            'result' => $path2,
            'exists' => Storage::exists($path2),
            'physical_exists' => file_exists(storage_path('app/' . $path2))
        ];
        
        // Method 3: move_uploaded_file
        $targetPath = storage_path('app/public/lesson_images/method3_' . $imageName);
        if (!is_dir(dirname($targetPath))) {
            mkdir(dirname($targetPath), 0755, true);
        }
        $move_result = move_uploaded_file($image->getPathname(), $targetPath);
        $results['move_uploaded_file'] = [
            'result' => $move_result,
            'exists' => file_exists($targetPath),
            'size' => file_exists($targetPath) ? filesize($targetPath) : 0
        ];
        
        return response()->json([
            'success' => true,
            'results' => $results,
            'temp_file' => [
                'pathname' => $image->getPathname(),
                'exists' => file_exists($image->getPathname()),
                'size' => $image->getSize(),
                'is_valid' => $image->isValid()
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
});