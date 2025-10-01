interface EnhancedWelcomeBannerProps {
    userName?: string;
    subtitle?: string;
}

export default function EnhancedWelcomeBanner({ 
    userName = "Olivia", 
    subtitle = "You're Moving Day Is Here!" 
}: EnhancedWelcomeBannerProps) {
    return (
        <div className="bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center">
                {/* Left Side Content */}
                <div className="mb-6 lg:mb-0">
                    <h1 className="text-4xl font-bold mb-2">Welcome Back {userName}</h1>
                    <p className="text-lg opacity-90">{subtitle}</p>
                </div>
                
                {/* Right Side - Quick Stats */}
                <div className="text-right">
                    <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="text-sm opacity-80 mb-1">Your Progress</div>
                        <div className="text-3xl font-bold mb-2">78%</div>
                        <div className="text-sm opacity-90">Move Journey Complete</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
