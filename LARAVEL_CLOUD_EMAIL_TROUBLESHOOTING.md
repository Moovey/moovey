# Laravel Cloud Email Configuration Troubleshooting

## Issue: Agent Notification Emails Not Sending on Laravel Cloud

When the Chain Checker is activated and agent emails are provided, emails are not being received in Mailtrap when deployed on Laravel Cloud.

## Root Causes and Solutions

### 1. Mail Configuration Issues

**Problem**: Default mail driver is set to `log` which only logs emails instead of sending them.

**Solution**: Update environment variables on Laravel Cloud:

```bash
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS=noreply@moovey.app
MAIL_FROM_NAME="Moovey"
```

### 2. Queue Worker Issues

**Problem**: Emails are queued but no queue workers are running on Laravel Cloud.

**Solutions**:

#### Option A: Use Sync Queue for Immediate Sending
```bash
QUEUE_CONNECTION=sync
```

#### Option B: Configure Laravel Cloud Queue Workers
1. Set up queue workers in Laravel Cloud dashboard
2. Ensure database queue table exists:
   ```bash
   php artisan migrate
   ```
3. Start queue workers:
   ```bash
   php artisan queue:work --daemon
   ```

### 3. Environment-Specific Configuration

**Problem**: Different behavior between local and production environments.

**Solution**: The code now handles this automatically:
- Production: Emails are queued for better reliability
- Development: Emails are sent immediately

### 4. Missing Database Tables

**Problem**: Jobs table might not exist for queued emails.

**Solution**: Run migrations:
```bash
php artisan migrate
```

## Testing Email Configuration

### 1. Test Basic Email Sending
```bash
php artisan test:email your-test@mailtrap.io
```

### 2. Check Email Logs
Monitor Laravel logs for email-related entries:
```bash
tail -f storage/logs/laravel.log | grep -i "email\|mail"
```

### 3. Debug Queue Status
Check if jobs are being queued:
```bash
php artisan queue:work --verbose
```

## Laravel Cloud Specific Configuration

### 1. Environment Variables
Set these in your Laravel Cloud dashboard:

```bash
# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS=noreply@moovey.app
MAIL_FROM_NAME="Moovey"

# Queue Configuration (choose one)
QUEUE_CONNECTION=sync  # For immediate sending
# OR
QUEUE_CONNECTION=database  # For queued sending (requires workers)

# App Configuration
APP_ENV=production
APP_DEBUG=false
```

### 2. Queue Workers Setup
If using database queues, configure workers in Laravel Cloud:
1. Go to your Laravel Cloud project dashboard
2. Navigate to "Workers" section
3. Add a new worker with command: `php artisan queue:work --tries=3 --timeout=60`

### 3. Database Configuration
Ensure your database connection is properly configured:
```bash
DB_CONNECTION=mysql  # or your preferred database
DB_HOST=your-database-host
DB_PORT=3306
DB_DATABASE=your-database-name
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
```

## Verification Steps

### 1. Check Configuration
```bash
php artisan config:show mail
php artisan config:show queue
```

### 2. Test Chain Checker Email
1. Create a new chain checker with agent email
2. Check Laravel logs for email-related entries
3. Verify in Mailtrap inbox

### 3. Monitor Queue Jobs (if using queues)
```bash
php artisan queue:failed  # Check failed jobs
php artisan queue:restart  # Restart queue workers
```

## Common Issues and Fixes

### Issue: "Connection refused" errors
**Fix**: Verify SMTP credentials and host settings

### Issue: Emails queued but never sent
**Fix**: Start queue workers or switch to sync connection

### Issue: "Authentication failed" errors
**Fix**: Double-check Mailtrap username and password

### Issue: Emails sent but not received
**Fix**: 
1. Check spam folder
2. Verify Mailtrap inbox is correct
3. Check email logs for delivery status

## Code Changes Made

The `ChainCheckerController` has been enhanced with:
1. Better logging for email sending attempts
2. Environment-specific handling (queue vs immediate send)
3. Detailed error reporting
4. Configuration debugging information

## Testing the Fix

1. Deploy with proper environment variables
2. Test chain checker activation
3. Monitor logs for email sending status
4. Verify receipt in Mailtrap

## Support Commands

```bash
# Test email configuration
php artisan test:email test@mailtrap.io

# Check queue status
php artisan queue:work --verbose

# Clear configuration cache
php artisan config:clear

# Restart queue workers
php artisan queue:restart
```