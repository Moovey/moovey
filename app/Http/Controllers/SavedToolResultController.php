<?php

namespace App\Http\Controllers;

use App\Models\SavedToolResult;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SavedToolResultController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'tool_type' => 'required|in:mortgage,affordability,volume,school-catchment',
            'form_data' => 'required|array',
            'results' => 'required|array',
            'calculated_at' => 'required|date'
        ]);

        $validated['user_id'] = Auth::id();

        SavedToolResult::create($validated);

        return back()->with('success', 'Results saved successfully!');
    }

    public function index(Request $request): Response
    {
        $perPage = 15; // Optimized page size - not too small (many requests) or too large (slow loading)
        
        $savedResults = SavedToolResult::where('user_id', Auth::id())
            ->select(['id', 'name', 'tool_type', 'results', 'calculated_at', 'created_at']) // Only select needed fields for performance
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $request->get('page', 1));

        // Add pagination info for better UX
        $savedResults->appends($request->query());

        return Inertia::render('SavedResults', [
            'savedResults' => $savedResults
        ]);
    }

    public function show(SavedToolResult $savedToolResult): Response
    {
        // Ensure the user can only view their own saved results
        if ($savedToolResult->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('SavedResultDetail', [
            'savedResult' => $savedToolResult
        ]);
    }

    public function destroy(SavedToolResult $savedToolResult): RedirectResponse
    {
        // Ensure the user can only delete their own saved results
        if ($savedToolResult->user_id !== Auth::id()) {
            abort(403);
        }

        $savedToolResult->delete();

        return back()->with('success', 'Saved result deleted successfully!');
    }

    public function api(): JsonResponse
    {
        $savedResults = SavedToolResult::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($savedResults);
    }
}
