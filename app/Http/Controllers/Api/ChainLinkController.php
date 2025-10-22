<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChainLinkingService;
use App\Models\Property;
use App\Models\PropertyBasket;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChainLinkController extends Controller
{
    protected ChainLinkingService $chainLinkingService;

    public function __construct(ChainLinkingService $chainLinkingService)
    {
        $this->chainLinkingService = $chainLinkingService;
    }

    /**
     * Get chain link opportunities for the authenticated user
     */
    public function getChainOpportunities(): JsonResponse
    {
        try {
            $user = Auth::user();
            $opportunities = $this->chainLinkingService->getChainOpportunitiesForUser($user);

            // Enhance opportunities with property details
            $enhancedOpportunities = $opportunities->map(function ($notification) {
                $data = $notification->data;
                
                // Get property details
                if (isset($data['property_id'])) {
                    $property = Property::find($data['property_id']);
                    if ($property) {
                        $data['property_details'] = [
                            'title' => $property->property_title,
                            'address' => $property->address,
                            'price' => $property->formatted_price,
                            'main_image' => $property->main_image,
                            'rightmove_url' => $property->rightmove_url
                        ];
                    }
                }

                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $data,
                    'created_at' => $notification->created_at,
                    'action_url' => $notification->action_url
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $enhancedOpportunities,
                'count' => $opportunities->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get chain opportunities', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load chain opportunities'
            ], 500);
        }
    }

    /**
     * Accept a chain link opportunity
     */
    public function acceptChainLink(Request $request): JsonResponse
    {
        $request->validate([
            'notification_id' => 'required|integer|exists:notifications,id',
            'property_id' => 'required|integer|exists:properties,id',
            'initiating_user_id' => 'required|integer|exists:users,id'
        ]);

        try {
            $user = Auth::user();
            
            // Verify the notification belongs to the user
            $notification = Notification::where('id', $request->notification_id)
                ->where('user_id', $user->id)
                ->where('type', 'chain_link_opportunity')
                ->firstOrFail();

            // Process the chain link acceptance
            $result = $this->chainLinkingService->processChainLinkAcceptance(
                $user,
                $request->property_id,
                $request->initiating_user_id
            );

            if ($result['success']) {
                return response()->json($result);
            } else {
                return response()->json($result, 400);
            }

        } catch (\Exception $e) {
            Log::error('Failed to accept chain link', [
                'user_id' => Auth::id(),
                'notification_id' => $request->notification_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to accept chain link. Please try again.'
            ], 500);
        }
    }

    /**
     * Decline a chain link opportunity
     */
    public function declineChainLink(Request $request): JsonResponse
    {
        $request->validate([
            'notification_id' => 'required|integer|exists:notifications,id'
        ]);

        try {
            $user = Auth::user();
            
            // Verify the notification belongs to the user and mark as read
            $notification = Notification::where('id', $request->notification_id)
                ->where('user_id', $user->id)
                ->where('type', 'chain_link_opportunity')
                ->firstOrFail();

            $notification->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Chain link opportunity declined'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to decline chain link', [
                'user_id' => Auth::id(),
                'notification_id' => $request->notification_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to decline chain link'
            ], 500);
        }
    }

    /**
     * Get multiple claims information for a property
     */
    public function getPropertyClaimInfo(Property $property): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get all claims for this property
            $claimsByType = $this->chainLinkingService->detectMultipleClaims($property);
            
            // Check if user has this property in basket
            $userBasket = PropertyBasket::where('user_id', $user->id)
                ->where('property_id', $property->id)
                ->first();

            $claimInfo = [
                'property_id' => $property->id,
                'property_title' => $property->property_title,
                'total_claims' => $claimsByType->flatten()->count(),
                'claims_by_type' => [],
                'user_claim' => null,
                'potential_links' => []
            ];

            // Process claims by type
            foreach ($claimsByType as $claimType => $claims) {
                $claimInfo['claims_by_type'][$claimType] = $claims->map(function ($basket) {
                    return [
                        'user_id' => $basket->user->id,
                        'user_name' => $basket->user->name,
                        'claimed_at' => $basket->claimed_at,
                        'notes' => $basket->notes
                    ];
                });
            }

            // Add user's claim info if they have one
            if ($userBasket && $userBasket->is_claimed) {
                $claimInfo['user_claim'] = [
                    'claim_type' => $userBasket->claim_type,
                    'claimed_at' => $userBasket->claimed_at,
                    'notes' => $userBasket->notes
                ];

                // Find potential links for this user
                $potentialLinks = $this->chainLinkingService->detectPotentialChainLinks(
                    $property,
                    $user,
                    $userBasket->claim_type
                );

                $claimInfo['potential_links'] = $potentialLinks->map(function ($link) {
                    return [
                        'user_id' => $link['potential_link_user']->id,
                        'user_name' => $link['potential_link_user']->name,
                        'user_role' => $link['potential_link_user_role'],
                        'link_type' => $link['link_type'],
                        'confidence_score' => $link['confidence_score']
                    ];
                });
            }

            return response()->json([
                'success' => true,
                'data' => $claimInfo
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get property claim info', [
                'property_id' => $property->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load property claim information'
            ], 500);
        }
    }

    /**
     * Initiate contact with another user for chain linking
     */
    public function initiateContact(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|integer|exists:properties,id',
            'target_user_id' => 'required|integer|exists:users,id',
            'message' => 'required|string|max:500'
        ]);

        try {
            $user = Auth::user();
            $property = Property::findOrFail($request->property_id);
            $targetUser = \App\Models\User::findOrFail($request->target_user_id);

            // Create a contact notification
            Notification::create([
                'user_id' => $targetUser->id,
                'type' => 'chain_contact_request',
                'title' => 'Chain Contact Request',
                'message' => "{$user->name} wants to connect with you about {$property->property_title}",
                'data' => [
                    'property_id' => $property->id,
                    'property_title' => $property->property_title,
                    'initiating_user_id' => $user->id,
                    'initiating_user_name' => $user->name,
                    'user_message' => $request->message,
                    'contact_type' => 'chain_linking'
                ],
                'action_url' => '/housemover/connections',
                'is_read' => false
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Contact request sent successfully!'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to initiate contact', [
                'user_id' => Auth::id(),
                'property_id' => $request->property_id,
                'target_user_id' => $request->target_user_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send contact request'
            ], 500);
        }
    }

    /**
     * Get chain statistics for the authenticated user
     */
    public function getChainStats(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get user's chain checker
            $chainChecker = $user->chainChecker;
            if (!$chainChecker) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'has_chain_checker' => false,
                        'message' => 'Chain checker not activated'
                    ]
                ]);
            }

            // Get statistics
            $buyingProperties = $chainChecker->buyingProperties();
            $sellingProperties = $chainChecker->sellingProperties();
            $participants = $chainChecker->chain_participants ?? [];
            
            // Get pending opportunities
            $pendingOpportunities = $this->chainLinkingService->getChainOpportunitiesForUser($user);

            $stats = [
                'has_chain_checker' => true,
                'chain_role' => $chainChecker->chain_role,
                'is_active' => $chainChecker->is_active,
                'buying_properties_count' => $buyingProperties->count(),
                'selling_properties_count' => $sellingProperties->count(),
                'chain_participants_count' => count($participants),
                'pending_opportunities_count' => $pendingOpportunities->count(),
                'progress_score' => $chainChecker->progress_score ?? 0,
                'last_activity' => $chainChecker->last_activity_at,
                'estimated_completion' => $chainChecker->estimated_completion
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get chain stats', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load chain statistics'
            ], 500);
        }
    }

    /**
     * Get connection requests for the authenticated user
     */
    public function getConnectionRequests(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get pending connection requests
            $requests = Notification::where('user_id', $user->id)
                ->where('type', 'chain_contact_request')
                ->where('is_read', false)
                ->orderBy('created_at', 'desc')
                ->get();

            // Enhance requests with property details
            $enhancedRequests = $requests->map(function ($notification) {
                $data = $notification->data;
                
                // Get property details
                if (isset($data['property_id'])) {
                    $property = Property::find($data['property_id']);
                    if ($property) {
                        $data['property_details'] = [
                            'title' => $property->property_title,
                            'address' => $property->address,
                            'price' => $property->formatted_price,
                            'main_image' => $property->main_image,
                            'rightmove_url' => $property->rightmove_url
                        ];
                    }
                }

                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $data,
                    'created_at' => $notification->created_at,
                    'action_url' => $notification->action_url
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $enhancedRequests,
                'count' => $requests->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get connection requests', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load connection requests'
            ], 500);
        }
    }

    /**
     * Accept a connection request
     */
    public function acceptConnectionRequest(Request $request): JsonResponse
    {
        $request->validate([
            'notification_id' => 'required|integer|exists:notifications,id',
            'property_id' => 'required|integer|exists:properties,id',
            'initiating_user_id' => 'required|integer|exists:users,id'
        ]);

        try {
            $user = Auth::user();
            
            // Verify the notification belongs to the user
            $notification = Notification::where('id', $request->notification_id)
                ->where('user_id', $user->id)
                ->where('type', 'chain_contact_request')
                ->firstOrFail();

            // Process the connection acceptance using the chain linking service
            $result = $this->chainLinkingService->processChainLinkAcceptance(
                $user,
                $request->property_id,
                $request->initiating_user_id
            );

            if ($result['success']) {
                // Mark the notification as read
                $notification->update(['is_read' => true]);
                
                return response()->json($result);
            } else {
                return response()->json($result, 400);
            }

        } catch (\Exception $e) {
            Log::error('Failed to accept connection request', [
                'user_id' => Auth::id(),
                'notification_id' => $request->notification_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to accept connection request. Please try again.'
            ], 500);
        }
    }

    /**
     * Decline a connection request
     */
    public function declineConnectionRequest(Request $request): JsonResponse
    {
        $request->validate([
            'notification_id' => 'required|integer|exists:notifications,id'
        ]);

        try {
            $user = Auth::user();
            
            // Verify the notification belongs to the user and mark as read
            $notification = Notification::where('id', $request->notification_id)
                ->where('user_id', $user->id)
                ->where('type', 'chain_contact_request')
                ->firstOrFail();

            $notification->update(['is_read' => true]);

            // Optionally notify the initiating user that their request was declined
            $data = $notification->data;
            if (isset($data['initiating_user_id'])) {
                Notification::create([
                    'user_id' => $data['initiating_user_id'],
                    'type' => 'chain_contact_declined',
                    'title' => 'Connection Request Declined',
                    'message' => "{$user->name} has declined your connection request for {$data['property_title']}.",
                    'data' => [
                        'property_id' => $data['property_id'],
                        'property_title' => $data['property_title'],
                        'declining_user_id' => $user->id,
                        'declining_user_name' => $user->name
                    ],
                    'is_read' => false
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Connection request declined'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to decline connection request', [
                'user_id' => Auth::id(),
                'notification_id' => $request->notification_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to decline connection request'
            ], 500);
        }
    }
}