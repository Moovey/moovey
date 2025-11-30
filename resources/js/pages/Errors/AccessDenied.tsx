import { Head, Link } from '@inertiajs/react';

interface AccessDeniedProps {
    message?: string;
}

export default function AccessDenied({ message = 'Access denied. You do not have permission to access this area.' }: AccessDeniedProps) {
    return (
        <>
            <Head title="Access Denied" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        {/* Moovey Logo/Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-[#17B7C7] to-[#1A237E] rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg 
                                className="w-10 h-10 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                                />
                            </svg>
                        </div>

                        {/* Error Code */}
                        <div className="text-6xl font-bold text-gray-200 mb-4">403</div>

                        {/* Error Message */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Access Denied
                        </h1>
                        
                        <p className="text-gray-600 mb-8">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                href="/dashboard"
                                className="block w-full bg-gradient-to-r from-[#17B7C7] to-[#139AAA] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200"
                            >
                                Go to Dashboard
                            </Link>
                            
                            <Link
                                href="/"
                                className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>

                        {/* Help Text */}
                        <p className="text-sm text-gray-500 mt-6">
                            If you believe this is an error, please contact support.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
