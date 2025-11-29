<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BusinessProfileController extends Controller
{
    public function getProfile()
    {
        $user = Auth::user();
        $profile = BusinessProfile::firstOrCreate(['user_id' => $user->id]);
        return response()->json([
            'success' => true,
            'profile' => $profile,
        ]);
    }

    public function saveBasicListing(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:140'],
            'services' => ['nullable', 'array'],
            'services.*' => ['string', 'max:60'],
        ]);

        $profile = BusinessProfile::firstOrCreate(['user_id' => $user->id]);
        $profile->fill($validated);
        $profile->save();

        // Return success response that works with Inertia
        return back()->with('success', 'Basic listing saved successfully');
    }

    public function uploadLogo(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpeg,jpg,png', 'max:2048'], // max:2048 KB (2MB)
        ]);

        $file = $request->file('logo');
        // Store with public visibility in business-logos directory
        $path = $file->store('business-logos', 'public');

        $profile = BusinessProfile::firstOrCreate(['user_id' => $user->id]);
        // delete old if exists
        if ($profile->logo_path && Storage::disk('public')->exists($profile->logo_path)) {
            Storage::disk('public')->delete($profile->logo_path);
        }
        $profile->logo_path = $path;
        $profile->save();

        // Return success response that works with Inertia
        return back()->with('success', 'Logo uploaded successfully');
    }

    public function deleteLogo()
    {
        $user = Auth::user();
        $profile = BusinessProfile::firstOrCreate(['user_id' => $user->id]);
        
        // Delete the logo file if it exists
        if ($profile->logo_path && Storage::disk('public')->exists($profile->logo_path)) {
            Storage::disk('public')->delete($profile->logo_path);
        }
        
        $profile->logo_path = null;
        $profile->save();

        return back()->with('success', 'Logo deleted successfully');
    }
}
