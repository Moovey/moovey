<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupPlaceholderImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'properties:cleanup-placeholders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove placeholder image URLs from property photos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup of placeholder images...');
        
        $properties = \App\Models\Property::whereNotNull('property_photos')->get();
        $updatedCount = 0;
        
        foreach ($properties as $property) {
            $photos = $property->property_photos;
            if (is_array($photos)) {
                // Filter out placeholder URLs
                $cleanedPhotos = array_filter($photos, function($photo) {
                    return !str_contains($photo, 'placeholder') && !str_contains($photo, 'via.placeholder.com');
                });
                
                // Re-index the array to remove gaps
                $cleanedPhotos = array_values($cleanedPhotos);
                
                // Update if there's a difference
                if (count($cleanedPhotos) !== count($photos)) {
                    $property->update([
                        'property_photos' => !empty($cleanedPhotos) ? $cleanedPhotos : null
                    ]);
                    $updatedCount++;
                    $this->info("Updated property ID {$property->id}: {$property->property_title}");
                }
            }
        }
        
        $this->info("Cleanup completed! Updated {$updatedCount} properties.");
        
        return Command::SUCCESS;
    }
}
