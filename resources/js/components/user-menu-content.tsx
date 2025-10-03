import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, LayoutDashboard, Crown, Building, Home } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.post(route('logout'), {}, {
            onSuccess: () => {
                // Redirect to home page after logout
                window.location.href = route('home');
            }
        });
    };

    // Get role-specific dashboard route
    const getDashboardRoute = () => {
        switch (user.role) {
            case 'admin':
                return route('admin.dashboard');
            case 'business':
                return route('business.dashboard');
            default:
                return route('dashboard');
        }
    };

    // Get role icon
    const getRoleIcon = () => {
        switch (user.role) {
            case 'admin':
                return Crown;
            case 'business':
                return Building;
            default:
                return Home;
        }
    };

    const RoleIcon = getRoleIcon();

    return (
        <>
            {/* User Info Header */}
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] rounded-lg p-4 text-white mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img
                                    src={`/storage/${user.avatar}`}
                                    alt={`${user.name}'s avatar`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to role icon if avatar fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const icon = document.createElement('div');
                                            icon.innerHTML = `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
                                            parent.appendChild(icon);
                                        }
                                    }}
                                />
                            ) : (
                                <RoleIcon className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="font-semibold text-sm">{user.name}</div>
                            <div className="text-xs opacity-90">{user.email}</div>
                            <div className="text-xs mt-1 px-2 py-1 bg-white/20 rounded-full inline-block">
                                {typeof user.role === 'string' && user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                            </div>
                        </div>
                    </div>
                </div>
            </DropdownMenuLabel>
            
            {/* Menu Items */}
            <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem asChild>
                    <Link 
                        className="flex items-center w-full p-3 rounded-lg hover:bg-[#E0F7FA] hover:text-[#00BCD4] transition-all duration-200 group" 
                        href={getDashboardRoute()} 
                        as="button" 
                        prefetch 
                        onClick={cleanup}
                    >
                        <div className="w-8 h-8 bg-[#F5F5F5] group-hover:bg-[#00BCD4] rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                            <LayoutDashboard className="h-4 w-4 text-gray-600 group-hover:text-white" />
                        </div>
                        <div>
                            <div className="font-medium text-sm">My Move</div>
                            <div className="text-xs text-gray-500 group-hover:text-[#00BCD4]/70">
                                {user.role === 'admin' ? 'System Overview' : 
                                 user.role === 'business' ? 'Manage Business' : 
                                 'Move Planning'}
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link 
                        className="flex items-center w-full p-3 rounded-lg hover:bg-[#E0F7FA] hover:text-[#00BCD4] transition-all duration-200 group" 
                        href="/saved-results" 
                        as="button" 
                        prefetch 
                        onClick={cleanup}
                    >
                        <div className="w-8 h-8 bg-[#F5F5F5] group-hover:bg-[#00BCD4] rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                            <svg className="h-4 w-4 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-sm">Saved Results</div>
                            <div className="text-xs text-gray-500 group-hover:text-[#00BCD4]/70">
                                View saved calculations
                            </div>
                        </div>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="my-3 bg-[#E0F7FA]" />
            
            {/* Logout Button */}
            <DropdownMenuItem asChild>
                <button 
                    className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 group" 
                    onClick={handleLogout}
                >
                    <div className="w-8 h-8 bg-[#F5F5F5] group-hover:bg-red-500 rounded-lg flex items-center justify-center mr-3 transition-colors duration-200">
                        <LogOut className="h-4 w-4 text-gray-600 group-hover:text-white" />
                    </div>
                    <div>
                        <div className="font-medium text-sm">Log out</div>
                        <div className="text-xs text-gray-500 group-hover:text-red-500/70">Sign out safely</div>
                    </div>
                </button>
            </DropdownMenuItem>
        </>
    );
}
