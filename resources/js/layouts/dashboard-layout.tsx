import { type ReactNode } from 'react';
import GlobalHeader from '@/components/global-header';
import WelcomeFooter from '@/components/welcome/welcome-footer';

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    currentPage?: string;
}

export default function DashboardLayout({ children, title, currentPage = 'dashboard' }: DashboardLayoutProps) {
    return (
        <div className="bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0] min-h-screen font-sans overflow-hidden">
            <GlobalHeader currentPage={currentPage} />
            
            {/* Dashboard Content */}
            <main className="relative">
                {/* Background Elements - subtle for dashboard */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0]"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#0cc0df]/5 to-[#0aa5c0]/3 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#f4c542]/5 to-[#0cc0df]/3 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {title && (
                        <div className="mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                {title}
                            </h1>
                            <p className="text-gray-600">
                                Welcome back! Here's what's happening with your move.
                            </p>
                        </div>
                    )}
                    
                    {children}
                </div>
            </main>
            
            <WelcomeFooter />
        </div>
    );
}
