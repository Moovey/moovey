<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BusinessSearchController extends Controller
{
    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'service' => ['nullable', 'string', 'max:255'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
            'offset' => ['nullable', 'integer', 'min:0'],
        ]);

        $query = BusinessProfile::query()
            ->whereNotNull('name')
            ->where('name', '!=', '')
            ->with('user:id,name,email');

        // Search by query (name, description, or services)
        if (!empty($validated['query'])) {
            $searchTerm = $validated['query'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhereJsonContains('services', $searchTerm)
                  ->orWhere('services', 'like', "%{$searchTerm}%");
            });
        }

        // Search by service
        if (!empty($validated['service']) && $validated['service'] !== "I'm looking for a...") {
            $service = $validated['service'];
            $query->where(function ($q) use ($service) {
                $q->whereJsonContains('services', $service)
                  ->orWhere('services', 'like', "%{$service}%")
                  ->orWhere('name', 'like', "%{$service}%")
                  ->orWhere('description', 'like', "%{$service}%");
            });
        }

        // For now, we'll skip location and rating filtering since we don't have that data yet
        // These can be implemented when we add location and rating fields to the business profiles

        $limit = $validated['limit'] ?? 10;
        $offset = $validated['offset'] ?? 0;
        
        // Get total count for pagination
        $totalCount = $query->count();
        
        // Apply pagination
        $businesses = $query->skip($offset)->take($limit)->get();

        // Transform the data to include logo URLs
        $results = $businesses->map(function ($business) {
            return [
                'id' => $business->id,
                'name' => $business->name,
                'description' => $business->description,
                'services' => $business->services ?? [],
                'logo_url' => $business->logo_path ? Storage::url($business->logo_path) : null,
                'plan' => $business->plan ?? 'basic',
                'user_name' => $business->user->name ?? 'Business Owner',
                'rating' => rand(3, 5), // Mock rating for now
                'verified' => rand(0, 1) === 1, // Mock verification status
                'response_time' => 'Usually responds within ' . rand(1, 4) . ' hours',
                'availability' => 'Available: ' . (rand(0, 1) ? 'Weekdays and Weekends' : 'Weekdays only'),
            ];
        });

        return response()->json([
            'success' => true,
            'results' => $results,
            'total' => $totalCount,
            'returned' => $results->count(),
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $totalCount,
            'query' => $validated,
        ]);
    }

    public function show($id)
    {
        $business = BusinessProfile::with('user:id,name,email')
            ->findOrFail($id);

        // Transform the data for the profile view
        $profile = [
            'id' => $business->id,
            'name' => $business->name,
            'description' => $business->description,
            'services' => $business->services ?? [],
            'logo_url' => $business->logo_path ? Storage::url($business->logo_path) : null,
            'plan' => $business->plan ?? 'basic',
            'user_name' => $business->user->name ?? 'Business Owner',
            'rating' => rand(4, 5), // Mock rating for now
            'verified' => rand(0, 1) === 1, // Mock verification status
            'response_time' => 'Usually responds within ' . rand(1, 4) . ' hours',
            'availability' => 'Available: ' . (rand(0, 1) ? 'Weekdays and Weekends' : 'Weekdays only'),
            'contact' => [
                'email' => $business->user->email ?? null,
                'phone' => '+44 7' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT), // Mock phone for now
                'address' => 'London, UK', // Mock address for now
            ],
            'portfolio' => [], // Empty for now, can be implemented later
            'reviews' => $this->getMockReviews(), // Mock reviews for demonstration
        ];

        return inertia('business-profile', compact('profile'));
    }

    private function getMockReviews()
    {
        $mockReviews = [
            [
                'id' => 1,
                'customer_name' => 'Sarah Johnson',
                'rating' => 5,
                'comment' => 'Excellent service! Very professional and handled our move with care. Highly recommended.',
                'date' => '2 weeks ago',
            ],
            [
                'id' => 2,
                'customer_name' => 'Mike Thompson',
                'rating' => 4,
                'comment' => 'Good communication and reliable service. They arrived on time and did the job efficiently.',
                'date' => '1 month ago',
            ],
            [
                'id' => 3,
                'customer_name' => 'Emma Wilson',
                'rating' => 5,
                'comment' => 'Outstanding work! They went above and beyond what was expected. Will definitely use again.',
                'date' => '2 months ago',
            ],
        ];

        return array_slice($mockReviews, 0, rand(1, 3));
    }
}