<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Simple test route to check if file serving works
Route::get('/test-avatar-serving', function() {
    $user = Auth::user();
    
    if (!$user || !$user->avatar) {
        return response()->json([
            'error' => 'No user logged in or no avatar set'
        ]);
    }
    
    $filename = basename($user->avatar);
    $newUrl = "/files/avatars/{$filename}";
    $oldUrl = "/storage/{$user->avatar}";
    
    return response()->json([
        'user' => $user->name,
        'avatar_stored_path' => $user->avatar,
        'old_url' => $oldUrl,
        'new_url' => $newUrl,
        'new_url_full' => url($newUrl),
        'test_message' => 'Try accessing both URLs to see which one works'
    ]);
})->middleware('auth')->name('test.avatar.serving');