<?php

namespace App\Http\Controllers;

use App\Mail\AgentChainNotification;
use App\Models\ChainChecker;
use App\Models\ChainUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ChainCheckerController extends Controller
{
    /**
     * Get the user's chain checker data
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $chainChecker = $user->chainChecker;
        
        if ($chainChecker) {
            $chainChecker->load(['updates' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            }]);
        }

        if (!$chainChecker) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No chain checker found'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'chain_checker' => $chainChecker,
                'health_score' => $chainChecker->calculateHealthScore(),
                'is_overdue' => $chainChecker->isOverdue(),
                'recent_updates' => $chainChecker->updates,
            ]
        ]);
    }

    /**
     * Create a new chain checker
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'chain_role' => 'required|in:first_time_buyer,seller_only,buyer_seller',
            'buying_properties' => 'nullable|array',
            'buying_properties.*' => 'integer|exists:properties,id',
            'selling_properties' => 'nullable|array',
            'selling_properties.*' => 'integer|exists:properties,id',
            'chain_length' => 'required|integer|min:1|max:20',
            'buying_agent_details' => 'nullable|array',
            'buying_agent_details.name' => 'nullable|string|max:255',
            'buying_agent_details.email' => 'nullable|email|max:255',
            'buying_agent_details.phone' => 'nullable|string|max:20',
            'buying_agent_details.firm' => 'nullable|string|max:255',
            'selling_agent_details' => 'nullable|array',
            'selling_agent_details.name' => 'nullable|string|max:255',
            'selling_agent_details.email' => 'nullable|email|max:255',
            'selling_agent_details.phone' => 'nullable|string|max:20',
            'selling_agent_details.firm' => 'nullable|string|max:255',
            'buying_solicitor_details' => 'nullable|array',
            'buying_solicitor_details.name' => 'nullable|string|max:255',
            'buying_solicitor_details.email' => 'nullable|email|max:255',
            'buying_solicitor_details.phone' => 'nullable|string|max:20',
            'buying_solicitor_details.firm' => 'nullable|string|max:255',
            'selling_solicitor_details' => 'nullable|array',
            'selling_solicitor_details.name' => 'nullable|string|max:255',
            'selling_solicitor_details.email' => 'nullable|email|max:255',
            'selling_solicitor_details.phone' => 'nullable|string|max:20',
            'selling_solicitor_details.firm' => 'nullable|string|max:255',
            'estimated_completion' => 'nullable|date|after:today',
            'consent_agent_contact' => 'nullable|boolean',
            // Backward compatibility
            'move_type' => 'nullable|in:buying,selling,both',
            'agent_name' => 'nullable|string|max:255',
            'agent_email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        // Deactivate any existing chain checker
        if ($user->chainChecker) {
            $user->chainChecker->update(['is_active' => false]);
        }

        // Create new chain checker
        $chainChecker = ChainChecker::create([
            'user_id' => $user->id,
            'chain_role' => $request->chain_role,
            'buying_properties' => $request->buying_properties ?? [],
            'selling_properties' => $request->selling_properties ?? [],
            'move_type' => $request->move_type ?? $this->determineMoveType($request->chain_role),
            'chain_length' => $request->chain_length,
            'buying_agent_details' => $request->buying_agent_details ?? [],
            'selling_agent_details' => $request->selling_agent_details ?? [],
            'buying_solicitor_details' => $request->buying_solicitor_details ?? [],
            'selling_solicitor_details' => $request->selling_solicitor_details ?? [],
            // Backward compatibility
            'agent_name' => $request->agent_name ?? $this->getPrimaryAgentName($request),
            'agent_email' => $request->agent_email ?? $this->getPrimaryAgentEmail($request),
            'estimated_completion' => $request->estimated_completion ? 
                \Carbon\Carbon::parse($request->estimated_completion) : null,
            'chain_status' => $this->getDefaultChainStatus(),
            'is_active' => true,
            'last_activity_at' => now(),
        ]);

        // Generate agent token and send notification if agent email provided
        Log::info('Chain checker email check', [
            'has_agent_email' => !empty($request->agent_email),
            'agent_email' => $request->agent_email,
            'has_consent' => $request->consent_agent_contact,
            'will_send_email' => !empty($request->agent_email) && $request->consent_agent_contact
        ]);

        if ($request->agent_email && $request->consent_agent_contact) {
            Log::info('Generating agent token and sending email');
            $chainChecker->generateAgentToken();
            
            // Send email notification to agent
            try {
                Log::info('Attempting to send email to agent', [
                    'agent_email' => $request->agent_email,
                    'agent_name' => $request->agent_name
                ]);
                
                Mail::send(new AgentChainNotification($chainChecker));
                
                Log::info('Email sent successfully to agent');
                
                // Log successful email
                ChainUpdate::createUpdate(
                    $chainChecker->id,
                    'agent_notified',
                    'Agent Notified',
                    "Your agent {$request->agent_name} has been notified about your chain tracker activation.",
                    $user->id
                );
            } catch (\Exception $e) {
                // Log email failure but don't stop the process
                Log::error('Failed to send agent notification email', [
                    'chain_checker_id' => $chainChecker->id,
                    'agent_email' => $request->agent_email,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                ChainUpdate::createUpdate(
                    $chainChecker->id,
                    'agent_notification_failed',
                    'Agent Notification Failed',
                    'We attempted to notify your agent but the email could not be delivered. You can manually share your chain progress with them.',
                    $user->id
                );
            }
        } else {
            Log::info('Email not sent - missing agent email or consent', [
                'agent_email' => $request->agent_email,
                'consent' => $request->consent_agent_contact
            ]);
        }

        // Create initial update
        ChainUpdate::createUpdate(
            $chainChecker->id,
            'chain_created',
            'Chain Checker Activated',
            'Your moving chain tracker has been set up and is ready to use.',
            $user->id
        );

        return response()->json([
            'success' => true,
            'data' => $chainChecker,
            'message' => 'Chain checker created successfully'
        ], 201);
    }

    /**
     * Update chain checker settings
     */
    public function update(Request $request, ChainChecker $chainChecker): JsonResponse
    {
        // Ensure user owns this chain checker
        if ($chainChecker->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'move_type' => 'sometimes|in:buying,selling,both',
            'chain_length' => 'sometimes|integer|min:1|max:20',
            'agent_name' => 'nullable|string|max:255',
            'agent_email' => 'nullable|email|max:255',
            'estimated_completion' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $chainChecker->update($request->only([
            'move_type', 'chain_length', 'agent_name', 'agent_email', 
            'estimated_completion', 'notes'
        ]));

        return response()->json([
            'success' => true,
            'data' => $chainChecker,
            'message' => 'Chain checker updated successfully'
        ]);
    }

    /**
     * Update chain status/stages
     */
    public function updateStatus(Request $request, ChainChecker $chainChecker): JsonResponse
    {
        // Ensure user owns this chain checker
        if ($chainChecker->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'stage' => 'required|in:offer_accepted,searches_surveys,mortgage_approval,contracts_exchanged,completion',
            'completed' => 'required|boolean',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $chainStatus = $chainChecker->chain_status ?? [];
        $stage = $request->stage;
        
        $chainStatus[$stage] = [
            'completed' => $request->completed,
            'updated_at' => now()->toISOString(),
            'notes' => $request->notes,
        ];

        $chainChecker->update([
            'chain_status' => $chainStatus,
            'progress_score' => $chainChecker->calculateHealthScore(),
        ]);

        // Create update log
        $statusText = $request->completed ? 'completed' : 'marked as pending';
        ChainUpdate::createUpdate(
            $chainChecker->id,
            'status_change',
            'Stage Updated',
            "Stage '{$stage}' has been {$statusText}.",
            Auth::id(),
            ['stage' => $stage, 'completed' => $request->completed]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'chain_checker' => $chainChecker,
                'health_score' => $chainChecker->calculateHealthScore(),
            ],
            'message' => 'Status updated successfully'
        ]);
    }

    /**
     * Request update from agent
     */
    public function requestAgentUpdate(Request $request, ChainChecker $chainChecker): JsonResponse
    {
        // Ensure user owns this chain checker
        if ($chainChecker->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (!$chainChecker->agent_email) {
            return response()->json([
                'success' => false,
                'message' => 'No agent email configured'
            ], 400);
        }

        // Create update request log
        ChainUpdate::createUpdate(
            $chainChecker->id,
            'update_request',
            'Update Requested',
            'You requested an update from your agent.',
            Auth::id()
        );

        // TODO: Send email to agent with link to update form

        return response()->json([
            'success' => true,
            'message' => 'Update request sent to agent'
        ]);
    }

    /**
     * Complete the chain
     */
    public function complete(ChainChecker $chainChecker): JsonResponse
    {
        // Ensure user owns this chain checker
        if ($chainChecker->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $chainChecker->markCompleted();

        ChainUpdate::createUpdate(
            $chainChecker->id,
            'chain_completed',
            'Move Completed! 🎉',
            'Congratulations! Your move has been successfully completed.',
            Auth::id()
        );

        return response()->json([
            'success' => true,
            'data' => $chainChecker,
            'message' => 'Chain marked as completed'
        ]);
    }

    /**
     * Get recent updates for a chain
     */
    public function getUpdates(ChainChecker $chainChecker): JsonResponse
    {
        // Ensure user owns this chain checker
        if ($chainChecker->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $updates = $chainChecker->updates()
            ->where('is_public', true)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $updates
        ]);
    }

    /**
     * Get default chain status structure
     */
    private function getDefaultChainStatus(): array
    {
        $defaultStages = [
            'offer_accepted' => [
                'completed' => false,
                'progress' => 0,
                'notes' => null,
                'updated_at' => null,
            ],
            'searches_surveys' => [
                'completed' => false,
                'progress' => 0,
                'notes' => null,
                'updated_at' => null,
            ],
            'surveys_complete' => [
                'completed' => false,
                'progress' => 0,
                'notes' => null,
                'updated_at' => null,
            ],
            'mortgage_approval' => [
                'completed' => false,
                'progress' => 0,
                'notes' => null,
                'updated_at' => null,
            ],
            'contracts_exchanged' => [
                'completed' => false,
                'progress' => 0,
                'notes' => null,
                'updated_at' => null,
            ],
            'completion' => [
                'completed' => false,
                'progress' => 0,
                'notes' => null,
                'updated_at' => null,
            ],
        ];

        // Return structure with separate buying and selling sections
        return [
            'buying' => $defaultStages,
            'selling' => $defaultStages,
            // Keep legacy structure for backward compatibility
            ...$defaultStages
        ];
    }

    /**
     * Determine move type from chain role for backward compatibility
     */
    private function determineMoveType(string $chainRole): string
    {
        return match($chainRole) {
            'first_time_buyer' => 'buying',
            'seller_only' => 'selling',
            'buyer_seller' => 'both',
            default => 'buying'
        };
    }

    /**
     * Get primary agent name from the new structured data
     */
    private function getPrimaryAgentName(Request $request): ?string
    {
        $buyingAgent = $request->buying_agent_details['name'] ?? null;
        $sellingAgent = $request->selling_agent_details['name'] ?? null;
        
        return $buyingAgent ?: $sellingAgent;
    }

    /**
     * Get primary agent email from the new structured data
     */
    private function getPrimaryAgentEmail(Request $request): ?string
    {
        $buyingAgent = $request->buying_agent_details['email'] ?? null;
        $sellingAgent = $request->selling_agent_details['email'] ?? null;
        
        return $buyingAgent ?: $sellingAgent;
    }

    /**
     * Build a new chain link for unknown properties
     */
    public function buildLink(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:buying,selling,unknown',
            'rightmove_link' => 'required|url',
            'agent_name' => 'nullable|string|max:255',
            'agent_email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $chainChecker = $user->chainChecker;

        if (!$chainChecker) {
            return response()->json([
                'success' => false,
                'message' => 'No active chain checker found'
            ], 404);
        }

        // Create a chain update log for the new link
        ChainUpdate::createUpdate(
            $chainChecker->id,
            'link_built',
            'Chain Link Built',
            "New chain link created for {$request->type} property: {$request->rightmove_link}",
            $user->id,
            [
                'type' => $request->type,
                'rightmove_link' => $request->rightmove_link,
                'agent_name' => $request->agent_name,
                'agent_email' => $request->agent_email,
            ]
        );

        // Update the chain checker's last activity
        $chainChecker->touch('last_activity_at');

        return response()->json([
            'success' => true,
            'data' => [
                'chain_checker' => $chainChecker->fresh(),
                'health_score' => $chainChecker->calculateHealthScore(),
            ],
            'message' => 'Chain link built successfully'
        ]);
    }

    /**
     * Update progress for user-owned properties
     */
    public function updateProgress(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:buying,selling',
            'stages' => 'required|array',
            'stages.offerAccepted' => 'required|integer|min:0|max:100',
            'stages.mortgageApproved' => 'required|integer|min:0|max:100',
            'stages.searchesComplete' => 'required|integer|min:0|max:100',
            'stages.surveysComplete' => 'required|integer|min:0|max:100',
            'stages.contractsExchanged' => 'required|integer|min:0|max:100',
            'stages.completionAchieved' => 'required|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $chainChecker = $user->chainChecker;

        if (!$chainChecker) {
            return response()->json([
                'success' => false,
                'message' => 'No active chain checker found'
            ], 404);
        }

        $stages = $request->stages;
        $type = $request->type;

        // Update the chain status with new percentage-based progress
        // Use separate objects for buying and selling progress
        $chainStatus = $chainChecker->chain_status ?? [];
        
        // Initialize structure if it doesn't exist
        if (!isset($chainStatus['buying'])) {
            $chainStatus['buying'] = [];
        }
        if (!isset($chainStatus['selling'])) {
            $chainStatus['selling'] = [];
        }
        
        // Map the frontend stage names to backend ones
        $stageMap = [
            'offerAccepted' => 'offer_accepted',
            'mortgageApproved' => 'mortgage_approval',
            'searchesComplete' => 'searches_surveys',
            'surveysComplete' => 'surveys_complete',
            'contractsExchanged' => 'contracts_exchanged',
            'completionAchieved' => 'completion',
        ];

        $updatedStages = [];
        foreach ($stages as $frontendStage => $percentage) {
            $backendStage = $stageMap[$frontendStage] ?? $frontendStage;
            
            // Store progress under the specific property type (buying or selling)
            $chainStatus[$type][$backendStage] = [
                'completed' => $percentage >= 100,
                'progress' => $percentage,
                'updated_at' => now()->toISOString(),
                'notes' => null,
            ];
            $updatedStages[] = "{$frontendStage}: {$percentage}%";
        }

        $chainChecker->update([
            'chain_status' => $chainStatus,
            'progress_score' => $chainChecker->calculateHealthScore(),
            'last_activity_at' => now(),
        ]);

        // Create update log
        ChainUpdate::createUpdate(
            $chainChecker->id,
            'progress_updated',
            'Progress Updated',
            "Updated progress for {$type} property: " . implode(', ', $updatedStages),
            $user->id,
            [
                'type' => $type,
                'stages' => $stages,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'chain_checker' => $chainChecker->fresh(),
                'health_score' => $chainChecker->calculateHealthScore(),
            ],
            'message' => 'Progress updated successfully'
        ]);
    }

    /**
     * Send a message to chain participants
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:buying,selling,unknown',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $chainChecker = $user->chainChecker;

        if (!$chainChecker) {
            return response()->json([
                'success' => false,
                'message' => 'No active chain checker found'
            ], 404);
        }

        // Create update log for the message
        ChainUpdate::createUpdate(
            $chainChecker->id,
            'message_sent',
            'Message Sent',
            "Message sent regarding {$request->type} property: " . substr($request->message, 0, 100) . (strlen($request->message) > 100 ? '...' : ''),
            $user->id,
            [
                'type' => $request->type,
                'message' => $request->message,
            ]
        );

        // Update the chain checker's last activity
        $chainChecker->touch('last_activity_at');

        // TODO: In the future, this could actually send emails to relevant parties
        // For now, we just log the intent

        return response()->json([
            'success' => true,
            'data' => [
                'chain_checker' => $chainChecker->fresh(),
            ],
            'message' => 'Message sent successfully'
        ]);
    }
}
