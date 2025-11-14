WELCOME TO MOOVEY!
{{ strtoupper($user->role ?? 'User') }}

Hi {{ $user->name }},

🎉 Congratulations! Your Moovey account has been successfully created. We're thrilled to have you join our community of movers and industry professionals.

@if($user->role === 'housemover')
🏠 AS A HOUSEMOVER, YOU NOW HAVE ACCESS TO:
- My Moovey Dashboard - Track your moving progress and manage tasks
- Moovey Academy - Learn from expert guides and lessons  
- Moving Tools - Calculators, planners, and helpful utilities
- Trusted Network - Connect with verified moving professionals
- Community Support - Get advice from fellow movers
@elseif($user->role === 'business')
🏢 AS A BUSINESS PARTNER, YOU NOW HAVE ACCESS TO:
- Business Dashboard - Manage your profile and services
- Lead Generation - Connect with potential customers
- Trade Directory - Showcase your business to the community
- Networking Opportunities - Partner with other professionals
- Analytics & Insights - Track your business performance
@endif

WHAT'S NEXT?
We recommend starting by completing your profile and exploring the Academy to discover all the amazing features we've built for you.

Get Started: {{ config('app.url') }}/{{ $user->role === 'business' ? 'business' : 'housemover' }}/dashboard

If you have any questions or need assistance, our support team is here to help. Simply reply to this email or visit our help center.

Happy moving! 📦✨

Best regards,
The Moovey Team

---
© 2025 Moovey. All rights reserved.
This email was sent to {{ $user->email }}. If you didn't create this account, please ignore this email.