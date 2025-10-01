<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class TestImageUpload extends Command
{
    protected $signature = 'test:image-upload';
    protected $description = 'Test image upload functionality';

    public function handle()
    {
        $this->info('Testing image upload functionality...');

        // Test 1: Check if storage disk is working
        $this->info('1. Testing storage disk configuration:');
        try {
            $disk = Storage::disk('public');
            $this->info('   - Public disk available: YES');
            $this->info('   - Public disk path: ' . $disk->path(''));
        } catch (\Exception $e) {
            $this->error('   - Error with public disk: ' . $e->getMessage());
        }

        // Test 2: Check directory creation
        $this->info('2. Testing directory creation:');
        $directory = 'lesson_images';
        try {
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
                $this->info("   - Directory created: $directory");
            } else {
                $this->info("   - Directory exists: $directory");
            }
        } catch (\Exception $e) {
            $this->error('   - Error creating directory: ' . $e->getMessage());
        }

        // Test 3: Test basic file writing
        $this->info('3. Testing basic file writing:');
        try {
            $testContent = "Test image data: " . now();
            $filename = 'test_' . time() . '.txt';
            $path = $directory . '/' . $filename;
            
            $result = Storage::disk('public')->put($path, $testContent);
            if ($result) {
                $this->info("   - File written successfully: $path");
                $this->info('   - File exists: ' . (Storage::disk('public')->exists($path) ? 'YES' : 'NO'));
                $this->info('   - File size: ' . Storage::disk('public')->size($path) . ' bytes');
                $this->info('   - Full path: ' . Storage::disk('public')->path($path));
                $this->info('   - File exists on disk: ' . (file_exists(Storage::disk('public')->path($path)) ? 'YES' : 'NO'));
                
                // Clean up
                Storage::disk('public')->delete($path);
                $this->info('   - Test file cleaned up');
            } else {
                $this->error('   - Failed to write file');
            }
        } catch (\Exception $e) {
            $this->error('   - Error writing file: ' . $e->getMessage());
        }

        $this->info('Test completed.');
    }
}