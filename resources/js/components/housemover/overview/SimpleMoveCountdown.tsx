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
                <span className="text-2xl mr-2">⏰</span>
                Move Countdown
            </h3>
            
            <div className="text-center">
                {countdownStatus === 'no-date' ? (
                    <div className="bg-gray-100 rounded-lg p-6 mb-4">
                        <div className="text-6xl mb-2">📅</div>
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
                        <p className="text-sm font-semibold text-orange-800">MOVING DAY IS TODAY! 🎉</p>
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
                                    <div className="bg-white bg-opacity-30 rounded-lg p-3 border border-white border-opacity-20">
                                        <div className="text-3xl font-bold text-black">{countdown.days}</div>
                                        <div className="text-sm font-bold text-black">DAYS</div>
                                    </div>
                                    <div className="bg-white bg-opacity-30 rounded-lg p-3 border border-white border-opacity-20">
                                        <div className="text-3xl font-bold text-black">{countdown.hours}</div>
                                        <div className="text-sm font-bold text-black">HOURS</div>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-white drop-shadow-lg">GETTING CLOSE! 🏃‍♂️</p>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                        <div className="text-xl font-bold text-white">{countdown.days}</div>
                                        <div className="text-xs font-semibold text-white">DAYS</div>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                        <div className="text-xl font-bold text-white">{countdown.hours}</div>
                                        <div className="text-xs font-semibold text-white">HRS</div>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                        <div className="text-xl font-bold text-white">{countdown.minutes}</div>
                                        <div className="text-xs font-semibold text-white">MIN</div>
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                        <div className="text-xl font-bold text-white">{countdown.seconds}</div>
                                        <div className="text-xs font-semibold text-white">SEC</div>
                                    </div>
                                </div>
                                <p className="text-sm font-semibold text-white">ALMOST TIME! 🏃‍♂️</p>
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