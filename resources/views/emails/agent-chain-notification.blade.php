<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chain Checker Activated - {{ $user->name }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #00BCD4, #0097A7);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .chain-details {
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #00BCD4;
        }
        .detail-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-label {
            font-weight: bold;
            color: #666;
            width: 150px;
            display: inline-block;
        }
        .cta-button {
            display: inline-block;
            background: #00BCD4;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background: #0097A7;
        }
        .footer {
            margin-top: 30px;
            padding: 20px 0;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏠 Moovey</div>
        <h1>Chain Checker Activated</h1>
        <p>Your client has set up moving chain tracking</p>
    </div>

    <div class="content">
        <h2>Hello {{ $chainChecker->agent_name ?: 'Estate Agent' }},</h2>
        
        <p>Great news! Your client <strong>{{ $user->name }}</strong> has activated Moovey's Chain Checker to track their moving chain progress.</p>
        
        <div class="chain-details">
            <h3>📋 Chain Details</h3>
            
            <div class="detail-row">
                <span class="detail-label">Client Name:</span>
                {{ $user->name }}
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Move Type:</span>
                {{ ucfirst(str_replace('_', ' ', $chainChecker->move_type)) }}
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Chain Length:</span>
                {{ $chainChecker->chain_length }} {{ $chainChecker->chain_length == 1 ? 'property' : 'properties' }}
            </div>
            
            @if($chainChecker->estimated_completion)
            <div class="detail-row">
                <span class="detail-label">Target Completion:</span>
                {{ $chainChecker->estimated_completion->format('j F Y') }}
            </div>
            @endif
            
            <div class="detail-row">
                <span class="detail-label">Activation Date:</span>
                {{ $chainChecker->created_at->format('j F Y') }}
            </div>
        </div>

        <h3>🎯 What This Means</h3>
        <p>Your client can now:</p>
        <ul>
            <li>Track each stage of their moving chain</li>
            <li>Receive automated progress updates</li>
            <li>Request updates from you directly through the platform</li>
            <li>Stay informed about potential delays or issues</li>
        </ul>

        <h3>🤝 How You Can Help</h3>
        <p>You can support your client by:</p>
        <ul>
            <li>Providing regular updates through the agent portal</li>
            <li>Responding to update requests promptly</li>
            <li>Flagging any potential issues early</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $updateUrl }}" class="cta-button">
                🔗 Access Agent Portal
            </a>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong>🔐 Secure Access:</strong> The link above provides secure access to update your client's chain progress. This link is unique to this chain and expires when the move is completed.
        </div>

        <p>If you have any questions about using the Chain Checker or need assistance, please don't hesitate to contact our support team.</p>

        <p>Thank you for being part of the Moovey network!</p>
        
        <p>Best regards,<br>
        <strong>The Moovey Team</strong></p>
    </div>

    <div class="footer">
        <p><strong>Moovey - Making Moving Simple</strong></p>
        <p>This email was sent because your client {{ $user->name }} listed you as their estate agent and provided consent for us to contact you regarding their moving chain.</p>
        <p>If you believe you received this email in error, please contact us at support@moovey.app</p>
    </div>
</body>
</html>