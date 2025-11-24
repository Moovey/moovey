import React from 'react';
import { motion } from 'framer-motion';

interface ChainCheckerTeaserProps {
    onActivate: () => void;
}

const ChainCheckerTeaser: React.FC<ChainCheckerTeaserProps> = ({ onActivate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8 text-center">
                {/* Professional Chain Status Icon */}
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center space-x-3">
                        <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                </svg>
                            </div>
                            {/* Alert indicator */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Heading */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Chain Checker Not Active
                </h2>
                
                {/* Description */}
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Build your moving chain, link up with others in the chain and check your chain health with our free chain checker tool
                </p>
                
                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                        <div className="mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Chain Visualization</h3>
                        <p className="text-sm text-gray-600">
                            See your entire property chain and track progress in real-time
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                        <div className="mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Agent Coordination</h3>
                        <p className="text-sm text-gray-600">
                            Get updates from your agent and request progress reports
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                        <div className="mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V9.375c0-.621.504-1.125 1.125-1.125H20.25M8.25 21l10.5 0m-11.25-9.375h11.25C18.621 11.625 19.125 11.121 19.125 10.5V9.15c0-.201-.075-.402-.225-.563L12.375 2.062a.75.75 0 00-1.061 0L4.8 8.587c-.15.161-.225.362-.225.563v.939c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Property Basket</h3>
                        <p className="text-sm text-gray-600">
                            Save properties from Rightmove and claim your listings
                        </p>
                    </div>
                </div>
                
                {/* CTA Button */}
                <button
                    onClick={() => {
                        onActivate();
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white rounded-lg hover:from-[#00ACC1] hover:to-[#16A5B8] transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center space-x-3 mx-auto"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <span>Activate Chain Checker</span>
                </button>
                
                {/* Additional Info */}
                <div className="mt-6 text-sm text-gray-500">
                    <p>Set up takes less than 2 minutes • Free feature</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ChainCheckerTeaser;