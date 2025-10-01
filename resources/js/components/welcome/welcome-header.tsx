import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export default function WelcomeHeader() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <AppLogo />
                        <span className="text-xl font-bold text-gray-900">Moovey</span>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link 
                            href={route('home')} 
                            className="text-gray-600 hover:text-[#00BCD4] font-medium transition-colors duration-200"
                        >
                            My Moovey
                        </Link>
                        <Link 
                            href={route('academy')} 
                            className="text-gray-600 hover:text-[#00BCD4] font-medium transition-colors duration-200"
                        >
                            Moovey Academy
                        </Link>
                        <Link 
                            href={route('tools')} 
                            className="text-gray-600 hover:text-[#00BCD4] font-medium transition-colors duration-200"
                        >
                            Tools
                        </Link>
                        <a href="#community" className="text-gray-600 hover:text-[#00BCD4] font-medium transition-colors duration-200">
                            Community
                        </a>
                        <a href="#directory" className="text-gray-600 hover:text-[#00BCD4] font-medium transition-colors duration-200">
                            Trade Directory
                        </a>
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {auth.user ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('dashboard')}
                                    className="text-gray-600 hover:text-[#00BCD4] font-medium transition-colors duration-200"
                                >
                                    Dashboard
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                <AvatarFallback className="bg-[#00BCD4] text-white font-semibold text-sm">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-[#00BCD4] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#00ACC1] transition-all duration-300"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
