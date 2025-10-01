import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Header Section */}
                    <div className="border-b border-[#E0F7FA] pb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[#1A237E]">Appearance Settings</h2>
                                <p className="text-gray-600">Customize your Moovey experience with theme preferences</p>
                            </div>
                        </div>
                    </div>

                    {/* Theme Preview */}
                    <div className="bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] rounded-xl p-6 border-l-4 border-purple-500">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                                <span className="text-white text-sm">🎨</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#1A237E] mb-2">Moovey Theme</h3>
                                <p className="text-sm text-gray-700 mb-3">
                                    Experience Moovey with our signature teal and navy color scheme designed for optimal usability and modern aesthetics.
                                </p>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-[#00BCD4] border-2 border-white shadow-sm"></div>
                                    <div className="w-6 h-6 rounded-full bg-[#1A237E] border-2 border-white shadow-sm"></div>
                                    <div className="w-6 h-6 rounded-full bg-[#26C6DA] border-2 border-white shadow-sm"></div>
                                    <div className="w-6 h-6 rounded-full bg-[#3F51B5] border-2 border-white shadow-sm"></div>
                                    <span className="text-sm text-gray-600 ml-2">Moovey Brand Colors</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="space-y-6">
                        <AppearanceTabs />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
