import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

interface PersonalDetails {
    currentAddress: string;
    newAddress: string;
    movingDate: string;
    contactInfo: string;
    emergencyContact: string;
}

interface SimpleMoveCountdownProps {
    personalDetails: PersonalDetails;
}

export default function SimpleMoveCountdown({ personalDetails }: SimpleMoveCountdownProps) {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [countdownStatus, setCountdownStatus] = useState<'future' | 'today' | 'overdue' | 'no-date'>('no-date');

    // Real-time countdown calculation
    useEffect(() => {
        if (!personalDetails.movingDate) {
            setCountdownStatus('no-date');
            return;
        }

        const calculateCountdown = () => {
            const now = new Date().getTime();
            const moveDate = new Date(personalDetails.movingDate).getTime();
            const difference = moveDate - now;

            if (difference > 86400000) { // More than 1 day away
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                
                setCountdown({ days, hours, minutes, seconds });
                setCountdownStatus('future');
            } else if (difference > 0 && difference <= 86400000) { // Today (within 24 hours)
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                
                setCountdown({ days: 0, hours, minutes, seconds });
                setCountdownStatus('today');
            } else { // Move date has passed
                const daysPassed = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
                setCountdown({ days: daysPassed, hours: 0, minutes: 0, seconds: 0 });
                setCountdownStatus('overdue');
            }
        };

        // Calculate immediately
        calculateCountdown();

        // Update every second for real-time countdown
        const interval = setInterval(calculateCountdown, 1000);

        return () => clearInterval(interval);
    }, [personalDetails.movingDate]);

    // Format move date for display
    const formatMoveDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#1A237E] mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg flex items-center justify-center shadow-sm mr-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                Move Countdown
            </h3>
            
            <div className="text-center">
                {countdownStatus === 'no-date' ? (
                    <div className="bg-gray-100 rounded-lg p-6 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-md mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-800 mb-2">No Move Date Set</p>
                        <Link 
                            href="/housemover/move-details?section=1#personal-details"
                            className="inline-block bg-[#00BCD4] text-white px-4 py-2 rounded-lg hover:bg-[#00ACC1] transition-colors font-semibold"
                        >
                            Set Your Move Date
                        </Link>
                    </div>
                ) : countdownStatus === 'overdue' ? (
                    <div className="bg-red-100 rounded-lg p-6 mb-4">
                        <div className="text-4xl font-bold text-red-800 mb-2">
                            {countdown.days}
                        </div>
                        <p className="text-sm font-semibold text-red-800 mb-2">DAYS SINCE MOVE DATE!</p>
                        <p className="text-xs text-red-700">Your move date was {formatMoveDate(personalDetails.movingDate)}</p>
                    </div>
                ) : countdownStatus === 'today' ? (
                    <div className="bg-orange-100 rounded-lg p-6 mb-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-orange-500 rounded-lg p-3 text-white">
                                <div className="text-2xl font-bold">{countdown.hours}</div>
                                <div className="text-xs font-semibold">HOURS</div>
                            </div>
                            <div className="bg-orange-500 rounded-lg p-3 text-white">
                                <div className="text-2xl font-bold">{countdown.minutes}</div>
                                <div className="text-xs font-semibold">MINS</div>
                            </div>
                            <div className="bg-orange-500 rounded-lg p-3 text-white">
                                <div className="text-2xl font-bold">{countdown.seconds}</div>
                                <div className="text-xs font-semibold">SECS</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <p className="text-sm font-semibold text-orange-800">MOVING DAY IS TODAY!</p>
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#00BCD4] rounded-lg p-6 mb-4">
                        {countdown.days > 30 ? (
                            <>
                                <div className="text-4xl font-bold text-white mb-2">
                                    {countdown.days}
                                </div>
                                <p className="text-sm font-semibold text-white">DAYS TO MOVE!</p>
                            </>
                        ) : countdown.days > 7 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white bg-opacity-80 rounded-lg p-3 border border-white shadow-lg">
                                        <div className="text-3xl font-bold text-gray-800">{countdown.days}</div>
                                        <div className="text-sm font-bold text-gray-700">DAYS</div>
                                    </div>
                                    <div className="bg-white bg-opacity-80 rounded-lg p-3 border border-white shadow-lg">
                                        <div className="text-3xl font-bold text-gray-800">{countdown.hours}</div>
                                        <div className="text-sm font-bold text-gray-700">HOURS</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <p className="text-lg font-bold text-white drop-shadow-lg">GETTING CLOSE!</p>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    <div className="bg-white bg-opacity-90 rounded-lg p-2 border border-white shadow-md">
                                        <div className="text-xl font-bold text-gray-800">{countdown.days}</div>
                                        <div className="text-xs font-semibold text-gray-700">DAYS</div>
                                    </div>
                                    <div className="bg-white bg-opacity-90 rounded-lg p-2 border border-white shadow-md">
                                        <div className="text-xl font-bold text-gray-800">{countdown.hours}</div>
                                        <div className="text-xs font-semibold text-gray-700">HRS</div>
                                    </div>
                                    <div className="bg-white bg-opacity-90 rounded-lg p-2 border border-white shadow-md">
                                        <div className="text-xl font-bold text-gray-800">{countdown.minutes}</div>
                                        <div className="text-xs font-semibold text-gray-700">MIN</div>
                                    </div>
                                    <div className="bg-white bg-opacity-90 rounded-lg p-2 border border-white shadow-md">
                                        <div className="text-xl font-bold text-gray-800">{countdown.seconds}</div>
                                        <div className="text-xs font-semibold text-gray-700">SEC</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-semibold text-white">ALMOST TIME!</p>
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                                    </svg>
                                </div>
                            </>
                        )}
                    </div>
                )}
                <div className="bg-[#E0F7FA] rounded-lg p-3">
                    <p className="text-xs font-medium text-[#1A237E]">
                        {personalDetails.movingDate ? 
                            `Target Move Date: ${formatMoveDate(personalDetails.movingDate)}` : 
                            'Set your move date in Personal Details to see countdown'
                        }
                    </p>
                    {personalDetails.movingDate && (
                        <Link 
                            href="/housemover/move-details?section=1#personal-details"
                            className="inline-block mt-2 text-xs text-[#00BCD4] hover:text-[#00ACC1] font-semibold"
                        >
                            Update Move Date →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}