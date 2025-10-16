import { Link } from '@inertiajs/react';

export default function CommunityCTA() {
    return (
        <section className="py-8 sm:py-12 lg:py-20 px-3 sm:px-6 lg:px-8 bg-[#17B7C7]">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                    Ready to Join the Community?
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-2xl mx-auto">
                    Sign up today and connect with thousands of movers who are ready to help make your move successful.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                    <Link
                        href="/register"
                        className="w-full sm:w-auto bg-white text-[#17B7C7] px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:bg-gray-100 transition-colors shadow-lg inline-block text-center min-w-[200px]"
                    >
                        Join Community
                    </Link>
                    
                    <Link
                        href="/login"
                        className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg hover:bg-white hover:text-[#17B7C7] transition-colors inline-block text-center min-w-[200px]"
                    >
                        Already a Member?
                    </Link>
                </div>
                
                {/* Mobile-friendly additional info */}
                <div className="mt-6 sm:mt-8 text-center">
                    <p className="text-xs sm:text-sm text-white/75 mb-2">
                        Join 2,847+ active members sharing their moving journey
                    </p>
                    <div className="flex justify-center items-center space-x-4 text-white/80">
                        <div className="flex items-center space-x-1">
                            <span className="text-sm sm:text-base">✓</span>
                            <span className="text-xs sm:text-sm">Free to join</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-sm sm:text-base">✓</span>
                            <span className="text-xs sm:text-sm">Expert advice</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="text-sm sm:text-base">✓</span>
                            <span className="text-xs sm:text-sm">24/7 support</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}