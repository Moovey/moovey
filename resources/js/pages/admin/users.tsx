import { Head } from '@inertiajs/react';
import { useState, useMemo, useCallback, useEffect, Suspense, lazy } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';
import { Button } from '@/components/ui/button';
import { useDebounce, useDebounceCallback } from '@/hooks/useDebounce';
import axios from 'axios';

// Lazy load components for better initial load performance
const UserStats = lazy(() => import('@/components/admin/user-stats'));
const UserTable = lazy(() => import('@/components/admin/user-table'));
const Pagination = lazy(() => import('@/components/admin/pagination'));

// Loading skeleton components
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-lg mr-3"></div>
          <div>
            <div className="h-6 w-12 bg-gray-300 rounded mb-1"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg p-8">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-6 bg-gray-300 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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

interface AdminUsersProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
  users: User[];
  stats: Stats;
  initialFilters: InitialFilters;
}

export default function AdminUsers({ auth, users: initialUsers, stats, initialFilters }: AdminUsersProps) {
    // State management with initial values from server
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loading, setLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>(initialFilters.role);
    const [searchQuery, setSearchQuery] = useState<string>(initialFilters.search);
    const [sortBy, setSortBy] = useState<string>(initialFilters.sort);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialFilters.order as 'asc' | 'desc');
    const [currentPage, setCurrentPage] = useState<number>(initialFilters.page);
    const usersPerPage = 10;

    // Debounced search to avoid excessive API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    // Client-side filtering and sorting for better performance
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users;
        
        // Filter by role
        if (roleFilter !== 'All Users') {
            filtered = filtered.filter(user => user.role === roleFilter.toLowerCase());
        }
        
        // Filter by search query
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query)
            );
        }
        
        // Sort users
        const sorted = [...filtered].sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'role':
                    aValue = a.role;
                    bValue = b.role;
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'messages':
                    aValue = a.sent_messages_count || 0;
                    bValue = b.sent_messages_count || 0;
                    break;
                default:
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
            }
            
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
        
        return sorted;
    }, [users, roleFilter, debouncedSearchQuery, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [roleFilter, debouncedSearchQuery, sortBy, sortOrder]);

    // Debounced API call for partial data reload
    const debouncedApiCall = useDebounceCallback(async (params: any) => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/api/users', { params });
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, 500);

    // Refresh data when filters change significantly
    useEffect(() => {
        if (debouncedSearchQuery !== initialFilters.search || 
            roleFilter !== initialFilters.role ||
            sortBy !== initialFilters.sort ||
            sortOrder !== initialFilters.order) {
            
            debouncedApiCall({
                search: debouncedSearchQuery,
                role: roleFilter,
                sort: sortBy,
                order: sortOrder
            });
        }
    }, [debouncedSearchQuery, roleFilter, sortBy, sortOrder]);

    // Memoized handlers for better performance
    const handleSort = useCallback((field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    }, [sortBy]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Smooth scroll to top of table
        document.querySelector('.user-management')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, []);

    const handleExport = useCallback(() => {
        // Placeholder for export functionality
        console.log('Exporting user data...');
    }, []);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setRoleFilter('All Users');
        setSortBy('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
    }, []);

    return (
        <DashboardLayout>
            <Head title="Admin Users - User Management" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="users" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-[#F5F5F5] min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Overview with Suspense */}
                    <Suspense fallback={<StatsSkeleton />}>
                        <UserStats stats={stats} />
                    </Suspense>

                    {/* User Management */}
                    <div className="bg-white rounded-xl shadow-lg p-8 user-management">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-red-600 flex items-center">
                                    <span className="text-3xl mr-3">👥</span>
                                    User Management
                                    {loading && (
                                        <div className="ml-3 w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {filteredAndSortedUsers.length} of {users.length} users
                                    {(roleFilter !== 'All Users' || debouncedSearchQuery.trim()) && (
                                        <span className="text-blue-600"> • Page {currentPage} of {totalPages}</span>
                                    )}
                                </p>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                {/* Search */}
                                <div className="relative flex-1 max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, email, or role..."
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                
                                {/* Role Filter */}
                                <select 
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                                >
                                    <option value="All Users">All Users</option>
                                    <option value="admin">Admins</option>
                                    <option value="housemover">Housemovers</option>
                                    <option value="business">Businesses</option>
                                </select>
                                
                                {/* Sort */}
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                                >
                                    <option value="created_at">Sort by Registration</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="email">Sort by Email</option>
                                    <option value="role">Sort by Role</option>
                                    <option value="messages">Sort by Activity</option>
                                </select>
                                
                                {/* Export Button */}
                                <Button 
                                    onClick={handleExport}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap"
                                >
                                    📊 Export Data
                                </Button>
                            </div>
                        </div>

                        {/* Users Table with Suspense */}
                        <Suspense fallback={<TableSkeleton />}>
                            <UserTable 
                                users={paginatedUsers}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSort={handleSort}
                            />
                        </Suspense>

                        {/* Pagination with Suspense */}
                        {totalPages > 1 && (
                            <Suspense fallback={<div className="h-16 bg-gray-50 rounded-lg animate-pulse mt-8"></div>}>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={filteredAndSortedUsers.length}
                                    itemsPerPage={usersPerPage}
                                    onPageChange={handlePageChange}
                                />
                            </Suspense>
                        )}

                        {/* Empty State */}
                        {paginatedUsers.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">👥</div>
                                <h3 className="text-xl font-semibold mb-2">No users found</h3>
                                <p className="mb-4">
                                    {debouncedSearchQuery ? `No users match "${debouncedSearchQuery}"` : `No ${roleFilter.toLowerCase()} users found`}
                                </p>
                                <Button
                                    onClick={clearFilters}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}