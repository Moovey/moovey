import { useState, useRef, useEffect, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { getAvatarUrl, getFallbackAvatarUrl } from '@/utils/fileUtils';

// Tasks added from lessons (Academy) and stored via TaskController
interface AcademyTask {
    id: string;
    title: string;
    description?: string;
    category: string;
    completed: boolean;
    urgency?: string;
    source?: string;
    sectionId?: number;
}

interface SectionTask {
    id: string;
    title: string;
    description?: string;
    category?: string;
    completed: boolean;
    isCustom?: boolean;
    completedDate?: string;
}

interface MoveSection {
    id: number;
    name: string;
    shortName: string;
    description: string;
    icon: string;
}

interface EnhancedWelcomeBannerProps {
    userName?: string;
    subtitle?: string;
    taskData?: {
        recommendedTaskStates?: Record<string, Record<string, { completed: boolean; completedDate?: string }>>;
        customTasks?: Record<string, Array<SectionTask>>;
    };
}

export default function EnhancedWelcomeBanner({ 
    userName = "Olivia", 
    subtitle,
    taskData 
}: EnhancedWelcomeBannerProps) {
    // Get authenticated user from shared Inertia props
    const { auth } = usePage().props as any;
    
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Progress tracking state
    const [academyTasks, setAcademyTasks] = useState<AcademyTask[]>([]);
    const [sectionTasks, setSectionTasks] = useState<Record<number, SectionTask[]>>({
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
    });

    // Move sections (same as in move-details)
    const moveSections: MoveSection[] = [
        { id: 1, name: 'Planning & Budgeting', shortName: 'Planning', description: 'Set your moving goals, timeline, and budget', icon: '📋' },
        { id: 2, name: 'Sell/Prep Current Home', shortName: 'Prep Home', description: 'Prepare your current property for sale or transition', icon: '🏠' },
        { id: 3, name: 'Find New Property', shortName: 'Find Property', description: 'Search and secure your new home', icon: '🔍' },
        { id: 4, name: 'Secure Finances', shortName: 'Finances', description: 'Arrange mortgage, deposits, and financial requirements', icon: '💰' },
        { id: 5, name: 'Legal & Admin', shortName: 'Legal', description: 'Handle contracts, surveys, and legal requirements', icon: '⚖️' },
        { id: 6, name: 'Packing & Removal', shortName: 'Packing', description: 'Organize packing and book removal services', icon: '📦' },
        { id: 7, name: 'Move Day Execution', shortName: 'Move Day', description: 'Coordinate and execute the moving day', icon: '🚚' },
        { id: 8, name: 'Settling In', shortName: 'Settling', description: 'Unpack and establish yourself in your new home', icon: '🏡' },
        { id: 9, name: 'Post Move Integration', shortName: 'Integration', description: 'Complete address changes and community integration', icon: '✨' },
    ];

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

    const handleAvatarInputClick = () => {
        avatarInputRef.current?.click();
    };

    // Helper function to get CSRF token
    const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // Load academy tasks from API
    useEffect(() => {
        const loadAcademyTasks = async () => {
            try {
                const res = await fetch('/api/tasks', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                if (!res.ok) return;
                const data = await res.json();
                const rawList = Array.isArray(data)
                    ? data
                    : (data.tasks || data.user_tasks || data.data || []);
                const mapped: AcademyTask[] = (rawList || []).map((t: any) => ({
                    id: (t.id ?? t.task_id ?? '').toString(),
                    title: t.title ?? 'Untitled Task',
                    description: t.description ?? '',
                    category: t.category ?? 'Pre-Move',
                    completed: (t.status ? t.status === 'completed' : false) || !!t.completed_at || !!t.completed,
                    urgency: t.urgency,
                    source: t.source ?? t.metadata?.source,
                    sectionId: (() => {
                        const raw = t.section_id ?? t.sectionId ?? t.section?.id;
                        if (raw === undefined || raw === null || raw === '') return undefined;
                        const num = typeof raw === 'number' ? raw : parseInt(raw, 10);
                        return Number.isNaN(num) ? undefined : num;
                    })(),
                }))
                .filter((t: AcademyTask) => !t.source || t.source === 'lesson');
                setAcademyTasks(mapped);
            } catch (e) {
                // fail silently
            }
        };
        loadAcademyTasks();
    }, []);

    // Merge backend task data (same logic as move-details)
    useEffect(() => {
        if (!taskData) return;
        setSectionTasks(prev => {
            const next: Record<number, SectionTask[]> = { ...prev };

            const states = taskData.recommendedTaskStates || {};
            Object.keys(states).forEach(sectionKey => {
                const sec = parseInt(sectionKey, 10);
                if (!next[sec]) return;
                const taskStateMap = states[sectionKey] || {};
                next[sec] = next[sec].map(t =>
                    taskStateMap[t.id]
                        ? {
                              ...t,
                              completed: !!taskStateMap[t.id].completed,
                              completedDate: taskStateMap[t.id].completedDate || undefined,
                          }
                        : t
                );
            });

            const custom = taskData.customTasks || {};
            Object.keys(custom).forEach(sectionKey => {
                const sec = parseInt(sectionKey, 10);
                const customList = (custom[sectionKey] || []).map(ct => ({ ...ct, isCustom: true }));
                next[sec] = [...(next[sec] || []), ...customList];
            });
            return next;
        });
    }, [taskData]);

    // Calculate section progress (same logic as move-details)
    const getSectionProgress = (sectionId: number) => {
        const custom = sectionTasks[sectionId] || [];
        const academy = academyTasks.filter(t => {
            if (t.sectionId == null) return sectionId === 1; // fallback treat untagged as Planning only
            return t.sectionId === sectionId;
        });
        const combinedCount = custom.length + academy.length;
        if (combinedCount === 0) return 0;
        const completedCustom = custom.filter(t => t.completed).length;
        const completedAcademy = academy.filter(t => t.completed).length;
        return Math.round(((completedCustom + completedAcademy) / combinedCount) * 100);
    };

    // Calculate overall progress (average of all sections)
    const overallProgress = useMemo(() => {
        const total = moveSections.reduce((acc, s) => acc + getSectionProgress(s.id), 0);
        return Math.round(total / moveSections.length);
    }, [sectionTasks, academyTasks]);

    return (
        <div className="bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1] rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center">
                {/* Left Side Content */}
                <div className="mb-6 lg:mb-0">
                    <h1 className="text-4xl font-bold mb-2">Welcome Back {auth?.user?.name || userName}</h1>
                    {subtitle && <p className="text-lg opacity-90">{subtitle}</p>}
                </div>
                
                {/* Right Side - Avatar and Quick Stats */}
                <div className="text-right flex flex-col items-end space-y-4">
                    {/* Avatar Section */}
                    <div className="relative">
                        <div 
                            className="w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-30 cursor-pointer hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center overflow-hidden"
                            onClick={handleAvatarInputClick}
                        >
                            {auth?.user?.avatar ? (
                                <img 
                                    src={getAvatarUrl(auth.user.avatar) || getFallbackAvatarUrl(auth?.user?.name || userName || 'User', 64)}
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLImageElement).src = getFallbackAvatarUrl(auth?.user?.name || userName || 'User', 64);
                                    }}
                                />
                            ) : (
                                <img 
                                    src={getFallbackAvatarUrl(auth?.user?.name || userName || 'User', 64)}
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {avatarUploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white bg-opacity-20 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="text-sm text-gray-700 mb-1">Your Progress</div>
                        <div className="text-3xl font-bold text-gray-800 mb-2">{overallProgress}%</div>
                        <div className="text-sm text-gray-600">Move Journey Complete</div>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
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
    );
}
