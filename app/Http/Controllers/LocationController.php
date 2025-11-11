<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    /**
     * Search for locations based on query string
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        
        if (empty(trim($query)) || strlen(trim($query)) < 2) {
            return response()->json([
                'success' => true,
                'suggestions' => []
            ]);
        }
        
        // Use cache to reduce API calls and improve performance
        $cacheKey = 'location_search_' . md5(strtolower(trim($query)));
        
        $locations = Cache::remember($cacheKey, 300, function() use ($query) {
            return $this->getLocationSuggestionsFromNominatim($query);
        });
        
        return response()->json([
            'success' => true,
            'suggestions' => $locations
        ]);
    }
    
    /**
     * Get location suggestions from Nominatim (OpenStreetMap) - FREE API
     * 
     * @param string $query
     * @return array
     */
    private function getLocationSuggestionsFromNominatim(string $query): array
    {
        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'User-Agent' => 'Moovey App (contact@moovey.com)', // Required by Nominatim
                ])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $query,
                    'format' => 'json',
                    'addressdetails' => 1,
                    'limit' => 10,
                    'countrycodes' => 'gb', // Restrict to UK only, remove this for worldwide
                    'featuretype' => 'city', // Focus on cities/towns
                ]);

            if (!$response->successful()) {
                return $this->getFallbackSuggestions($query);
            }

            $data = $response->json();
            $suggestions = [];

            foreach ($data as $item) {
                // Build a nice display name
                $displayName = $this->formatLocationName($item);
                
                if ($displayName) {
                    $suggestions[] = [
                        'display_name' => $displayName,
                        'value' => $displayName,
                        'type' => 'location',
                        'lat' => $item['lat'] ?? null,
                        'lon' => $item['lon'] ?? null,
                    ];
                }
            }

            // Remove duplicates and return
            return array_values(array_unique($suggestions, SORT_REGULAR));
            
        } catch (\Exception $e) {
            Log::warning('Nominatim API error: ' . $e->getMessage());
            return $this->getFallbackSuggestions($query);
        }
    }
    
    /**
     * Format location name for display
     * 
     * @param array $item
     * @return string|null
     */
    private function formatLocationName(array $item): ?string
    {
        $address = $item['address'] ?? [];
        $parts = [];
        
        // Priority order for location parts
        if (!empty($address['city'])) {
            $parts[] = $address['city'];
        } elseif (!empty($address['town'])) {
            $parts[] = $address['town'];
        } elseif (!empty($address['village'])) {
            $parts[] = $address['village'];
        } elseif (!empty($address['suburb'])) {
            $parts[] = $address['suburb'];
        }
        
        // Add county/state if available
        if (!empty($address['county'])) {
            $parts[] = $address['county'];
        } elseif (!empty($address['state'])) {
            $parts[] = $address['state'];
        }
        
        // Add country
        if (!empty($address['country'])) {
            $parts[] = $address['country'];
        }
        
        return !empty($parts) ? implode(', ', $parts) : ($item['display_name'] ?? null);
    }
    
    /**
     * Fallback to local suggestions if API fails
     * 
     * @param string $query
     * @return array
     */
    private function getFallbackSuggestions(string $query): array
    {
        return $this->getLocationSuggestions($query);
    }
    
    /**
     * Get location suggestions based on query
     * This is a simple implementation - fallback when Nominatim API fails
     * 
     * @param string $query
     * @return array
     */
    private function getLocationSuggestions(string $query): array
    {
        // Fallback UK locations database when Nominatim API fails
        $ukLocations = [
            'London, England, UK',
            'Manchester, England, UK',
            'Birmingham, England, UK',
            'Leeds, England, UK',
            'Glasgow, Scotland, UK',
            'Sheffield, England, UK',
            'Bradford, England, UK',
            'Liverpool, England, UK',
            'Edinburgh, Scotland, UK',
            'Bristol, England, UK',
            'Cardiff, Wales, UK',
            'Belfast, Northern Ireland, UK',
            'Leicester, England, UK',
            'Coventry, England, UK',
            'Nottingham, England, UK',
            'Newcastle upon Tyne, England, UK',
            'Brighton, England, UK',
            'Portsmouth, England, UK',
            'Southampton, England, UK',
            'Reading, England, UK',
            'Oxford, England, UK',
            'Cambridge, England, UK',
            'York, England, UK',
            'Bath, England, UK',
            'Canterbury, England, UK',
        ];
        
        $query = strtolower($query);
        $suggestions = [];
        
        foreach ($ukLocations as $location) {
            if (stripos($location, $query) !== false) {
                $suggestions[] = [
                    'display_name' => $location,
                    'value' => $location,
                    'type' => 'location',
                    'lat' => null,
                    'lon' => null,
                ];
                
                if (count($suggestions) >= 10) {
                    break;
                }
            }
        }
        
        return $suggestions;
    }
}