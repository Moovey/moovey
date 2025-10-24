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
        <section className="py-20 bg-gradient-to-br from-[#E0F7FA] via-white to-[#F3E5F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        Trusted by <span className="text-[#17B7C7]">Thousands</span> of Movers
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        See why families across the UK choose Moovey to make their moves stress-free and successful.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
                    {/* Testimonials */}
                    <div className="space-y-6">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-lg transition-transform hover:scale-[1.02]">
                                <div className="flex items-center space-x-1 mb-3">
                                    <span className="text-yellow-400 text-lg">
                                        {renderStars(testimonial.rating)}
                                    </span>
                                </div>
                                <blockquote className="text-gray-700 italic leading-relaxed mb-4">
                                    {testimonial.content}
                                </blockquote>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 ${testimonial.color} rounded-full flex items-center justify-center`}>
                                        <span className="text-white text-sm font-bold">{testimonial.initials}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                                        <div className="text-sm text-gray-600">{testimonial.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats and Social Proof */}
                    <div className="text-center lg:text-left space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Join 10,000+ Movers</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#17B7C7]">{currentStats.successfulMoves}</div>
                                    <div className="text-sm text-gray-600">Successful Moves</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-500">{currentStats.moneySaved}</div>
                                    <div className="text-sm text-gray-600">Money Saved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-500">{currentStats.satisfactionRate}</div>
                                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-500">{currentStats.averageRating}</div>
                                    <div className="text-sm text-gray-600">Average Rating</div>
                                </div>
                            </div>

                            <div className="flex justify-center items-center space-x-3 mb-6">
                                <div className="flex -space-x-1">
                                    {customerAvatars.map((avatar, index) => (
                                        <div 
                                            key={index}
                                            className={`w-8 h-8 ${avatar.color} rounded-full border-2 border-white flex items-center justify-center`}
                                        >
                                            <span className="text-white text-sm font-bold">{avatar.letter}</span>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 font-medium">5,455+ satisfied customers</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <a 
                                href="/register"
                                className="bg-[#17B7C7] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
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
