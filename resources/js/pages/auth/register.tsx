import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'housemover' | 'business';
};

export default function Register() {
    const [selectedRole, setSelectedRole] = useState<'housemover' | 'business' | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'housemover',
    });

    const handleRoleSelect = (role: 'housemover' | 'business') => {
        setSelectedRole(role);
        setData('role', role);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!selectedRole) {
            alert('Please select a registration type');
            return;
        }

        post(route('register'), {
            onSuccess: () => {
                // Redirect based on role using Laravel routes
                if (data.role === 'business') {
                    window.location.href = route('business.dashboard');
                } else {
                    window.location.href = route('housemover.dashboard');
                }
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // If no role selected, show role selection
    if (!selectedRole) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Head title="Register" />
                <div className="max-w-4xl w-full">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
                            REGISTRATION PAGE
                        </h1>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600">
                            Register As
                        </h2>
                    </div>

                    {/* Role Selection Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                        {/* Housemover Card */}
                        <div 
                            onClick={() => handleRoleSelect('housemover')}
                            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-4 border-transparent hover:border-[#00BCD4]"
                        >
                            <div className="text-center">
                                <div className="mb-6">
                                    <div className="w-48 h-48 mx-auto bg-[#E0F7FA] rounded-full flex items-center justify-center text-6xl">
                                        🏠
                                    </div>
                                    {/* Replace with: <img src="/images/housemover-mascot.png" alt="Housemover Mascot" className="w-48 h-48 mx-auto object-contain" /> */}
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                    Housemover
                                </h3>
                                <p className="text-gray-600 mb-6 text-lg">
                                    I'm planning a house move and need trusted services and guidance
                                </p>
                                <button className="w-full bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Register as Housemover
                                </button>
                            </div>
                        </div>

                        {/* Business Card */}
                        <div 
                            onClick={() => handleRoleSelect('business')}
                            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-4 border-transparent hover:border-[#1A237E]"
                        >
                            <div className="text-center">
                                <div className="mb-6">
                                    <div className="w-48 h-48 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center text-6xl">
                                        🏢
                                    </div>
                                    {/* Replace with: <img src="/images/business-mascot.png" alt="Business Mascot" className="w-48 h-48 mx-auto object-contain" /> */}
                                </div>
                                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                    Business
                                </h3>
                                <p className="text-gray-600 mb-6 text-lg">
                                    I provide moving-related services and want to connect with customers
                                </p>
                                <button className="w-full bg-[#1A237E] hover:bg-[#303F9F] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Register as Business
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Link */}
                    <div className="text-center mt-12">
                        <p className="text-gray-600 text-lg">
                            Already have an account?{' '}
                            <TextLink 
                                href={route('login')} 
                                className="text-[#00BCD4] hover:text-[#00ACC1] font-semibold transition-colors duration-200"
                            >
                                Log in here
                            </TextLink>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show registration form after role selection
    return (
        <AuthLayout 
            title={`Create your ${selectedRole} account`} 
            description={`Enter your details below to create your ${selectedRole} account`}
        >
            <Head title="Register" />
            
            {/* Back to role selection */}
            <div className="mb-6">
                <button 
                    onClick={() => {
                        setSelectedRole(null);
                        setData('role', 'housemover');
                    }}
                    className="text-[#00BCD4] hover:text-[#00ACC1] font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to role selection</span>
                </button>
            </div>

            {/* Selected Role Indicator */}
            <div className="mb-6 p-4 bg-[#E0F7FA] rounded-xl border-l-4 border-[#00BCD4]">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#00BCD4] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                            {selectedRole === 'housemover' ? '🏠' : '🏢'}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#1A237E] text-lg">
                            Registering as: {selectedRole === 'housemover' ? 'Housemover' : 'Business'}
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {selectedRole === 'housemover' 
                                ? 'Access to move planning tools and trusted services'
                                : 'Join our network and connect with customers'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                            {selectedRole === 'business' ? 'Business Name' : 'Full Name'}
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder={selectedRole === 'business' ? 'Your business name' : 'Your full name'}
                            className="h-12 rounded-xl border-gray-200 focus:border-[#0cc0df] focus:ring-[#0cc0df]/20 transition-all duration-200 text-gray-900"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="h-12 rounded-xl border-gray-200 focus:border-[#0cc0df] focus:ring-[#0cc0df]/20 transition-all duration-200 text-gray-900"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Password"
                                className="h-12 rounded-xl border-gray-200 focus:border-[#0cc0df] focus:ring-[#0cc0df]/20 transition-all duration-200 text-gray-900 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="password_confirmation" className="text-gray-700 font-medium">Confirm password</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Confirm password"
                                className="h-12 rounded-xl border-gray-200 focus:border-[#0cc0df] focus:ring-[#0cc0df]/20 transition-all duration-200 text-gray-900 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <InputError message={errors.password_confirmation} />
                        <InputError message={errors.role} />
                    </div>

                    <Button 
                        type="submit" 
                        className={`mt-2 w-full h-12 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ${
                            selectedRole === 'business' 
                                ? 'bg-gradient-to-r from-[#1A237E] to-[#303F9F] hover:from-[#303F9F] hover:to-[#1A237E] text-white'
                                : 'bg-gradient-to-r from-[#0cc0df] to-[#0aa5c0] hover:from-[#0bb8d5] hover:to-[#099fb5] text-white'
                        }`}
                        tabIndex={5} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Create {selectedRole} account
                    </Button>
                </div>

                <div className="text-center text-gray-600">
                    Already have an account?{' '}
                    <TextLink 
                        href={route('login')} 
                        className="text-[#0cc0df] hover:text-[#0aa5c0] font-medium transition-colors duration-200" 
                        tabIndex={6}
                    >
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
