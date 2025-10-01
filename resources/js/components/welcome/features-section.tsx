export default function FeaturesSection() {
    return (
        <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                    Everything you need for a{" "}
                    <span className="text-[#0cc0df]">perfect move</span>
                </h2>
                <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
                    From timeline planning to task management, Moovey makes your move seamless and stress-free.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0cc0df]/10 to-[#0cc0df]/20 rounded-2xl flex items-center justify-center mx-auto">
                            <span className="text-2xl">📅</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Smart Timeline</h3>
                        <p className="text-gray-600 text-sm">AI-powered timeline that adapts to your moving needs</p>
                    </div>
                    
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#f4c542]/10 to-[#f4c542]/20 rounded-2xl flex items-center justify-center mx-auto">
                            <span className="text-2xl">✅</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Task Automation</h3>
                        <p className="text-gray-600 text-sm">Never miss important moving tasks with smart reminders</p>
                    </div>
                    
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0aa5c0]/10 to-[#0aa5c0]/20 rounded-2xl flex items-center justify-center mx-auto">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
                        <p className="text-gray-600 text-sm">Real-time insights into your moving progress</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
