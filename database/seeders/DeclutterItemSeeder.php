<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DeclutterItem;
use App\Models\User;

class DeclutterItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users to assign items to
        $users = User::all();
        if ($users->isEmpty()) {
            // Create a test user if none exist
            $users = collect([
                User::create([
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                    'password' => bcrypt('password'),
                    'role' => 'housemover',
                    'email_verified_at' => now(),
                ])
            ]);
        }

        $sampleItems = [
            [
                'name' => 'Vintage Wooden Dining Chair',
                'description' => 'Beautiful solid oak dining chair in excellent condition. Hand-carved details and comfortable cushioned seat. Perfect for dining room or study area.',
                'category' => 'Furniture',
                'condition' => 'excellent',
                'estimated_value' => 75.00,
                'location' => 'London, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['furniture/chair1.jpg', 'furniture/chair2.jpg'],
            ],
            [
                'name' => 'Samsung 32" LED TV',
                'description' => 'Samsung 32-inch LED Smart TV in good working condition. Includes original remote control and HDMI cables. Wall mount brackets included.',
                'category' => 'Electronics',
                'condition' => 'good',
                'estimated_value' => 150.00,
                'location' => 'Manchester, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['electronics/tv1.jpg'],
            ],
            [
                'name' => 'Winter Coat - Size M',
                'description' => 'Warm winter coat in size Medium. Barely worn, perfect for cold weather. Water-resistant outer shell with down filling.',
                'category' => 'Clothing',
                'condition' => 'excellent',
                'estimated_value' => 40.00,
                'location' => 'Birmingham, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['clothing/coat1.jpg'],
            ],
            [
                'name' => 'Coffee Table Books Collection',
                'description' => 'Collection of 15 beautiful coffee table books covering art, photography, and design. All in excellent condition.',
                'category' => 'Books',
                'condition' => 'excellent',
                'estimated_value' => 25.00,
                'location' => 'Leeds, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['books/collection1.jpg'],
            ],
            [
                'name' => 'Kitchen Stand Mixer',
                'description' => 'Professional-grade stand mixer with multiple attachments. Perfect for baking enthusiasts. Some minor wear but fully functional.',
                'category' => 'Kitchen Items',
                'condition' => 'good',
                'estimated_value' => 120.00,
                'location' => 'Liverpool, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['kitchen/mixer1.jpg', 'kitchen/mixer2.jpg'],
            ],
            [
                'name' => 'Decorative Wall Mirror',
                'description' => 'Large decorative wall mirror with ornate frame. Perfect statement piece for living room or bedroom.',
                'category' => 'Home Decor',
                'condition' => 'good',
                'estimated_value' => 60.00,
                'location' => 'Bristol, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['decor/mirror1.jpg'],
            ],
            [
                'name' => 'Childrens Toy Box',
                'description' => 'Wooden toy box with safety hinges. Perfect for organizing childrens toys. Some minor scuffs but structurally sound.',
                'category' => 'Toys',
                'condition' => 'fair',
                'estimated_value' => 30.00,
                'location' => 'Sheffield, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['toys/toybox1.jpg'],
            ],
            [
                'name' => 'Tennis Racket Set',
                'description' => 'Professional tennis racket with carrying case and extra strings. Lightly used, great for intermediate players.',
                'category' => 'Sports Equipment',
                'condition' => 'excellent',
                'estimated_value' => 85.00,
                'location' => 'Cambridge, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['sports/tennis1.jpg'],
            ],
            [
                'name' => 'Garden Planter Set',
                'description' => 'Set of 3 ceramic garden planters in different sizes. Perfect for herbs or small plants. Weather-resistant glaze.',
                'category' => 'Garden Items',
                'condition' => 'excellent',
                'estimated_value' => 45.00,
                'location' => 'Oxford, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['garden/planters1.jpg'],
            ],
            [
                'name' => 'Vintage Suitcase',
                'description' => 'Beautiful vintage leather suitcase. Great for decoration or actual travel. Some patina adds to the character.',
                'category' => 'Other',
                'condition' => 'good',
                'estimated_value' => 55.00,
                'location' => 'Bath, UK',
                'action' => 'sell',
                'is_listed_for_sale' => true,
                'images' => ['other/suitcase1.jpg'],
            ],
        ];

        foreach ($sampleItems as $itemData) {
            $user = $users->random();
            DeclutterItem::create([
                ...$itemData,
                'user_id' => $user->id,
            ]);
        }
    }
}
