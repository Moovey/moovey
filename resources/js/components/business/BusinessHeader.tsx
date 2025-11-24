import { useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { getAvatarUrl, getFallbackAvatarUrl } from '@/utils/fileUtils';

// Professional SVG icons for Business Header
const getBusinessHeaderIcon = (name: string, className: string = "w-6 h-6") => {
    const icons: Record<string, React.JSX.Element> = {
        upload: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
        ),
        camera: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        edit: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        plus: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        user: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        business: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    };
    
    return icons[name] || icons.user;
};

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
    <div className="bg-gradient-to-r from-[#1A237E] via-[#17B7C7] to-[#00BCD4] text-white rounded-xl p-8 mb-8 shadow-lg relative overflow-hidden">
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
              className="w-20 h-20 rounded-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 cursor-pointer hover:bg-opacity-30 hover:border-opacity-50 transition-all duration-200 flex items-center justify-center overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={handleAvatarInputClick}
              title="Click to upload new avatar"
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
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#17B7C7] rounded-full border-2 border-white flex items-center justify-center hover:bg-[#00BCD4] transition-colors duration-200 shadow-sm">
              {getBusinessHeaderIcon('camera', 'w-3 h-3 text-white')}
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