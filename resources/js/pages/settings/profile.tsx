import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Header Section */}
                    <div className="border-b border-[#E0F7FA] pb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00BCD4] to-[#26C6DA] rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-[#1A237E]">Profile Information</h2>
                                <p className="text-gray-600">Update your personal details and contact information</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* User Role Display */}
                        <div className="bg-gradient-to-r from-[#E0F7FA] to-[#B2EBF2] rounded-xl p-6 border-l-4 border-[#00BCD4]">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-[#00BCD4] rounded-lg flex items-center justify-center">
                                    {auth.user.role === 'admin' && <span className="text-white">👑</span>}
                                    {auth.user.role === 'business' && <span className="text-white">🏢</span>}
                                    {auth.user.role === 'housemover' && <span className="text-white">🏠</span>}
                                </div>
                                <div>
                                    <div className="font-semibold text-[#1A237E]">Account Type</div>
                                    <div className="text-sm text-gray-600">
                                        {typeof auth.user.role === 'string' && auth.user.role ? 
                                            auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1) : 
                                            'User'} Account
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-gray-700 font-medium text-lg">
                                    {auth.user.role === 'business' ? 'Business Name' : 'Full Name'}
                                </Label>
                                <Input
                                    id="name"
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#00BCD4] focus:ring-[#00BCD4]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder={auth.user.role === 'business' ? 'Your business name' : 'Your full name'}
                                />
                                <InputError className="mt-2 text-red-600" message={errors.name} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-gray-700 font-medium text-lg">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="h-12 rounded-xl border-gray-200 focus:border-[#00BCD4] focus:ring-[#00BCD4]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="your.email@example.com"
                                />
                                <InputError className="mt-2 text-red-600" message={errors.email} />
                            </div>
                        </div>

                        {/* Email Verification Notice */}
                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">!</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-yellow-800 font-medium">Email Verification Required</p>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={route('verification.send')}
                                                method="post"
                                                as="button"
                                                className="text-yellow-800 underline font-medium hover:text-yellow-900 transition-colors duration-200"
                                            >
                                                Click here to resend the verification email.
                                            </Link>
                                        </p>
                                    </div>
                                </div>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                                        <div className="text-sm font-medium text-green-800">
                                            ✓ A new verification link has been sent to your email address.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-6 pt-6 border-t border-[#E0F7FA]">
                            <Button 
                                disabled={processing}
                                className="bg-gradient-to-r from-[#00BCD4] to-[#26C6DA] hover:from-[#00ACC1] hover:to-[#00BCD4] text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                {processing ? (
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
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0 transform translate-x-4"
                                enterTo="opacity-100 transform translate-x-0"
                                leave="transition ease-in-out duration-300"
                                leaveTo="opacity-0 transform translate-x-4"
                            >
                                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                    <span>✓</span>
                                    <span className="font-medium">Changes saved successfully!</span>
                                </div>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
