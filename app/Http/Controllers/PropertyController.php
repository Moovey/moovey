<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\ChainUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    /**
     * Get user's property basket
     */
    public function getBasket(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        try {
            // Use the PropertyBasket model directly to ensure we get the right data
            $basketProperties = \App\Models\PropertyBasket::where('user_id', $user->id)
                ->with('property')
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('Basket properties for user ' . $user->id, [
                'count' => $basketProperties->count(),
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
     * Add property to basket from Rightmove URL
     */
    public function addToBasket(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rightmove_url' => 'required|url',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $url = $request->rightmove_url;
        $user = Auth::user();

        // Check if property already exists
        $property = Property::where('rightmove_url', $url)->first();

        if (!$property) {
            // Scrape property data from Rightmove
            $propertyData = $this->scrapePropertyData($url);
            
            if (!$propertyData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to fetch property data from Rightmove'
                ], 400);
            }

            // Create new property
            $property = Property::create([
                'rightmove_url' => $url,
                'property_title' => $propertyData['title'],
                'property_image' => $propertyData['image'],
                'property_description' => $propertyData['description'],
                'address' => $propertyData['address'],
                'price' => $propertyData['price'],
                'property_type' => $propertyData['type'],
                'bedrooms' => $propertyData['bedrooms'],
                'bathrooms' => $propertyData['bathrooms'],
                'metadata' => $propertyData['metadata'] ?? [],
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
                'property' => $property,
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
        
        $claimed = $property->claimProperty($user->id, $request->claim_type);
        
        if (!$claimed) {
            return response()->json([
                'success' => false,
                'message' => 'Property is already claimed'
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
            'data' => $property->fresh(),
            'message' => 'Property claimed successfully'
        ]);
    }

    /**
     * Get property details with basket counts
     */
    public function show(Property $property): JsonResponse
    {
        $user = Auth::user();
        
        $property->load(['baskets', 'claimedByUser:id,name']);
        
        return response()->json([
            'success' => true,
            'data' => [
                'property' => $property,
                'is_in_user_basket' => $property->isInUserBasket($user->id),
                'basket_count' => $property->basket_count,
                'is_claimed' => $property->is_claimed,
                'claim_type' => $property->claim_type,
                'claimed_by_current_user' => $property->claimed_by_user_id === $user->id,
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
                'image' => 'https://via.placeholder.com/400x300?text=Property+Image',
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
