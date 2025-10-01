import { Link } from '@inertiajs/react';

export default function CommunityCTA() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#17B7C7]">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Ready to Join the Community?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                    Sign up today and connect with thousands of movers who are ready to help make your move successful.
                </p>
                <Link
                    href="/register"
                    className="bg-white text-[#17B7C7] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg inline-block"
                >
                    Join Community
                </Link>
            </div>
        </section>
    );
}