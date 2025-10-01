export default function HeroBanner() {
    return (
        <section className="py-20 lg:py-32 relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/images/hero-background.webp')"}}>
            {/* Background Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>
            
            {/* Optional: Keep some decorative elements if desired */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <div className="text-center lg:text-left space-y-8 relative z-10">
                        <div className="space-y-6">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                                WORRIED ABOUT MOVING?
                            </h1>
                            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md">
                                We've Got You Covered With Our User-Friendly Guide To Put House Movers Like You Back In Control Of The Process
                            </p>
                        </div>
                        
                        <div className="flex justify-center lg:justify-start">
                            <a 
                                href="/register"
                                className="bg-[#17B7C7] text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                START
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
