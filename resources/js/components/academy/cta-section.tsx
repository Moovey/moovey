import React from 'react';

interface CtaSectionProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    onButtonClick?: () => void;
    backgroundColor?: string;
}

export default function CtaSection({
    title = "Ready to Make Your Move?",
    subtitle = "Sign up today and start planning your seamless move with Moovey.",
    buttonText = "Get Started",
    onButtonClick,
    backgroundColor = "bg-gray-50"
}: CtaSectionProps) {
    const handleButtonClick = () => {
        if (onButtonClick) {
            onButtonClick();
        } else {
            // Default behavior - could redirect to signup or another action
            console.log("CTA button clicked - implement your action here");
        }
    };

    return (
        <section className={`py-20 px-4 sm:px-6 lg:px-8 ${backgroundColor}`}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {title}
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    {subtitle}
                </p>
                <button 
                    onClick={handleButtonClick}
                    className="bg-[#00BCD4] text-white px-12 py-4 rounded-full text-lg font-bold hover:bg-[#0097A7] transition-colors shadow-lg hover:shadow-xl"
                >
                    {buttonText}
                </button>
            </div>
        </section>
    );
}