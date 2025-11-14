# Welcome Email System Documentation

## Overview
The welcome email system automatically sends personalized welcome emails to new users when they register for Moovey accounts.

## Configuration

### Mailtrap Production Settings (Already configured in .env)
```
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=505fe1d5ecc034
MAIL_PASSWORD=aadc5198ac9c53
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@moovey.app"
MAIL_FROM_NAME="Moovey"
```

## Features

### 📧 Automated Welcome Emails
- **Trigger**: Sent automatically when users complete registration
- **Queue Support**: Emails are queued for background processing (non-blocking)
- **Error Handling**: Failed emails are logged without preventing registration
- **Role-based Content**: Different content for housemovers vs businesses

### 🎨 Email Templates
- **HTML Version**: Styled email with branding and role-specific features
- **Text Version**: Plain text fallback for email clients
- **Responsive Design**: Works on desktop and mobile devices

### 👥 Role-Specific Content

#### Housemover Welcome Email Includes:
- My Moovey Dashboard access
- Moovey Academy information  
- Moving Tools overview
- Trusted Network benefits
- Community Support details

#### Business Welcome Email Includes:
- Business Dashboard features
- Lead Generation opportunities
- Trade Directory listing
- Networking benefits
- Analytics & Insights access

## Testing

### Manual Email Test
```bash
# Test housemover welcome email
php artisan email:test-welcome your-email@example.com --name="Test User" --role=housemover

# Test business welcome email  
php artisan email:test-welcome your-email@example.com --name="Test Business" --role=business
```

### Queue Processing
```bash
# Process queued emails (run continuously)
php artisan queue:work

# Process one job only (for testing)
php artisan queue:work --once
```

## User Experience

### Registration Flow
1. User completes registration form
2. Account is created and user is logged in
3. Success message displays mentioning welcome email
4. Welcome email is queued and sent in background
5. User is redirected to appropriate dashboard

### Success Message
Users see: "🎉 Welcome to Moovey! Your account has been created successfully. 📧 Check your email (user@example.com) for a welcome message with next steps and important information about your [role] account."

## Files Created/Modified

### New Files:
- `app/Mail/WelcomeEmail.php` - Mailable class
- `resources/views/emails/welcome.blade.php` - HTML email template
- `resources/views/emails/welcome-text.blade.php` - Text email template
- `app/Console/Commands/TestWelcomeEmail.php` - Testing command

### Modified Files:
- `app/Http/Controllers/Auth/RegisteredUserController.php` - Added email sending
- `resources/js/pages/auth/register.tsx` - Added success message

## Troubleshooting

### Check Queue Status
```bash
php artisan queue:monitor
```

### View Failed Jobs
```bash
php artisan queue:failed
```

### Retry Failed Jobs
```bash
php artisan queue:retry all
```

### Clear All Queued Jobs
```bash
php artisan queue:clear
```

## Production Notes
- Emails are queued for better performance
- Failed emails are logged but don't prevent user registration
- Mailtrap is configured for reliable email delivery
- Templates are responsive and branded
- Error handling ensures system stability