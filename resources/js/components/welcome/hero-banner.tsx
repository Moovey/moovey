export default function HeroBanner() {
    return (
        <section className="h-[50vh] relative overflow-hidden bg-cover bg-center bg-no-repeat flex items-center" style={{backgroundImage: "url('/images/hero-banner2.webp')"}}>
            {/* Background Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/30"></div>
            
            {/* Optional: Keep some decorative elements if desired */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center h-full">
                    {/* Left Column - Content */}
                    <div className="text-center lg:text-left space-y-4 sm:space-y-6 relative z-10 py-4">
                        <div className="space-y-3 sm:space-y-4">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                                WORRIED ABOUT MOVING?
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-md">
                                We've Got You Covered With Our User-Friendly Guide To Put House Movers Like You Back In Control Of The Process
                            </p>
                        </div>
                        
                        <div className="flex justify-center lg:justify-start pt-2">
                            <a 
                                href="/register"
                                className="bg-[#17B7C7] text-white px-8 sm:px-10 lg:px-12 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
