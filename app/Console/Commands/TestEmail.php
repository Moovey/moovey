<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test sending email to Mailtrap';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        try {
            Mail::raw('This is a test email from Moovey Chain Checker system.', function ($message) use ($email) {
                $message->to($email)
                        ->subject('Test Email from Moovey')
                        ->from('noreply@moovey.app', 'Moovey');
            });
            
            $this->info("Email sent successfully to: {$email}");
            $this->info("Check your Mailtrap inbox!");
            
        } catch (\Exception $e) {
            $this->error("Failed to send email: " . $e->getMessage());
            $this->error("Stack trace: " . $e->getTraceAsString());
        }
    }
}
