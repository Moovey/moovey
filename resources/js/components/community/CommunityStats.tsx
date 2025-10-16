export default function CommunityStats() {
    const stats = [
        {
            number: "2,847",
            label: "Active Members"
        },
        {
            number: "8,392",
            label: "Community Posts"
        },
        {
            number: "12,458",
            label: "Questions Answered"
        },
        {
            number: "95%",
            label: "Satisfaction Rate"
        }
    ];

    return (
        <section className="py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Community Impact</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">See how our community is helping movers across the UK</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center bg-[#E0F7FA] rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8">
                            <div className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-[#17B7C7] mb-1 sm:mb-2 lg:mb-3">{stat.number}</div>
                            <p className="text-xs sm:text-sm lg:text-base text-gray-700 font-medium leading-tight">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}