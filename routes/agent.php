<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\ChainChecker;

/*
|--------------------------------------------------------------------------
| Agent Portal Routes
|--------------------------------------------------------------------------
| Routes for agents to access and update chain checker information
*/

// Agent chain update portal
Route::get('/agent/chain-update/{token}', function ($token) {
    $chainChecker = ChainChecker::where('agent_token', $token)
        ->where('is_active', true)
        ->first();
    
    if (!$chainChecker) {
        abort(404, 'Chain checker not found or inactive');
    }
    
    // Load chain data with user info
    $chainChecker->load(['user', 'updates' => function($query) {
        $query->orderBy('created_at', 'desc')->limit(10);
    }]);
    
    return view('agent.chain-update', [
        'chainChecker' => $chainChecker,
        'user' => $chainChecker->user,
        'token' => $token
    ]);
})->name('agent.chain-update');

// Agent chain update submission
Route::post('/agent/chain-update/{token}', function (Request $request, $token) {
    $chainChecker = ChainChecker::where('agent_token', $token)
        ->where('is_active', true)
        ->first();
    
    if (!$chainChecker) {
        abort(404, 'Chain checker not found or inactive');
    }
    
    $request->validate([
        'update_type' => 'required|in:progress,delay,issue,completion',
        'title' => 'required|string|max:255',
        'description' => 'required|string|max:1000',
        'stage' => 'nullable|in:offer_accepted,searches_surveys,mortgage_approval,contracts_exchanged,completion',
        'stage_completed' => 'nullable|boolean',
    ]);
    
    // Create the update
    \App\Models\ChainUpdate::create([
        'chain_checker_id' => $chainChecker->id,
        'update_type' => $request->update_type,
        'title' => $request->title,
        'description' => $request->description,
        'metadata' => $request->stage ? [
            'stage' => $request->stage,
            'completed' => $request->stage_completed ?? false
        ] : null,
        'is_public' => true,
        'user_id' => null, // Agent updates don't have user_id
        'agent_name' => $chainChecker->agent_name,
    ]);
    
    // Update chain status if stage provided
    if ($request->stage) {
        $chainStatus = $chainChecker->chain_status ?? [];
        $chainStatus[$request->stage] = [
            'completed' => $request->stage_completed ?? false,
            'updated_at' => now()->toISOString(),
            'notes' => $request->title,
        ];
        
        $chainChecker->update([
            'chain_status' => $chainStatus,
            'progress_score' => $chainChecker->calculateHealthScore(),
        ]);
    }
    
    return redirect()->back()->with('success', 'Update submitted successfully! Your client will be notified.');
})->name('agent.chain-update.submit');