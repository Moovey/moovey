<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HousemoverController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MoveDetailsController;
use App\Http\Controllers\ChainCheckerController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AgentFormController;

// Test routes for debugging
require_once __DIR__ . '/test.php';

// Storage file serving route for cloud hosting compatibility
Route::get('/storage-file/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    if (!file_exists($fullPath)) {
        abort(404);
    }
    
    $mimeType = mime_content_type($fullPath);
    return response()->file($fullPath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'public, max-age=31536000', // Cache for 1 year
    ]);
})->where('path', '.*')->name('storage.file');

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

// Chain Checker Agent Form (public access)
Route::get('/chain-checker/agent/{token}', [\App\Http\Controllers\AgentFormController::class, 'show'])->name('agent.chain-form.show');
Route::post('/chain-checker/agent/{token}', [\App\Http\Controllers\AgentFormController::class, 'update'])->name('agent.chain-form.update');
Route::get('/api/chain-checker/agent/{token}', [\App\Http\Controllers\AgentFormController::class, 'getChainData'])->name('api.agent.chain-data');

Route::middleware('auth')->group(function () {
    // Notification API Routes
    Route::get('/api/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('api.notifications.index');
    Route::get('/api/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('api.notifications.unread-count');
    Route::patch('/api/notifications/{id}/mark-as-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('api.notifications.mark-as-read');
    Route::patch('/api/notifications/mark-all-as-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-all-as-read');
    
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
    
    // User Profile Get
    Route::get('/api/user/{user}/profile', [\App\Http\Controllers\UserProfileController::class, 'apiShow'])->name('api.user.profile.show');
    
    // Messaging API Routes
    Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{conversation}', [\App\Http\Controllers\MessageController::class, 'show'])->name('messages.show');
    Route::post('/api/messages', [\App\Http\Controllers\MessageController::class, 'store'])->name('api.messages.store');
    Route::post('/api/messages/conversation/start', [\App\Http\Controllers\MessageController::class, 'startConversation'])->name('api.messages.start-conversation');
    Route::post('/api/messages/send', [\App\Http\Controllers\MessageController::class, 'sendMarketplaceMessage'])->name('api.messages.send-marketplace');
    Route::get('/api/messages/unread-count', [\App\Http\Controllers\MessageController::class, 'getUnreadCount'])->name('api.messages.unread-count');
    Route::get('/api/messages/conversations-preview', [\App\Http\Controllers\MessageController::class, 'conversationsPreview'])->name('api.messages.conversations-preview');
    Route::patch('/api/messages/conversations/{conversation}/mark-as-read', [\App\Http\Controllers\MessageController::class, 'markAsRead'])->name('api.messages.mark-as-read');
    
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
            'old_avatar_path' => $user->avatar ? '/storage/' . $user->avatar : null,
            'new_avatar_url' => $user->avatar_url,
            'avatar_full_path' => $user->avatar ? storage_path('app/public/' . $user->avatar) : null,
            'avatar_exists' => $user->avatar ? file_exists(storage_path('app/public/' . $user->avatar)) : false,
        ]);
    })->name('api.avatar.debug');
});

// API Routes for async data loading
Route::get('/api/welcome/featured-lessons', [PublicController::class, 'getFeaturedLessons'])->name('api.welcome.featured-lessons');
Route::get('/api/welcome/business-network', [PublicController::class, 'getBusinessNetwork'])->name('api.welcome.business-network');

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
    
    // Chain Checker API Routes
    Route::get('/api/chain-checker', [\App\Http\Controllers\ChainCheckerController::class, 'index'])->name('api.chain-checker.get');
    Route::post('/api/chain-checker', [\App\Http\Controllers\ChainCheckerController::class, 'store'])->name('api.chain-checker.create');
    Route::patch('/api/chain-checker/{chainChecker}', [\App\Http\Controllers\ChainCheckerController::class, 'update'])->name('api.chain-checker.update');
    Route::patch('/api/chain-checker/{chainChecker}/status', [\App\Http\Controllers\ChainCheckerController::class, 'updateStatus'])->name('api.chain-checker.status');
    Route::post('/api/chain-checker/{chainChecker}/request-update', [\App\Http\Controllers\ChainCheckerController::class, 'requestAgentUpdate'])->name('api.chain-checker.request-update');
    Route::patch('/api/chain-checker/{chainChecker}/complete', [\App\Http\Controllers\ChainCheckerController::class, 'complete'])->name('api.chain-checker.complete');
    Route::get('/api/chain-checker/{chainChecker}/updates', [\App\Http\Controllers\ChainCheckerController::class, 'getUpdates'])->name('api.chain-checker.updates');
    
    // Property Basket API Routes
    Route::get('/api/properties/basket', [\App\Http\Controllers\PropertyController::class, 'getBasket'])->name('api.properties.basket');
    Route::post('/api/properties/add-to-basket', [\App\Http\Controllers\PropertyController::class, 'addToBasket'])->name('api.properties.add-to-basket');
    Route::delete('/api/properties/{property}/remove-from-basket', [\App\Http\Controllers\PropertyController::class, 'removeFromBasket'])->name('api.properties.remove-from-basket');
    Route::patch('/api/properties/{property}/claim', [\App\Http\Controllers\PropertyController::class, 'claimProperty'])->name('api.properties.claim');
    Route::get('/api/properties/{property}', [\App\Http\Controllers\PropertyController::class, 'show'])->name('api.properties.show');
    Route::get('/api/properties/search', [\App\Http\Controllers\PropertyController::class, 'search'])->name('api.properties.search');
    
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
        
        // Chain Checker
        Route::get('chain-checker', [HousemoverController::class, 'chainChecker'])->name('chain-checker');
        
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
| File Serving Routes
|--------------------------------------------------------------------------
| These routes serve files directly from storage to work around
| symbolic link issues in cloud hosting environments
*/

// Serve avatar files directly
Route::get('/files/avatars/{filename}', [FileController::class, 'serveAvatar'])->name('files.avatars');

// Serve other uploaded files
Route::get('/files/{folder}/{filename}', [FileController::class, 'serveFile'])->name('files.serve');

/*
|--------------------------------------------------------------------------
| Include Additional Route Files
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/test_avatar.php';
require __DIR__.'/agent.php';
