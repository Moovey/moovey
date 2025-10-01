<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    /**
     * Display the business dashboard.
     */
    public function dashboard(): Response
    {
        if (Auth::user()->role !== 'business') {
            abort(403, 'Business access required');
        }
        
    return Inertia::render('business/overview');
    }

    /**
     * Display the leads management page.
     */
    public function leads(): Response
    {
        if (Auth::user()->role !== 'business') {
            abort(403, 'Business access required');
        }
        
    return Inertia::render('business/leads');
    }

    /**
     * Display the services management page.
     */
    public function services(): Response
    {
        if (Auth::user()->role !== 'business') {
            abort(403, 'Business access required');
        }
        $profile = \App\Models\BusinessProfile::firstOrCreate(['user_id' => Auth::id()]);
        $logoUrl = $profile->logo_path ? \Illuminate\Support\Facades\Storage::url($profile->logo_path) : null;
        return Inertia::render('business/services', [
            'profile' => [
                'name' => $profile->name,
                'description' => $profile->description,
                'logoUrl' => $logoUrl,
                'plan' => $profile->plan,
                'services' => $profile->services ?? [],
            ],
        ]);
    }

    /**
     * Display the analytics page.
     */
    public function analytics(): Response
    {
        if (Auth::user()->role !== 'business') {
            abort(403, 'Business access required');
        }
        
    return Inertia::render('business/analytics');
    }

    /**
     * Display the business profile page.
     */
    public function profile(): Response
    {
        if (Auth::user()->role !== 'business') {
            abort(403, 'Business access required');
        }
        
    return Inertia::render('business/settings');
    }
}