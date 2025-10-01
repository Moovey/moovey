export default function FinalCTA() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Ready to Make <span className="text-[#17B7C7]">Your Move?</span>
                </h2>
                <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
                    Sign up completely free and start planning your move with Moovey
                </p>
                
                <div className="mb-12">
                    <a 
                        href="/register"
                        className="bg-[#17B7C7] text-white px-16 py-5 rounded-full text-2xl font-bold hover:bg-[#139AAA] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-block"
                    >
                        Get Started
                    </a>
                </div>
                
                {/* Customer Testimonial Section */}
                <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
                    <div className="flex justify-center items-center space-x-6 mb-6">
                        <div className="flex -space-x-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm font-bold">JS</span>
                            </div>
                            <div className="w-12 h-12 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm font-bold">MK</span>
                            </div>
                            <div className="w-12 h-12 bg-purple-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm font-bold">AC</span>
                            </div>
                            <div className="w-12 h-12 bg-pink-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm font-bold">RL</span>
                            </div>
                            <div className="w-12 h-12 bg-indigo-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                <span className="text-white text-sm font-bold">TB</span>
                            </div>
                        </div>
                        
                        <div className="text-left">
                            <div className="flex items-center space-x-1 mb-1">
                                <span className="text-yellow-400 text-xl">★★★★★</span>
                            </div>
                            <div className="text-sm text-gray-600 font-medium">5-star rating</div>
                        </div>
                    </div>
                    
                    <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-4">
                        "Moovey made our house move incredibly smooth and stress-free. The step-by-step guidance and community support were invaluable!"
                    </blockquote>
                    
                    <div className="text-sm text-gray-600">
                        <strong>5,455+ satisfied customers</strong> have successfully planned their moves with Moovey
                    </div>
                </div>
            </div>
        </section>
    );
}
