import { useMemo, useCallback, memo } from 'react';
import { router } from '@inertiajs/react';
import UserStats from './user-stats';
import UserTable from './user-table';
import Pagination from './pagination';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'housemover' | 'business';
    avatar?: string;
    avatar_url?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    sent_messages_count?: number;
    friends_count?: number;
    completed_lessons_count?: number;
    profile?: {
        id: number;
        post_count: number;
        friend_count: number;
    };
}

interface Stats {
    total_users: number;
    admins: number;
    housemovers: number;
    businesses: number;
    verified_users: number;
    recent_registrations: number;
}

interface InitialFilters {
    search: string;
    role: string;
    sort: string;
    order: string;
    page: number;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    prev_page_url?: string;
    next_page_url?: string;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface OptimizedUserManagerProps {
    users: PaginatedUsers;
    stats?: Stats;
    initialFilters: InitialFilters;
}

// Professional SVG icon mapping function
const getAdminIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconProps = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        strokeWidth: 2
    };

    const iconMap: Record<string, React.ReactElement> = {
        'users-management': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
        'search': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
        ),
        'close': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        'export': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
        ),
        'empty-state': (
            <svg {...iconProps}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        )
    };
    return iconMap[iconName] || null;
};



const OptimizedUserManager = memo(({ users: paginatedUsers, stats, initialFilters }: OptimizedUserManagerProps) => {
    // Extract data from paginated response
    const users = paginatedUsers.data;
    const pagination = {
        current_page: paginatedUsers.current_page,
        last_page: paginatedUsers.last_page,
        per_page: paginatedUsers.per_page,
        total: paginatedUsers.total,
        from: paginatedUsers.from,
        to: paginatedUsers.to
    };

    // Users are already filtered and sorted on the server
    const displayUsers = users;



    // Handlers using Inertia router
    const handleSort = useCallback((field: string) => {
        const currentSort = initialFilters.sort;
        const currentOrder = initialFilters.order;
        
        const newOrder = currentSort === field && currentOrder === 'desc' ? 'asc' : 'desc';
        
        router.get('/admin/users', {
            search: initialFilters.search,
            role: initialFilters.role,
            sort: field,
            order: newOrder,
            page: 1 // Reset to first page when sorting
        }, {
            preserveState: true,
            preserveScroll: true
        });
    }, [initialFilters]);

    const handlePageChange = useCallback((page: number) => {
        router.get('/admin/users', {
            search: initialFilters.search,
            role: initialFilters.role,
            sort: initialFilters.sort,
            order: initialFilters.order,
            page: page
        }, {
            preserveState: true,
            preserveScroll: true
        });
    }, [initialFilters]);

    const handleSearch = useCallback((searchValue: string) => {
        router.get('/admin/users', {
            search: searchValue,
            role: initialFilters.role,
            sort: initialFilters.sort,
            order: initialFilters.order,
            page: 1 // Reset to first page when searching
        }, {
            preserveState: true,
            preserveScroll: true
        });
    }, [initialFilters]);

    const handleRoleFilter = useCallback((role: string) => {
        router.get('/admin/users', {
            search: initialFilters.search,
            role: role,
            sort: initialFilters.sort,
            order: initialFilters.order,
            page: 1 // Reset to first page when filtering
        }, {
            preserveState: true,
            preserveScroll: true
        });
    }, [initialFilters]);

    const handleExport = useCallback(() => {
        // Placeholder for export functionality
        console.log('Exporting user data...');
    }, []);

    const clearFilters = useCallback(() => {
        router.get('/admin/users', {
            search: '',
            role: 'All Users',
            sort: 'created_at',
            order: 'desc',
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true
        });
    }, []);

    return (
        <div>
            {/* Stats Overview */}
            {stats && <UserStats stats={stats} />}

            {/* User Management */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 user-management">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 sm:mb-6 gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1A237E] flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-xl flex items-center justify-center mr-2 sm:mr-3 shadow-md flex-shrink-0">
                                {getAdminIcon('users-management', "w-4 h-4 sm:w-5 sm:h-5 text-white")}
                            </div>
                            <span className="truncate">User Management</span>
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 ml-10 sm:ml-13">
                            <span className="font-semibold text-[#1A237E]">{pagination.from || 0}-{pagination.to || 0}</span> of <span className="font-semibold">{pagination.total}</span> users
                            <span className="text-[#00BCD4] font-medium block sm:inline"> • Page {pagination.current_page} of {pagination.last_page}</span>
                        </p>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center w-full xl:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 lg:flex-none lg:w-64 xl:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <div className="text-gray-400">
                                    {getAdminIcon('search', "w-4 h-4 sm:w-5 sm:h-5")}
                                </div>
                            </div>
                            <input
                                type="text"
                                defaultValue={initialFilters.search}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Debounce the search by using a timeout
                                    clearTimeout((window as any).searchTimeout);
                                    (window as any).searchTimeout = setTimeout(() => {
                                        handleSearch(value);
                                    }, 300);
                                }}
                                placeholder="Search users..."
                                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/20 focus:outline-none transition-all shadow-sm hover:shadow-md"
                            />
                            {initialFilters.search && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#00BCD4] transition-colors duration-200"
                                >
                                    <div>{getAdminIcon('close', "w-4 h-4 sm:w-5 sm:h-5")}</div>
                                </button>
                            )}
                        </div>
                        
                        {/* Filter and Sort Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 lg:gap-2">
                            {/* Role Filter */}
                            <select 
                                value={initialFilters.role}
                                onChange={(e) => handleRoleFilter(e.target.value)}
                                className="px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/20 focus:outline-none shadow-sm hover:shadow-md transition-all font-medium min-w-0 flex-1 sm:flex-none sm:w-32 lg:w-36"
                            >
                                <option value="All Users">All Users</option>
                                <option value="admin">Admins</option>
                                <option value="housemover">Housemovers</option>
                                <option value="business">Businesses</option>
                            </select>
                            
                            {/* Sort */}
                            <select 
                                value={initialFilters.sort}
                                onChange={(e) => handleSort(e.target.value)}
                                className="px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#00BCD4] focus:ring-2 focus:ring-[#00BCD4]/20 focus:outline-none shadow-sm hover:shadow-md transition-all font-medium min-w-0 flex-1 sm:flex-none sm:w-40 lg:w-44"
                            >
                                <option value="created_at">By Registration</option>
                                <option value="name">By Name</option>
                                <option value="email">By Email</option>
                                <option value="role">By Role</option>
                                <option value="messages">By Activity</option>
                            </select>
                        </div>
                        
                        {/* Export Button */}
                        <button 
                            onClick={handleExport}
                            className="bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:from-[#00ACC1] hover:to-[#00BCD4] transition-all whitespace-nowrap shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 min-w-0"
                        >
                            <div>{getAdminIcon('export', "w-4 h-4")}</div>
                            <span className="hidden sm:inline">Export Data</span>
                            <span className="sm:hidden">Export</span>
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <UserTable 
                    users={displayUsers}
                    sortBy={initialFilters.sort}
                    sortOrder={initialFilters.order as 'asc' | 'desc'}
                    onSort={handleSort}
                />

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <Pagination
                        currentPage={pagination.current_page}
                        totalPages={pagination.last_page}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.per_page}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Empty State */}
                {displayUsers.length === 0 && (
                    <div className="text-center py-12 sm:py-16 text-gray-500 px-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <div className="text-gray-400">
                                {getAdminIcon('empty-state', "w-10 h-10 sm:w-12 sm:h-12")}
                            </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#1A237E]">No users found</h3>
                        <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                            {initialFilters.search ? `No users match "${initialFilters.search}"` : `No ${initialFilters.role.toLowerCase()} users found`}
                        </p>
                        <button
                            onClick={clearFilters}
                            className="bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-[#00ACC1] hover:to-[#00BCD4] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

OptimizedUserManager.displayName = 'OptimizedUserManager';

export default OptimizedUserManager;