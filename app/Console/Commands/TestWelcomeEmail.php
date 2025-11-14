<?php

namespace App\Console\Commands;

use App\Mail\WelcomeEmail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestWelcomeEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test-welcome {email} {--name=Test User} {--role=housemover}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test welcome email to verify email configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $name = $this->option('name');
        $role = $this->option('role');

        // Create a temporary user object for testing
        $testUser = new User([
            'name' => $name,
            'email' => $email,
            'role' => $role,
        ]);

        try {
            Mail::to($email)->send(new WelcomeEmail($testUser));
            $this->info("✅ Welcome email sent successfully to {$email}");
            $this->info("📧 Check your Mailtrap inbox to view the email");
        } catch (\Exception $e) {
            $this->error("❌ Failed to send welcome email: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}