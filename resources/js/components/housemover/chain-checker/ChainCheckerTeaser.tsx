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
                {/* Broken Chain Icon */}
                <div className="mb-6">
                    <div className="inline-flex items-center space-x-2 text-6xl">
                        <span>⛓️</span>
                        <span className="text-red-500">💔</span>
                    </div>
                </div>
                
                {/* Heading */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Chain Checker Not Active
                </h2>
                
                {/* Description */}
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Track your entire moving chain in one place! Monitor progress, get agent updates, 
                    and manage property interests all while staying connected with every part of your move.
                </p>
                
                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Chain Visualization</h3>
                        <p className="text-sm text-gray-600">
                            See your entire property chain and track progress in real-time
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                        <div className="text-3xl mb-3">🏘️</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Agent Coordination</h3>
                        <p className="text-sm text-gray-600">
                            Get updates from your agent and request progress reports
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                        <div className="text-3xl mb-3">🏠</div>
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
                    className="px-8 py-4 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
                >
                    ⛓️ Activate Chain Checker
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