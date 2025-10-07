<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HousemoverController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MoveDetailsController;

// Test routes for debugging
require_once __DIR__ . '/test.php';

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| Routes accessible to all users without authentication
*/

Route::get('/', [PublicController::class, 'welcome'])->name('home');
Route::get('/academy', [PublicController::class, 'academy'])->name('academy');
Route::get('/tools', [PublicController::class, 'tools'])->name('tools');
Route::get('/marketplace', [PublicController::class, 'marketplace'])->name('marketplace');
Route::get('/trade-directory', [PublicController::class, 'tradeDirectory'])->name('trade-directory');
Route::get('/community', [\App\Http\Controllers\CommunityController::class, 'index'])->name('community');

// Test routes removed - see routes/test.php for development testing

// Business Search API (public access)
Route::get('/api/business/search', [\App\Http\Controllers\BusinessSearchController::class, 'search'])->name('api.business.search');
Route::get('/business-profile/{id}', [\App\Http\Controllers\BusinessSearchController::class, 'show'])->name('business.profile.show');

// Community API Routes (public access)
Route::get('/api/community/posts', [\App\Http\Controllers\CommunityController::class, 'getPosts'])->name('api.community.posts');
Route::get('/api/community/posts/{post}/comments', [\App\Http\Controllers\CommunityController::class, 'getComments'])->name('api.community.posts.comments');

// Marketplace API Routes (public access)
Route::get('/api/marketplace/items', [\App\Http\Controllers\DeclutterItemController::class, 'marketplace'])->name('api.marketplace.items');

// User Profile Routes (public access)
Route::get('/user/{userId}', [\App\Http\Controllers\UserProfileController::class, 'show'])->name('user.profile.show');

Route::middleware('auth')->group(function () {
    // Community Posts (authenticated routes)
    Route::post('/api/community/posts', [\App\Http\Controllers\CommunityController::class, 'store'])->name('api.community.posts.store');
    Route::post('/api/community/posts/{post}/like', [\App\Http\Controllers\CommunityController::class, 'toggleLike'])->name('api.community.posts.like');
    Route::post('/api/community/posts/{post}/share', [\App\Http\Controllers\CommunityController::class, 'sharePost'])->name('api.community.posts.share');
    Route::post('/api/community/posts/{post}/comments', [\App\Http\Controllers\CommunityController::class, 'storeComment'])->name('api.community.posts.comments.store');
    Route::delete('/api/community/posts/{post}/comments/{comment}', [\App\Http\Controllers\CommunityController::class, 'destroyComment'])->name('api.community.posts.comments.destroy');
    Route::delete('/api/community/posts/{post}', [\App\Http\Controllers\CommunityController::class, 'destroy'])->name('api.community.posts.destroy');
    
    // Avatar Upload Routes
    Route::post('/api/avatar/upload', [AvatarController::class, 'update'])->name('api.avatar.upload');
    Route::delete('/api/avatar', [AvatarController::class, 'destroy'])->name('api.avatar.delete');
    
    // Friendship API Routes
    Route::post('/api/friendships/send', [\App\Http\Controllers\FriendshipController::class, 'sendRequest'])->name('api.friendships.send');
    Route::post('/api/friendships/accept', [\App\Http\Controllers\FriendshipController::class, 'acceptRequest'])->name('api.friendships.accept');
    Route::post('/api/friendships/decline', [\App\Http\Controllers\FriendshipController::class, 'declineRequest'])->name('api.friendships.decline');
    Route::delete('/api/friendships/cancel', [\App\Http\Controllers\FriendshipController::class, 'cancelRequest'])->name('api.friendships.cancel');
    Route::get('/api/friendships', [\App\Http\Controllers\FriendshipController::class, 'getFriends'])->name('api.friendships.list');
    Route::get('/api/friendships/requests', [\App\Http\Controllers\FriendshipController::class, 'getPendingRequests'])->name('api.friendships.requests');
    
    // User Profile Update
    Route::patch('/api/user/profile', [\App\Http\Controllers\UserProfileController::class, 'update'])->name('api.user.profile.update');
    
    // Declutter Items API Routes
    Route::apiResource('api/declutter-items', \App\Http\Controllers\DeclutterItemController::class);
    Route::patch('/api/declutter-items/{id}/list-for-sale', [\App\Http\Controllers\DeclutterItemController::class, 'listForSale'])->name('api.declutter-items.list-for-sale');
    Route::patch('/api/declutter-items/{id}/unlist-from-sale', [\App\Http\Controllers\DeclutterItemController::class, 'unlistFromSale'])->name('api.declutter-items.unlist-from-sale');
    
    // Test route for avatar debugging
    Route::get('/api/user/avatar-debug', function() {
        $user = Auth::user();
        return response()->json([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_avatar' => $user->avatar,
            'avatar_path' => $user->avatar ? '/storage/' . $user->avatar : null,
            'avatar_full_path' => $user->avatar ? storage_path('app/public/' . $user->avatar) : null,
            'avatar_exists' => $user->avatar ? file_exists(storage_path('app/public/' . $user->avatar)) : false,
        ]);
    })->name('api.avatar.debug');
});

