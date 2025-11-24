import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef, FormEventHandler, useState, useMemo } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import BusinessNavTabs from '@/components/business/BusinessNavTabs';
import BusinessHeader from '@/components/business/BusinessHeader';
import { toast } from 'react-toastify';
import { getAvatarUrl, getFallbackAvatarUrl } from '@/utils/fileUtils';

// Professional SVG icons for Business Settings
const getBusinessSettingsIcon = (name: string, className: string = "w-6 h-6") => {
    const icons: Record<string, React.JSX.Element> = {
        eye: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ),
        eyeOff: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
        ),
        creditCard: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        document: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        chevronDown: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        ),
        settings: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        shield: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        bell: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
        mail: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        phone: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        user: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        building: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        clock: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        download: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
        ),
        lockClosed: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        trash: (
            <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        )
    };
    
    return icons[name] || icons.settings;
};

interface SecuritySettings {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface BillingInfo {
    currentPlan: {
        name: string;
        price: string;
        billing: string;
        status: string;
    };
    paymentMethods: Array<{
        id: string;
        type: string;
        last4: string;
        expiryDate: string;
        isDefault: boolean;
    }>;
    billingHistory: Array<{
        id: string;
        date: string;
        amount: string;
        status: string;
        invoiceUrl: string;
    }>;
}

interface NotificationPreferences {
    emailNotifications: boolean;
    smsReminders: boolean;
    marketingEmails: boolean;
    systemNotifications: boolean;
    newBookingNotifications: boolean;
    businessUpdates: boolean;
    weeklyReports: boolean;
}

export default function BusinessSettings() {
    // Get authenticated user from shared Inertia props
    const { auth } = usePage().props as any;

    const emailVerified = useMemo(() => Boolean(auth?.user?.email_verified_at), [auth]);

    // Profile form (company name and email) wired to Laravel settings routes
    const {
        data: profileData,
        setData: setProfileData,
        patch: patchProfile,
        errors: profileErrors,
        processing: profileProcessing,
        recentlySuccessful: profileSaved,
        reset: resetProfile,
    } = useForm({
        name: auth?.user?.name ?? '',
        email: auth?.user?.email ?? '',
    });

    // Business-specific fields (not yet supported by backend; keep local only for now)
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        paymentMethods: false,
        billingHistory: false,
        emailPreferences: false
    });

    // Password form wired to Laravel password.update route
    const {
        data: pwdData,
        setData: setPwdData,
        put: putPassword,
        processing: pwdProcessing,
        errors: pwdErrors,
        reset: resetPwd,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [billingInfo] = useState<BillingInfo>({
        currentPlan: {
            name: 'Business Pro Plan',
            price: '£29.99',
            billing: 'month',
            status: 'active'
        },
        paymentMethods: [
            {
                id: '1',
                type: 'Visa',
                last4: '1234',
                expiryDate: '12/26',
                isDefault: true
            },
            {
                id: '2',
                type: 'Mastercard',
                last4: '5678',
                expiryDate: '08/25',
                isDefault: false
            }
        ],
        billingHistory: [
            {
                id: '1',
                date: '2025-08-01',
                amount: '£29.99',
                status: 'Paid',
                invoiceUrl: '#'
            },
            {
                id: '2',
                date: '2025-07-01',
                amount: '£29.99',
                status: 'Paid',
                invoiceUrl: '#'
            },
            {
                id: '3',
                date: '2025-06-01',
                amount: '£29.99',
                status: 'Paid',
                invoiceUrl: '#'
            }
        ]
    });

    const [notifications, setNotifications] = useState<NotificationPreferences>({
        emailNotifications: true,
        smsReminders: true,
        marketingEmails: false,
        systemNotifications: true,
        newBookingNotifications: true,
        businessUpdates: true,
        weeklyReports: false
    });

    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone: string): boolean => {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    };

    const getPasswordStrength = (password: string): { strength: number; feedback: string[] } => {
        let strength = 0;
        const feedback: string[] = [];

        if (password.length >= 8) strength += 1;
        else feedback.push('At least 8 characters');

        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('One uppercase letter');

        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('One lowercase letter');

        if (/\d/.test(password)) strength += 1;
        else feedback.push('One number');

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
        else feedback.push('One special character');

        return { strength, feedback };
    };

    const handleProfileUpdate = async () => {
        const errors: {[key: string]: string} = {};

        if (!profileData.name.trim()) {
            errors.name = 'Full name is required';
        }

        if (!validateEmail(profileData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Business fields currently not persisted; validate only if provided
        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            errors.phoneNumber = 'Please enter a valid phone number';
        }

        setValidationErrors(errors);

        if (Object.keys(errors).length === 0) {
            patchProfile(route('profile.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Profile updated successfully!');
                },
                onError: () => {
                    toast.error('Failed to update profile. Please try again.');
                },
            });
        }
    };

    const handlePasswordUpdate = async () => {
        const errors: {[key: string]: string} = {};

        if (!pwdData.current_password) {
            errors.currentPassword = 'Current password is required';
        }

        const passwordStrength = getPasswordStrength(pwdData.password);
        if (passwordStrength.strength < 4) {
            errors.newPassword = 'Password must meet all requirements';
        }

        if (pwdData.password !== pwdData.password_confirmation) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);

        if (Object.keys(errors).length === 0) {
            putPassword(route('password.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Password updated successfully!');
                    resetPwd();
                },
                onError: (errs) => {
                    const apiErrors: {[key: string]: string} = {};
                    if (errs.current_password) apiErrors.currentPassword = errs.current_password as string;
                    if (errs.password) apiErrors.newPassword = errs.password as string;
                    if ((errs as any).password_confirmation) apiErrors.confirmPassword = (errs as any).password_confirmation as string;
                    setValidationErrors(apiErrors);
                    toast.error('Failed to update password. Please check your current password.');
                },
            });
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleNotification = (key: keyof NotificationPreferences) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
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

    const passwordStrength = getPasswordStrength(pwdData.password);

    return (
        <DashboardLayout>
            <Head title="Business Settings" />
            
            <BusinessHeader 
                title="Business Settings"
                subtitle="Manage your business account and preferences"
                showAvatar={true}
            />

            <BusinessNavTabs active="settings" />

            {/* Page Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Business Account Settings</h2>
                <p className="text-gray-600">Manage your business profile and preferences</p>
            </div>

            {/* Four-Section Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Business Information</h3>
                    
                    <div className="space-y-6">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                    {auth?.user?.avatar ? (
                                        <img
                                            src={getAvatarUrl(auth.user.avatar) || getFallbackAvatarUrl(auth?.user?.name || 'User', 128)}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'User')}&background=1A237E&color=white&size=128`;
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(auth?.user?.name || 'User')}&background=1A237E&color=white&size=128`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                {avatarUploading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleAvatarInputClick}
                                    disabled={avatarUploading}
                                    className="bg-[#1A237E] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#303F9F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {avatarUploading ? 'Uploading...' : 'Upload Photo'}
                                </button>
                                
                                {auth?.user?.avatar && (
                                    <button
                                        type="button"
                                        onClick={handleAvatarDelete}
                                        disabled={avatarUploading}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Remove
                                    </button>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Name
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData('name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1A237E] focus:border-transparent ${
                                    (validationErrors.name || profileErrors.name) ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., John Smith"
                            />
                            {(validationErrors.name || profileErrors.name) && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.name || profileErrors.name}</p>
                            )}
                        </div>



                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData('email', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1A237E] focus:border-transparent pr-10 ${
                                        (validationErrors.email || profileErrors.email) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., info@company.com"
                                />
                                {emailVerified && (
                                    <span className="absolute right-3 top-3 text-green-500">✓</span>
                                )}
                            </div>
                            {(validationErrors.email || profileErrors.email) && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.email || profileErrors.email}</p>
                            )}
                            {emailVerified && (
                                <p className="text-green-600 text-sm mt-1">Email verified</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1A237E] focus:border-transparent ${
                                    validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., +44 20 1234 5678"
                            />
                            {validationErrors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                            )}
                        </div>

                        <button
                            onClick={handleProfileUpdate}
                            disabled={profileProcessing}
                            className="w-full bg-[#1A237E] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#303F9F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {profileProcessing ? 'Updating Profile...' : 'Update Profile'}
                        </button>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={pwdData.current_password}
                                    onChange={(e) => setPwdData('current_password', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1A237E] focus:border-transparent pr-12 ${
                                        (validationErrors.currentPassword || pwdErrors.current_password) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? getBusinessSettingsIcon('eyeOff', 'w-5 h-5') : getBusinessSettingsIcon('eye', 'w-5 h-5')}
                                </button>
                            </div>
                            {(validationErrors.currentPassword || pwdErrors.current_password) && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.currentPassword || pwdErrors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={pwdData.password}
                                    onChange={(e) => setPwdData('password', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1A237E] focus:border-transparent pr-12 ${
                                        (validationErrors.newPassword || pwdErrors.password) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., StrongPass!23"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showNewPassword ? getBusinessSettingsIcon('eyeOff', 'w-5 h-5') : getBusinessSettingsIcon('eye', 'w-5 h-5')}
                                </button>
                            </div>
                            {pwdData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all ${
                                                    passwordStrength.strength < 2 ? 'bg-red-500' :
                                                    passwordStrength.strength < 4 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-medium ${
                                            passwordStrength.strength < 2 ? 'text-red-500' :
                                            passwordStrength.strength < 4 ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                            {passwordStrength.strength < 2 ? 'Weak' :
                                             passwordStrength.strength < 4 ? 'Medium' : 'Strong'}
                                        </span>
                                    </div>
                                    {passwordStrength.feedback.length > 0 && (
                                        <div className="text-sm text-gray-600">
                                            <p>Required:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {passwordStrength.feedback.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                            {(validationErrors.newPassword || pwdErrors.password) && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.newPassword || pwdErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={pwdData.password_confirmation}
                                    onChange={(e) => setPwdData('password_confirmation', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1A237E] focus:border-transparent pr-12 ${
                                        (validationErrors.confirmPassword || pwdErrors.password) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Re-enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showConfirmPassword ? getBusinessSettingsIcon('eyeOff', 'w-5 h-5') : getBusinessSettingsIcon('eye', 'w-5 h-5')}
                                </button>
                            </div>
                            {(validationErrors.confirmPassword || pwdErrors.password) && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword || pwdErrors.password}</p>
                            )}
                        </div>

                        <button
                            onClick={handlePasswordUpdate}
                            disabled={pwdProcessing || passwordStrength.strength < 4 || pwdData.password !== pwdData.password_confirmation}
                            className="w-full bg-[#1A237E] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#303F9F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {pwdProcessing ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </div>
                </div>

                {/* Billing Information */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Billing Information</h3>
                    
                    <div className="space-y-6">
                        {/* Current Plan */}
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Current Plan</span>
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Active
                                </span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                                {billingInfo.currentPlan.name} - {billingInfo.currentPlan.price}/{billingInfo.currentPlan.billing}
                            </p>
                            <p className="text-sm text-gray-600">Billed monthly</p>
                        </div>

                        {/* Payment Methods */}
                        <div className="border border-gray-200 rounded-2xl">
                            <button
                                onClick={() => toggleSection('paymentMethods')}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900">Payment Methods</span>
                                <div className={`transform transition-transform ${
                                    expandedSections.paymentMethods ? 'rotate-180' : ''
                                }`}>
                                    {getBusinessSettingsIcon('chevronDown', 'w-5 h-5 text-gray-400')}
                                </div>
                            </button>
                            {expandedSections.paymentMethods && (
                                <div className="border-t border-gray-200 p-4 space-y-3">
                                    {billingInfo.paymentMethods.map((method) => (
                                        <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-[#17B7C7] rounded-lg flex items-center justify-center">
                                                    {getBusinessSettingsIcon('creditCard', 'w-5 h-5 text-white')}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {method.type} •••• {method.last4}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {method.isDefault && (
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                        Default
                                                    </span>
                                                )}
                                                <button className="text-[#1A237E] hover:text-[#303F9F] text-sm font-medium">
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-[#1A237E] hover:text-[#1A237E] transition-colors">
                                        + Add Payment Method
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Billing History */}
                        <div className="border border-gray-200 rounded-2xl">
                            <button
                                onClick={() => toggleSection('billingHistory')}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900 flex items-center">
                                    <div className="w-6 h-6 bg-[#00BCD4] rounded flex items-center justify-center mr-2">
                                        {getBusinessSettingsIcon('document', 'w-4 h-4 text-white')}
                                    </div>
                                    Billing History
                                </span>
                                <div className={`transform transition-transform ${
                                    expandedSections.billingHistory ? 'rotate-180' : ''
                                }`}>
                                    {getBusinessSettingsIcon('chevronDown', 'w-5 h-5 text-gray-400')}
                                </div>
                            </button>
                            {expandedSections.billingHistory && (
                                <div className="border-t border-gray-200 p-4 space-y-3">
                                    {billingInfo.billingHistory.map((invoice) => (
                                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{invoice.amount}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(invoice.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    invoice.status === 'Paid' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {invoice.status}
                                                </span>
                                                <button className="text-[#1A237E] hover:text-[#303F9F] text-sm font-medium">
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
                    
                    <div className="space-y-6">
                        {/* Notification Settings */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-4">Notification Settings</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-500">Receive updates via email</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification('emailNotifications')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            notifications.emailNotifications ? 'bg-[#1A237E]' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">SMS Reminders</p>
                                        <p className="text-sm text-gray-500">Get text reminders for important events</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification('smsReminders')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            notifications.smsReminders ? 'bg-[#1A237E]' : 'bg-gray-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                notifications.smsReminders ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Expandable Email Preferences */}
                                {notifications.emailNotifications && (
                                    <div className="border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection('emailPreferences')}
                                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-700">Email Preferences</span>
                                            <div className={`transform transition-transform ${
                                                expandedSections.emailPreferences ? 'rotate-180' : ''
                                            }`}>
                                                {getBusinessSettingsIcon('chevronDown', 'w-4 h-4 text-gray-400')}
                                            </div>
                                        </button>
                                        {expandedSections.emailPreferences && (
                                            <div className="border-t border-gray-200 p-3 space-y-3">
                                                {Object.entries({
                                                    marketingEmails: 'Marketing emails',
                                                    systemNotifications: 'System notifications',
                                                    newBookingNotifications: 'New booking alerts',
                                                    businessUpdates: 'Business updates',
                                                    weeklyReports: 'Weekly reports'
                                                }).map(([key, label]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">{label}</span>
                                                        <button
                                                            onClick={() => toggleNotification(key as keyof NotificationPreferences)}
                                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                                notifications[key as keyof NotificationPreferences] ? 'bg-[#1A237E]' : 'bg-gray-300'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                                                    notifications[key as keyof NotificationPreferences] ? 'translate-x-5' : 'translate-x-1'
                                                                }`}
                                                            />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Business Settings */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="font-medium text-gray-900 mb-4">Business Settings</h4>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Service Areas</span>
                                        <span className="text-sm text-gray-500">Manage →</span>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Business Hours</span>
                                        <span className="text-sm text-gray-500">Setup →</span>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Export Business Data</span>
                                        <span className="text-sm text-gray-500">Download →</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Security & Privacy */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="font-medium text-gray-900 mb-4">Account Management</h4>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                                        <span className="text-sm text-gray-500">Setup →</span>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-red-600">Deactivate Business Account</span>
                                        <span className="text-sm text-red-400">Manage →</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
}
