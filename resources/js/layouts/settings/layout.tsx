import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { User, Lock, Palette, Settings } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: User,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: Lock,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] to-[#E0F7FA] px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-l-4 border-[#00BCD4]">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#00BCD4] to-[#1A237E] rounded-xl flex items-center justify-center">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#1A237E] mb-2">Account Settings</h1>
                            <p className="text-lg text-gray-600">Manage your profile and account preferences</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-80">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h2 className="text-lg font-semibold text-[#1A237E] mb-4 flex items-center">
                                <Settings className="w-5 h-5 mr-2" />
                                Settings Menu
                            </h2>
                            <nav className="space-y-2">
                                {sidebarNavItems.map((item, index) => {
                                    const IconComponent = item.icon;
                                    const isActive = currentPath === item.href;
                                    
                                    return (
                                        <Link
                                            key={`${item.href}-${index}`}
                                            href={item.href}
                                            prefetch
                                            className={cn(
                                                'flex items-center space-x-3 p-4 rounded-lg text-left w-full transition-all duration-200 group',
                                                {
                                                    'bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] text-white shadow-md': isActive,
                                                    'text-gray-700 hover:bg-[#E0F7FA] hover:text-[#00BCD4]': !isActive,
                                                }
                                            )}
                                        >
                                            <div className={cn(
                                                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200',
                                                {
                                                    'bg-white/20': isActive,
                                                    'bg-[#F5F5F5] group-hover:bg-[#00BCD4] group-hover:text-white': !isActive,
                                                }
                                            )}>
                                                {IconComponent && (
                                                    <IconComponent className={cn(
                                                        'w-5 h-5',
                                                        {
                                                            'text-white': isActive,
                                                            'text-gray-600 group-hover:text-white': !isActive,
                                                        }
                                                    )} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{item.title}</div>
                                                <div className={cn(
                                                    'text-sm',
                                                    {
                                                        'text-white/80': isActive,
                                                        'text-gray-500 group-hover:text-[#00BCD4]/70': !isActive,
                                                    }
                                                )}>
                                                    {item.title === 'Profile' && 'Account details'}
                                                    {item.title === 'Password' && 'Security settings'}
                                                    {item.title === 'Appearance' && 'Theme preferences'}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Quick Stats */}
                            <div className="mt-8 pt-6 border-t border-[#E0F7FA]">
                                <h3 className="text-sm font-semibold text-gray-600 mb-3">Account Status</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Profile Complete</span>
                                        <span className="text-sm font-semibold text-[#00BCD4]">85%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
