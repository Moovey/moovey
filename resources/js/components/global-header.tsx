import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import NotificationDropdown from '@/components/NotificationDropdown';
import MessageDropdown from '@/components/MessageDropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { getAvatarUrl } from '@/utils/fileUtils';

interface GlobalHeaderProps {
    currentPage?: string;
}

export default function GlobalHeader({ currentPage }: GlobalHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (page: string) => currentPage === page;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <img 
                                src="/images/moovey-logo.png" 
                                alt="Moovey" 
                                className="h-14 sm:h-16 md:h-18 lg:h-20 xl:h-24 2xl:h-28 w-auto"
                                onError={(e) => {
                                    // Fallback to text logo if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling) {
                                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                    }
                                }}
                            />
                            {/* Fallback text logo */}
                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900" style={{display: 'none'}}>Moovey</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 2xl:space-x-3">
                        <Link 
                            href="/" 
                            className={`px-1.5 py-2 lg:px-2 xl:px-3 rounded text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                                isActive('homepage') || isActive('home') || currentPage === 'welcome'
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            HOME
                        </Link>
                        {auth.user && (
                            <Link 
                                href={route('dashboard')} 
                                className={`px-1.5 py-2 lg:px-2 xl:px-3 rounded text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                                    isActive('dashboard')
                                        ? 'bg-[#17B7C7] text-white' 
                                        : 'text-gray-700 hover:text-[#17B7C7]'
                                }`}
                            >
                                MY MOOVEY
                            </Link>
                        )}
                        <Link 
                            href={route('academy')} 
                            className={`px-1.5 py-2 lg:px-2 xl:px-3 rounded text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                                isActive('academy')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            ACADEMY
                        </Link>
                        <Link 
                            href={route('tools')} 
                            className={`px-1.5 py-2 lg:px-2 xl:px-3 rounded text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                                isActive('tools')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            TOOLS
                        </Link>
                        <Link 
                            href={route('community')} 
                            className={`px-1.5 py-2 lg:px-2 xl:px-3 rounded text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                                isActive('community')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            COMMUNITY
                        </Link>
                        <Link 
                            href={route('trade-directory')} 
                            className={`px-1.5 py-2 lg:px-2 xl:px-3 rounded text-xs lg:text-sm xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                                isActive('trade-directory') || isActive('trade_directory')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            TRADE DIRECTORY
                        </Link>
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 2xl:space-x-4">
                        {auth.user ? (
                            <div className="flex items-center space-x-2">
                                <NotificationDropdown />
                                <MessageDropdown />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center space-x-1 lg:space-x-2 p-1.5 lg:p-2 rounded-xl bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] hover:from-[#00BCD4] hover:to-[#26C6DA] hover:text-white transition-all duration-300 border-2 border-transparent hover:border-[#00BCD4] hover:shadow-lg hover:shadow-[#00BCD4]/20 transform hover:scale-105">
                                            <Avatar className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 ring-2 ring-white shadow-md">
                                                <AvatarImage 
                                                    src={getAvatarUrl(auth.user.avatar) || undefined} 
                                                    alt={auth.user.name} 
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-[#00BCD4] to-[#1A237E] text-white font-bold text-xs">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left hidden 2xl:block">
                                                <span className="block text-xs font-semibold text-gray-800 group-hover:text-white">
                                                    {auth.user.name.split(' ')[0]}
                                                </span>
                                                <span className="block text-xs text-gray-600 group-hover:text-white/80">
                                                    {auth.user.role ? 
                                                        auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1) : 
                                                        'User'
                                                    }
                                                </span>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-72 bg-white rounded-xl shadow-2xl border-2 border-[#E0F7FA] p-2">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-xs lg:text-sm xl:text-base text-gray-700 hover:text-[#17B7C7] font-medium transition-colors duration-200 px-1"
                                >
                                    LOGIN
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-xs lg:text-sm xl:text-base text-gray-700 hover:text-[#17B7C7] font-medium transition-colors duration-200 px-1"
                                >
                                    REGISTER
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button 
                            onClick={toggleMobileMenu}
                            className="relative z-50 text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2"
                            aria-label="Toggle mobile menu"
                        >
                            <svg 
                                className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Mobile Menu */}
            <div className={`
                fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 
                transform transition-transform duration-300 ease-in-out lg:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <img 
                            src="/images/moovey-logo.png" 
                            alt="Moovey" 
                            className="h-10 sm:h-12 w-auto"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                }
                            }}
                        />
                        <span className="text-xl sm:text-2xl font-bold text-gray-900" style={{display: 'none'}}>Moovey</span>
                        <button 
                            onClick={closeMobileMenu}
                            className="text-gray-500 hover:text-gray-700 p-2"
                            aria-label="Close mobile menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6">
                        <div className="space-y-2 px-6">
                            <Link 
                                href="/" 
                                onClick={closeMobileMenu}
                                className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                    isActive('homepage') || isActive('home') || currentPage === 'welcome'
                                        ? 'bg-[#17B7C7] text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                HOME
                            </Link>
                            {auth.user && (
                                <Link 
                                    href={route('dashboard')} 
                                    onClick={closeMobileMenu}
                                    className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                        isActive('dashboard')
                                            ? 'bg-[#17B7C7] text-white' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    MY MOOVEY
                                </Link>
                            )}
                            <Link 
                                href={route('academy')} 
                                onClick={closeMobileMenu}
                                className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                    isActive('academy')
                                        ? 'bg-[#17B7C7] text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                MOOVEY ACADEMY
                            </Link>
                            <Link 
                                href={route('tools')} 
                                onClick={closeMobileMenu}
                                className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                    isActive('tools')
                                        ? 'bg-[#17B7C7] text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                TOOLS
                            </Link>
                            <Link 
                                href={route('community')} 
                                onClick={closeMobileMenu}
                                className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                    isActive('community')
                                        ? 'bg-[#17B7C7] text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                COMMUNITY
                            </Link>
                            <Link 
                                href={route('trade-directory')} 
                                onClick={closeMobileMenu}
                                className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                    isActive('trade-directory') || isActive('trade_directory')
                                        ? 'bg-[#17B7C7] text-white' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                TRADE DIRECTORY
                            </Link>
                            {/* My Moovey already placed after Home */}
                        </div>
                    </nav>

                    {/* Mobile Auth Section */}
                    <div className="border-t border-gray-200 p-6">
                        {auth.user ? (
                            <div className="space-y-4">
                                {/* Mobile Notifications and Messages */}
                                <div className="mb-4 flex space-x-2">
                                    <NotificationDropdown />
                                    <MessageDropdown />
                                </div>
                                
                                {/* User Profile Info */}
                                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] rounded-lg">
                                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                                        <AvatarImage 
                                            src={getAvatarUrl(auth.user.avatar) || undefined} 
                                            alt={auth.user.name} 
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-[#00BCD4] to-[#1A237E] text-white font-bold text-sm">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {auth.user.name.split(' ')[0]}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {auth.user.role ? 
                                                auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1) : 
                                                'User'
                                            }
                                        </p>
                                    </div>
                                </div>
                                
                                {/* User Menu Links */}
                                <div className="space-y-2">
                                    <Link
                                        href={route('dashboard')}
                                        onClick={closeMobileMenu}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        My Move
                                    </Link>
                                    <Link
                                        href="/profile/settings"
                                        onClick={closeMobileMenu}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Profile Settings
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        onClick={closeMobileMenu}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Sign Out
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Link
                                    href={route('login')}
                                    onClick={closeMobileMenu}
                                    className="block w-full text-center px-4 py-3 bg-[#17B7C7] text-white font-medium rounded-lg hover:bg-[#139AAA] transition-colors"
                                >
                                    LOGIN
                                </Link>
                                <Link
                                    href={route('register')}
                                    onClick={closeMobileMenu}
                                    className="block w-full text-center px-4 py-3 border-2 border-[#17B7C7] text-[#17B7C7] font-medium rounded-lg hover:bg-[#17B7C7] hover:text-white transition-colors"
                                >
                                    REGISTER
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
