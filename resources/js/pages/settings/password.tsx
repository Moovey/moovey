import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Header Section */}
                    <div className="border-b border-[#E0F7FA] pb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1A237E] to-[#3F51B5] rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[#1A237E]">Password Security</h2>
                                <p className="text-gray-600">Keep your account secure with a strong password</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] rounded-xl p-6 border-l-4 border-[#00BCD4]">
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-[#00BCD4] rounded-full flex items-center justify-center mt-1">
                                <span className="text-white text-sm">💡</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#1A237E] mb-2">Password Security Tips</h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
                                    <li>• Avoid common words, personal information, or sequential characters</li>
                                    <li>• Consider using a password manager for enhanced security</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={updatePassword} className="space-y-8">
                        {/* Form Fields */}
                        <div className="grid gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="current_password" className="text-gray-700 font-medium text-lg">Current Password</Label>
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    type="password"
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#1A237E] focus:ring-[#1A237E]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                    autoComplete="current-password"
                                    placeholder="Enter your current password"
                                />
                                <InputError message={errors.current_password} className="text-red-600" />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-gray-700 font-medium text-lg">New Password</Label>
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#1A237E] focus:ring-[#1A237E]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                    autoComplete="new-password"
                                    placeholder="Enter your new password"
                                />
                                <InputError message={errors.password} className="text-red-600" />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="password_confirmation" className="text-gray-700 font-medium text-lg">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type="password"
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#1A237E] focus:ring-[#1A237E]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                    autoComplete="new-password"
                                    placeholder="Confirm your new password"
                                />
                                <InputError message={errors.password_confirmation} className="text-red-600" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-6 pt-6 border-t border-[#E0F7FA]">
                            <Button 
                                disabled={processing}
                                className="bg-gradient-to-r from-[#1A237E] to-[#3F51B5] hover:from-[#303F9F] hover:to-[#1A237E] text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                {processing ? (
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
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0 transform translate-x-4"
                                enterTo="opacity-100 transform translate-x-0"
                                leave="transition ease-in-out duration-300"
                                leaveTo="opacity-0 transform translate-x-4"
                            >
                                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                    <span>✓</span>
                                    <span className="font-medium">Password updated successfully!</span>
                                </div>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
