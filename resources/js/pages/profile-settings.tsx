import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState, useRef } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import SubNavigationTabs from '@/components/housemover/SubNavigationTabs';
import { toast } from 'react-toastify';
import { getAvatarUrl, getFallbackAvatarUrl } from '@/utils/fileUtils';

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
    achievementNotifications: boolean;
    moveReminders: boolean;
    weeklyDigest: boolean;
}

export default function ProfileSettings() {
    // Get authenticated user from shared Inertia props
    const { auth } = usePage().props as any;

    const emailVerified = useMemo(() => Boolean(auth?.user?.email_verified_at), [auth]);

    // Profile form (name and email) wired to Laravel settings routes
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

    // Phone number is not yet supported by backend; keep local only for now
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
            name: 'Premium Plan',
            price: '£9.99',
            billing: 'month',
            status: 'active'
        },
        paymentMethods: [
            {
                id: '1',
                type: 'Visa',
                last4: '4242',
                expiryDate: '12/26',
                isDefault: true
            },
            {
                id: '2',
                type: 'Mastercard',
                last4: '8888',
                expiryDate: '08/25',
                isDefault: false
            }
        ],
        billingHistory: [
            {
                id: '1',
                date: '2025-08-01',
                amount: '£9.99',
                status: 'Paid',
                invoiceUrl: '#'
            },
            {
                id: '2',
                date: '2025-07-01',
                amount: '£9.99',
                status: 'Paid',
                invoiceUrl: '#'
            },
            {
                id: '3',
                date: '2025-06-01',
                amount: '£9.99',
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
        achievementNotifications: true,
        moveReminders: true,
        weeklyDigest: false
    });

    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [successMessage, setSuccessMessage] = useState('');
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

        // Phone number currently not persisted; validate only if provided
        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            errors.phoneNumber = 'Please enter a valid phone number';
        }

        setValidationErrors(errors);

        if (Object.keys(errors).length === 0) {
            patchProfile(route('profile.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    setSuccessMessage('Profile updated successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
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
                    setSuccessMessage('Password updated successfully!');
                    resetPwd();
                    setTimeout(() => setSuccessMessage(''), 3000);
                },
                onError: (errs) => {
                    const apiErrors: {[key: string]: string} = {};
                    if (errs.current_password) apiErrors.currentPassword = errs.current_password as string;
                    if (errs.password) apiErrors.newPassword = errs.password as string;
                    if ((errs as any).password_confirmation) apiErrors.confirmPassword = (errs as any).password_confirmation as string;
                    setValidationErrors(apiErrors);
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
            <Head title="Profile Settings" />
            
            <EnhancedWelcomeBanner subtitle="Complete your profile to earn bonus coins!" />

            {/* Sub-Navigation Tabs */}
            <SubNavigationTabs
                activeTab="settings"
                tabs={[
                    { id: 'overview', icon: '🏠', label: 'OVERVIEW', route: '/dashboard' },
                    { id: 'chain-checker', icon: '⛓️', label: 'CHAIN CHECKER', route: '/housemover/chain-checker' },
                    { id: 'move-details', icon: '📋', label: 'MY MOVE', route: '/housemover/move-details' },
                    { id: 'achievements', icon: '🏆', label: 'ACHIEVEMENTS', route: '/housemover/achievements' },
                    { id: 'connections', icon: '🔗', label: 'CONNECTIONS', route: '/housemover/connections' },
                    { id: 'settings', icon: '⚙️', label: 'SETTINGS' },
                ]}
            />

            {/* Page Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Setting</h2>
                <p className="text-gray-600">Manage your profile and preferences</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                    {successMessage}
                </div>
            )}

            {/* Four-Section Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                    
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
                                                (e.target as HTMLImageElement).src = getFallbackAvatarUrl(auth?.user?.name || 'User', 128);
                                            }}
                                        />
                                    ) : (
                                        <img
                                            src={getFallbackAvatarUrl(auth?.user?.name || 'User', 128)}
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
                                    className="bg-[#00BCD4] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0097A7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData('name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent ${
                                    (validationErrors.name || profileErrors.name) ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., Olivia Thompson"
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
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent pr-10 ${
                                        (validationErrors.email || profileErrors.email) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., olivia@example.com"
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
                                className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent ${
                                    validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., +44 7123 456789"
                            />
                            {validationErrors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                            )}
                        </div>

                        <button
                            onClick={handleProfileUpdate}
                            disabled={profileProcessing}
                            className="w-full bg-[#00BCD4] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#0097A7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent pr-12 ${
                                        (validationErrors.currentPassword || pwdErrors.current_password) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? '🙈' : '👁️'}
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
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent pr-12 ${
                                        (validationErrors.newPassword || pwdErrors.password) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., StrongPass!23"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showNewPassword ? '🙈' : '👁️'}
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
                                    className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent pr-12 ${
                                        (validationErrors.confirmPassword || pwdErrors.password) ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Re-enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {(validationErrors.confirmPassword || pwdErrors.password) && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword || pwdErrors.password}</p>
                            )}
                        </div>

                        <button
                            onClick={handlePasswordUpdate}
                            disabled={pwdProcessing || passwordStrength.strength < 4 || pwdData.password !== pwdData.password_confirmation}
                            className="w-full bg-[#00BCD4] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#0097A7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                {billingInfo.currentPlan.price}/{billingInfo.currentPlan.billing} - Billed monthly
                            </p>
                        </div>

                        {/* Payment Methods */}
                        <div className="border border-gray-200 rounded-2xl">
                            <button
                                onClick={() => toggleSection('paymentMethods')}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900">Payment Methods</span>
                                <span className={`transform transition-transform ${
                                    expandedSections.paymentMethods ? 'rotate-180' : ''
                                }`}>
                                    ▼
                                </span>
                            </button>
                            {expandedSections.paymentMethods && (
                                <div className="border-t border-gray-200 p-4 space-y-3">
                                    {billingInfo.paymentMethods.map((method) => (
                                        <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">💳</span>
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
                                                <button className="text-[#00BCD4] hover:text-[#0097A7] text-sm font-medium">
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-[#00BCD4] hover:text-[#00BCD4] transition-colors">
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
                                    <span className="mr-2">📄</span>
                                    Billing History
                                </span>
                                <span className={`transform transition-transform ${
                                    expandedSections.billingHistory ? 'rotate-180' : ''
                                }`}>
                                    ▼
                                </span>
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
                                                <button className="text-[#00BCD4] hover:text-[#0097A7] text-sm font-medium">
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
                                            notifications.emailNotifications ? 'bg-[#00BCD4]' : 'bg-gray-300'
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
                                        <p className="text-sm text-gray-500">Get text reminders for important tasks</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification('smsReminders')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            notifications.smsReminders ? 'bg-[#00BCD4]' : 'bg-gray-300'
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
                                            <span className={`transform transition-transform text-sm ${
                                                expandedSections.emailPreferences ? 'rotate-180' : ''
                                            }`}>
                                                ▼
                                            </span>
                                        </button>
                                        {expandedSections.emailPreferences && (
                                            <div className="border-t border-gray-200 p-3 space-y-3">
                                                {Object.entries({
                                                    marketingEmails: 'Marketing emails',
                                                    systemNotifications: 'System notifications',
                                                    achievementNotifications: 'Achievement updates',
                                                    moveReminders: 'Move reminders',
                                                    weeklyDigest: 'Weekly digest'
                                                }).map(([key, label]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-700">{label}</span>
                                                        <button
                                                            onClick={() => toggleNotification(key as keyof NotificationPreferences)}
                                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                                                notifications[key as keyof NotificationPreferences] ? 'bg-[#00BCD4]' : 'bg-gray-300'
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

                        {/* Security & Privacy */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="font-medium text-gray-900 mb-4">Security & Privacy</h4>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                                        <span className="text-sm text-gray-500">Setup →</span>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900">Download Data</span>
                                        <span className="text-sm text-gray-500">Export →</span>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-red-600">Delete Account</span>
                                        <span className="text-sm text-red-400">Delete →</span>
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
