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
            'move_type' => 'required|in:buying,selling,both',
            'chain_length' => 'required|integer|min:1|max:20',
            'agent_name' => 'nullable|string|max:255',
            'agent_email' => 'nullable|email|max:255',
            'estimated_completion' => 'nullable|date|after:today',
            'consent_agent_contact' => 'nullable|boolean',
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
            'move_type' => $request->move_type,
            'chain_length' => $request->chain_length,
            'agent_name' => $request->agent_name,
            'agent_email' => $request->agent_email,
            'estimated_completion' => $request->estimated_completion ? 
                \Carbon\Carbon::parse($request->estimated_completion) : null,
            'chain_status' => $this->getDefaultChainStatus(),
            'is_active' => true,
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
                    'agent_name' => $request->agent_name,
                    'mail_mailer' => config('mail.default'),
                    'queue_connection' => config('queue.default'),
                    'app_env' => config('app.env')
                ]);
                
                $mailable = new AgentChainNotification($chainChecker);
                
                // For production/Laravel Cloud, queue the email for better reliability
                if (config('app.env') === 'production') {
                    Mail::queue($mailable);
                    Log::info('Email queued for agent', ['agent_email' => $request->agent_email]);
                } else {
                    Mail::send($mailable);
                    Log::info('Email sent immediately to agent', ['agent_email' => $request->agent_email]);
                }
                
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
                    'trace' => $e->getTraceAsString(),
                    'mail_config' => [
                        'mailer' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                    ]
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
        return [
            'offer_accepted' => [
                'completed' => false,
                'notes' => null,
                'updated_at' => null,
            ],
            'searches_surveys' => [
                'completed' => false,
                'notes' => null,
                'updated_at' => null,
            ],
            'mortgage_approval' => [
                'completed' => false,
                'notes' => null,
                'updated_at' => null,
            ],
            'contracts_exchanged' => [
                'completed' => false,
                'notes' => null,
                'updated_at' => null,
            ],
            'completion' => [
                'completed' => false,
                'notes' => null,
                'updated_at' => null,
            ],
        ];
    }
}
