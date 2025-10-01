export default function CommunityGuidelines() {
    const guidelines = {
        dos: [
            "Be helpful and supportive to fellow movers",
            "Share genuine experiences and advice",
            "Respect others' questions and concerns",
            "Use location tags when relevant",
            "Keep content moving-related"
        ],
        donts: [
            "Post spam or promotional content",
            "Share personal contact information publicly",
            "Use offensive or inappropriate language",
            "Post duplicate or irrelevant content",
            "Engage in arguments or negative behavior"
        ]
    };

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-[#1A237E] mb-6">Community Guidelines</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                Do's
                            </h3>
                            <ul className="space-y-2 text-gray-700">
                                {guidelines.dos.map((item, index) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="text-red-500 mr-2">✗</span>
                                Don'ts
                            </h3>
                            <ul className="space-y-2 text-gray-700">
                                {guidelines.donts.map((item, index) => (
                                    <li key={index}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}