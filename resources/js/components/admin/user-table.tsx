import { memo, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

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

interface UserTableProps {
  users: User[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const UserTable = memo(({ users, sortBy, sortOrder, onSort }: UserTableProps) => {
  const [loadingActions, setLoadingActions] = useState<Set<number>>(new Set());

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'housemover': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getRoleIcon = useCallback((role: string, className: string = "w-4 h-4") => {
    const icons = {
      'admin': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'business': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      'housemover': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      'default': (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    };
    return icons[role as keyof typeof icons] || icons['default'];
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleAction = useCallback(async (userId: number, action: string) => {
    setLoadingActions(prev => new Set(prev).add(userId));
    
    try {
      switch (action) {
        case 'view':
          router.visit(`/user/${userId}`);
          break;
        case 'suspend':
          console.log('Suspend user:', userId);
          break;
      }
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, []);

  const renderSortButton = useCallback((field: string, label: string) => (
    <th 
      className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-[#00BCD4] transition-colors" 
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortBy === field && (
          <div className="text-[#00BCD4]">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sortOrder === 'asc' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </div>
        )}
      </div>
    </th>
  ), [sortBy, sortOrder, onSort]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <div className="text-white">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <span className="truncate">Users Overview</span>
        </h3>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {renderSortButton('name', 'User')}
              {renderSortButton('role', 'Role')}
              <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              {renderSortButton('created_at', 'Joined')}
              {renderSortButton('messages', 'Activity')}
              <th className="px-4 xl:px-6 py-3 xl:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const isLoading = loadingActions.has(user.id);
              
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 xl:h-12 xl:w-12">
                        <div className="h-10 w-10 xl:h-12 xl:w-12 rounded-full bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-white font-semibold text-base xl:text-lg">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 xl:ml-4 min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#1A237E] truncate">{user.name}</div>
                        <div className="text-sm text-gray-600 truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 xl:px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleColor(user.role)}`}>
                      <span className="mr-1">{getRoleIcon(user.role, "w-3 h-3")}</span>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.email_verified_at ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-[#00BCD4] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {user.sent_messages_count || 0}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-[#00BCD4] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {user.friends_count || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-1 xl:space-x-2">
                      <Button 
                        className="px-2 xl:px-3 py-1 text-xs bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white rounded hover:from-[#00ACC1] hover:to-[#00BCD4] disabled:opacity-50 transition-all"
                        onClick={() => handleAction(user.id, 'view')}
                        disabled={isLoading}
                      >
                        {isLoading ? '...' : 'View'}
                      </Button>
                      {user.role !== 'admin' && (
                        <Button 
                          className="px-2 xl:px-3 py-1 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-400 hover:to-red-500 disabled:opacity-50 transition-all"
                          onClick={() => {
                            if (confirm(`Are you sure you want to suspend ${user.name}?`)) {
                              handleAction(user.id, 'suspend');
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? '...' : 'Suspend'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {users.map((user) => {
          const isLoading = loadingActions.has(user.id);
          
          return (
            <div key={user.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-white font-semibold text-base sm:text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-semibold text-[#1A237E] truncate">{user.name}</p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleColor(user.role)}`}>
                      <span className="mr-1">{getRoleIcon(user.role, "w-3 h-3")}</span>
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="mt-2 sm:mt-3">
                    {user.email_verified_at ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                        Unverified
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Joined</p>
                      <p className="text-gray-900">{formatDate(user.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Activity</p>
                      <div className="text-gray-900 space-y-1">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-[#00BCD4] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {user.sent_messages_count || 0} messages
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-[#00BCD4] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {user.friends_count || 0} friends
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-col xs:flex-row gap-2">
                    <Button 
                      className="flex-1 xs:flex-none px-3 py-2 text-sm bg-gradient-to-r from-[#00BCD4] to-[#17B7C7] text-white rounded-lg hover:from-[#00ACC1] hover:to-[#00BCD4] disabled:opacity-50 transition-all"
                      onClick={() => handleAction(user.id, 'view')}
                      disabled={isLoading}
                    >
                      {isLoading ? '...' : 'View Profile'}
                    </Button>
                    {user.role !== 'admin' && (
                      <Button 
                        className="flex-1 xs:flex-none px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-400 hover:to-red-500 disabled:opacity-50 transition-all"
                        onClick={() => {
                          if (confirm(`Are you sure you want to suspend ${user.name}?`)) {
                            handleAction(user.id, 'suspend');
                          }
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? '...' : 'Suspend'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

UserTable.displayName = 'UserTable';

export default UserTable;