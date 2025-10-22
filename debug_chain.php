<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\ChainChecker;

echo "Chain Progress Debug\n";
echo "===================\n\n";

try {
    // Find John Housemover and Arnel P. Tagupa
    $john = User::where('name', 'John Housemover')->first();
    $arnel = User::where('name', 'Arnel P. Tagupa')->first();
    
    if (!$john || !$arnel) {
        echo "Users not found!\n";
        return;
    }
    
    echo "John Housemover (ID: {$john->id}):\n";
    if ($john->chainChecker) {
        echo "Chain Status: " . json_encode($john->chainChecker->chain_status, JSON_PRETTY_PRINT) . "\n";
        echo "Progress Score: " . ($john->chainChecker->progress_score ?? 0) . "%\n";
        echo "Chain Participants: " . json_encode($john->chainChecker->chain_participants, JSON_PRETTY_PRINT) . "\n\n";
    } else {
        echo "No chain checker found\n\n";
    }
    
    echo "Arnel P. Tagupa (ID: {$arnel->id}):\n";
    if ($arnel->chainChecker) {
        echo "Chain Status: " . json_encode($arnel->chainChecker->chain_status, JSON_PRETTY_PRINT) . "\n";
        echo "Progress Score: " . ($arnel->chainChecker->progress_score ?? 0) . "%\n";
        echo "Chain Participants: " . json_encode($arnel->chainChecker->chain_participants, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "No chain checker found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}