import React from 'react';
import type { ValuePropsectionProps } from '@/types/welcome';

const ValuePropCard: React.FC<{ prop: any }> = ({ prop }) => {
    const getIconSvg = (iconType: string) => {
        const iconProps = "w-8 h-8 md:w-10 md:h-10 text-white";
        
        switch (iconType) {
            case 'book':
                return (
                    <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                );
            case 'users':
                return (
                    <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'chat':
                return (
                    <svg className={iconProps} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                );
            case 'moovey-crest':
                return (
                    <img 
                        src="/images/moovey-crest.png" 
                        alt="Moovey Crest" 
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                );
            case 'professionals':
                return (
                    <img 
                        src="/images/trade-directory-logo.png" 
                        alt="Trade Directory Logo" 
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                );
            case 'tasks':
                return (
                    <img 
                        src="/images/community-logo.png" 
                        alt="Community Logo" 
                        className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={`bg-gradient-to-br from-${prop.color}-50 to-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center`}>
            <div className={`w-16 h-16 md:w-20 md:h-20 bg-${prop.color === 'blue' ? '[#17B7C7]' : prop.color + '-500'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                {getIconSvg(prop.icon)}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{prop.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
                {prop.description}
            </p>
            <a 
                href={prop.link}
                className={`bg-${prop.color === 'blue' ? '[#17B7C7] hover:bg-[#139AAA]' : prop.color + '-500 hover:bg-' + prop.color + '-600'} text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 inline-block`}
            >
                {prop.linkText}
            </a>
        </div>
    );
};

const ValuePropsSection: React.FC<ValuePropsectionProps> = ({ valueProps }) => {
    return (
        <section className="py-12 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        Make Your Move with <span className="text-[#17B7C7]">Moovey</span>
                    </h2>
                    <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                        Access our comprehensive suite of moving resources, connect with trusted professionals, and join a supportive community.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {valueProps.map((prop) => (
                        <ValuePropCard key={prop.id} prop={prop} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ValuePropsSection;