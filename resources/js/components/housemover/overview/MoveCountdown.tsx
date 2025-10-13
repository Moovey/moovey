import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

interface MoveDetails {
    moveDate?: string;
    currentAddress?: string;
    newAddress?: string;
    movingCompany?: string;
    estimatedCost?: number;
    moveType?: 'local' | 'long-distance' | 'international';
    status?: 'planning' | 'scheduled' | 'in-progress' | 'completed';
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface MoveCountdownProps {
    moveDetails?: MoveDetails;
    onUpdateMoveDate?: (date: string) => void;
}

export default function MoveCountdown({ 
    moveDetails,
    onUpdateMoveDate 
}: MoveCountdownProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [newMoveDate, setNewMoveDate] = useState(moveDetails?.moveDate || '');

    useEffect(() => {
        if (!moveDetails?.moveDate) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const moveTime = new Date(moveDetails.moveDate!).getTime();
            const difference = moveTime - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeRemaining({ days, hours, minutes, seconds });
            } else {
                setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        // Update immediately
        updateCountdown();

        // Update every second
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [moveDetails?.moveDate]);

    const handleDateUpdate = () => {
        if (newMoveDate && onUpdateMoveDate) {
            onUpdateMoveDate(newMoveDate);
            setIsEditingDate(false);
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getMoveTypeColor = (type?: string): string => {
        switch (type) {
            case 'local': return 'bg-green-100 text-green-800';
            case 'long-distance': return 'bg-yellow-100 text-yellow-800';
            case 'international': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status?: string): string => {
        switch (status) {
            case 'planning': return 'bg-blue-100 text-blue-800';
            case 'scheduled': return 'bg-green-100 text-green-800';
            case 'in-progress': return 'bg-orange-100 text-orange-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUrgencyLevel = (days: number): { level: 'critical' | 'urgent' | 'moderate' | 'relaxed'; message: string; color: string } => {
        if (days <= 7) {
            return {
                level: 'critical',
                message: 'Move is very soon! Final preparations needed.',
                color: 'text-red-600'
            };
        } else if (days <= 30) {
            return {
                level: 'urgent',
                message: 'Less than a month to go. Time to finalize details.',
                color: 'text-orange-600'
            };
        } else if (days <= 60) {
            return {
                level: 'moderate',
                message: 'Good time to start detailed planning.',
                color: 'text-yellow-600'
            };
        } else {
            return {
                level: 'relaxed',
                message: 'Plenty of time for thorough preparation.',
                color: 'text-green-600'
            };
        }
    };

    const urgency = getUrgencyLevel(timeRemaining.days);

    return (
        <section className="bg-white rounded-xl shadow-lg p-6">
            {/* Move Countdown Section - Purple Container */}
            <div className="bg-[#F3E5F5] rounded-xl p-8 shadow-lg">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                        <span className="text-3xl mr-3">⏰</span>
                        Move Countdown & Timeline
                    </h2>
                    <p className="text-lg font-medium text-gray-700">
                        Track time remaining until your moving day
                    </p>
                </div>

                {moveDetails?.moveDate ? (
                    <>
                        {/* Countdown Display */}
                        <div className="bg-white rounded-xl p-8 mb-6 shadow-lg text-center">
                            <div className="mb-4">
                                <h3 className="text-2xl font-bold text-[#1A237E] mb-2">Time Until Moving Day</h3>
                                <p className="text-lg text-gray-600">{formatDate(moveDetails.moveDate)}</p>
                            </div>

                            {/* Countdown Timer */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { value: timeRemaining.days, label: 'Days', color: 'bg-[#9C27B0]' },
                                    { value: timeRemaining.hours, label: 'Hours', color: 'bg-[#673AB7]' },
                                    { value: timeRemaining.minutes, label: 'Minutes', color: 'bg-[#3F51B5]' },
                                    { value: timeRemaining.seconds, label: 'Seconds', color: 'bg-[#2196F3]' }
                                ].map((item, index) => (
                                    <div key={index} className={`${item.color} text-white rounded-xl p-4 shadow-sm`}>
                                        <div className="text-3xl md:text-4xl font-bold">{item.value}</div>
                                        <div className="text-sm font-medium">{item.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Urgency Message */}
                            <div className={`p-4 rounded-lg border-l-4 ${urgency.level === 'critical' ? 'bg-red-50 border-red-500' : 
                                urgency.level === 'urgent' ? 'bg-orange-50 border-orange-500' :
                                urgency.level === 'moderate' ? 'bg-yellow-50 border-yellow-500' :
                                'bg-green-50 border-green-500'}`}>
                                <p className={`font-semibold ${urgency.color}`}>
                                    {urgency.message}
                                </p>
                            </div>
                        </div>

                        {/* Move Details Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Move Information */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                                    <span className="text-xl mr-2">📋</span>
                                    Move Details
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Move Date:</span>
                                        <div className="flex items-center space-x-2">
                                            {isEditingDate ? (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="date"
                                                        value={newMoveDate}
                                                        onChange={(e) => setNewMoveDate(e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                    <button
                                                        onClick={handleDateUpdate}
                                                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditingDate(false)}
                                                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-[#1A237E]">
                                                        {formatDate(moveDetails.moveDate)}
                                                    </span>
                                                    <button
                                                        onClick={() => setIsEditingDate(true)}
                                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                                        title="Edit date"
                                                    >
                                                        ✎
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {moveDetails.moveType && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Move Type:</span>
                                            <span className={`px-2 py-1 rounded text-sm font-medium ${getMoveTypeColor(moveDetails.moveType)}`}>
                                                {moveDetails.moveType.charAt(0).toUpperCase() + moveDetails.moveType.slice(1).replace('-', ' ')}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {moveDetails.status && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(moveDetails.status)}`}>
                                                {moveDetails.status.charAt(0).toUpperCase() + moveDetails.status.slice(1).replace('-', ' ')}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {moveDetails.estimatedCost && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Estimated Cost:</span>
                                            <span className="font-semibold text-[#1A237E]">
                                                ${moveDetails.estimatedCost.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {moveDetails.movingCompany && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Moving Company:</span>
                                            <span className="font-semibold text-[#1A237E]">
                                                {moveDetails.movingCompany}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                                    <span className="text-xl mr-2">🏠</span>
                                    Move Route
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-600">FROM</span>
                                        </div>
                                        <div className="ml-5 p-3 bg-red-50 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {moveDetails.currentAddress || 'Current address not set'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center">
                                        <div className="text-2xl">⬇️</div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-600">TO</span>
                                        </div>
                                        <div className="ml-5 p-3 bg-green-50 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {moveDetails.newAddress || 'New address not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link
                                href="/move-details"
                                className="flex items-center justify-center space-x-2 p-4 bg-[#9C27B0] text-white rounded-lg hover:bg-[#7B1FA2] transition-all duration-200 font-semibold shadow-sm"
                            >
                                <span className="text-xl">📝</span>
                                <span>Update Move Details</span>
                            </Link>
                            
                            <Link
                                href="/timeline"
                                className="flex items-center justify-center space-x-2 p-4 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold shadow-sm"
                            >
                                <span className="text-xl">📅</span>
                                <span>View Timeline</span>
                            </Link>
                            
                            <Link
                                href="/checklist"
                                className="flex items-center justify-center space-x-2 p-4 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm"
                            >
                                <span className="text-xl">✅</span>
                                <span>Moving Checklist</span>
                            </Link>
                        </div>
                    </>
                ) : (
                    /* No Move Date Set */
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                        <div className="text-8xl mb-4">📅</div>
                        <h3 className="text-2xl font-bold text-[#1A237E] mb-4">Set Your Moving Date</h3>
                        <p className="text-gray-600 mb-6">
                            Set your moving date to start the countdown and access timeline features
                        </p>
                        
                        <div className="max-w-md mx-auto">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="date"
                                    value={newMoveDate}
                                    onChange={(e) => setNewMoveDate(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <button
                                    onClick={handleDateUpdate}
                                    className="px-6 py-3 bg-[#9C27B0] text-white rounded-lg hover:bg-[#7B1FA2] transition-all duration-200 font-semibold"
                                >
                                    Set Date
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-700">
                                💡 Setting your move date will unlock timeline features, countdown timer, and personalized task scheduling
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}