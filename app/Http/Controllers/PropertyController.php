<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\ChainUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    /**
     * Get user's property basket
     */
    public function getBasket(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            // Get the claim_type filter from request
            $claimTypeFilter = $request->get('claim_type');

            // Use the PropertyBasket model directly to ensure we get the right data with claim info
            $query = \App\Models\PropertyBasket::where('user_id', $user->id)
                ->with('property')
                ->orderBy('created_at', 'desc');

            // Apply claim_type filter if provided
            if ($claimTypeFilter && in_array($claimTypeFilter, ['buyer', 'seller'])) {
                $query->where('claim_type', $claimTypeFilter);
            }

            $basketProperties = $query->get()
                ->map(function ($basket) use ($user) {
                    $property = $basket->property;
                    if ($property) {
                        // Add claim information from basket to property data
                        $propertyData = $property->toArray();
                        $propertyData['is_claimed'] = $basket->is_claimed;
                        $propertyData['claim_type'] = $basket->claim_type;
                        $propertyData['claimed_by_user_id'] = $user->id;
                        $propertyData['basket_id'] = $basket->id;
                        $propertyData['notes'] = $basket->notes;
                        $propertyData['is_favorite'] = $basket->is_favorite;
                        $propertyData['claimed_at'] = $basket->claimed_at;
                        
                        return $propertyData;
                    }
                    return null;
                })
                ->filter(); // Remove null entries

            Log::info('Basket properties for user ' . $user->id, [
                'count' => $basketProperties->count(),
                'claim_type_filter' => $claimTypeFilter,
                'data' => $basketProperties->toArray()
            ]);

            return response()->json([
                'success' => true,
                'data' => $basketProperties->values() // Ensure it's a proper array
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching basket properties: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching basket properties',
                'data' => [] // Always provide an empty array on error
            ], 500);
        }
    }

    /**
     * Add property to basket from Rightmove URL, custom name, or photos
     */
    public function addToBasket(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rightmove_url' => 'required|url',
            'property_name' => 'required|string|max:255',
            'property_address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
            'photos.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max per image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        
        // Handle photo uploads
        $photoUrls = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $filename = time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
                $path = $photo->storeAs('property-photos', $filename, 'public');
                $photoUrls[] = '/storage/' . $path;
            }
        }

        $property = null;
        
        // Check if property already exists with this Rightmove URL
        $property = Property::where('rightmove_url', $request->rightmove_url)->first();
        
        if (!$property) {
            // Scrape property data from Rightmove
            $propertyData = $this->scrapePropertyData($request->rightmove_url);
            
            if ($propertyData) {
                // Combine scraped image with user photos (exclude placeholder URLs)
                $allPhotos = [];
                if (isset($propertyData['image']) && 
                    $propertyData['image'] && 
                    !str_contains($propertyData['image'], 'placeholder')) {
                    $allPhotos[] = $propertyData['image'];
                }
                if (!empty($photoUrls)) {
                    $allPhotos = array_merge($allPhotos, $photoUrls);
                }
                
                // Create new property with scraped data but use user's property name
                $property = Property::create([
                    'rightmove_url' => $request->rightmove_url,
                    'property_title' => $request->property_name, // Use user's property name
                    'property_photos' => !empty($allPhotos) ? $allPhotos : null,
                    'property_description' => $propertyData['description'],
                    'address' => $request->property_address ?: $propertyData['address'], // Use user address or fallback to scraped
                    'price' => $propertyData['price'],
                    'property_type' => $propertyData['type'],
                    'bedrooms' => $propertyData['bedrooms'],
                    'bathrooms' => $propertyData['bathrooms'],
                    'metadata' => array_merge($propertyData['metadata'] ?? [], [
                        'user_provided_name' => true,
                        'original_scraped_title' => $propertyData['title'],
                    ]),
                ]);
            }
        } else if (!empty($photoUrls)) {
            // Add new photos to existing property
            $existingPhotos = $property->property_photos ?? [];
            $property->update([
                'property_photos' => array_merge($existingPhotos, $photoUrls)
            ]);
        }
        
        // If no Rightmove URL or scraping failed, create property from user input
        if (!$property) {
            $property = Property::create([
                'rightmove_url' => $request->rightmove_url,
                'property_title' => $request->property_name,
                'property_photos' => !empty($photoUrls) ? $photoUrls : null,
                'property_description' => 'Property added by user',
                'address' => $request->property_address ?: 'Address not specified',
                'price' => null,
                'property_type' => 'property',
                'bedrooms' => null,
                'bathrooms' => null,
                'metadata' => [
                    'user_created' => true,
                    'created_by_user_id' => $user->id,
                    'created_at' => now()->toISOString(),
                ],
            ]);
        }

        // Add to user's basket
        $basket = $property->addToBasket($user->id, $request->notes);

        // Log update if user has active chain checker
        $chainChecker = $user->activeChainChecker;
        if ($chainChecker) {
            ChainUpdate::createUpdate(
                $chainChecker->id,
                'property_added',
                'Property Added to Basket',
                "Added '{$property->property_title}' to your property basket.",
                $user->id,
                ['property_id' => $property->id]
            );
        }

        return response()->json([
            'success' => true,
            'data' => [
                'property' => $property->fresh(), // Ensure we have latest data including claim status
                'basket' => $basket,
            ],
            'message' => 'Property added to basket successfully'
        ], 201);
    }

    /**
     * Remove property from basket
     */
    public function removeFromBasket(Property $property): JsonResponse
    {
        $user = Auth::user();
        
        $removed = $property->removeFromBasket($user->id);
        
        if (!$removed) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found in your basket'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Property removed from basket'
        ]);
    }

    /**
     * Claim a property
     */
    public function claimProperty(Request $request, Property $property): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'claim_type' => 'required|in:buyer,seller',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        
        // Find or create the user's PropertyBasket entry for this property
        $basket = \App\Models\PropertyBasket::firstOrCreate([
            'user_id' => $user->id,
            'property_id' => $property->id,
        ]);
        
        // Check if user has already claimed this property
        if ($basket->is_claimed) {
            return response()->json([
                'success' => false,
                'message' => "You have already claimed this property as a {$basket->claim_type}",
                'data' => [
                    'property' => $property,
                    'already_claimed' => true,
                    'claim_type' => $basket->claim_type,
                    'claimed_by_current_user' => true,
                ]
            ], 400);
        }
        
        // Claim the property for this specific user
        $claimed = $basket->claimProperty($request->claim_type);
        
        if (!$claimed) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to claim property'
            ], 400);
        }

        // Log update if user has active chain checker
        $chainChecker = $user->activeChainChecker;
        if ($chainChecker) {
            $claimTypeText = $request->claim_type === 'seller' ? 'selling' : 'buying';
            ChainUpdate::createUpdate(
                $chainChecker->id,
                'property_claimed',
                'Property Claimed',
                "Claimed '{$property->property_title}' as your {$claimTypeText} property.",
                $user->id,
                ['property_id' => $property->id, 'claim_type' => $request->claim_type]
            );
        }

        return response()->json([
            'success' => true,
            'data' => [
                'property' => $property->fresh(),
                'basket' => $basket->fresh(),
                'is_claimed' => true,
                'claim_type' => $request->claim_type,
            ],
            'message' => 'Property claimed successfully'
        ]);
    }

    /**
     * Get property details with basket counts
     */
    public function show(Property $property): JsonResponse
    {
        $user = Auth::user();
        
        $property->load('baskets');
        
        // Get user's specific basket entry for this property
        $userBasket = \App\Models\PropertyBasket::where('user_id', $user->id)
            ->where('property_id', $property->id)
            ->first();
        
        return response()->json([
            'success' => true,
            'data' => [
                'property' => $property,
                'is_in_user_basket' => $property->isInUserBasket($user->id),
                'basket_count' => $property->basket_count,
                'user_claim_info' => $userBasket ? [
                    'is_claimed' => $userBasket->is_claimed,
                    'claim_type' => $userBasket->claim_type,
                    'claimed_at' => $userBasket->claimed_at,
                ] : [
                    'is_claimed' => false,
                    'claim_type' => null,
                    'claimed_at' => null,
                ],
            ]
        ]);
    }

    /**
     * Search properties by Rightmove URL or address
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:3',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = $request->query;
        
        // Search existing properties
        $properties = Property::where(function($q) use ($query) {
            $q->where('property_title', 'LIKE', "%{$query}%")
              ->orWhere('address', 'LIKE', "%{$query}%")
              ->orWhere('rightmove_url', 'LIKE', "%{$query}%");
        })
        ->withCount('baskets')
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

        return response()->json([
            'success' => true,
            'data' => $properties
        ]);
    }

    /**
     * Update property information
     */
    public function updateProperty(Request $request, Property $property): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_title' => 'required|string|max:255',
            'property_address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Update property details
            $property->update([
                'property_title' => $request->property_title,
                'address' => $request->property_address,
            ]);

            // Update basket notes for the current user
            $user = Auth::user();
            $basket = $property->baskets()->where('user_id', $user->id)->first();
            if ($basket && $request->has('notes')) {
                $basket->update(['notes' => $request->notes]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Property updated successfully',
                'data' => $property->load('baskets')
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating property: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating property'
            ], 500);
        }
    }

    /**
     * Toggle favorite status for a property in user's basket
     */
    public function toggleFavorite(Property $property): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Find the user's basket entry for this property
            $basket = \App\Models\PropertyBasket::where('user_id', $user->id)
                ->where('property_id', $property->id)
                ->first();
            
            if (!$basket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property not found in your basket'
                ], 404);
            }

            // Toggle favorite status
            $basket->update([
                'is_favorite' => !$basket->is_favorite
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'property_id' => $property->id,
                    'is_favorite' => $basket->is_favorite,
                ],
                'message' => $basket->is_favorite ? 'Property added to favorites' : 'Property removed from favorites'
            ]);
        } catch (\Exception $e) {
            Log::error('Error toggling favorite status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating favorite status'
            ], 500);
        }
    }

    /**
     * Delete property completely
     */
    public function deleteProperty(Property $property): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Check if user has this property in their basket (for authorization)
            $hasProperty = $property->baskets()->where('user_id', $user->id)->exists();
            
            if (!$hasProperty) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only delete properties from your own basket'
                ], 403);
            }

            // Delete associated photos if they exist
            if ($property->property_photos && is_array($property->property_photos)) {
                foreach ($property->property_photos as $photoPath) {
                    if (str_starts_with($photoPath, '/storage/')) {
                        $filePath = str_replace('/storage/', 'public/', $photoPath);
                        Storage::delete($filePath);
                    }
                }
            }

            // Delete the property (this will cascade delete baskets due to foreign key)
            $property->delete();

            return response()->json([
                'success' => true,
                'message' => 'Property deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting property: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting property'
            ], 500);
        }
    }

    /**
     * Scrape property data from Rightmove URL
     * This is a simplified implementation - in production you'd want more robust scraping
     */
    private function scrapePropertyData(string $url): ?array
    {
        try {
            // For this demo, we'll extract basic info from URL and create mock data
            // In production, you'd use a proper web scraper or Rightmove API
            
            $propertyId = $this->extractPropertyIdFromUrl($url);
            
            if (!$propertyId) {
                return null;
            }

            // Mock property data based on URL
            return [
                'title' => 'Property in Great Location - ' . $propertyId,
                'image' => null, // No placeholder image, only use user uploads
                'description' => 'Beautiful property with excellent transport links and local amenities.',
                'address' => 'Sample Address, Sample Area',
                'price' => rand(200000, 800000),
                'type' => collect(['house', 'flat', 'bungalow', 'maisonette'])->random(),
                'bedrooms' => rand(1, 5),
                'bathrooms' => rand(1, 3),
                'metadata' => [
                    'property_id' => $propertyId,
                    'scraped_at' => now()->toISOString(),
                ]
            ];

            // TODO: Implement actual Rightmove scraping
            // $response = Http::timeout(10)->get($url);
            // Parse HTML and extract property details
            
        } catch (\Exception $e) {
            Log::error('Property scraping failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract property ID from Rightmove URL
     */
    private function extractPropertyIdFromUrl(string $url): ?string
    {
        // Match common Rightmove URL patterns
        if (preg_match('/rightmove\.co\.uk\/.*\/(\d+)/', $url, $matches)) {
            return $matches[1];
        }
        
        return substr(md5($url), 0, 8); // Fallback: use URL hash
    }
}
