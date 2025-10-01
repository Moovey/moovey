<?php

require_once 'bootstrap/app.php';

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Simulate an image upload test
echo "Testing image upload functionality...\n";

// Test 1: Check if storage disk is working
echo "1. Testing storage disk configuration:\n";
try {
    $disk = Storage::disk('public');
    echo "   - Public disk available: YES\n";
    echo "   - Public disk path: " . $disk->path('') . "\n";
} catch (Exception $e) {
    echo "   - Error with public disk: " . $e->getMessage() . "\n";
}

// Test 2: Check directory creation
echo "\n2. Testing directory creation:\n";
$directory = 'lesson_images';
try {
    if (!Storage::disk('public')->exists($directory)) {
        Storage::disk('public')->makeDirectory($directory);
        echo "   - Directory created: $directory\n";
    } else {
        echo "   - Directory exists: $directory\n";
    }
} catch (Exception $e) {
    echo "   - Error creating directory: " . $e->getMessage() . "\n";
}

// Test 3: Test basic file writing
echo "\n3. Testing basic file writing:\n";
try {
    $testContent = "Test image data: " . date('Y-m-d H:i:s');
    $filename = 'test_' . time() . '.txt';
    $path = $directory . '/' . $filename;
    
    $result = Storage::disk('public')->put($path, $testContent);
    if ($result) {
        echo "   - File written successfully: $path\n";
        echo "   - File exists: " . (Storage::disk('public')->exists($path) ? 'YES' : 'NO') . "\n";
        echo "   - File size: " . Storage::disk('public')->size($path) . " bytes\n";
        echo "   - Full path: " . Storage::disk('public')->path($path) . "\n";
        echo "   - File exists on disk: " . (file_exists(Storage::disk('public')->path($path)) ? 'YES' : 'NO') . "\n";
        
        // Clean up
        Storage::disk('public')->delete($path);
        echo "   - Test file cleaned up\n";
    } else {
        echo "   - Failed to write file\n";
    }
} catch (Exception $e) {
    echo "   - Error writing file: " . $e->getMessage() . "\n";
}

echo "\nTest completed.\n";