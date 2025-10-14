<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckMailConfig extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:mail-config';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check current mail configuration for debugging';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Mail Configuration ===');
        $this->line('Default Mailer: ' . config('mail.default'));
        $this->line('Mail Host: ' . config('mail.mailers.smtp.host'));
        $this->line('Mail Port: ' . config('mail.mailers.smtp.port'));
        $this->line('Mail Username: ' . (config('mail.mailers.smtp.username') ? '***SET***' : '***NOT SET***'));
        $this->line('Mail Password: ' . (config('mail.mailers.smtp.password') ? '***SET***' : '***NOT SET***'));
        $this->line('From Address: ' . config('mail.from.address'));
        $this->line('From Name: ' . config('mail.from.name'));
        
        $this->info('');
        $this->info('=== Queue Configuration ===');
        $this->line('Default Queue: ' . config('queue.default'));
        
        $this->info('');
        $this->info('=== Environment ===');
        $this->line('App Environment: ' . config('app.env'));
        $this->line('App Debug: ' . (config('app.debug') ? 'true' : 'false'));
        $this->line('App URL: ' . config('app.url'));
        
        // Test mail configuration
        if (config('mail.default') === 'log') {
            $this->warn('⚠️  Mail is configured to LOG only - emails will not be sent!');
            $this->warn('   Set MAIL_MAILER=smtp to send real emails');
        } else {
            $this->info('✅ Mail is configured to send emails via: ' . config('mail.default'));
        }
        
        if (config('queue.default') === 'sync') {
            $this->info('✅ Queue is set to SYNC - emails will be sent immediately');
        } else {
            $this->warn('⚠️  Queue is set to: ' . config('queue.default') . ' - ensure queue workers are running!');
            $this->warn('   Run: php artisan queue:work to process queued emails');
        }
    }
}
