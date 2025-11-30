<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Lesson;
use App\Models\UserLessonProgress;

class DeleteAllLessons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lessons:delete-all {--force : Force deletion without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all lessons and their associated progress records from the database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $lessonCount = Lesson::count();
        $progressCount = UserLessonProgress::count();

        if ($lessonCount === 0) {
            $this->info('No lessons found in the database.');
            return self::SUCCESS;
        }

        $this->info("Found {$lessonCount} lesson(s) and {$progressCount} progress record(s).");

        if (!$this->option('force')) {
            if (!$this->confirm('Are you sure you want to delete ALL lessons and progress records? This action cannot be undone.')) {
                $this->info('Deletion cancelled.');
                return self::SUCCESS;
            }
        }

        $this->info('Deleting user progress records...');
        $deletedProgress = UserLessonProgress::query()->delete();
        
        $this->info('Deleting all lessons...');
        $deletedLessons = Lesson::query()->delete();

        $this->info("Successfully deleted {$deletedLessons} lesson(s) and {$deletedProgress} progress record(s).");
        
        return self::SUCCESS;
    }
}
