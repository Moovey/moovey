import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

interface GlobalHeaderProps {
    currentPage?: string;
}

export default function GlobalHeader({ currentPage }: GlobalHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const isActive = (page: string) => currentPage === page;

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
                                className="h-10 w-auto"
                                onError={(e) => {
                                    // Fallback to text logo if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling) {
                                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                    }
                                }}
                            />
                            {/* Fallback text logo */}
                            <span className="text-2xl font-bold text-gray-900" style={{display: 'none'}}>Moovey</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link 
                            href="/" 
                            className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                                isActive('homepage') || isActive('home') || currentPage === 'welcome'
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            HOMEPAGE
                        </Link>
                        <Link 
                            href={route('academy')} 
                            className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                                isActive('academy')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            MOOVEY ACADEMY
                        </Link>
                        <Link 
                            href={route('tools')} 
                            className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                                isActive('tools')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            TOOLS
                        </Link>
                        <Link 
                            href={route('community')} 
                            className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                                isActive('community')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            COMMUNITY
                        </Link>
                        <Link 
                            href={route('trade-directory')} 
                            className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                                isActive('trade-directory') || isActive('trade_directory')
                                    ? 'bg-[#17B7C7] text-white' 
                                    : 'text-gray-700 hover:text-[#17B7C7]'
                            }`}
                        >
                            TRADE DIRECTORY
                        </Link>
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {auth.user ? (
                            <div className="flex items-center space-x-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] hover:from-[#00BCD4] hover:to-[#26C6DA] hover:text-white transition-all duration-300 border-2 border-transparent hover:border-[#00BCD4] hover:shadow-lg hover:shadow-[#00BCD4]/20 transform hover:scale-105">
                                            <Avatar className="h-9 w-9 ring-2 ring-white shadow-md">
                                                <AvatarImage 
                                                    src={auth.user.avatar ? `/storage/${auth.user.avatar}` : undefined} 
                                                    alt={auth.user.name} 
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-[#00BCD4] to-[#1A237E] text-white font-bold text-sm">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="text-left">
                                                <span className="block text-sm font-semibold text-gray-800 group-hover:text-white">
                                                    {auth.user.name}
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
                                    className="text-gray-700 hover:text-[#17B7C7] font-medium transition-colors duration-200"
                                >
                                    LOGIN
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-gray-700 hover:text-[#17B7C7] font-medium transition-colors duration-200"
                                >
                                    REGISTER
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
