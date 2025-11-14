import { useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { getAvatarUrl, getFallbackAvatarUrl } from '@/utils/fileUtils';

interface BusinessHeaderProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
}

export default function BusinessHeader({ 
  title = "Welcome back", 
  subtitle = "Your Business Overview",
  showAvatar = true 
}: BusinessHeaderProps) {
  // Get authenticated user from shared Inertia props
  const { auth } = usePage().props as any;
  
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setAvatarUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Refresh the page to show the new avatar
        window.location.reload();
      } else {
        toast.error(data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarInputClick = () => {
    avatarInputRef.current?.click();
  };

  return (
    <div className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] text-white rounded-xl p-8 mb-8 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {title} {auth?.user?.name && `${auth.user.name}!`}
          </h1>
          <p className="text-lg opacity-90">{subtitle}</p>
        </div>
        
        {/* Avatar Section */}
        {showAvatar && (
          <div className="relative">
            <div 
              className="w-20 h-20 rounded-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 cursor-pointer hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center overflow-hidden"
              onClick={handleAvatarInputClick}
            >
              {auth?.user?.avatar ? (
                <img 
                  src={getAvatarUrl(auth.user.avatar) || getFallbackAvatarUrl(auth?.user?.name || 'Business', 80)}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = getFallbackAvatarUrl(auth?.user?.name || 'Business', 80);
                  }}
                />
              ) : (
                <img 
                  src={getFallbackAvatarUrl(auth?.user?.name || 'Business', 80)}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      {showAvatar && (
        <input
          type="file"
          ref={avatarInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleAvatarUpload(file);
            }
          }}
          accept="image/*"
          className="hidden"
        />
      )}
    </div>
  );
}