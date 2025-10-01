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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Impact</h2>
                    <p className="text-lg text-gray-600">See how our community is helping movers across the UK</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center bg-[#E0F7FA] rounded-xl p-6">
                            <div className="text-4xl font-bold text-[#17B7C7] mb-2">{stat.number}</div>
                            <p className="text-gray-700 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}