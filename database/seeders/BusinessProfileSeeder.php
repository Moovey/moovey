<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BusinessProfile;
use Illuminate\Database\Seeder;

class BusinessProfileSeeder extends Seeder
{
    public function run(): void
    {
        // Create some business users and their profiles
        $businesses = [
            [
                'user' => [
                    'name' => 'Swift Moving Services',
                    'email' => 'info@swiftmoving.co.uk',
                    'role' => 'business',
                    'password' => bcrypt('business123'),
                ],
                'profile' => [
                    'name' => 'Swift Moving Services',
                    'description' => 'Professional moving company with over 15 years of experience. We handle residential and commercial moves with care and efficiency.',
                    'services' => ['House Removals', 'Office Moves', 'Packing Service', 'Storage Solutions', 'Furniture Assembly'],
                    'plan' => 'premium',
                ],
            ],
            [
                'user' => [
                    'name' => 'London Cleaning Pros',
                    'email' => 'hello@londoncleaningpros.com',
                    'role' => 'business',
                    'password' => bcrypt('business123'),
                ],
                'profile' => [
                    'name' => 'London Cleaning Pros',
                    'description' => 'Specialist cleaning service for move-ins and move-outs. End of tenancy cleaning guaranteed to get your deposit back.',
                    'services' => ['End of Tenancy Cleaning', 'Deep Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Post-Construction Cleanup'],
                    'plan' => 'free',
                ],
            ],
            [
                'user' => [
                    'name' => 'PackMaster Solutions',
                    'email' => 'contact@packmaster.co.uk',
                    'role' => 'business',
                    'password' => bcrypt('business123'),
                ],
                'profile' => [
                    'name' => 'PackMaster Solutions',
                    'description' => 'Expert packing and unpacking services. We ensure your belongings are safely packed and transported to your new home.',
                    'services' => ['Professional Packing', 'Unpacking Service', 'Fragile Item Packing', 'Custom Crates', 'Packing Materials Supply'],
                    'plan' => 'premium',
                ],
            ],
            [
                'user' => [
                    'name' => 'SecureStore Ltd',
                    'email' => 'info@securestorage.co.uk',
                    'role' => 'business',
                    'password' => bcrypt('business123'),
                ],
                'profile' => [
                    'name' => 'SecureStore Ltd',
                    'description' => 'Climate-controlled storage facilities across London. Short and long-term storage solutions for households and businesses.',
                    'services' => ['Self Storage', 'Business Storage', 'Student Storage', 'Archive Storage', 'Container Storage'],
                    'plan' => 'free',
                ],
            ],
            [
                'user' => [
                    'name' => 'HandyFix Services',
                    'email' => 'bookings@handyfix.co.uk',
                    'role' => 'business',
                    'password' => bcrypt('business123'),
                ],
                'profile' => [
                    'name' => 'HandyFix Services',
                    'description' => 'Handyman services for your new home. From furniture assembly to minor repairs, we help you settle in quickly.',
                    'services' => ['Furniture Assembly', 'Picture Hanging', 'TV Wall Mounting', 'Shelving Installation', 'Minor Repairs'],
                    'plan' => 'free',
                ],
            ],
        ];

        foreach ($businesses as $business) {
            // Create the user first (only if it doesn't exist)
            $user = User::firstOrCreate(
                ['email' => $business['user']['email']],
                array_merge($business['user'], ['email_verified_at' => now()])
            );
            
            // Then create the business profile (only if it doesn't exist)
            $profile = $business['profile'];
            $profile['user_id'] = $user->id;
            
            BusinessProfile::firstOrCreate(
                ['user_id' => $user->id],
                $profile
            );
        }
    }
}