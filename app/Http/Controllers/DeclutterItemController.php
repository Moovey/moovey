<?php

namespace App\Http\Controllers;

use App\Models\DeclutterItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DeclutterItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = DeclutterItem::byUser(Auth::id())
                             ->orderBy('created_at', 'desc')
                             ->get();

        return response()->json([
            'success' => true,
            'items' => $items
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'condition' => ['required', Rule::in(['excellent', 'good', 'fair', 'poor'])],
            'estimated_value' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'action' => ['required', Rule::in(['throw', 'donate', 'sell', 'keep'])],
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('declutter_items', 'public');
                $imagePaths[] = $path;
            }
        }

        $item = DeclutterItem::create([
            ...$validated,
            'user_id' => Auth::id(),
            'estimated_value' => $validated['estimated_value'] ?? 0,
            'images' => $imagePaths,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item added successfully',
            'item' => $item
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $item = DeclutterItem::where('id', $id)
                            ->where('user_id', Auth::id())
                            ->firstOrFail();

        return response()->json([
            'success' => true,
            'item' => $item
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $item = DeclutterItem::where('id', $id)
                            ->where('user_id', Auth::id())
                            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'condition' => ['required', Rule::in(['excellent', 'good', 'fair', 'poor'])],
            'estimated_value' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'action' => ['required', Rule::in(['throw', 'donate', 'sell', 'keep'])],
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image uploads if new images are provided
        $updateData = [
            ...$validated,
            'estimated_value' => $validated['estimated_value'] ?? 0,
        ];

        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('declutter_items', 'public');
                $imagePaths[] = $path;
            }
            $updateData['images'] = $imagePaths;
        }

        $item->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'item' => $item->fresh()
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = DeclutterItem::where('id', $id)
                            ->where('user_id', Auth::id())
                            ->firstOrFail();

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully'
        ]);
    }

    /**
     * List an item for sale in the marketplace.
     */
    public function listForSale(string $id)
    {
        $item = DeclutterItem::where('id', $id)
                            ->where('user_id', Auth::id())
                            ->firstOrFail();

        $item->update(['is_listed_for_sale' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Item listed for sale successfully',
            'item' => $item->fresh()
        ]);
    }

    /**
     * Unlist an item from the marketplace.
     */
    public function unlistFromSale(string $id)
    {
        $item = DeclutterItem::where('id', $id)
                            ->where('user_id', Auth::id())
                            ->firstOrFail();

        $item->update(['is_listed_for_sale' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Item unlisted from marketplace successfully',
            'item' => $item->fresh()
        ]);
    }

    /**
     * Get marketplace items (items listed for sale).
     */
    public function marketplace()
    {
        $items = DeclutterItem::forSale()
                             ->with('user:id,name')
                             ->orderBy('created_at', 'desc')
                             ->get();

        return response()->json([
            'success' => true,
            'items' => $items
        ]);
    }
}
