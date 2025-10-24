import { Head, useForm } from '@inertiajs/react';
import { useState, FormEventHandler, useRef } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import AdminHeader from '@/components/admin/admin-header';
import AdminNavigation from '@/components/admin/admin-navigation';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';

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

    return (
        <DashboardLayout>
            <Head title="Admin Settings - Account Settings" />
            
            {/* Admin Header */}
            <AdminHeader userName={auth.user.name} />

            {/* Navigation Tabs */}
            <AdminNavigation activeTab="settings" onTabChange={() => {}} />

            {/* Dashboard Content */}
            <div className="bg-[#F5F5F5] min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="border-b border-gray-200 pb-6 mb-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                                    <span className="text-white text-xl">👤</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-red-600">Admin Account Settings</h2>
                                    <p className="text-gray-600">Manage your administrator account details and security</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Sub Navigation */}
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
                            <button
                                onClick={() => setSettingsTab('profile')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                    settingsTab === 'profile'
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                👤 Profile Details
                            </button>
                            <button
                                onClick={() => setSettingsTab('password')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                    settingsTab === 'password'
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                🔒 Password Security
                            </button>
                        </div>

                        {/* Profile Settings */}
                        {settingsTab === 'profile' && (
                            <div className="space-y-8">
                                {/* Admin Role Display */}
                                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border-l-4 border-red-600">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white">👑</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-red-800">Administrator Account</div>
                                            <div className="text-sm text-red-700">Full system access and management privileges</div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={submitProfile} className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="admin_name" className="text-gray-700 font-medium text-lg">Administrator Name</Label>
                                            <Input
                                                id="admin_name"
                                                className="h-12 rounded-xl border-gray-200 focus:border-red-600 focus:ring-red-600/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData('name', e.target.value)}
                                                required
                                                placeholder="Your administrator name"
                                            />
                                            <InputError className="text-red-600" message={profileErrors.name} />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="admin_email" className="text-gray-700 font-medium text-lg">Email Address</Label>
                                            <Input
                                                id="admin_email"
                                                type="email"
                                                className="h-12 rounded-xl border-gray-200 focus:border-red-600 focus:ring-red-600/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData('email', e.target.value)}
                                                required
                                                placeholder="admin@moovey.com"
                                            />
                                            <InputError className="text-red-600" message={profileErrors.email} />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 pt-6 border-t border-gray-200">
                                        <Button
                                            disabled={profileProcessing}
                                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            {profileProcessing ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Saving...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <span>💾</span>
                                                    <span>Save Changes</span>
                                                </div>
                                            )}
                                        </Button>

                                        <Transition
                                            show={profileSuccess}
                                            enter="transition ease-in-out duration-300"
                                            enterFrom="opacity-0 transform translate-x-4"
                                            enterTo="opacity-100 transform translate-x-0"
                                            leave="transition ease-in-out duration-300"
                                            leaveTo="opacity-0 transform translate-x-4"
                                        >
                                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                                <span>✓</span>
                                                <span className="font-medium">Profile updated!</span>
                                            </div>
                                        </Transition>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Settings */}
                        {settingsTab === 'password' && (
                            <div className="space-y-8">
                                {/* Security Warning */}
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-l-4 border-yellow-500">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mt-1">
                                            <span className="text-white text-sm">⚠️</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-yellow-800 mb-2">Administrator Security</h3>
                                            <p className="text-sm text-yellow-700">
                                                As an administrator, use a strong, unique password. Consider using a password manager and enable two-factor authentication when available.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={updatePassword} className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="current_password_admin" className="text-gray-700 font-medium text-lg">Current Password</Label>
                                            <Input
                                                id="current_password_admin"
                                                ref={currentPasswordInput}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                type="password"
                                                className="h-12 rounded-xl border-gray-200 focus:border-red-600 focus:ring-red-600/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                                autoComplete="current-password"
                                                placeholder="Enter your current password"
                                            />
                                            <InputError message={passwordErrors.current_password} className="text-red-600" />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="password_admin" className="text-gray-700 font-medium text-lg">New Password</Label>
                                            <Input
                                                id="password_admin"
                                                ref={passwordInput}
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                type="password"
                                                className="h-12 rounded-xl border-gray-200 focus:border-red-600 focus:ring-red-600/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                                autoComplete="new-password"
                                                placeholder="Enter your new password"
                                            />
                                            <InputError message={passwordErrors.password} className="text-red-600" />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="password_confirmation_admin" className="text-gray-700 font-medium text-lg">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation_admin"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                type="password"
                                                className="h-12 rounded-xl border-gray-200 focus:border-red-600 focus:ring-red-600/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                                autoComplete="new-password"
                                                placeholder="Confirm your new password"
                                            />
                                            <InputError message={passwordErrors.password_confirmation} className="text-red-600" />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 pt-6 border-t border-gray-200">
                                        <Button
                                            disabled={passwordProcessing}
                                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            {passwordProcessing ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Updating...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <span>🔒</span>
                                                    <span>Update Password</span>
                                                </div>
                                            )}
                                        </Button>

                                        <Transition
                                            show={passwordSuccess}
                                            enter="transition ease-in-out duration-300"
                                            enterFrom="opacity-0 transform translate-x-4"
                                            enterTo="opacity-100 transform translate-x-0"
                                            leave="transition ease-in-out duration-300"
                                            leaveTo="opacity-0 transform translate-x-4"
                                        >
                                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                                <span>✓</span>
                                                <span className="font-medium">Password updated!</span>
                                            </div>
                                        </Transition>
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