// Lesson Viewing Routes (public access)
Route::get('/lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');

// Lesson Progress Routes (authenticated users only)
Route::middleware('auth')->group(function () {
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'markComplete'])->name('lessons.complete');
    
    // Task Management API Routes
    Route::post('/api/tasks', [TaskController::class, 'addTask'])->name('api.tasks.add');
    Route::get('/api/tasks', [TaskController::class, 'getTasks'])->name('api.tasks.get');
    Route::patch('/api/tasks/{task}/complete', [TaskController::class, 'completeTask'])->name('api.tasks.complete');
    Route::delete('/api/tasks/{task}', [TaskController::class, 'deleteTask'])->name('api.tasks.delete');
    
    // Priority Tasks API Routes
    Route::post('/api/priority-tasks', [TaskController::class, 'addToPriority'])->name('api.priority-tasks.add');
    Route::delete('/api/priority-tasks/{task}', [TaskController::class, 'removeFromPriority'])->name('api.priority-tasks.remove');
    Route::get('/api/priority-tasks', [TaskController::class, 'getPriorityTasks'])->name('api.priority-tasks.get');

    // Move Details API Routes
    Route::get('/api/move-details', [MoveDetailsController::class, 'getData'])->name('api.move-details.get');
    Route::patch('/api/move-details', [MoveDetailsController::class, 'updateDetails'])->name('api.move-details.update');
    Route::patch('/api/move-details/recommended-task', [MoveDetailsController::class, 'toggleRecommendedTask'])->name('api.move-details.recommended.toggle');
    Route::post('/api/move-details/custom-tasks', [MoveDetailsController::class, 'addCustomTask'])->name('api.move-details.custom.add');
    Route::patch('/api/move-details/custom-tasks/{taskId}/toggle', [MoveDetailsController::class, 'toggleCustomTask'])->name('api.move-details.custom.toggle');
    Route::delete('/api/move-details/custom-tasks/{taskId}', [MoveDetailsController::class, 'deleteCustomTask'])->name('api.move-details.custom.delete');
    
    // Saved Tool Results Routes
    Route::post('/saved-results', [\App\Http\Controllers\SavedToolResultController::class, 'store'])->name('saved-results.store');
    Route::get('/saved-results', [\App\Http\Controllers\SavedToolResultController::class, 'index'])->name('saved-results.index');
    Route::get('/saved-results/{savedToolResult}', [\App\Http\Controllers\SavedToolResultController::class, 'show'])->name('saved-results.show');
    Route::delete('/saved-results/{savedToolResult}', [\App\Http\Controllers\SavedToolResultController::class, 'destroy'])->name('saved-results.destroy');
    Route::get('/api/saved-results', [\App\Http\Controllers\SavedToolResultController::class, 'api'])->name('api.saved-results');
    
    // Test route to add a sample CTA task
    Route::get('/test-add-task', function() {
        if (!Auth::check()) {
            return redirect('/login');
        }
        
        $task = \App\Models\UserTask::create([
            'user_id' => Auth::id(),
            'title' => 'Test CTA Task from Academy',
            'description' => 'This is a test task created from a lesson CTA button',
            'priority' => 'medium',
            'status' => 'pending',
            'metadata' => [
                'source' => 'lesson',
                'source_id' => 1,
                'created_from' => 'lesson_cta',
            ]
        ]);
        
        return redirect('/housemover/dashboard')->with('success', 'Test task added!');
    })->name('test.add.task');
});

