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
    chain_length: number;
    agent_name?: string;
    agent_email?: string;
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
        console.log('ChainChecker component mounted, loading data...');
        loadChainData();
    }, []);

    // Debug logging
    console.log('ChainChecker render state:', { 
        loading, 
        chainData: !!chainData, 
        showSetupWizard,
        willShowSetupWizard: showSetupWizard,
        willShowTeaser: !loading && !chainData && !showSetupWizard,
        willShowMain: !loading && chainData && !showSetupWizard
    });    const loadChainData = async () => {
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
                console.log('Chain checker API response:', data); // Debug log
                if (data.success) {
                    setChainData(data.data?.chain_checker || null);
                    // Don't auto-show setup wizard - let user click activate button
                } else {
                    console.log('Chain checker API returned success: false');
                }
            } else {
                console.error('Chain checker API response not ok:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to load chain data:', error);
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
        console.log('ChainChecker: Showing setup wizard');
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
                    console.log('ChainChecker: Activate button clicked, setting showSetupWizard to true');
                    setShowSetupWizard(true);
                }}
            />
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-[#00BCD4] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">⛓️</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Chain Checker</h1>
                                <p className="text-sm text-gray-500">Track your moving chain progress</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    Chain Health: {chainData.progress_score}%
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-[#00BCD4] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${chainData.progress_score}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Chain Overview', icon: '🔗' },
                            { id: 'stages', label: 'Stages & Next Steps', icon: '✅' },
                            { id: 'updates', label: 'Updates & Notifications', icon: '🔔' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-[#00BCD4] text-[#00BCD4]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
    );
};

export default ChainChecker;