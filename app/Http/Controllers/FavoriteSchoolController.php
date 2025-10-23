<?php

namespace App\Http\Controllers;

use App\Models\FavoriteSchool;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FavoriteSchoolController extends Controller
{
    /**
     * Get all favorite schools for the authenticated user
     */
    public function index(): JsonResponse
    {
        $favoriteSchools = FavoriteSchool::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($school) => $school->toSchoolFormat());

        return response()->json($favoriteSchools);
    }

    /**
     * Add a school to favorites
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'school' => 'required|array',
            'school.id' => 'required|string',
            'school.name' => 'required|string|max:255',
            'school.address' => 'required|string',
            'school.coordinates' => 'required|array|size:2',
            'school.coordinates.0' => 'required|numeric|between:-90,90', // latitude
            'school.coordinates.1' => 'required|numeric|between:-180,180', // longitude
            'school.catchmentZones' => 'sometimes|array',
            'school.averageCatchment' => 'sometimes|array|nullable',
            'school.isActive' => 'sometimes|boolean'
        ]);

        try {
            $favoriteSchool = FavoriteSchool::create(
                FavoriteSchool::fromSchoolFormat($validated['school'], Auth::id())
            );

            return response()->json([
                'success' => true,
                'school' => $favoriteSchool->toSchoolFormat(),
                'message' => 'School added to favorites successfully!'
            ], 201);

        } catch (\Exception $e) {
            // Handle duplicate entries
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'success' => false,
                    'message' => 'This school is already in your favorites!'
                ], 409);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to add school to favorites.'
            ], 500);
        }
    }

    /**
     * Update a favorite school (e.g., catchment zones)
     */
    public function update(Request $request, string $schoolId): JsonResponse
    {
        $validated = $request->validate([
            'school' => 'required|array',
            'school.name' => 'sometimes|string|max:255',
            'school.address' => 'sometimes|string',
            'school.coordinates' => 'sometimes|array|size:2',
            'school.catchmentZones' => 'sometimes|array',
            'school.averageCatchment' => 'sometimes|array|nullable',
            'school.isActive' => 'sometimes|boolean'
        ]);

        $favoriteSchool = FavoriteSchool::where('user_id', Auth::id())
            ->where('school_id', $schoolId)
            ->first();

        if (!$favoriteSchool) {
            return response()->json([
                'success' => false,
                'message' => 'Favorite school not found.'
            ], 404);
        }

        $updateData = [];
        $school = $validated['school'];

        if (isset($school['name'])) $updateData['name'] = $school['name'];
        if (isset($school['address'])) $updateData['address'] = $school['address'];
        if (isset($school['coordinates'])) {
            $updateData['latitude'] = $school['coordinates'][0];
            $updateData['longitude'] = $school['coordinates'][1];
        }
        if (isset($school['catchmentZones'])) $updateData['catchment_zones'] = $school['catchmentZones'];
        if (isset($school['averageCatchment'])) $updateData['average_catchment'] = $school['averageCatchment'];
        if (isset($school['isActive'])) $updateData['is_active'] = $school['isActive'];

        $favoriteSchool->update($updateData);

        return response()->json([
            'success' => true,
            'school' => $favoriteSchool->fresh()->toSchoolFormat(),
            'message' => 'Favorite school updated successfully!'
        ]);
    }

    /**
     * Remove a school from favorites
     */
    public function destroy(string $schoolId): JsonResponse
    {
        $deleted = FavoriteSchool::where('user_id', Auth::id())
            ->where('school_id', $schoolId)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'School removed from favorites successfully!'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Favorite school not found.'
        ], 404);
    }

    /**
     * Bulk update favorite schools (for when multiple schools change at once)
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'schools' => 'required|array',
            'schools.*.id' => 'required|string',
            'schools.*.name' => 'required|string|max:255',
            'schools.*.address' => 'required|string',
            'schools.*.coordinates' => 'required|array|size:2',
            'schools.*.catchmentZones' => 'sometimes|array',
            'schools.*.averageCatchment' => 'sometimes|array|nullable',
            'schools.*.isActive' => 'sometimes|boolean'
        ]);

        $userId = Auth::id();
        $updatedSchools = [];

        foreach ($validated['schools'] as $schoolData) {
            $favoriteSchool = FavoriteSchool::updateOrCreate(
                [
                    'user_id' => $userId,
                    'school_id' => $schoolData['id']
                ],
                FavoriteSchool::fromSchoolFormat($schoolData, $userId)
            );

            $updatedSchools[] = $favoriteSchool->toSchoolFormat();
        }

        return response()->json([
            'success' => true,
            'schools' => $updatedSchools,
            'message' => 'Favorite schools updated successfully!'
        ]);
    }
}
