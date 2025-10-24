<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard - redirect to overview.
     */
    public function dashboard()
    {
        return redirect()->route('admin.overview');
    }

    /**
     * Display the admin overview page.
     */
    public function overview(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/overview');
    }

    /**
     * Display the admin academy dashboard.
     */
    public function academy(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        $lessons = Lesson::latest()->get();
        
        return Inertia::render('admin/academy', [
            'lessons' => $lessons
        ]);
    }

    /**
     * Display the users management page.
     */
    public function users(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/users');
    }

    /**
     * Display the businesses management page.
     */
    public function businesses(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/businesses');
    }

    /**
     * Display the system settings page.
     */
    public function system(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/system');
    }

    /**
     * Display the account settings page.
     */
    public function settings(): Response
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Admin access required');
        }
        
        return Inertia::render('admin/settings');
    }

    /**
     * Test image access for debugging.
     */
    public function testImages()
    {
        $images = Storage::files('public/lesson_images');
        $imageUrls = array_map(function($image) {
            return [
                'path' => $image,
                'storage_url' => Storage::url($image),
                'asset_url' => asset('storage/lesson_images/' . basename($image))
            ];
        }, $images);
        
        return response()->json([
            'images' => $imageUrls,
            'storage_path' => storage_path('app/public/lesson_images'),
            'public_path' => public_path('storage/lesson_images')
        ]);
    }
}