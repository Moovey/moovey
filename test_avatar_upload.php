<?php
/**
 * Simple test script for avatar upload functionality
 * 
 * Run this from the command line to test the avatar system:
 * php test_avatar_upload.php
 */

require_once 'vendor/autoload.php';

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\AvatarController;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

echo "=== Avatar Upload System Test ===\n\n";

// Test 1: Check if User model has avatar field
echo "1. Testing User model avatar field...\n";
$user = User::first();
if ($user) {
    echo "✓ User found: {$user->name}\n";
    echo "  Current avatar: " . ($user->avatar ?? 'None') . "\n";
} else {
    echo "✗ No users found in database\n";
}

// Test 2: Check avatar storage directory
echo "\n2. Testing storage directory...\n";
$avatarPath = storage_path('app/public/avatars');
if (is_dir($avatarPath)) {
    echo "✓ Avatar storage directory exists: $avatarPath\n";
    $files = glob($avatarPath . '/*');
    echo "  Files in directory: " . count($files) . "\n";
} else {
    echo "✗ Avatar storage directory missing: $avatarPath\n";
}

// Test 3: Check storage symlink
echo "\n3. Testing storage symlink...\n";
$publicStorage = public_path('storage');
if (is_link($publicStorage)) {
    echo "✓ Storage symlink exists\n";
    echo "  Links to: " . readlink($publicStorage) . "\n";
} else {
    echo "✗ Storage symlink missing\n";
}

// Test 4: Test AvatarController exists
echo "\n4. Testing AvatarController...\n";
if (class_exists('App\\Http\\Controllers\\AvatarController')) {
    echo "✓ AvatarController class exists\n";
    $methods = get_class_methods('App\\Http\\Controllers\\AvatarController');
    echo "  Methods: " . implode(', ', $methods) . "\n";
} else {
    echo "✗ AvatarController class not found\n";
}

echo "\n=== Test Complete ===\n";