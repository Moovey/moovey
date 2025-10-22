<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyBasket;
use App\Models\ChainChecker;
use App\Models\User;
use App\Models\Notification;
use App\Events\ChainLinkOpportunity;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChainLinkingService
{
    /**
     * Detect potential chain links when a property is claimed
     */
    public function detectPotentialChainLinks(Property $property, User $claimingUser, string $claimType): Collection
    {
        $potentialLinks = collect();
        
        // Find all other users who have this property in their basket
        $otherUsersWithProperty = PropertyBasket::where('property_id', $property->id)
            ->where('user_id', '!=', $claimingUser->id)
            ->with(['user.chainChecker'])
            ->get();
        
        foreach ($otherUsersWithProperty as $basket) {
            $otherUser = $basket->user;
            
            // Skip if user doesn't have chain checker activated
            if (!$otherUser->chainChecker || !$otherUser->chainChecker->is_active) {
                continue;
            }
            
            // Check for complementary claim types (buyer looking for seller, seller looking for buyer)
            $potentialLink = $this->checkComplementaryChainLink($property, $claimingUser, $claimType, $otherUser, $basket);
            
            if ($potentialLink) {
                $potentialLinks->push($potentialLink);
            }
        }
        
        return $potentialLinks;
    }

    /**
     * Check if two users can form a complementary chain link
     */
    private function checkComplementaryChainLink(Property $property, User $claimingUser, string $claimType, User $otherUser, PropertyBasket $otherUserBasket): ?array
    {
        $otherUserChainRole = $otherUser->chainChecker->chain_role;
        
        // Determine if there's a potential match
        $isMatch = false;
        $linkType = '';
        
        if ($claimType === 'buyer') {
            // Claiming user is buying, check if other user could be selling
            if (in_array($otherUserChainRole, ['seller_only', 'buyer_seller'])) {
                // Check if other user has this property in their selling properties or could sell it
                if ($this->couldUserSellProperty($otherUser, $property)) {
                    $isMatch = true;
                    $linkType = 'buyer_seller_match';
                }
            }
        } elseif ($claimType === 'seller') {
            // Claiming user is selling, check if other user could be buying
            if (in_array($otherUserChainRole, ['first_time_buyer', 'buyer_seller'])) {
                // Check if other user has this property in their buying interests
                if ($this->couldUserBuyProperty($otherUser, $property)) {
                    $isMatch = true;
                    $linkType = 'seller_buyer_match';
                }
            }
        }
        
        if (!$isMatch) {
            return null;
        }
        
        return [
            'property_id' => $property->id,
            'claiming_user' => $claimingUser,
            'claiming_user_role' => $claimType,
            'potential_link_user' => $otherUser,
            'potential_link_user_role' => $otherUserChainRole,
            'link_type' => $linkType,
            'property' => $property,
            'confidence_score' => $this->calculateLinkConfidenceScore($claimingUser, $otherUser, $property),
            'basket_data' => $otherUserBasket
        ];
    }

    /**
     * Check if a user could sell a property (owns it or could own it)
     */
    private function couldUserSellProperty(User $user, Property $property): bool
    {
        $chainChecker = $user->chainChecker;
        
        // Check if property is in their selling properties
        if (!empty($chainChecker->selling_properties) && in_array($property->id, $chainChecker->selling_properties)) {
            return true;
        }
        
        // Check if they have the property marked as claimed by them as seller
        $userBasket = PropertyBasket::where('user_id', $user->id)
            ->where('property_id', $property->id)
            ->first();
            
        if ($userBasket && $userBasket->is_claimed && $userBasket->claim_type === 'seller') {
            return true;
        }
        
        // If they're a seller_only or buyer_seller and have the property in basket, they could potentially sell
        if (in_array($chainChecker->chain_role, ['seller_only', 'buyer_seller'])) {
            return $userBasket !== null;
        }
        
        return false;
    }

    /**
     * Check if a user could buy a property
     */
    private function couldUserBuyProperty(User $user, Property $property): bool
    {
        $chainChecker = $user->chainChecker;
        
        // Check if property is in their buying properties
        if (!empty($chainChecker->buying_properties) && in_array($property->id, $chainChecker->buying_properties)) {
            return true;
        }
        
        // Check if they have the property marked as claimed by them as buyer
        $userBasket = PropertyBasket::where('user_id', $user->id)
            ->where('property_id', $property->id)
            ->first();
            
        if ($userBasket && $userBasket->is_claimed && $userBasket->claim_type === 'buyer') {
            return true;
        }
        
        // If they're a first_time_buyer or buyer_seller and have the property in basket, they could potentially buy
        if (in_array($chainChecker->chain_role, ['first_time_buyer', 'buyer_seller'])) {
            return $userBasket !== null;
        }
        
        return false;
    }

    /**
     * Calculate confidence score for a potential chain link
     */
    private function calculateLinkConfidenceScore(User $claimingUser, User $otherUser, Property $property): int
    {
        $score = 50; // Base score
        
        // Boost score based on user activity
        if ($claimingUser->chainChecker->last_activity_at && $claimingUser->chainChecker->last_activity_at->isAfter(now()->subDays(7))) {
            $score += 20;
        }
        
        if ($otherUser->chainChecker->last_activity_at && $otherUser->chainChecker->last_activity_at->isAfter(now()->subDays(7))) {
            $score += 20;
        }
        
        // Boost score if both users have notes on the property
        $claimingUserBasket = PropertyBasket::where('user_id', $claimingUser->id)->where('property_id', $property->id)->first();
        $otherUserBasket = PropertyBasket::where('user_id', $otherUser->id)->where('property_id', $property->id)->first();
        
        if ($claimingUserBasket && !empty($claimingUserBasket->notes)) {
            $score += 10;
        }
        
        if ($otherUserBasket && !empty($otherUserBasket->notes)) {
            $score += 10;
        }
        
        // Cap at 100
        return min($score, 100);
    }

    /**
     * Send chain link notifications to potential matches
     */
    public function sendChainLinkNotifications(Collection $potentialLinks): void
    {
        foreach ($potentialLinks as $link) {
            $this->createChainLinkNotification($link);
        }
    }

    /**
     * Create a chain link notification for a potential match
     */
    private function createChainLinkNotification(array $linkData): void
    {
        try {
            $notification = Notification::create([
                'user_id' => $linkData['potential_link_user']->id,
                'type' => 'chain_link_opportunity',
                'title' => 'New Chain Link Opportunity!',
                'message' => $this->generateNotificationMessage($linkData),
                'data' => [
                    'property_id' => $linkData['property_id'],
                    'claiming_user_id' => $linkData['claiming_user']->id,
                    'claiming_user_name' => $linkData['claiming_user']->name,
                    'claiming_user_role' => $linkData['claiming_user_role'],
                    'link_type' => $linkData['link_type'],
                    'confidence_score' => $linkData['confidence_score'],
                    'property_title' => $linkData['property']->property_title,
                    'property_address' => $linkData['property']->address,
                    'action_required' => true,
                    'expires_at' => now()->addDays(7)->toISOString()
                ],
                'is_read' => false,
                'action_url' => '/housemover/chain-checker?property_id=' . $linkData['property_id'],
            ]);
            
            // Also send email notification if user has email notifications enabled
            // This would be handled by a mail notification class
            
            Log::info('Chain link notification created', [
                'notification_id' => $notification->id,
                'user_id' => $linkData['potential_link_user']->id,
                'property_id' => $linkData['property_id']
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to create chain link notification', [
                'error' => $e->getMessage(),
                'link_data' => $linkData
            ]);
        }
    }

    /**
     * Generate notification message based on link type
     */
    private function generateNotificationMessage(array $linkData): string
    {
        $claimingUserName = $linkData['claiming_user']->name;
        $propertyTitle = $linkData['property']->property_title ?? 'a property';
        $linkType = $linkData['link_type'];
        
        switch ($linkType) {
            case 'buyer_seller_match':
                return "{$claimingUserName} has claimed {$propertyTitle} as a buyer. Since you have this property in your basket and can sell properties, you might be able to form a chain link! Connect with them to explore this opportunity.";
            
            case 'seller_buyer_match':
                return "{$claimingUserName} has claimed {$propertyTitle} as a seller. Since you have this property in your basket and are looking to buy, you might be able to form a chain link! Connect with them to explore this opportunity.";
            
            default:
                return "{$claimingUserName} has claimed {$propertyTitle}. You both have interest in this property - there might be an opportunity to form a chain link!";
        }
    }

    /**
     * Process chain link acceptance
     */
    public function processChainLinkAcceptance(User $acceptingUser, int $propertyId, int $initiatingUserId): array
    {
        DB::beginTransaction();
        
        try {
            $property = Property::findOrFail($propertyId);
            $initiatingUser = User::findOrFail($initiatingUserId);
            
            // Update both users' chain checkers to link the property
            $this->linkPropertyInChains($acceptingUser, $initiatingUser, $property);
            
            // Create confirmation notifications
            $this->createChainLinkConfirmation($acceptingUser, $initiatingUser, $property);
            
            // Mark related notifications as read
            $this->markRelatedNotificationsAsRead($acceptingUser->id, $propertyId);
            
            DB::commit();
            
            return [
                'success' => true,
                'message' => 'Chain link established successfully!',
                'data' => [
                    'property_id' => $propertyId,
                    'linked_user' => $initiatingUser->name,
                    'property_title' => $property->property_title
                ]
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to process chain link acceptance', [
                'error' => $e->getMessage(),
                'accepting_user_id' => $acceptingUser->id,
                'property_id' => $propertyId,
                'initiating_user_id' => $initiatingUserId
            ]);
            
            return [
                'success' => false,
                'message' => 'Failed to establish chain link. Please try again.',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Link property in both users' chain checkers
     */
    private function linkPropertyInChains(User $acceptingUser, User $initiatingUser, Property $property): void
    {
        // Get both users' baskets for this property
        $acceptingUserBasket = PropertyBasket::where('user_id', $acceptingUser->id)
            ->where('property_id', $property->id)
            ->first();
            
        $initiatingUserBasket = PropertyBasket::where('user_id', $initiatingUser->id)
            ->where('property_id', $property->id)
            ->first();
        
        // Update chain checkers based on the link
        if ($acceptingUserBasket && $initiatingUserBasket) {
            $this->updateChainCheckerWithLink($acceptingUser, $property, $initiatingUser);
            $this->updateChainCheckerWithLink($initiatingUser, $property, $acceptingUser);
        }
    }

    /**
     * Update a user's chain checker with the new property link
     */
    private function updateChainCheckerWithLink(User $user, Property $property, User $linkedUser): void
    {
        $chainChecker = $user->chainChecker;
        if (!$chainChecker || !$chainChecker->is_active) {
            return;
        }
        
        $userBasket = PropertyBasket::where('user_id', $user->id)
            ->where('property_id', $property->id)
            ->first();
        
        if (!$userBasket || !$userBasket->is_claimed) {
            return;
        }
        
        // Also ensure the linked user has an active chain checker
        $linkedUserChainData = $linkedUser->chainChecker;
        if (!$linkedUserChainData || !$linkedUserChainData->is_active) {
            return;
        }
        
        // Add property to appropriate array based on claim type
        if ($userBasket->claim_type === 'buyer') {
            $buyingProperties = $chainChecker->buying_properties ?? [];
            if (!in_array($property->id, $buyingProperties)) {
                $buyingProperties[] = $property->id;
                $chainChecker->buying_properties = $buyingProperties;
            }
        } elseif ($userBasket->claim_type === 'seller') {
            $sellingProperties = $chainChecker->selling_properties ?? [];
            if (!in_array($property->id, $sellingProperties)) {
                $sellingProperties[] = $property->id;
                $chainChecker->selling_properties = $sellingProperties;
            }
        }
        
        // Update chain participants
        $participants = $chainChecker->chain_participants ?? [];
        $participantExists = false;
        
        foreach ($participants as &$participant) {
            if ($participant['user_id'] === $linkedUser->id) {
                // Update existing participant with fresh chain data
                $linkedUserChainData = $linkedUser->chainChecker;
                
                $participant['properties'][] = [
                    'property_id' => $property->id,
                    'property_title' => $property->property_title,
                    'progress_score' => $linkedUserChainData->progress_score ?? 0,
                    'linked_at' => now()->toISOString()
                ];
                
                // Update chain data for existing participant
                $participant['chain_data'] = [
                    'progress_score' => $linkedUserChainData->progress_score ?? 0,
                    'chain_length' => $linkedUserChainData->chain_length ?? 1,
                    'move_type' => $linkedUserChainData->move_type ?? 'unknown',
                    'chain_role' => $linkedUserChainData->chain_role ?? 'unknown'
                ];
                $participant['chain_status'] = $linkedUserChainData->chain_status ?? [];
                $participant['chain_role'] = $linkedUserChainData->chain_role ?? 'unknown';
                
                $participantExists = true;
                break;
            }
        }
        
        if (!$participantExists) {
            // Get the linked user's chain data
            $linkedUserChainData = $linkedUser->chainChecker;
            
            $participants[] = [
                'user_id' => $linkedUser->id,
                'user_name' => $linkedUser->name,
                'user_email' => $linkedUser->email,
                'chain_role' => $linkedUserChainData->chain_role ?? 'unknown',
                'properties' => [
                    [
                        'property_id' => $property->id,
                        'property_title' => $property->property_title,
                        'progress_score' => $linkedUserChainData->progress_score ?? 0,
                        'linked_at' => now()->toISOString()
                    ]
                ],
                'chain_data' => [
                    'progress_score' => $linkedUserChainData->progress_score ?? 0,
                    'chain_length' => $linkedUserChainData->chain_length ?? 1,
                    'move_type' => $linkedUserChainData->move_type ?? 'unknown',
                    'chain_role' => $linkedUserChainData->chain_role ?? 'unknown'
                ],
                'chain_status' => $linkedUserChainData->chain_status ?? [],
                'linked_at' => now()->toISOString()
            ];
        }
        
        $chainChecker->chain_participants = $participants;
        $chainChecker->updateActivity();
        
        // Ensure the chain remains active after linking
        if (!$chainChecker->is_active) {
            $chainChecker->is_active = true;
        }
        
        $chainChecker->save();
    }

    /**
     * Update chain participants with fresh progress data
     */
    public function refreshChainParticipantsProgress(ChainChecker $chainChecker): void
    {
        // Ensure we don't accidentally corrupt the chain checker
        if (!$chainChecker || !$chainChecker->is_active) {
            return;
        }
        
        $participants = $chainChecker->chain_participants ?? [];
        
        foreach ($participants as &$participant) {
            $linkedUser = User::find($participant['user_id']);
            if ($linkedUser && $linkedUser->chainChecker && $linkedUser->chainChecker->is_active) {
                $linkedUserChainData = $linkedUser->chainChecker;
                
                // Update participant's chain data
                $participant['chain_data'] = [
                    'progress_score' => $linkedUserChainData->progress_score ?? 0,
                    'chain_length' => $linkedUserChainData->chain_length ?? 1,
                    'move_type' => $linkedUserChainData->move_type ?? 'unknown',
                    'chain_role' => $linkedUserChainData->chain_role ?? 'unknown'
                ];
                $participant['chain_status'] = $linkedUserChainData->chain_status ?? [];
                $participant['chain_role'] = $linkedUserChainData->chain_role ?? 'unknown';
                
                // Update progress for each property
                if (isset($participant['properties']) && is_array($participant['properties'])) {
                    foreach ($participant['properties'] as &$property) {
                        $property['progress_score'] = $linkedUserChainData->progress_score ?? 0;
                    }
                }
            }
        }
        
        $chainChecker->chain_participants = $participants;
        
        // Only save if the chain checker is still valid
        if ($chainChecker->exists && $chainChecker->is_active) {
            $chainChecker->save();
        }
    }

    /**
     * Create confirmation notifications for both users
     */
    private function createChainLinkConfirmation(User $acceptingUser, User $initiatingUser, Property $property): void
    {
        // Notification for accepting user
        Notification::create([
            'user_id' => $acceptingUser->id,
            'type' => 'chain_link_confirmed',
            'title' => 'Chain Link Established!',
            'message' => "You've successfully linked with {$initiatingUser->name} for {$property->property_title}. Your chains are now connected!",
            'data' => [
                'property_id' => $property->id,
                'linked_user_id' => $initiatingUser->id,
                'linked_user_name' => $initiatingUser->name,
                'property_title' => $property->property_title
            ],
            'action_url' => '/housemover/chain-checker'
        ]);
        
        // Notification for initiating user
        Notification::create([
            'user_id' => $initiatingUser->id,
            'type' => 'chain_link_confirmed',
            'title' => 'Chain Link Accepted!',
            'message' => "{$acceptingUser->name} has accepted your chain link for {$property->property_title}. Your chains are now connected!",
            'data' => [
                'property_id' => $property->id,
                'linked_user_id' => $acceptingUser->id,
                'linked_user_name' => $acceptingUser->name,
                'property_title' => $property->property_title
            ],
            'action_url' => '/housemover/chain-checker'
        ]);
    }

    /**
     * Mark related chain link notifications as read
     */
    private function markRelatedNotificationsAsRead(int $userId, int $propertyId): void
    {
        Notification::where('user_id', $userId)
            ->where('type', 'chain_link_opportunity')
            ->where('data->property_id', $propertyId)
            ->update(['is_read' => true]);
    }

    /**
     * Get chain opportunities for a user
     */
    public function getChainOpportunitiesForUser(User $user): Collection
    {
        return Notification::where('user_id', $user->id)
            ->where('type', 'chain_link_opportunity')
            ->where('is_read', false)
            ->where(function ($query) {
                // Include notifications without expires_at or where expires_at is in the future
                $query->whereRaw("JSON_EXTRACT(data, '$.expires_at') IS NULL")
                      ->orWhereRaw("JSON_EXTRACT(data, '$.expires_at') > ?", [now()->toISOString()]);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Detect multiple claims on the same property
     */
    public function detectMultipleClaims(Property $property): Collection
    {
        return PropertyBasket::where('property_id', $property->id)
            ->where('is_claimed', true)
            ->with(['user'])
            ->get()
            ->groupBy('claim_type');
    }
}