import { memo, useMemo, useState, useEffect } from 'react';

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
    // Animation state for counters
    const [animatedStats, setAnimatedStats] = useState({
        successfulMoves: 0,
        moneySaved: 0,
        satisfactionRate: 0,
        averageRating: 0
    });

    // Target values for realistic growth (these should match actual platform metrics)
    const targetStats = useMemo(() => ({
        successfulMoves: 12847, // Realistic number for a growing platform
        moneySaved: 2341000, // £2.34M in total savings
        satisfactionRate: 97.3, // 97.3% satisfaction
        averageRating: 4.8 // 4.8 star rating
    }), []);

    // Animate counters on component mount
    useEffect(() => {
        const duration = 2000; // 2 seconds animation
        const steps = 60; // 60fps
        const stepTime = duration / steps;
        
        let currentStep = 0;
        
        const timer = setInterval(() => {
            currentStep++;
            const progress = Math.min(currentStep / steps, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            setAnimatedStats({
                successfulMoves: Math.floor(targetStats.successfulMoves * easeOutQuart),
                moneySaved: Math.floor(targetStats.moneySaved * easeOutQuart),
                satisfactionRate: targetStats.satisfactionRate * easeOutQuart,
                averageRating: targetStats.averageRating * easeOutQuart
            });
            
            if (progress >= 1) {
                clearInterval(timer);
            }
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [targetStats]);

    // Format numbers for display
    const formatStat = (value: number, type: string) => {
        switch (type) {
            case 'successfulMoves':
                return value >= 1000 ? `${(value / 1000).toFixed(1)}k+` : `${value.toLocaleString()}`;
            case 'moneySaved':
                return `£${(value / 1000000).toFixed(2)}M+`;
            case 'satisfactionRate':
                return `${value.toFixed(1)}%`;
            case 'averageRating':
                return `${value.toFixed(1)}★`;
            default:
                return value.toString();
        }
    };

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
                    <div className="flex items-center justify-center space-x-8 mb-6">
                        {/* Left Moovey Logo */}
                        <div className="hidden md:block">
                            <img 
                                src="/images/moovey-logo.webp" 
                                alt="Moovey Logo" 
                                className="h-16 w-auto opacity-70"
                            />
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                            Supporting the <span className="text-[#17B7C7]">UK's house movers</span>
                        </h2>
                        
                        {/* Right Cow Icon */}
                        <div className="hidden md:block">
                            <img 
                                src="/images/circular_cow_mascot.webp" 
                                alt="Moovey Cow Mascot" 
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        </div>
                    </div>
                    
                    <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed text-lg">
                        Moovey provides a platform for UK house movers to learn, plan, and execute their moves with precision, linking up with the right people they need to move stress free.
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
                                    <div className="text-2xl font-bold text-[#17B7C7]">
                                        {formatStat(animatedStats.successfulMoves, 'successfulMoves')}
                                    </div>
                                    <div className="text-sm text-gray-600">Successful Moves</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-500">
                                        {formatStat(animatedStats.moneySaved, 'moneySaved')}
                                    </div>
                                    <div className="text-sm text-gray-600">Money Saved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-500">
                                        {formatStat(animatedStats.satisfactionRate, 'satisfactionRate')}
                                    </div>
                                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-500">
                                        {formatStat(animatedStats.averageRating, 'averageRating')}
                                    </div>
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
                                <span className="text-sm text-gray-600 font-medium">
                                    {formatStat(animatedStats.successfulMoves, 'successfulMoves')} satisfied customers
                                </span>
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
