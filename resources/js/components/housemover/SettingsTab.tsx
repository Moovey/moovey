import { FormEventHandler, useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import { toast } from 'react-toastify';
import { getAvatarUrl, getFallbackAvatarUrl } from '@/utils/fileUtils';

interface SettingsTabProps {
    auth: {
        user: {
            name: string;
            email: string;
            avatar?: string;
        };
    };
}

export default function SettingsTab({ auth }: SettingsTabProps) {
    // Profile form
    const { 
        data: profileData, 
        setData: setProfileData, 
        patch: patchProfile, 
        errors: profileErrors, 
        processing: processingProfile, 
        recentlySuccessful: recentlySuccessfulProfile 
    } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    // Password form
    const { 
        data: passwordData, 
        setData: setPasswordData, 
        put: putPassword, 
        errors: passwordErrors, 
        processing: processingPassword, 
        recentlySuccessful: recentlySuccessfulPassword, 
        reset: resetPassword 
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    
    const [avatarUploading, setAvatarUploading] = useState(false);

    const updateProfile: FormEventHandler = (e) => {
        e.preventDefault();

        patchProfile(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Stay on the current page after successful update
            },
            onError: (errors) => {
                console.log('Profile update errors:', errors);
            },
        });
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        putPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
            onError: (errors) => {
                if (errors.password) {
                    resetPassword('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    resetPassword('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

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

    const handleAvatarDelete = async () => {
        if (!auth?.user?.avatar) return;

        if (!confirm('Are you sure you want to remove your profile picture?')) return;

        setAvatarUploading(true);

        try {
            const response = await fetch('/api/avatar', {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                // Refresh the page to show the removed avatar
                window.location.reload();
            } else {
                toast.error(data.message || 'Failed to remove avatar');
            }
        } catch (error) {
            console.error('Avatar delete error:', error);
            toast.error('Failed to remove avatar');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleAvatarInputClick = () => {
        avatarInputRef.current?.click();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#1A237E] mb-6 flex items-center">
                    <span className="text-3xl mr-3">👤</span>
                    Account Details
                </h2>
                
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4 mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                            {auth?.user?.avatar ? (
                                <img
                                    src={getAvatarUrl(auth.user.avatar) || getFallbackAvatarUrl(auth?.user?.name || 'User', 128)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'User')}&background=1A237E&color=white&size=96`;
                                    }}
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'User')}&background=1A237E&color=white&size=96`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        {avatarUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex space-x-3">
                        <Button
                            type="button"
                            onClick={handleAvatarInputClick}
                            disabled={avatarUploading}
                            className="bg-[#1A237E] hover:bg-[#303F9F] text-white px-4 py-2 text-sm"
                        >
                            {avatarUploading ? 'Uploading...' : 'Upload Photo'}
                        </Button>
                        
                        {auth?.user?.avatar && (
                            <Button
                                type="button"
                                onClick={handleAvatarDelete}
                                disabled={avatarUploading}
                                variant="destructive"
                                className="px-4 py-2 text-sm"
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">
                        Upload a photo up to 2MB. JPG, PNG, or GIF files are supported.
                    </p>
                    
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
                </div>
                
                <form onSubmit={updateProfile} className="space-y-6">
                    <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            className="mt-2 w-full bg-white text-gray-900 border-gray-300 focus:border-[#00BCD4] focus:ring-[#00BCD4]/20"
                            value={profileData.name}
                            onChange={(e) => setProfileData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={profileErrors.name} />
                    </div>

                    <div>
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            className="mt-2 w-full bg-white text-gray-900 border-gray-300 focus:border-[#00BCD4] focus:ring-[#00BCD4]/20"
                            value={profileData.email}
                            onChange={(e) => setProfileData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={profileErrors.email} />
                    </div>

                    <div className="flex items-center justify-between">
                        <Button 
                            disabled={processingProfile}
                            className="bg-[#1A237E] hover:bg-[#303F9F] text-white px-6 py-2"
                        >
                            {processingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>

                        <Transition
                            show={recentlySuccessfulProfile}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600">Saved.</p>
                        </Transition>
                    </div>
                </form>
            </div>

            {/* Password Update */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#1A237E] mb-6 flex items-center">
                    <span className="text-3xl mr-3">🔒</span>
                    Update Password
                </h2>

                <form onSubmit={updatePassword} className="space-y-6">
                    <div>
                        <Label htmlFor="current_password" className="text-gray-700 font-medium">Current Password</Label>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            type="password"
                            className="mt-2 w-full bg-white text-gray-900 border-gray-300 focus:border-[#00BCD4] focus:ring-[#00BCD4]/20"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                            autoComplete="current-password"
                        />
                        <InputError message={passwordErrors.current_password} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="password" className="text-gray-700 font-medium">New Password</Label>
                        <Input
                            id="password"
                            ref={passwordInput}
                            type="password"
                            className="mt-2 w-full bg-white text-gray-900 border-gray-300 focus:border-[#00BCD4] focus:ring-[#00BCD4]/20"
                            value={passwordData.password}
                            onChange={(e) => setPasswordData('password', e.target.value)}
                            autoComplete="new-password"
                        />
                        <InputError message={passwordErrors.password} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" className="text-gray-700 font-medium">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            className="mt-2 w-full bg-white text-gray-900 border-gray-300 focus:border-[#00BCD4] focus:ring-[#00BCD4]/20"
                            value={passwordData.password_confirmation}
                            onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                        <InputError message={passwordErrors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <Button 
                            disabled={processingPassword}
                            className="bg-[#1A237E] hover:bg-[#303F9F] text-white px-6 py-2"
                        >
                            {processingPassword ? 'Updating...' : 'Update Password'}
                        </Button>

                        <Transition
                            show={recentlySuccessfulPassword}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-green-600">Saved.</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </div>
    );
}