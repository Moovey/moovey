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

  const getRoleIcon = useCallback((role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'business': return '🏢';
      case 'housemover': return '🏠';
      default: return '👤';
    }
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
        case 'edit':
          console.log('Edit user:', userId);
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
      className="text-left py-4 px-4 font-semibold text-gray-700 cursor-pointer hover:text-red-600 transition-colors" 
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortBy === field && (
          <span className="text-red-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  ), [sortBy, sortOrder, onSort]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200">
            {renderSortButton('name', 'User')}
            {renderSortButton('role', 'Role')}
            <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
            {renderSortButton('created_at', 'Joined')}
            {renderSortButton('messages', 'Activity')}
            <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isLoading = loadingActions.has(user.id);
            
            return (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    <span className="mr-1">{getRoleIcon(user.role)}</span>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
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
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">
                    <div>💬 {user.sent_messages_count || 0} messages</div>
                    <div>👥 {user.friends_count || 0} friends</div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Button 
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      onClick={() => handleAction(user.id, 'view')}
                      disabled={isLoading}
                    >
                      {isLoading ? '...' : 'View'}
                    </Button>
                    <Button 
                      className="px-3 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                      onClick={() => handleAction(user.id, 'edit')}
                      disabled={isLoading}
                    >
                      {isLoading ? '...' : 'Edit'}
                    </Button>
                    {user.role !== 'admin' && (
                      <Button 
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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
  );
});

UserTable.displayName = 'UserTable';

export default UserTable;