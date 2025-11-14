<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Moovey</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #17B7C7;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #17B7C7;
            margin-bottom: 10px;
        }
        .welcome-title {
            color: #1A237E;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .user-role {
            display: inline-block;
            background: linear-gradient(135deg, #17B7C7, #00BCD4);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: capitalize;
        }
        .content {
            margin: 30px 0;
        }
        .feature-list {
            background-color: #f0f8ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #17B7C7;
            margin: 20px 0;
        }
        .feature-list h3 {
            color: #1A237E;
            margin-top: 0;
        }
        .feature-list ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .feature-list li {
            margin-bottom: 8px;
            color: #555;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #17B7C7, #00BCD4);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #17B7C7;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="{{ config('app.url') }}/images/moovey-logo.png" alt="Moovey" style="height: 60px; width: auto;" />
            </div>
            <h1 class="welcome-title">Welcome!</h1>
            <div class="user-role">{{ $user->role ?? 'User' }}</div>
        </div>

        <div class="content">
            <p>Hi <strong>{{ $user->name }}</strong>,</p>
            
            <p>🎉 <strong>Congratulations!</strong> Your Moovey account has been successfully created. We're thrilled to have you join our community of movers and industry professionals.</p>

            @if($user->role === 'housemover')
            <div class="feature-list">
                <h3>🏠 As a Housemover, you now have access to:</h3>
                <ul>
                    <li><strong>My Moovey Dashboard</strong> - Track your moving progress and manage tasks</li>
                    <li><strong>Moovey Academy</strong> - Learn from expert guides and lessons</li>
                    <li><strong>Moving Tools</strong> - Calculators, planners, and helpful utilities</li>
                    <li><strong>Trusted Network</strong> - Connect with verified moving professionals</li>
                    <li><strong>Community Support</strong> - Get advice from fellow movers</li>
                </ul>
            </div>
            @elseif($user->role === 'business')
            <div class="feature-list">
                <h3>🏢 As a Business Partner, you now have access to:</h3>
                <ul>
                    <li><strong>Business Dashboard</strong> - Manage your profile and services</li>
                    <li><strong>Lead Generation</strong> - Connect with potential customers</li>
                    <li><strong>Trade Directory</strong> - Showcase your business to the community</li>
                    <li><strong>Networking Opportunities</strong> - Partner with other professionals</li>
                    <li><strong>Analytics & Insights</strong> - Track your business performance</li>
                </ul>
            </div>
            @endif

            <p><strong>What's next?</strong></p>
            <p>We recommend starting by completing your profile and exploring the Academy to discover all the amazing features we've built for you.</p>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/{{ $user->role === 'business' ? 'business' : 'housemover' }}/dashboard" class="cta-button">
                    🚀 Get Started Now
                </a>
            </div>

            <p>If you have any questions or need assistance, our support team is here to help. Simply reply to this email or visit our help center.</p>

            <p>Happy moving! 📦✨</p>
            
            <p>Best regards,<br>
            <strong>The Moovey Team</strong></p>
        </div>

        <div class="footer">
            <div class="social-links">
                <a href="#">Facebook</a> |
                <a href="#">Twitter</a> |
                <a href="#">LinkedIn</a>
            </div>
            <p>© 2025 Moovey. All rights reserved.</p>
            <p>This email was sent to {{ $user->email }}. If you didn't create this account, please ignore this email.</p>
        </div>
    </div>
</body>
</html>