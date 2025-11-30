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
        return Inertia::render('business/overview');
    }

    /**
     * Display the leads management page.
     */
    public function leads(): Response
    {
        $businessProfile = \App\Models\BusinessProfile::where('user_id', Auth::id())->first();
        
        if (!$businessProfile) {
            return Inertia::render('business/leads', [
                'leads' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 5,
                    'total' => 0,
                    'from' => null,
                    'to' => null,
                ],
            ]);
        }

        $leads = \App\Models\CustomerLead::where('business_profile_id', $businessProfile->id)
            ->with(['customer', 'conversation'])
            ->orderBy('created_at', 'desc')
            ->paginate(5)
            ->through(function ($lead) {
                return [
                    'id' => $lead->id,
                    'customer' => [
                        'id' => $lead->customer->id,
                        'name' => $lead->customer->name,
                        'email' => $lead->customer->email,
                        'avatar' => $lead->customer->avatar_url,
                    ],
                    'status' => $lead->status,
                    'conversation_id' => $lead->conversation_id,
                    'contacted_at' => $lead->contacted_at?->diffForHumans(),
                    'created_at' => $lead->created_at->diffForHumans(),
                    'notes' => $lead->notes,
                ];
            });
        
        return Inertia::render('business/leads', [
            'leads' => $leads,
        ]);
    }

    /**
     * Display the services management page.
     */
    public function services(): Response
    {
        $profile = \App\Models\BusinessProfile::firstOrCreate(['user_id' => Auth::id()]);
        // Generate URL - use FileController route for serving files (works in Laravel Cloud)
        $logoUrl = null;
        if ($profile->logo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($profile->logo_path)) {
            // Use the FileController route pattern: /files/{folder}/{filename}
            $filename = basename($profile->logo_path);
            $logoUrl = url('/files/business-logos/' . $filename);
        }
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
        return Inertia::render('business/analytics');
    }

    /**
     * Display the business profile page.
     */
    public function profile(): Response
    {
        return Inertia::render('business/profile');
    }

    /**
     * Update lead status.
     */
    public function updateLeadStatus(Request $request, $leadId)
    {
        $request->validate([
            'status' => 'required|in:new,contacted,quoted,converted,closed',
        ]);

        $businessProfile = \App\Models\BusinessProfile::where('user_id', Auth::id())->first();
        
        if (!$businessProfile) {
            return response()->json(['error' => 'Business profile not found'], 404);
        }

        $lead = \App\Models\CustomerLead::where('id', $leadId)
            ->where('business_profile_id', $businessProfile->id)
            ->firstOrFail();

        $lead->update([
            'status' => $request->status,
            'contacted_at' => $request->status !== 'new' && !$lead->contacted_at ? now() : $lead->contacted_at,
        ]);

        return response()->json([
            'success' => true,
            'lead' => [
                'id' => $lead->id,
                'status' => $lead->status,
                'contacted_at' => $lead->contacted_at?->diffForHumans(),
            ],
        ]);
    }
}