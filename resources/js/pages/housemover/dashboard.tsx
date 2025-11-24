import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import HousemoverNavigation from '@/components/housemover/HousemoverNavigation';

// Lazy load heavy components for better initial page load
const CompleteMovingJourney = lazy(() => import('@/components/housemover/CompleteMovingJourney'));
const LearningJourney = lazy(() => import('@/components/housemover/overview/LearningJourney'));
const CTATasksManager = lazy(() => import('@/components/housemover/overview/CTATasksManager'));
const SimplePriorityTasksWidget = lazy(() => import('@/components/housemover/overview/SimplePriorityTasksWidget'));
const SimpleMoveCountdown = lazy(() => import('@/components/housemover/overview/SimpleMoveCountdown'));
const SimpleVouchersRewards = lazy(() => import('@/components/housemover/overview/SimpleVouchersRewards'));
const SimpleStatisticsDashboard = lazy(() => import('@/components/housemover/overview/SimpleStatisticsDashboard'));
const PropertyBasketSection = lazy(() => import('@/components/housemover/overview/PropertyBasketSection'));

interface Task {
    id: string;
    title: string;
    icon: string;
    dueDate: string;
    urgency: 'overdue' | 'urgent' | 'moderate' | 'normal';
    category: string;
    completed: boolean;
    estimatedTime: string;
    description: string;
    subtasks?: {
        completed: number;
        total: number;
    };
}

interface MoveStage {
    id: number;
    label: string;
    shortLabel: string;
    icon: string;
    completed: boolean;
    current: boolean;
    upcoming: boolean;
    progress: number;
    description: string;
}

interface SectionTask {
    id: string;
    title: string;
    completed: boolean;
    isCustom?: boolean;
    category: string;
}

// Minimal academy task shape for progress parity with Move Details
interface AcademyTask {
    id: string;
    title: string;
    description?: string;
    category?: string;
    completed: boolean;
    urgency?: string;
    source?: string;
    sectionId?: number;
}

interface PersonalDetails {
    currentAddress: string;
    newAddress: string;
    movingDate: string;
    contactInfo: string;
    emergencyContact: string;
}

interface DashboardProps {
  auth: {
    user: {
      name: string;
      email: string;
    };
  };
  upcomingTasks?: Array<{
    id: number;
    title: string;
    description: string;
    priority: string;
    created_at: string;
    source: string;
    source_id?: number;
    category: string;
    completed: boolean;
    urgency: string;
  }>;
  allUserTasks?: Array<{
    id: number;
    title: string;
    description: string;
    priority: string;
    created_at: string;
    source: string;
    source_id?: number;
    category: string;
    completed: boolean;
    urgency: string;
  }>;
  taskStats?: {
    total: number;
    pending: number;
    completed: number;
  };
  academyProgress?: {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    currentLevel: number;
    currentRank: string;
    nextRank: string;
    nextLesson?: {
      id: number;
      title: string;
      description: string;
      stage: string;
      duration: string;
      difficulty: string;
    };
  };
  personalDetails?: PersonalDetails;
}

// Cache for API responses
const API_CACHE = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache utility functions
const getCachedData = (key: string) => {
    const cached = API_CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key: string, data: any, ttl: number = CACHE_TTL) => {
    API_CACHE.set(key, { data, timestamp: Date.now(), ttl });
};