// Direct image serving route (public access for editor display)
Route::get('/lesson-image/{filename}', [PublicController::class, 'lessonImage'])->name('lesson.image');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
| Routes requiring authentication and role-based access
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Main dashboard with role-based redirection
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    | Routes accessible only to admin users
    */
    
    Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
        
        // Admin Dashboard
        Route::get('dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        
        // Admin Academy Dashboard
        Route::get('academy', [AdminController::class, 'academy'])->name('academy');
        
        // Lesson Management
        Route::resource('lessons', LessonController::class)->except(['show']);
        Route::get('lessons/{lesson}', [LessonController::class, 'show'])->name('lessons.show');
        
        // Image Upload for Lessons
        Route::post('lesson-images/upload', [\App\Http\Controllers\LessonImageController::class, 'upload'])->name('lesson-images.upload');
        
        // Test image access (temporary for debugging)
        Route::get('test-images', [AdminController::class, 'testImages'])->name('test-images');
        
        // User Management (future implementation)
        Route::get('users', [AdminController::class, 'users'])->name('users');
        
        // Business Management (future implementation)
        Route::get('businesses', [AdminController::class, 'businesses'])->name('businesses');
        
        // System Settings (future implementation)
        Route::get('settings', [AdminController::class, 'settings'])->name('settings');
    });

    /*
    |--------------------------------------------------------------------------
    | Business Routes
    |--------------------------------------------------------------------------
    | Routes accessible only to business users
    */
    
    Route::middleware(['auth', 'verified'])->prefix('business')->name('business.')->group(function () {
        
        // Business Dashboard
        Route::get('dashboard', [BusinessController::class, 'dashboard'])->name('dashboard');
        
        // Lead Management (future implementation)
        Route::get('leads', [BusinessController::class, 'leads'])->name('leads');
        
        // Service Management (future implementation)
        Route::get('services', [BusinessController::class, 'services'])->name('services');
        
        // Analytics (future implementation)
        Route::get('analytics', [BusinessController::class, 'analytics'])->name('analytics');
        
        // Business Profile (future implementation)
        Route::get('profile', [BusinessController::class, 'profile'])->name('profile');

        // Business Profile API (for saving basic listing)
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('profile', [\App\Http\Controllers\BusinessProfileController::class, 'getProfile'])->name('profile.get');
            Route::patch('profile', [\App\Http\Controllers\BusinessProfileController::class, 'saveBasicListing'])->name('profile.save');
            Route::post('profile/logo', [\App\Http\Controllers\BusinessProfileController::class, 'uploadLogo'])->name('profile.logo');
            Route::delete('profile/logo', [\App\Http\Controllers\BusinessProfileController::class, 'deleteLogo'])->name('profile.logo.delete');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Housemover Routes
    |--------------------------------------------------------------------------
    | Routes accessible only to housemover users (default role)
    */
    
    Route::middleware(['auth', 'verified'])->prefix('housemover')->name('housemover.')->group(function () {
        
        // Housemover Dashboard
        Route::get('dashboard', [HousemoverController::class, 'dashboard'])->name('dashboard');
        
        // Tasks Management
        Route::get('tasks', [HousemoverController::class, 'tasks'])->name('tasks');
        
        // Move Management
        Route::get('move-details', [HousemoverController::class, 'moveDetails'])->name('move-details');
        
        // Achievements & Progress
        Route::get('achievements', [HousemoverController::class, 'achievements'])->name('achievements');
        
        // Connections & Networking
        Route::get('connections', [HousemoverController::class, 'connections'])->name('connections');
    });
    
    /*
    |--------------------------------------------------------------------------
    | Shared Authenticated Routes
    |--------------------------------------------------------------------------
    | Routes accessible to all authenticated users regardless of role
    */
    
    // Profile Settings (accessible to all roles)
    Route::get('profile-settings', [HousemoverController::class, 'profileSettings'])->name('profile-settings');
});

/*
|--------------------------------------------------------------------------
| Include Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
