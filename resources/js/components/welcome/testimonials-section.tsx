import { memo, useMemo } from 'react';

interface Testimonial {
    id: string;
    rating: number;
    content: string;
    author: string;
    location: string;
    initials: string;
    color: string;
}

interface TestimonialsSectionProps {
    stats?: {
        successfulMoves: string;
        moneySaved: string;
        satisfactionRate: string;
        averageRating: string;
    };
}

const TestimonialsSection = memo(({ stats }: TestimonialsSectionProps) => {
    // Memoized testimonials data
    const testimonials: Testimonial[] = useMemo(() => [
        {
            id: '1',
            rating: 5,
            content: '"Moovey saved me £600 on removals! The trade directory helped me find vetted companies and the community gave me negotiation tips that really worked."',
            author: 'Jessica S.',
            location: 'London to Manchester',
            initials: 'JS',
            color: 'bg-[#17B7C7]'
        },
        {
            id: '2',
            rating: 5,
            content: '"The step-by-step guidance was incredible. I felt completely prepared and confident throughout my entire move. Couldn\'t have done it without Moovey!"',
            author: 'David M.',
            location: 'Birmingham to Leeds',
            initials: 'DM',
            color: 'bg-green-500'
        }
    ], []);

    // Default stats with memoization
    const defaultStats = useMemo(() => ({
        successfulMoves: '10,000+',
        moneySaved: '£2M+',
        satisfactionRate: '98%',
        averageRating: '4.9★'
    }), []);

    const currentStats = stats || defaultStats;

    const customerAvatars = useMemo(() => [
        { letter: 'A', color: 'bg-blue-500' },
        { letter: 'B', color: 'bg-green-500' },
        { letter: 'C', color: 'bg-purple-500' },
        { letter: 'D', color: 'bg-pink-500' },
        { letter: '+', color: 'bg-indigo-500' }
    ], []);

    const renderStars = (rating: number) => {
        return '★'.repeat(rating);
    };

    return (
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 bg-gradient-to-br from-[#E0F7FA] via-white to-[#F3E5F5]">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
                <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-8 leading-tight">
                        Trusted by <span className="text-[#17B7C7]">Thousands</span> of Movers
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-600 max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto leading-relaxed px-4 sm:px-0">
                        See why families across the UK choose Moovey to make their moves stress-free and successful.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-20 items-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
                    {/* Testimonials */}
                    <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 2xl:space-y-16">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 shadow-lg transition-transform hover:scale-[1.02]">
                                <div className="flex items-center space-x-1 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
                                    <span className="text-yellow-400 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
                                        {renderStars(testimonial.rating)}
                                    </span>
                                </div>
                                <blockquote className="text-gray-700 italic text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl leading-relaxed mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 2xl:mb-8">
                                    {testimonial.content}
                                </blockquote>
                                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-18 2xl:h-18 ${testimonial.color} rounded-full flex items-center justify-center`}>
                                        <span className="text-white text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold">{testimonial.initials}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">{testimonial.author}</div>
                                        <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600">{testimonial.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats and Social Proof */}
                    <div className="text-center lg:text-left space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 2xl:space-y-16">
                        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 shadow-lg">
                            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12">Join 10,000+ Movers</h3>
                            
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12">
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#17B7C7]">{currentStats.successfulMoves}</div>
                                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600">Successful Moves</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-green-500">{currentStats.moneySaved}</div>
                                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600">Money Saved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-purple-500">{currentStats.satisfactionRate}</div>
                                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600">Satisfaction Rate</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-orange-500">{currentStats.averageRating}</div>
                                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600">Average Rating</div>
                                </div>
                            </div>

                            <div className="flex justify-center items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5 xl:space-x-6 2xl:space-x-8 mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 2xl:mb-12">
                                <div className="flex -space-x-1 sm:-space-x-2">
                                    {customerAvatars.map((avatar, index) => (
                                        <div 
                                            key={index}
                                            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 ${avatar.color} rounded-full border-2 border-white flex items-center justify-center`}
                                        >
                                            <span className="text-white text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold">{avatar.letter}</span>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-gray-600 font-medium">5,455+ satisfied customers</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <a 
                                href="/register"
                                className="bg-[#17B7C7] text-white px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 xl:px-14 xl:py-7 2xl:px-16 2xl:py-8 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
                            >
                                Get Started
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

TestimonialsSection.displayName = 'TestimonialsSection';

export default TestimonialsSection;
