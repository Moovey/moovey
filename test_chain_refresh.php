<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Models\ChainChecker;
use App\Services\ChainLinkingService;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Chain Data Refresh Test ===\n\n";

// Find John Housemover and Arnel P. Tagupa
$johnEmail = 'housemover@moovey.com';
$arnelEmail = 'arneltagupa123@gmail.com';

$john = User::where('email', $johnEmail)->first();
$arnel = User::where('email', $arnelEmail)->first();

if (!$john || !$arnel) {
    echo "Users not found:\n";
    if (!$john) echo "- John not found with email: $johnEmail\n";
    if (!$arnel) echo "- Arnel not found with email: $arnelEmail\n";
    exit(1);
}

echo "Found users:\n";
echo "- John: {$john->name} (ID: {$john->id})\n";
echo "- Arnel: {$arnel->name} (ID: {$arnel->id})\n\n";

// Get their chain checkers
$johnChain = $john->chainChecker;
$arnelChain = $arnel->chainChecker;

if (!$johnChain || !$arnelChain) {
    echo "Chain checkers not found:\n";
    if (!$johnChain) echo "- John's chain checker not found\n";
    if (!$arnelChain) echo "- Arnel's chain checker not found\n";
    exit(1);
}

echo "Found chain checkers:\n";
echo "- John's chain ID: {$johnChain->id}\n";
echo "- Arnel's chain ID: {$arnelChain->id}\n\n";

// Initialize the chain linking service
$chainLinkingService = new ChainLinkingService();

echo "=== Refreshing Chain Data ===\n";

// Refresh both chains
echo "Refreshing John's chain data...\n";
$chainLinkingService->refreshChainParticipantsProgress($johnChain);

echo "Refreshing Arnel's chain data...\n";
$chainLinkingService->refreshChainParticipantsProgress($arnelChain);

echo "Chain data refreshed!\n\n";

// Check John's current progress
echo "=== John's Current Progress ===\n";
$johnChain->refresh();
$johnStatus = $johnChain->chain_status ?? [];
echo "Chain status keys: " . implode(', ', array_keys($johnStatus)) . "\n";

if (isset($johnStatus['selling']['offer_accepted'])) {
    $offerProgress = $johnStatus['selling']['offer_accepted']['progress'] ?? 0;
    echo "John's Offer Accepted progress: {$offerProgress}%\n";
} else {
    echo "John's Offer Accepted progress not found in selling section\n";
}

// Check Arnel's chain participants
echo "\n=== Arnel's Chain Participants ===\n";
$arnelChain->refresh();
$participants = $arnelChain->chain_participants ?? [];

echo "Number of participants in Arnel's chain: " . count($participants) . "\n";

foreach ($participants as $index => $participant) {
    $userName = $participant['user_name'] ?? 'Unknown';
    $chainRole = $participant['chain_role'] ?? 'No role';
    
    echo "\nParticipant #{$index}: {$userName}\n";
    echo "- Chain role: {$chainRole}\n";
    
    if (isset($participant['chain_status'])) {
        $chainStatus = $participant['chain_status'];
        echo "- Chain status keys: " . implode(', ', array_keys($chainStatus)) . "\n";
        
        // Check for John's progress in selling section
        if (strpos($userName, 'John') !== false) {
            if (isset($chainStatus['selling']['offer_accepted'])) {
                $progress = $chainStatus['selling']['offer_accepted']['progress'] ?? 0;
                echo "- John's Offer Accepted progress (in Arnel's view): {$progress}%\n";
            } else {
                echo "- John's Offer Accepted progress not found in selling section\n";
                if (isset($chainStatus['offer_accepted'])) {
                    $progress = $chainStatus['offer_accepted']['progress'] ?? 0;
                    echo "- Found in root level: {$progress}%\n";
                }
            }
        }
    }
}

echo "\n=== Test Complete ===\n";
echo "If John's progress shows 94% in Arnel's view, the fix is working!\n";