import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => {
                // Redirect to home page after successful login
                window.location.href = route('home');
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="h-12 rounded-xl border-gray-200 focus:border-[#0cc0df] focus:ring-[#0cc0df]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-3">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="ml-auto text-sm text-[#0cc0df] hover:text-[#0aa5c0] transition-colors duration-200" 
                                    tabIndex={5}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                className="h-12 rounded-xl border-gray-200 focus:border-[#0cc0df] focus:ring-[#0cc0df]/20 transition-all duration-200 text-gray-900 bg-white placeholder:text-gray-400 pr-12"
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

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="data-[state=checked]:bg-[#0cc0df] data-[state=checked]:border-[#0cc0df]"
                        />
                        <Label htmlFor="remember" className="text-gray-700">Remember me</Label>
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 w-full h-12 bg-gradient-to-r from-[#0cc0df] to-[#0aa5c0] hover:from-[#0bb8d5] hover:to-[#099fb5] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#0cc0df]/25 transform hover:scale-[1.02] transition-all duration-300" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-gray-600">
                    Don't have an account?{' '}
                    <TextLink 
                        href={route('register')} 
                        className="text-[#0cc0df] hover:text-[#0aa5c0] font-medium transition-colors duration-200" 
                        tabIndex={6}
                    >
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