// Loading skeleton component
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export default function Dashboard({ 
    auth, 
    upcomingTasks = [], 
    allUserTasks = [],
    taskStats = { total: 0, pending: 0, completed: 0 },
    academyProgress = { 
        totalLessons: 0, 
        completedLessons: 0, 
        progressPercentage: 0, 
        currentLevel: 1, 
        currentRank: 'MOVE DREAMER', 
        nextRank: 'PLAN STARTER',
        nextLesson: undefined
    },
    personalDetails: personalDetailsFromProps = {
        currentAddress: '',
        newAddress: '',
        movingDate: '',
        contactInfo: '',
        emergencyContact: ''
    }
}: DashboardProps) {
    // Get initial tab from URL parameter or default to 'overview'
    const getInitialTab = (): 'overview' => {
        // Chain checker now has its own page, so dashboard only has overview
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState<'overview'>(getInitialTab());
    const [activeStage, setActiveStage] = useState<number>(2);
    
    // Performance optimization states
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [componentLoadStates, setComponentLoadStates] = useState({
        journey: false,
        learning: false,
        tasks: false,
        priority: false,
        countdown: false,
        vouchers: false,
        statistics: false,
        propertyBasket: false
    });
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['banner', 'tabs']));
    const [dataVersion, setDataVersion] = useState(0); // For tracking data freshness

    // Tab change handler - overview is managed locally, others redirect

    // Function to handle tab change with URL update
    const handleTabChange = (tabId: string) => {
        // Only handle overview locally, other tabs have dedicated pages
        if (tabId === 'overview') {
            setActiveTab('overview');
            // Remove tab param for default overview
            const url = new URL(window.location.href);
            url.searchParams.delete('tab');
            window.history.pushState({}, '', url.toString());
        }
        // Other tabs are handled by HousemoverNavigation component routing
    };

    // Optimized data loading with progressive enhancement
    useEffect(() => {
        const initializeDashboard = async () => {
            // Start with critical data first
            setVisibleSections(prev => new Set([...prev, 'journey']));
            
            // Load priority tasks (critical)
            await loadPriorityTasks();
            
            // Progressive loading of other sections
            setTimeout(() => setVisibleSections(prev => new Set([...prev, 'learning'])), 100);
            setTimeout(() => setVisibleSections(prev => new Set([...prev, 'tasks'])), 200);
            setTimeout(() => setVisibleSections(prev => new Set([...prev, 'priority', 'countdown'])), 300);
            setTimeout(() => setVisibleSections(prev => new Set([...prev, 'vouchers', 'statistics'])), 400);
            
            setIsInitialLoading(false);
        };

        initializeDashboard();
    }, []);

    // Optimized priority tasks loading with caching
    const loadPriorityTasks = useCallback(async () => {
        const cacheKey = 'priority-tasks';
        const cached = getCachedData(cacheKey);
        
        if (cached) {
            setUserPriorityTasks(cached);
            return;
        }

        try {
            const response = await fetch('/api/priority-tasks', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const priorityTasks = data.priority_tasks.map((task: any) => ({
                        id: task.id.toString(),
                        title: task.title,
                        icon: '🎓',
                        dueDate: 'From Academy',
                        urgency: 'moderate' as const,
                        category: task.category,
                        completed: false,
                        estimatedTime: '15 mins',
                        description: task.description,
                    }));
                    setUserPriorityTasks(priorityTasks);
                    setCachedData(cacheKey, priorityTasks);
                }
            }
        } catch (error) {
            // Silently fail for better UX
        }
    }, []);

    // Optimized save task to priority list with optimistic updates
    const saveToPriorityList = useCallback(async (taskId: string) => {
        // Optimistic update - add immediately to UI
        const task = allUserTasks.find(t => t.id.toString() === taskId);
        if (task) {
            const optimisticTask = {
                id: task.id.toString(),
                title: task.title,
                icon: '🎓',
                dueDate: 'From Academy',
                urgency: 'moderate' as const,
                category: task.category,
                completed: false,
                estimatedTime: '15 mins',
                description: task.description,
            };
            setUserPriorityTasks(prev => [...prev, optimisticTask]);
        }

        try {
            const response = await fetch('/api/priority-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ task_id: parseInt(taskId) }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Invalidate cache
                    API_CACHE.delete('priority-tasks');
                    setDataVersion(prev => prev + 1);
                    return true;
                }
            }
            
            // Rollback optimistic update on failure
            setUserPriorityTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            // Rollback optimistic update on error
            setUserPriorityTasks(prev => prev.filter(t => t.id !== taskId));
        }
        return false;
    }, [allUserTasks]);

    // Optimized remove task from priority list with optimistic updates
    const removeFromPriorityList = useCallback(async (taskId: string) => {
        // Store the task for potential rollback using functional state update
        let taskToRemove: Task | undefined;
        setUserPriorityTasks(prev => {
            taskToRemove = prev.find(t => t.id === taskId);
            return prev.filter(t => t.id !== taskId);
        });

        try {
            const response = await fetch(`/api/priority-tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Invalidate cache
                    API_CACHE.delete('priority-tasks');
                    setDataVersion(prev => prev + 1);
                    return true;
                }
            }
            
            // Rollback optimistic update on failure
            if (taskToRemove) {
                setUserPriorityTasks(prev => [...prev, taskToRemove!]);
            }
        } catch (error) {
            // Rollback optimistic update on error
            if (taskToRemove) {
                setUserPriorityTasks(prev => [...prev, taskToRemove!]);
            }
        }
        return false;
    }, []);
    const [showTaskCreator, setShowTaskCreator] = useState<number | null>(null);
    const [newTaskText, setNewTaskText] = useState('');
    const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(personalDetailsFromProps);
    const [selectedCtaTasks, setSelectedCtaTasks] = useState<Set<string>>(new Set());
    const [userPriorityTasks, setUserPriorityTasks] = useState<Task[]>([]);

    // Icon mapping function to convert emoji icons to professional SVG icons
    const getSectionIcon = (iconName: string, iconSize: string = "w-6 h-6") => {
        // Map emoji icons to icon names
        const emojiToIconMap: Record<string, string> = {
            '📋': 'planning',
            '🏠': 'home', 
            '🔍': 'search',
            '💰': 'money',
            '📄': 'legal',
            '📦': 'box',
            '🚚': 'truck',
            '🏡': 'settling',
            '✨': 'sparkle'
        };
        
        const mappedIconName = emojiToIconMap[iconName] || iconName;
        
        const iconMap: Record<string, React.ReactElement> = {
            'planning': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            'home': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V9.375c0-.621.504-1.125 1.125-1.125H20.25M8.25 21l10.5 0m-11.25-9.375h11.25C18.621 11.625 19.125 11.121 19.125 10.5V9.15c0-.201-.075-.402-.225-.563L12.375 2.062a.75.75 0 00-1.061 0L4.8 8.587c-.15.161-.225.362-.225.563v.939c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            ),
            'search': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            ),
            'money': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            'legal': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            'box': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            ),
            'truck': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V8.5a1.5 1.5 0 011.5-1.5h3.25V15a1.5 1.5 0 01-1.5 1.5H8.25zM10.5 18.75a1.5 1.5 0 01-1.5-1.5V15h1.5v3.75zm4.5-13.5V15a1.5 1.5 0 001.5 1.5h3.25a1.5 1.5 0 003 0V8.5a1.5 1.5 0 00-1.5-1.5H15zm4.5 13.5a1.5 1.5 0 01-1.5-1.5V15h1.5v3.75z" />
                </svg>
            ),
            'settling': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            ),
            'sparkle': (
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
            )
        };
        return iconMap[mappedIconName] || null;
    };

    const moveStages: MoveStage[] = [
        {
            id: 1,
            label: 'Planning & Budgeting',
            shortLabel: 'Planning',
            icon: '📋',
            completed: true,
            current: false,
            upcoming: false,
            progress: 100,
            description: 'Initial planning, budget setup, and timeline creation'
        },
        {
            id: 2,
            label: 'Sell/Prep Current Home',
            shortLabel: 'Prep Home',
            icon: '🏠',
            completed: true,
            current: false,
            upcoming: false,
            progress: 100,
            description: 'Prepare current property for sale or rental transition'
        },
        {
            id: 3,
            label: 'Find New Property',
            shortLabel: 'Find Property',
            icon: '🔍',
            completed: false,
            current: true,
            upcoming: false,
            progress: 75,
            description: 'Search and secure your new home'
        },
        {
            id: 4,
            label: 'Secure Finances',
            shortLabel: 'Finances',
            icon: '💰',
            completed: false,
            current: false,
            upcoming: true,
            progress: 30,
            description: 'Mortgage approval, deposits, and financial arrangements'
        },
        {
            id: 5,
            label: 'Legal & Admin',
            shortLabel: 'Legal',
            icon: '📝',
            completed: false,
            current: false,
            upcoming: true,
            progress: 0,
            description: 'Contracts, surveys, and legal requirements'
        },
        {
            id: 6,
            label: 'Packing & Removal',
            shortLabel: 'Packing',
            icon: '📦',
            completed: false,
            current: false,
            upcoming: true,
            progress: 0,
            description: 'Organize packing and book removal services'
        },
        {
            id: 7,
            label: 'Move Day Execution',
            shortLabel: 'Move Day',
            icon: '🚚',
            completed: false,
            current: false,
            upcoming: true,
            progress: 0,
            description: 'Coordinate and execute the moving day'
        },
        {
            id: 8,
            label: 'Settling In',
            shortLabel: 'Settling',
            icon: '🏡',
            completed: false,
            current: false,
            upcoming: true,
            progress: 0,
            description: 'Unpack and settle into your new home'
        },
        {
            id: 9,
            label: 'Post Move Integration',
            shortLabel: 'Integration',
            icon: '✨',
            completed: false,
            current: false,
            upcoming: true,
            progress: 0,
            description: 'Complete address changes and community integration'
        }
    ];

    // Section-specific tasks (custom tasks) - start empty for parity with Move Details
    const [sectionTasks, setSectionTasks] = useState<Record<number, SectionTask[]>>({
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
    });

    // Academy tasks (from lessons), fetched with caching and pagination
    const [academyTasks, setAcademyTasks] = useState<AcademyTask[]>([]);
    const [academyTasksPage, setAcademyTasksPage] = useState(1);
    const [hasMoreAcademyTasks, setHasMoreAcademyTasks] = useState(true);
    
    const loadAcademyTasks = useCallback(async (page: number = 1, append: boolean = false) => {
        const cacheKey = `academy-tasks-${page}`;
        const cached = getCachedData(cacheKey);
        
        if (cached && !append) {
            setAcademyTasks(cached.tasks);
            setHasMoreAcademyTasks(cached.hasMore);
            return;
        }

        try {
            const res = await fetch(`/api/tasks?page=${page}&per_page=20`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (!res.ok) return;
            const data = await res.json();
            const rawList = Array.isArray(data) ? data : (data.tasks || data.user_tasks || data.data || []);
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
            })).filter((t: AcademyTask) => !t.source || t.source === 'lesson');
            
            const hasMore = mapped.length === 20; // If we got a full page, there might be more
            const result = { tasks: mapped, hasMore };
            setCachedData(cacheKey, result);
            
            if (append) {
                setAcademyTasks(prev => [...prev, ...mapped]);
            } else {
                setAcademyTasks(mapped);
            }
            setHasMoreAcademyTasks(hasMore);
        } catch (e) {
            // silent fail
        }
    }, []);

    useEffect(() => {
        loadAcademyTasks(1);
    }, [loadAcademyTasks]);

    // Optimized custom tasks loading with caching and intelligent updates
    const loadCustomTasks = useCallback(async () => {
        const cacheKey = 'custom-tasks';
        const cached = getCachedData(cacheKey);
        
        if (cached) {
            setSectionTasks(cached);
            return;
        }

        try {
            const res = await fetch('/api/move-details', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const payload = await res.json();
            const grouped = payload?.data?.customTasks || {};
            // Normalize into numeric keys 1..9
            const next: Record<number, SectionTask[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
            Object.keys(grouped).forEach((key) => {
                const num = parseInt(key, 10);
                if (Number.isNaN(num) || num < 1 || num > 9) return;
                const arr = Array.isArray(grouped[key]) ? grouped[key] : [];
                next[num] = arr.map((t: any) => ({
                    id: (t.id ?? '').toString(),
                    title: t.title ?? 'Custom task',
                    completed: !!t.completed,
                    isCustom: true,
                    category: t.category ?? 'pre-move',
                }));
            });
            setSectionTasks(next);
            setCachedData(cacheKey, next);
        } catch (_) {
            // ignore
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        if (isMounted) {
            loadCustomTasks();
        }

        // Refresh when the window/tab regains focus with debouncing
        let focusTimeout: NodeJS.Timeout;
        const onFocus = () => {
            clearTimeout(focusTimeout);
            focusTimeout = setTimeout(() => {
                if (isMounted) {
                    // Invalidate cache and reload
                    API_CACHE.delete('custom-tasks');
                    loadCustomTasks();
                }
            }, 1000); // 1 second debounce
        };

        window.addEventListener('focus', onFocus);
        return () => {
            isMounted = false;
            clearTimeout(focusTimeout);
            window.removeEventListener('focus', onFocus);
        };
    }, [loadCustomTasks]);

    // Cache cleanup and performance monitoring
    useEffect(() => {
        const cleanup = setInterval(() => {
            // Clean expired cache entries
            const now = Date.now();
            for (const [key, value] of API_CACHE.entries()) {
                if (now - value.timestamp > value.ttl) {
                    API_CACHE.delete(key);
                }
            }
            
            // Limit cache size to prevent memory issues
            if (API_CACHE.size > 50) {
                const entries = Array.from(API_CACHE.entries())
                    .sort((a, b) => a[1].timestamp - b[1].timestamp);
                entries.slice(0, entries.length - 40).forEach(([key]) => {
                    API_CACHE.delete(key);
                });
            }
        }, 60000); // Run cleanup every minute

        return () => clearInterval(cleanup);
    }, []);

    // Removed sample priority tasks - now only showing tasks added from Academy Learning Tasks
    const priorityTasks: Task[] = [];

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'overdue':
                return 'border-l-red-500 bg-red-50';
            case 'urgent':
                return 'border-l-red-400 bg-red-50';
            case 'moderate':
                return 'border-l-yellow-500 bg-yellow-50';
            case 'normal':
                return 'border-l-[#00BCD4] bg-[#E0F7FA]';
            default:
                return 'border-l-gray-500 bg-[#F5F5F5]';
        }
    };

    const getUrgencyTextColor = (urgency: string) => {
        switch (urgency) {
            case 'overdue':
                return 'text-red-600';
            case 'urgent':
                return 'text-red-600';
            case 'moderate':
                return 'text-yellow-600';
            case 'normal':
                return 'text-[#00BCD4]';
            default:
                return 'text-gray-600';
        }
    };

    const handleTaskClick = (taskId: string) => {
        window.location.href = `/move-details#task-${taskId}`;
    };

    const handleTaskComplete = async (taskId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        
        // Show confirmation dialog
        const taskToComplete = getCombinedPriorityTasks().find(task => task.id === taskId);
        const taskTitle = taskToComplete?.title || 'this task';
        
        const isConfirmed = window.confirm(
            `Are you sure you want to mark "${taskTitle}" as completed?\n\nThis action cannot be undone.`
        );
        
        if (!isConfirmed) {
            return;
        }

        try {
            // Call API to mark task as complete
            const response = await fetch(`/api/tasks/${taskId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Remove completed task from priority tasks if it's a user priority task
                    if (userPriorityTasks.some(ut => ut.id === taskId)) {
                        setUserPriorityTasks(prev => prev.filter(ut => ut.id !== taskId));
                        
                        // Also remove from backend priority list
                        await removeFromPriorityList(taskId);
                    }
                    
                    // Show success message
                    alert(`"${taskTitle}" has been marked as completed! 🎉`);
                } else {
                    throw new Error(data.message || 'Failed to complete task');
                }
            } else {
                throw new Error('Failed to complete task');
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Failed to complete the task. Please try again.');
        }
    };

    const handleCtaTaskClick = async (taskId: number) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                // Refresh the page to update the task list
                window.location.reload();
            } else {
                alert(data.message || 'Failed to complete task');
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Failed to complete task. Please try again.');
        }
    };

    const handleStageClick = (stageId: number) => {
        // Navigate to Move Details page with the section parameter using Inertia router
        router.visit(`/housemover/move-details?section=${stageId}`);
    };

    const toggleSectionTask = (stageId: number, taskId: string) => {
        setSectionTasks(prev => ({
            ...prev,
            [stageId]: prev[stageId].map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        }));
    };

    const addCustomTask = (stageId: number) => {
        if (newTaskText.trim()) {
            const newTask: SectionTask = {
                id: `${stageId}-custom-${Date.now()}`,
                title: newTaskText.trim(),
                completed: false,
                isCustom: true,
                category: 'Custom'
            };
            
            setSectionTasks(prev => ({
                ...prev,
                [stageId]: [...(prev[stageId] || []), newTask]
            }));
            
            setNewTaskText('');
            setShowTaskCreator(null);
        }
    };

    // Memoized section progress calculation for performance
    const getSectionProgress = useCallback((sectionId: number) => {
        const custom = sectionTasks[sectionId] || [];
        const academy = academyTasks.filter((t) => {
            if (t.sectionId === undefined || t.sectionId === null) {
                // Fallback: untagged academy tasks counted under Planning (section 1)
                return sectionId === 1;
            }
            return t.sectionId === sectionId;
        });

        const total = custom.length + academy.length;
        if (total === 0) return 0;
        const completed = custom.filter(t => t.completed).length + academy.filter(t => t.completed).length;
        return Math.round((completed / total) * 100);
    }, [academyTasks, sectionTasks]);

    // Memoized overall progress calculation
    const overallMoveProgress = useMemo(() => {
        if (!moveStages.length) return 0;
        const sum = moveStages.reduce((acc, stage) => acc + getSectionProgress(stage.id), 0);
        return Math.round(sum / moveStages.length);
    }, [moveStages, getSectionProgress]);

    // Memoized upcoming tasks calculation
    const upcomingTasksMemoized = useMemo(() => {
        const allUpcomingTasks = [];
        
        // First, add CTA tasks from lessons (these are high priority)
        const ctaTasks = upcomingTasks.map(task => ({
            ...task,
            stageId: null,
            stageName: task.source === 'lesson' ? 'Academy' : 'Custom',
            priority: 'high' as const,
            isCtaTask: true,
        }));
        allUpcomingTasks.push(...ctaTasks);
        
        // If we need more tasks, get remaining tasks from current stage
        if (allUpcomingTasks.length < 4) {
            const currentTasks = sectionTasks[activeStage] || [];
            const currentIncompleteTasks = currentTasks.filter(task => !task.completed).slice(0, 4 - allUpcomingTasks.length);
            allUpcomingTasks.push(...currentIncompleteTasks.map(task => ({
                ...task,
                stageId: activeStage,
                stageName: moveStages.find(s => s.id === activeStage)?.shortLabel || '',
                priority: 'medium' as const,
                isCtaTask: false,
            })));
        }
        
        // If we still need more tasks, get tasks from next incomplete stage
        if (allUpcomingTasks.length < 4) {
            const nextStage = moveStages.find(s => s.id > activeStage && !s.completed);
            if (nextStage) {
                const nextTasks = sectionTasks[nextStage.id] || [];
                const nextIncompleteTasks = nextTasks.filter(task => !task.completed).slice(0, 4 - allUpcomingTasks.length);
                allUpcomingTasks.push(...nextIncompleteTasks.map(task => ({
                    ...task,
                    stageId: nextStage.id,
                    stageName: nextStage.shortLabel,
                    priority: 'low' as const,
                    isCtaTask: false,
                })));
            }
        }
        
        return allUpcomingTasks.slice(0, 4);
    }, [upcomingTasks, sectionTasks, activeStage, moveStages]);

    // Memoized CTA tasks by category
    const ctaTasksByCategory = useMemo(() => {
        const ctaTasks = allUserTasks || [];
        return {
            'Pre-Move': ctaTasks.filter(task => task.category === 'Pre-Move'),
            'In-Move': ctaTasks.filter(task => task.category === 'In-Move'),
            'Post-Move': ctaTasks.filter(task => task.category === 'Post-Move')
        };
    }, [allUserTasks]);

    // Match Move Details logic for coloring progress
    const getProgressColor = (progress: number) => (progress > 0 ? 'bg-[#00BCD4]' : 'bg-gray-300');

    // Get upcoming tasks (now uses memoized version)
    const getUpcomingTasks = () => upcomingTasksMemoized;

    // Group CTA tasks by category (now uses memoized version)
    const getCtaTasksByCategory = () => ctaTasksByCategory;

    // Handle CTA task selection/deselection
    const handleCtaTaskToggle = (taskId: string) => {
        setSelectedCtaTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    // Add selected CTA tasks to priority tasks
    const addSelectedTasksToPriority = async () => {
        const tasksToAdd = allUserTasks.filter(task => 
            selectedCtaTasks.has(task.id.toString())
        );

        for (const task of tasksToAdd) {
            const success = await saveToPriorityList(task.id.toString());
            if (success) {
                const newPriorityTask = {
                    id: task.id.toString(),
                    title: task.title,
                    icon: '🎓',
                    dueDate: 'From Academy',
                    urgency: 'moderate' as const,
                    category: task.category,
                    completed: false,
                    estimatedTime: '15 mins',
                    description: task.description,
                };
                setUserPriorityTasks(prev => [...prev, newPriorityTask]);
            }
        }

        setSelectedCtaTasks(new Set());
    };

    // Handle drag start
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    // Handle drop on priority tasks
    const handleDropOnPriority = async (e: React.DragEvent) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const task = allUserTasks.find(t => t.id.toString() === taskId);
        
        if (task && !userPriorityTasks.some(pt => pt.id === taskId)) {
            const success = await saveToPriorityList(taskId);
            if (success) {
                const newPriorityTask = {
                    id: task.id.toString(),
                    title: task.title,
                    icon: '🎓',
                    dueDate: 'From Academy',
                    urgency: 'moderate' as const,
                    category: task.category,
                    completed: false,
                    estimatedTime: '15 mins',
                    description: task.description,
                };
                setUserPriorityTasks(prev => [...prev, newPriorityTask]);
            }
        }
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // Get user priority tasks (only tasks added from Academy Learning Tasks)
    const getCombinedPriorityTasks = () => {
        return userPriorityTasks;
    };

    return (
        <DashboardLayout>
            <Head title="Dashboard Overview" />
            
            {/* Header Section - Enhanced Welcome Banner */}
            <div className="mb-8">
                <EnhancedWelcomeBanner 
                    userName={auth.user.name} 
                    showProgress={true}
                    taskData={{
                        customTasks: Object.fromEntries(
                            Object.entries(sectionTasks).map(([key, tasks]) => [
                                key, 
                                tasks.filter(task => task.isCustom)
                            ])
                        )
                    }}
                />
            </div>

            {/* Main Dashboard Container with Moovey Theme */}
            <div>
                <div>

            {/* Sub-Navigation Tabs */}
            <HousemoverNavigation 
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {/* Main Dashboard Content - Professional Layout with Performance Optimizations */}
            {activeTab === 'overview' && (
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* My House Move Progress Timeline - Lazy Loaded */}
                    {visibleSections.has('journey') ? (
                        <Suspense fallback={<LoadingSkeleton className="h-48" />}>
                            <CompleteMovingJourney
                                overallProgress={overallMoveProgress}
                                moveSections={moveStages.map(stage => ({
                                    id: stage.id,
                                    name: stage.label,
                                    shortName: stage.shortLabel,
                                    description: stage.description,
                                    icon: stage.icon
                                }))}
                                activeSection={activeStage}
                                onSectionClick={handleStageClick}
                                getSectionProgress={getSectionProgress}
                                getProgressColor={getProgressColor}
                                getSectionIcon={getSectionIcon}
                            />
                        </Suspense>
                    ) : (
                        <LoadingSkeleton className="h-48" />
                    )}

                    {/* Learning Journey Section - Lazy Loaded */}
                    {visibleSections.has('learning') ? (
                        <Suspense fallback={<LoadingSkeleton className="h-32" />}>
                            <LearningJourney academyProgress={academyProgress} />
                        </Suspense>
                    ) : (
                        <LoadingSkeleton className="h-32" />
                    )}

                    {/* Property Basket Section - Responsive Component */}
                    <Suspense fallback={<LoadingSkeleton className="h-48" />}>
                        <PropertyBasketSection />
                    </Suspense>

                    {/* Moving Tasks Management Section (CTA Tasks) - Lazy Loaded */}
                    {visibleSections.has('tasks') ? (
                        <Suspense fallback={<LoadingSkeleton className="h-56" />}>
                            <CTATasksManager 
                                selectedCtaTasks={selectedCtaTasks}
                                setSelectedCtaTasks={setSelectedCtaTasks}
                                getCtaTasksByCategory={getCtaTasksByCategory}
                                handleCtaTaskToggle={handleCtaTaskToggle}
                                addSelectedTasksToPriority={addSelectedTasksToPriority}
                                handleDragStart={handleDragStart}
                                handleDropOnPriority={handleDropOnPriority}
                                handleDragOver={handleDragOver}
                            />
                        </Suspense>
                    ) : (
                        <LoadingSkeleton className="h-56" />
                    )}

                    {/* Priority Tasks & Move Countdown Row - Lazy Loaded */}
                    {visibleSections.has('priority') && visibleSections.has('countdown') ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Suspense fallback={<LoadingSkeleton className="h-80" />}>
                                <SimplePriorityTasksWidget 
                                    userPriorityTasks={userPriorityTasks}
                                    setUserPriorityTasks={setUserPriorityTasks}
                                    getCombinedPriorityTasks={getCombinedPriorityTasks}
                                    handleTaskClick={handleTaskClick}
                                    handleTaskComplete={handleTaskComplete}
                                    removeFromPriorityList={removeFromPriorityList}
                                    taskStats={taskStats}
                                    handleDropOnPriority={handleDropOnPriority}
                                    handleDragOver={handleDragOver}
                                />
                            </Suspense>
                            <Suspense fallback={<LoadingSkeleton className="h-80" />}>
                                <SimpleMoveCountdown personalDetails={personalDetails} />
                            </Suspense>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <LoadingSkeleton className="h-80" />
                            <LoadingSkeleton className="h-80" />
                        </div>
                    )}

                    {/* Vouchers & Rewards Section - Lazy Loaded */}
                    {visibleSections.has('vouchers') ? (
                        <Suspense fallback={<LoadingSkeleton className="h-40" />}>
                            <SimpleVouchersRewards />
                        </Suspense>
                    ) : (
                        <LoadingSkeleton className="h-40" />
                    )}

                    {/* Statistics Dashboard - Lazy Loaded */}
                    {visibleSections.has('statistics') ? (
                        <Suspense fallback={<LoadingSkeleton className="h-64" />}>
                            <SimpleStatisticsDashboard />
                        </Suspense>
                    ) : (
                        <LoadingSkeleton className="h-64" />
                    )}

                    {/* Call-to-Action Area - Responsive */}
                    <section className="text-center px-3 sm:px-4 lg:px-6">
                        {/* Mobile CTA */}
                        <div className="block sm:hidden">
                            <a 
                                href="/housemover/move-details" 
                                className="w-full inline-flex items-center justify-center px-6 py-4 bg-[#00BCD4] text-white font-semibold text-base rounded-lg hover:bg-[#00ACC1] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                                Continue Journey
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <p className="text-xs text-gray-600 mt-3">
                                Track your moving progress & complete tasks
                            </p>
                        </div>

                        {/* Tablet CTA */}
                        <div className="hidden sm:block lg:hidden">
                            <a 
                                href="/housemover/move-details" 
                                className="inline-flex items-center px-8 py-4 bg-[#00BCD4] text-white font-semibold text-lg rounded-lg hover:bg-[#00ACC1] transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                                Continue Your Moving Journey
                                <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <p className="text-sm text-gray-600 mt-4">
                                Access detailed move planning tools and track your progress
                            </p>
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden lg:block">
                            <div className="max-w-4xl mx-auto">
                                <h3 className="text-2xl xl:text-3xl font-bold text-[#1A237E] mb-4">
                                    Ready to Take the Next Step?
                                </h3>
                                <p className="text-base xl:text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                                    Access your detailed moving plan, track progress across all stages, and get personalized guidance for your journey.
                                </p>
                                <a 
                                    href="/housemover/move-details" 
                                    className="inline-flex items-center px-10 xl:px-12 py-4 xl:py-5 bg-[#00BCD4] text-white font-semibold text-lg xl:text-xl rounded-lg hover:bg-[#00ACC1] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-6 h-6 xl:w-7 xl:h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                    </svg>
                                    Continue Your Moving Journey
                                    <svg className="ml-3 w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                                
                                {/* Desktop Additional Features */}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl flex items-center justify-center shadow-md mx-auto mb-2">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-medium text-[#1A237E]">Detailed Progress</div>
                                        <div className="text-xs text-gray-600">Track every stage</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl flex items-center justify-center shadow-md mx-auto mb-2">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-medium text-[#1A237E]">Task Management</div>
                                        <div className="text-xs text-gray-600">Organize & prioritize</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-xl flex items-center justify-center shadow-md mx-auto mb-2">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm font-medium text-[#1A237E]">Personal Guidance</div>
                                        <div className="text-xs text-gray-600">Customized support</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Performance Monitoring - Hidden */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="hidden">
                            <div>Cache Size: {API_CACHE.size}</div>
                            <div>Data Version: {dataVersion}</div>
                            <div>Visible Sections: {Array.from(visibleSections).join(', ')}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Chain Checker Tab now routes to dedicated page */}
            {/* Settings Tab now routes to Profile Settings page; no internal rendering here */}



            </div>
            </div>

        </DashboardLayout>
    );
}