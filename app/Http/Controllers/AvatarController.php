<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Illuminate\Validation\Rule;

class AvatarController extends Controller
{
    /**
     * Upload and update user avatar
     */
    public function update(Request $request)
    {
        $request->validate([
            'avatar' => [
                'required',
                File::image()
                    ->max(2048) // 2MB max
                    ->dimensions(Rule::dimensions()->maxWidth(1000)->maxHeight(1000))
            ],
        ]);

        $user = User::find(Auth::id());
        
        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        
        // Update user record
        $user->update(['avatar' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Profile picture updated successfully!',
            'avatar_url' => '/files/avatars/' . basename($path),
        ]);
    }

    /**
     * Delete user avatar
     */
    public function destroy()
    {
        $user = User::find(Auth::id());
        
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
            
            return response()->json([
                'success' => true,
                'message' => 'Profile picture removed successfully!',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No profile picture to remove.',
        ]);
    }
}
