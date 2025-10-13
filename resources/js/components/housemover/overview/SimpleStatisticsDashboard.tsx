export default function SimpleStatisticsDashboard() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { icon: "🏆", label: "Total Points", value: "2150", color: "#00BCD4", bgColor: "bg-[#E0F7FA]" },
                { icon: "👥", label: "Connections", value: "12", color: "#1A237E", bgColor: "bg-white" },
                { icon: "⭐", label: "Achievements", value: "3", color: "#00BCD4", bgColor: "bg-[#F5F5F5]" }
            ].map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer`}>
                    <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{stat.icon}</div>
                        <div className="text-3xl font-bold text-[#1A237E] mb-1">{stat.value}</div>
                        <div className="text-sm font-medium text-gray-600">{stat.label.toUpperCase()}</div>
                    </div>
                    <div className="h-2 bg-[#00BCD4] rounded-full"></div>
                </div>
            ))}
        </section>
    );
}