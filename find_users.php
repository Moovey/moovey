<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Finding Users ===\n\n";

echo "Users with 'John' in name:\n";
$johns = User::where('name', 'like', '%John%')
    ->get(['id', 'name', 'email']);

foreach ($johns as $user) {
    echo "- {$user->name} ({$user->email})\n";
}

echo "\nUsers with 'Arnel' in name:\n";
$arnels = User::where('name', 'like', '%Arnel%')
    ->get(['id', 'name', 'email']);

foreach ($arnels as $user) {
    echo "- {$user->name} ({$user->email})\n";
}

echo "\nAll users with chain checkers:\n";
$usersWithChains = User::whereHas('chainChecker')->get(['id', 'name', 'email']);
foreach ($usersWithChains as $user) {
    echo "- {$user->name} ({$user->email})\n";
}