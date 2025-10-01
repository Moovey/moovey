import React from 'react';
import { Link } from '@inertiajs/react';

export default function GlobalFooter() {
    return (
        <footer className="bg-[#1A237E] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Moovey Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-[#00BCD4] rounded-lg flex items-center justify-center">
                                <span className="text-xl font-bold text-white">🐄</span>
                            </div>
                            <div className="text-2xl font-bold text-white">Moovey</div>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Your trusted companion for stress-free house moves. Making relocations simple, organized, and enjoyable.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-[#00BCD4] transition-colors">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-[#00BCD4] transition-colors">
                                <span className="sr-only">Twitter</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-[#00BCD4] transition-colors">
                                <span className="sr-only">Instagram</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm-1.04 13.8c-2.15-.024-3.728-1.687-3.728-3.84s1.578-3.816 3.728-3.84c2.15.024 3.728 1.687 3.728 3.84s-1.578 3.816-3.728 3.84zM13.2 7.2c.397 0 .72-.323.72-.72s-.323-.72-.72-.72-.72.323-.72.72.323.72.72.72z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/dashboard" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/move-details" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Move Details
                                </Link>
                            </li>
                            <li>
                                <Link href="/moovey-academy" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Moovey Academy
                                </Link>
                            </li>
                            <li>
                                <Link href="/tools" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Tools & Resources
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Community</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/community" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Community Hub
                                </Link>
                            </li>
                            <li>
                                <Link href="/connections" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Connections
                                </Link>
                            </li>
                            <li>
                                <Link href="/trade-directory" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Trade Directory
                                </Link>
                            </li>
                            <li>
                                <Link href="/achievements" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Achievements
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-[#00BCD4] transition-colors text-sm">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-600 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-300 text-sm mb-4 md:mb-0">
                            © 2025 Moovey. All rights reserved. Making moves easier, one step at a time.
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                <span className="text-[#00BCD4]">🐄</span>
                                <span>Powered by Moovey Technology</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
