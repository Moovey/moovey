import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import sub-components
import ChainCheckerTeaser from './ChainCheckerTeaser';
import ChainSetupWizard from './ChainSetupWizard';
import ChainOverview from './ChainOverview';
import ChainStages from './ChainStages';
import ChainUpdates from './ChainUpdates';

interface ChainCheckerData {
    id: number;
    move_type: 'buying' | 'selling' | 'both';
    chain_role?: 'first_time_buyer' | 'seller_only' | 'buyer_seller';
    buying_properties?: number[];
    selling_properties?: number[];
    chain_length: number;
    agent_name?: string;
    agent_email?: string;
    buying_agent_details?: {
        name: string;
        email: string;
        phone: string;
        firm: string;
    };
    selling_agent_details?: {
        name: string;
        email: string;
        phone: string;
        firm: string;
    };
    buying_solicitor_details?: {
        name: string;
        email: string;
        phone: string;
        firm: string;
    };
    selling_solicitor_details?: {
        name: string;
        email: string;
        phone: string;
        firm: string;
    };
    chain_participants?: any[];
    analytics_data?: any;
    last_activity_at?: string;
    chain_status: Record<string, any>;
    progress_score: number;
    is_active: boolean;
    estimated_completion?: string;
    recent_updates: ChainUpdate[];
}

interface ChainUpdate {
    id: number;
    update_type: string;
    title: string;
    description: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

interface ChainCheckerProps {
    onClose?: () => void;
}

    const ChainChecker: React.FC<ChainCheckerProps> = ({ onClose }) => {
    const [chainData, setChainData] = useState<ChainCheckerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'updates'>('overview');
    const [showSetupWizard, setShowSetupWizard] = useState(false);

    useEffect(() => {
        loadChainData();
    }, []);

    const loadChainData = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/api/chain-checker', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setChainData(data.data?.chain_checker || null);
                    // Don't auto-show setup wizard - let user click activate button
                }
            }
        } catch (error) {
            // Error loading chain data
        } finally {
            setLoading(false);
        }
    };

    const handleSetupComplete = (newChainData: ChainCheckerData) => {
        setChainData(newChainData);
        setShowSetupWizard(false);
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BCD4] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Chain Checker...</p>
                </div>
            </div>
        );
    }

    // Check for setup wizard first, before checking chainData
    if (showSetupWizard) {
        return (
            <ChainSetupWizard 
                onComplete={handleSetupComplete}
                onCancel={() => setShowSetupWizard(false)}
            />
        );
    }

    if (!chainData) {
        return (
            <ChainCheckerTeaser 
                onActivate={() => {
                    setShowSetupWizard(true);
                }}
            />
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#00BCD4] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm sm:text-base">⛓️</span>
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Chain Checker</h1>
                                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Track your moving chain progress</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="text-right">
                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                    Chain Health: {chainData.progress_score}%
                                </div>
                                <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-1.5 sm:h-2">
                                    <div 
                                        className="bg-[#00BCD4] h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${chainData.progress_score}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    {/* Mobile Tab Navigation - Horizontal Scroll */}
                    <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'overview', label: 'Chain Overview', shortLabel: 'Overview', icon: '🔗' },
                            { id: 'stages', label: 'Stages & Next Steps', shortLabel: 'Stages', icon: '✅' },
                            { id: 'updates', label: 'Updates & Notifications', shortLabel: 'Updates', icon: '🔔' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 transition-colors whitespace-nowrap flex-shrink-0
                                    ${activeTab === tab.id
                                        ? 'border-[#00BCD4] text-[#00BCD4]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <span className="text-sm sm:text-base">{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.shortLabel}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChainOverview chainData={chainData} onRefresh={loadChainData} />
                        </motion.div>
                    )}
                    
                    {activeTab === 'stages' && (
                        <motion.div
                            key="stages"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChainStages chainData={chainData} onUpdate={loadChainData} />
                        </motion.div>
                    )}
                    
                    {activeTab === 'updates' && (
                        <motion.div
                            key="updates"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChainUpdates chainData={chainData} onRefresh={loadChainData} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add custom scrollbar styles */}
            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ChainChecker;