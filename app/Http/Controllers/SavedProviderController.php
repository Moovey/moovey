<?php

namespace App\Http\Controllers;

use App\Models\SavedProvider;
use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SavedProviderController extends Controller
{
    /**
     * Save a business provider for the authenticated user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'business_profile_id' => 'required|exists:business_profiles,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        
        // Check if already saved
        $existingSave = SavedProvider::where('user_id', $user->id)
            ->where('business_profile_id', $request->business_profile_id)
            ->first();

        if ($existingSave) {
            return back()->with('info', 'Provider already saved');
        }

        // Create new saved provider
        $savedProvider = SavedProvider::create([
            'user_id' => $user->id,
            'business_profile_id' => $request->business_profile_id,
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Provider saved successfully');
    }

    /**
     * Remove a saved provider.
     */
    public function destroy(Request $request, $businessProfileId)
    {
        $user = Auth::user();

        $savedProvider = SavedProvider::where('user_id', $user->id)
            ->where('business_profile_id', $businessProfileId)
            ->first();

        if (!$savedProvider) {
            return back()->with('error', 'Saved provider not found');
        }

        $savedProvider->delete();

        return back()->with('success', 'Provider removed from saved list');
    }

    /**
     * Get all saved providers for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $savedProviders = SavedProvider::where('user_id', $user->id)
            ->with(['businessProfile.user'])
            ->latest()
            ->get()
            ->map(function ($savedProvider) {
                $business = $savedProvider->businessProfile;
                
                return [
                    'id' => $business->id,
                    'business_profile_id' => $business->id, // Add explicit business_profile_id for frontend
                    'name' => $business->name,
                    'avatar' => '🏢',
                    'businessType' => $business->user->name ?? 'Service Provider',
                    'location' => 'UK', // Can be enhanced with actual location data
                    'rating' => 4.5, // Can be enhanced with actual ratings
                    'reviewCount' => 0, // Can be enhanced with actual reviews
                    'verified' => $business->plan === 'premium',
                    'services' => $business->services ?? [],
                    'availability' => 'Available',
                    'responseTime' => 'Usually responds within 24 hours',
                    'savedDate' => $savedProvider->created_at->diffForHumans(),
                    'notes' => $savedProvider->notes,
                ];
            });

        return response()->json([
            'savedProviders' => $savedProviders,
        ], 200);
    }

    /**
     * Check if a provider is saved by the authenticated user.
     */
    public function check($businessProfileId): JsonResponse
    {
        $user = Auth::user();

        $isSaved = SavedProvider::where('user_id', $user->id)
            ->where('business_profile_id', $businessProfileId)
            ->exists();

        return response()->json([
            'saved' => $isSaved,
        ], 200);
    }
}
