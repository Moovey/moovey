import { Head, useForm } from '@inertiajs/react';
import { useState, FormEventHandler, useRef } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';

// Professional SVG icons for Admin Settings
const getSettingsIcon = (name: string, className: string = "w-6 h-6") => {
    const icons: Record<string, React.JSX.Element> = {
        user: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        crown: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l4 6l3-3 3 3 4-6v13a2 2 0 01-2 2H7a2 2 0 01-2-2V3z" />
            </svg>
        ),
        lock: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        save: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3-3-3m3-3v12" />
            </svg>
        ),
        check: (
            <svg className={className} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        warning: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        ),
        settings: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    };
    
    return icons[name] || icons.settings;
};

interface AdminSettingsProps {
  auth: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
}

export default function AdminSettings({ auth }: AdminSettingsProps) {
    const [settingsTab, setSettingsTab] = useState<'profile' | 'password'>('profile');
    
    // Profile form
    const { data: profileData, setData: setProfileData, patch: patchProfile, errors: profileErrors, processing: profileProcessing, recentlySuccessful: profileSuccess } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    // Password form
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { data: passwordData, setData: setPasswordData, errors: passwordErrors, put: putPassword, reset: resetPassword, processing: passwordProcessing, recentlySuccessful: passwordSuccess } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            },
            onError: (errors) => {
                toast.error('Failed to update profile. Please check your information and try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                console.log('Profile update errors:', errors);
            },
        });
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();
        putPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
                toast.success('Password updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            },
            onError: (errors) => {
                toast.error('Failed to update password. Please check your current password and try again.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
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

    return (
        <DashboardLayout>
            <Head title="Admin Settings - Account Settings" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="settings" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-gradient-to-br from-white via-gray-50/30 to-[#17B7C7]/5 min-h-screen py-4 sm:py-6 md:py-8">
                <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 space-y-4 sm:space-y-6">
                    
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
                        <div className="border-b border-gray-200 pb-4 sm:pb-6 mb-6 sm:mb-8">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                    {getSettingsIcon('settings', 'w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white')}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#1A237E] leading-tight">Admin Account Settings</h2>
                                    <p className="text-gray-600 text-sm sm:text-base mt-1">Manage your administrator account details and security</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Sub Navigation */}
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 rounded-lg p-1 mb-6 sm:mb-8 w-full sm:w-fit">
                            <button
                                onClick={() => setSettingsTab('profile')}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base ${
                                    settingsTab === 'profile'
                                        ? 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {getSettingsIcon('user', 'w-4 h-4 sm:w-5 sm:h-5')}
                                <span>Profile Details</span>
                            </button>
                            <button
                                onClick={() => setSettingsTab('password')}
                                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base ${
                                    settingsTab === 'password'
                                        ? 'bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {getSettingsIcon('lock', 'w-4 h-4 sm:w-5 sm:h-5')}
                                <span>Password Security</span>
                            </button>
                        </div>

                        {/* Profile Settings */}
                        {settingsTab === 'profile' && (
                            <div className="space-y-8">
                                {/* Admin Role Display */}
                                <div className="bg-gradient-to-r from-[#17B7C7]/10 to-[#00BCD4]/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-[#17B7C7]">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#17B7C7] to-[#00BCD4] rounded-lg flex items-center justify-center flex-shrink-0">
                                            {getSettingsIcon('crown', 'w-5 h-5 sm:w-6 sm:h-6 text-white')}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-[#1A237E] text-sm sm:text-base">Administrator Account</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Full system access and management privileges</div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={submitProfile} className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-2 sm:space-y-3">
                                            <Label htmlFor="admin_name" className="text-[#1A237E] font-medium text-sm sm:text-base md:text-lg">Administrator Name</Label>
                                            <Input
                                                id="admin_name"
                                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#17B7C7] focus:ring-[#17B7C7]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400 text-sm sm:text-base"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData('name', e.target.value)}
                                                required
                                                placeholder="Your administrator name"
                                            />
                                            <InputError className="text-red-600" message={profileErrors.name} />
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            <Label htmlFor="admin_email" className="text-[#1A237E] font-medium text-sm sm:text-base md:text-lg">Email Address</Label>
                                            <Input
                                                id="admin_email"
                                                type="email"
                                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#17B7C7] focus:ring-[#17B7C7]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400 text-sm sm:text-base"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData('email', e.target.value)}
                                                required
                                                placeholder="admin@moovey.com"
                                            />
                                            <InputError className="text-red-600" message={profileErrors.email} />
                                        </div>
                                    </div>

                                    <div className="flex justify-start pt-4 sm:pt-6 border-t border-gray-200">
                                        <Button
                                            disabled={profileProcessing}
                                            className="w-full sm:w-auto bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] hover:from-[#139AAA] hover:to-[#0097A7] text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                                        >
                                            {profileProcessing ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Saving...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    {getSettingsIcon('save', 'w-4 h-4 sm:w-5 sm:h-5')}
                                                    <span>Save Changes</span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Settings */}
                        {settingsTab === 'password' && (
                            <div className="space-y-8">
                                {/* Security Warning */}
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-yellow-500">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                                            {getSettingsIcon('warning', 'w-4 h-4 sm:w-5 sm:h-5 text-white')}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">Administrator Security</h3>
                                            <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">
                                                As an administrator, use a strong, unique password. Consider using a password manager and enable two-factor authentication when available.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={updatePassword} className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-2 sm:space-y-3">
                                            <Label htmlFor="current_password_admin" className="text-[#1A237E] font-medium text-sm sm:text-base md:text-lg">Current Password</Label>
                                            <Input
                                                id="current_password_admin"
                                                ref={currentPasswordInput}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                type="password"
                                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#17B7C7] focus:ring-[#17B7C7]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400 text-sm sm:text-base"
                                                autoComplete="current-password"
                                                placeholder="Enter your current password"
                                            />
                                            <InputError message={passwordErrors.current_password} className="text-red-600" />
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            <Label htmlFor="password_admin" className="text-[#1A237E] font-medium text-sm sm:text-base md:text-lg">New Password</Label>
                                            <Input
                                                id="password_admin"
                                                ref={passwordInput}
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                type="password"
                                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#17B7C7] focus:ring-[#17B7C7]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400 text-sm sm:text-base"
                                                autoComplete="new-password"
                                                placeholder="Enter your new password"
                                            />
                                            <InputError message={passwordErrors.password} className="text-red-600" />
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                            <Label htmlFor="password_confirmation_admin" className="text-[#1A237E] font-medium text-sm sm:text-base md:text-lg">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation_admin"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                type="password"
                                                className="h-10 sm:h-12 rounded-lg sm:rounded-xl border-gray-200 focus:border-[#17B7C7] focus:ring-[#17B7C7]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400 text-sm sm:text-base"
                                                autoComplete="new-password"
                                                placeholder="Confirm your new password"
                                            />
                                            <InputError message={passwordErrors.password_confirmation} className="text-red-600" />
                                        </div>
                                    </div>

                                    <div className="flex justify-start pt-4 sm:pt-6 border-t border-gray-200">
                                        <Button
                                            disabled={passwordProcessing}
                                            className="w-full sm:w-auto bg-gradient-to-r from-[#17B7C7] to-[#00BCD4] hover:from-[#139AAA] hover:to-[#0097A7] text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                                        >
                                            {passwordProcessing ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Updating...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    {getSettingsIcon('lock', 'w-4 h-4 sm:w-5 sm:h-5')}
                                                    <span>Update Password</span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}