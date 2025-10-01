import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0] font-sans overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-[#f9f5f0]"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#0cc0df]/10 to-[#0aa5c0]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#f4c542]/10 to-[#0cc0df]/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex min-h-screen items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-[#0cc0df]/10 border border-white/20">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-6">
                                <Link href={route('home')} className="flex flex-col items-center gap-3 font-medium">
                                    <div className="text-4xl font-bold text-[#f4c542] mb-2">MOOVEY</div>
                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-3 text-center">
                                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                                    <p className="text-gray-600 leading-relaxed">{description}</p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>
                    
                    {/* Floating Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#0cc0df]/20 to-[#0aa5c0]/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-[#f4c542]/20 to-[#0cc0df]/10 rounded-full blur-xl"></div>
                </div>
            </div>
        </div>
    );
}
