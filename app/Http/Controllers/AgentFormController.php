<?php

namespace App\Http\Controllers;

use App\Models\ChainChecker;
use App\Models\ChainUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class AgentFormController extends Controller
{
    /**
     * Show the agent form page
     */
    public function show(string $token): Response
    {
        $chainChecker = ChainChecker::where('agent_token', $token)
            ->where('is_active', true)
            ->with('user:id,name,email')
            ->first();

        if (!$chainChecker) {
            abort(404, 'Chain not found or token invalid');
        }

        return Inertia::render('agent/ChainUpdateForm', [
            'chainChecker' => $chainChecker,
            'token' => $token,
        ]);
    }

    /**
     * Submit agent form updates
     */
    public function update(Request $request, string $token)
    {
        $chainChecker = ChainChecker::where('agent_token', $token)
            ->where('is_active', true)
            ->first();

        if (!$chainChecker) {
            return back()->withErrors(['token' => 'Invalid or expired token']);
        }

        $validator = Validator::make($request->all(), [
            'agent_name' => 'required|string|max:255',
            'chain_status' => 'required|array',
            'chain_status.*.completed' => 'required|boolean',
            'chain_status.*.notes' => 'nullable|string|max:500',
            'estimated_completion' => 'nullable|date|after:today',
            'overall_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors())->withInput();
        }

        // Update chain checker
        $chainChecker->update([
            'agent_name' => $request->agent_name,
            'chain_status' => $request->chain_status,
            'estimated_completion' => $request->estimated_completion ? 
                \Carbon\Carbon::parse($request->estimated_completion) : null,
            'notes' => $request->overall_notes,
            'progress_score' => $chainChecker->calculateHealthScore(),
        ]);

        // Create update log
        ChainUpdate::createUpdate(
            $chainChecker->id,
            'agent_update',
            'Agent Update Received',
            'Your agent has provided an update on your chain progress.',
            null, // No user_id for agent updates
            [
                'agent_name' => $request->agent_name,
                'updated_stages' => array_keys($request->chain_status),
            ]
        );

        return back()->with('success', 'Chain updated successfully! The homeowner will be notified.');
    }

    /**
     * API endpoint to get chain data for agent form
     */
    public function getChainData(string $token)
    {
        $chainChecker = ChainChecker::where('agent_token', $token)
            ->where('is_active', true)
            ->with('user:id,name,email')
            ->first();

        if (!$chainChecker) {
            return response()->json([
                'success' => false,
                'message' => 'Chain not found or token invalid'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'chain_checker' => $chainChecker,
                'stages' => [
                    'offer_accepted' => 'Offer Accepted',
                    'searches_surveys' => 'Searches & Surveys',
                    'mortgage_approval' => 'Mortgage Approval',
                    'contracts_exchanged' => 'Contracts Exchanged',
                    'completion' => 'Completion',
                ],
            ]
        ]);
    }
}
