import React from 'react';

interface AdminHeaderProps {
    userName: string;
}

export default function AdminHeader({ userName }: AdminHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-8 mb-8 shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-lg opacity-90">Welcome back, {userName}</p>
                </div>
                <div className="text-6xl">👑</div>
            </div>
        </div>
    );
}