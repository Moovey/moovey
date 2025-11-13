#!/usr/bin/env php
<?php

/*
 * Fix image serving issues by creating necessary symlinks and directories
 */

define('LARAVEL_START', microtime(true));

// Register the Composer autoloader...
require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel and handle the command...
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

echo "🔧 Fixing image serving for Laravel in cloud environment...\n\n";

// 1. Create storage directories if they don't exist
$storageDir = storage_path('app/public/lesson_images');
if (!File::isDirectory($storageDir)) {
    File::makeDirectory($storageDir, 0755, true);
    echo "✅ Created storage directory: {$storageDir}\n";
} else {
    echo "✅ Storage directory already exists: {$storageDir}\n";
}

// 2. Create public symlink directory if it doesn't exist
$publicStorageDir = public_path('storage');
if (!File::isDirectory($publicStorageDir)) {
    File::makeDirectory($publicStorageDir, 0755, true);
    echo "✅ Created public storage directory: {$publicStorageDir}\n";
} else {
    echo "✅ Public storage directory already exists: {$publicStorageDir}\n";
}

// 3. Create symlink for lesson_images specifically
$publicLessonImagesDir = public_path('storage/lesson_images');
$storageLessonImagesDir = storage_path('app/public/lesson_images');

if (!File::isDirectory($publicLessonImagesDir) && !File::isLink($publicLessonImagesDir)) {
    if (File::link($storageLessonImagesDir, $publicLessonImagesDir)) {
        echo "✅ Created symlink: {$publicLessonImagesDir} -> {$storageLessonImagesDir}\n";
    } else {
        echo "⚠️  Could not create symlink, will use direct file serving instead\n";
    }
} else {
    echo "✅ Lesson images symlink already exists\n";
}

// 4. Test image serving
echo "\n🧪 Testing image serving setup...\n";

// Create a test image
$testImagePath = $storageDir . '/test_image.jpg';
$testImageData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
file_put_contents($testImagePath, $testImageData);

if (file_exists($testImagePath)) {
    echo "✅ Test image created in storage\n";
    
    // Check if accessible via public path
    $publicTestImagePath = public_path('storage/lesson_images/test_image.jpg');
    if (file_exists($publicTestImagePath)) {
        echo "✅ Test image accessible via public symlink\n";
    } else {
        echo "⚠️  Test image NOT accessible via public symlink - will use direct serving\n";
    }
    
    // Clean up
    unlink($testImagePath);
    if (file_exists($publicTestImagePath)) {
        unlink($publicTestImagePath);
    }
} else {
    echo "❌ Could not create test image\n";
}

echo "\n🎉 Setup complete!\n";
echo "📸 Images will be served via:\n";
echo "   - Asset URL (if symlink works): " . asset('storage/lesson_images/example.jpg') . "\n";
echo "   - Direct route (fallback): " . url('/lesson-image/example.jpg') . "\n\n";

echo "💡 If images still don't show:\n";
echo "   1. Check file permissions on storage/app/public/\n";
echo "   2. Verify your web server can follow symlinks\n";
echo "   3. Check if your hosting provider supports symlinks\n";
echo "   4. The app will automatically fallback to direct file serving\n";