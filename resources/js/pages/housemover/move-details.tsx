import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import HousemoverNavigation from '@/components/housemover/HousemoverNavigation';
import CompleteMovingJourney from '@/components/housemover/CompleteMovingJourney';
import PropertyBasket from '@/components/housemover/chain-checker/PropertyBasket';
import LocationAutocomplete from '@/components/community/shared/LocationAutocomplete';
import { toast } from 'react-toastify';

type TaskCategory = 'pre-move' | 'in-move' | 'post-move';

// Tasks added from lessons (Academy) and stored via TaskController
interface AcademyTask {
    id: string; // keep as string for UI consistency
    title: string;
    description?: string;
    category: string; // expects 'Pre-Move' | 'In-Move' | 'Post-Move'
    completed: boolean;
    urgency?: string;
    source?: string; // 'lesson' | 'custom' | ...
    // Optional association to a move section (1..9). If present we only show the task in that section
    sectionId?: number;
}

interface SectionTask {
    id: string;
    title: string;
    description?: string;
    category?: TaskCategory | string;
    completed: boolean;
    isCustom?: boolean;
    completedDate?: string;
}

interface PersonalDetails {
    currentAddress: string;
    newAddress: string;
    movingDate: string;
    budget: string;
    movingType: 'rental' | 'purchase' | 'sale' | 'rental-to-rental' | 'rental-to-purchase';
    targetArea: string;
    propertyRequirements: string;
    solicitorContact: string;
    keyDates: string;
}

interface MoveSection {
    id: number;
    name: string;
    shortName: string;
    description: string;
    icon: string;
}

interface MoveDetailsProps {
    auth: { user: { name: string; email?: string } };
    moveDetails?: Partial<PersonalDetails> & { movingType?: PersonalDetails['movingType']; activeSection?: number };
    taskData?: {
        recommendedTaskStates?: Record<string, Record<string, { completed: boolean; completedDate?: string }>>;
        customTasks?: Record<string, Array<SectionTask>>;
    };
}

export default function MoveDetails({ auth, moveDetails, taskData }: MoveDetailsProps) {
    // Sections
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

    const moveSections: MoveSection[] = [
        { id: 1, name: 'Planning & Budgeting', shortName: 'Planning', description: 'Set your moving goals, timeline, and budget', icon: 'planning' },
        { id: 2, name: 'Sell/Prep Current Home', shortName: 'Prep Home', description: 'Prepare your current property for sale or transition', icon: 'home' },
        { id: 3, name: 'Find New Property', shortName: 'Find Property', description: 'Search and secure your new home', icon: 'search' },
        { id: 4, name: 'Secure Finances', shortName: 'Finances', description: 'Arrange mortgage, deposits, and financial requirements', icon: 'money' },
        { id: 5, name: 'Legal & Admin', shortName: 'Legal', description: 'Handle contracts, surveys, and legal requirements', icon: 'legal' },
        { id: 6, name: 'Packing & Removal', shortName: 'Packing', description: 'Organize packing and book removal services', icon: 'box' },
        { id: 7, name: 'Move Day Execution', shortName: 'Move Day', description: 'Coordinate and execute the moving day', icon: 'truck' },
        { id: 8, name: 'Settling In', shortName: 'Settling', description: 'Unpack and establish yourself in your new home', icon: 'settling' },
        { id: 9, name: 'Post Move Integration', shortName: 'Integration', description: 'Complete address changes and community integration', icon: 'sparkle' },
    ];

    // UI state - initialize from database or default to 1
    const [activeSection, setActiveSection] = useState<number>(moveDetails?.activeSection ?? 1);
    const [saving, setSaving] = useState(false);
    const [showCustomTaskInput, setShowCustomTaskInput] = useState(false);
    const [newCustomTask, setNewCustomTask] = useState('');
    const [newCustomTaskDescription, setNewCustomTaskDescription] = useState('');
    // Collapsible categories state
    const [collapsedCategories, setCollapsedCategories] = useState<Record<TaskCategory, boolean>>({
        'pre-move': true,
        'in-move': true,
        'post-move': true,
    });

    const toggleCategoryCollapsed = (category: TaskCategory) => {
        setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    // Allow query param override (e.g., ?section=1) - database value already set as initial state
    useEffect(() => {
        try {
            const url = new URL(window.location.href);
            const qp = url.searchParams.get('section');
            if (qp) {
                const num = parseInt(qp, 10);
                if (!Number.isNaN(num) && num >= 1 && num <= 9) {
                    setActiveSection(num);
                }
            }
        } catch {/* noop */}
    }, []);

    // Personal details
    const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
        currentAddress: moveDetails?.currentAddress ?? '',
        newAddress: moveDetails?.newAddress ?? '',
        movingDate: moveDetails?.movingDate ?? '',
        budget: moveDetails?.budget ?? '',
        movingType: (moveDetails?.movingType as PersonalDetails['movingType']) ?? 'purchase',
        targetArea: moveDetails?.targetArea ?? '',
        propertyRequirements: moveDetails?.propertyRequirements ?? '',
        solicitorContact: moveDetails?.solicitorContact ?? '',
        keyDates: moveDetails?.keyDates ?? '',
    });

    // Section tasks (custom tasks only). Initialize empty; no sample tasks.
    const [sectionTasks, setSectionTasks] = useState<Record<number, SectionTask[]>>({
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
    });

    // Academy tasks from lessons
    const [academyTasks, setAcademyTasks] = useState<AcademyTask[]>([]);

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
                    // Backend returns status 'pending' | 'completed' and/or completed_at
                    completed: (t.status ? t.status === 'completed' : false) || !!t.completed_at || !!t.completed,
                    urgency: t.urgency,
                    // Prefer top-level source, fallback to metadata.source
                    source: t.source ?? t.metadata?.source,
                    // Try several possible shapes for section id coming from backend
                    sectionId: (() => {
                        const raw = t.section_id ?? t.sectionId ?? t.section?.id;
                        if (raw === undefined || raw === null || raw === '') return undefined;
                        const num = typeof raw === 'number' ? raw : parseInt(raw, 10);
                        return Number.isNaN(num) ? undefined : num;
                    })(),
                }))
                // Prefer tasks created from lessons
                .filter((t: AcademyTask) => !t.source || t.source === 'lesson');
                setAcademyTasks(mapped);
            } catch (e) {
                // fail silently
            }
        };
        loadAcademyTasks();
    }, []);

    // Merge backend state/custom tasks
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

    // Persist active section to database
    useEffect(() => {
        const saveActiveSection = async () => {
            try {
                await fetch('/api/move-details', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ activeSection }),
                });
                // Also keep localStorage as fallback for immediate UI sync
                localStorage.setItem('moveDetails.activeSection', String(activeSection));
            } catch (e) {
                // Silently fail - localStorage serves as fallback
                try { localStorage.setItem('moveDetails.activeSection', String(activeSection)); } catch {/* noop */}
            }
        };
        saveActiveSection();
    }, [activeSection]);

    // Progress calculations now include: custom tasks + academy tasks assigned to the section
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

    const overallProgress = useMemo(() => {
        const total = moveSections.reduce((acc, s) => acc + getSectionProgress(s.id), 0);
        return Math.round(total / moveSections.length);
    }, [sectionTasks, academyTasks]);

    // Helpers
    const getProgressColor = (progress: number) => (progress > 0 ? 'bg-[#00BCD4]' : 'bg-gray-300');
    const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const toggleTask = async (sectionId: number, taskId: string) => {
        const task = (sectionTasks[sectionId] || []).find(t => t.id === taskId);
        if (!task) return;
        const newCompleted = !task.completed;
        setSectionTasks(prev => ({
            ...prev,
            [sectionId]: prev[sectionId].map(t => (t.id === taskId ? { ...t, completed: newCompleted, completedDate: newCompleted ? new Date().toISOString().split('T')[0] : undefined } : t)),
        }));
        try {
            if (task.isCustom) {
                const res = await fetch(`/api/move-details/custom-tasks/${encodeURIComponent(taskId)}/toggle`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({ section_id: sectionId, completed: newCompleted }),
                });
                if (!res.ok) throw new Error('Toggle failed');
            } else {
                const res = await fetch('/api/move-details/recommended-task', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                    body: JSON.stringify({ section_id: sectionId, task_id: taskId, completed: newCompleted }),
                });
                if (!res.ok) throw new Error('Toggle failed');
            }
        } catch (e) {
            setSectionTasks(prev => ({
                ...prev,
                [sectionId]: prev[sectionId].map(t => (t.id === taskId ? { ...t, completed: !newCompleted, completedDate: !newCompleted ? new Date().toISOString().split('T')[0] : undefined } : t)),
            }));
            toast.error('Failed to update task status');
        }
    };

    const addCustomTask = async (sectionId: number) => {
        if (!newCustomTask.trim()) {
            toast.warn('Please enter a task title first');
            return;
        }
        try {
            const res = await fetch('/api/move-details/custom-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ section_id: sectionId, title: newCustomTask.trim(), description: newCustomTaskDescription.trim() }),
            });
            const data = await res.json();
            if (data?.success && data.task) {
                const customTask: SectionTask = { ...data.task, isCustom: true };
                setSectionTasks(prev => ({ ...prev, [sectionId]: [...(prev[sectionId] || []), customTask] }));
                setNewCustomTask('');
                setNewCustomTaskDescription('');
                setShowCustomTaskInput(false);
                toast.success('Custom task added');
            } else {
                toast.error('Could not add task');
            }
        } catch (e) {
            toast.error('Failed to add custom task');
        }
    };

    const removeCustomTask = async (sectionId: number, taskId: string) => {
        const prevState = sectionTasks;
        setSectionTasks(prev => ({ ...prev, [sectionId]: prev[sectionId].filter(t => t.id !== taskId) }));
        try {
            const res = await fetch(`/api/move-details/custom-tasks/${encodeURIComponent(taskId)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ section_id: sectionId }),
            });
            if (!res.ok) throw new Error('Delete failed');
            toast.info('Custom task removed');
        } catch (e) {
            setSectionTasks(prevState);
            toast.error('Failed to remove task');
        }
    };

    const getCategoryTasks = (sectionId: number, category: TaskCategory | 'custom') => {
        const tasks = sectionTasks[sectionId] || [];
        if (category === 'custom') return tasks.filter(t => t.isCustom);
        return [];
    };

    // Academy task helpers
    const categoryTitleMap: Record<TaskCategory, string> = {
        'pre-move': 'Pre-Move',
        'in-move': 'In-Move',
        'post-move': 'Post-Move',
    };

    const getAcademyTasksByCategory = (category: TaskCategory): AcademyTask[] => {
        const wanted = categoryTitleMap[category];
        return academyTasks.filter(t => {
            const matchesCategory = (t.category || '').toLowerCase() === wanted.toLowerCase();
            if (!matchesCategory) return false;
            // If not tagged with a section yet, show only in section 1 (Planning) as transitional fallback
            if (t.sectionId == null) return activeSection === 1;
            return t.sectionId === activeSection;
        });
    };

    const completeAcademyTask = async (taskId: string) => {
        // Optimistic update to completed
        setAcademyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
        try {
            await fetch(`/api/tasks/${encodeURIComponent(taskId)}/complete`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ completed: true })
            });
        } catch (e) {
            // revert if failed
            setAcademyTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: false } : t));
        }
    };

    const updatePersonalDetail = (field: keyof PersonalDetails, value: string) => {
        setPersonalDetails(prev => ({ ...prev, [field]: value }));
    };

    const savePersonalDetails = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/move-details', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken(), 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({
                    currentAddress: personalDetails.currentAddress,
                    newAddress: personalDetails.newAddress,
                    movingDate: personalDetails.movingDate,
                    budget: personalDetails.budget,
                    movingType: personalDetails.movingType,
                    targetArea: personalDetails.targetArea,
                    propertyRequirements: personalDetails.propertyRequirements,
                    solicitorContact: personalDetails.solicitorContact,
                    keyDates: personalDetails.keyDates,
                }),
            });
            if (!res.ok) throw new Error('Save failed');
            toast.success('Details saved');
        } catch (e) {
            toast.error('Failed to save details');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <Head title="My Move" />

            <div className="mb-8">
                <EnhancedWelcomeBanner userName={auth.user.name} showProgress={true} taskData={taskData} />
            </div>

            <div>
                <div>
                    <HousemoverNavigation activeTab="move-details" />

                    {/* Toast notifications handle feedback; inline banner removed */}

                    <CompleteMovingJourney
                        overallProgress={overallProgress}
                        moveSections={moveSections}
                        activeSection={activeSection}
                        onSectionClick={setActiveSection}
                        getSectionProgress={getSectionProgress}
                        getProgressColor={getProgressColor}
                        getSectionIcon={getSectionIcon}
                    />

                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl ${getProgressColor(getSectionProgress(activeSection))}`}>
                                    {getSectionIcon(moveSections.find(s => s.id === activeSection)?.icon || '')}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[#1A237E]">{moveSections.find(s => s.id === activeSection)?.name}</h2>
                                    <p className="text-gray-600">{moveSections.find(s => s.id === activeSection)?.description}</p>
                                </div>
                            </div>
                            <div className="text-right bg-[#E0F7FA] rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-bold text-[#1A237E]">{getSectionProgress(activeSection)}%</div>
                                <div className="text-sm font-medium text-gray-600">Section Progress</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(getSectionProgress(activeSection))}`} style={{ width: `${getSectionProgress(activeSection)}%` }} />
                            </div>
                        </div>

                        {(activeSection === 1 || activeSection === 3 || activeSection === 5) && (
                            <div id="personal-details" className="bg-blue-50 rounded-lg p-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <div className="mr-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-6h0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    Personal Details for {moveSections.find(s => s.id === activeSection)?.name}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeSection === 1 && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                                                <LocationAutocomplete
                                                    value={personalDetails.currentAddress}
                                                    onChange={(value) => updatePersonalDetail('currentAddress', value)}
                                                    placeholder="Enter your current address"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[#1A237E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Move Date</label>
                                                <input type="date" value={personalDetails.movingDate} onChange={e => updatePersonalDetail('movingDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[#1A237E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4]" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                                                <input type="text" value={personalDetails.budget} onChange={e => updatePersonalDetail('budget', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[#1A237E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4]" placeholder="e.g., £200,000 - £250,000" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Moving Type</label>
                                                <select value={personalDetails.movingType} onChange={e => updatePersonalDetail('movingType', e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[#1A237E] focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4]">
                                                    <option value="rental">Rental to Rental</option>
                                                    <option value="purchase">First Time Purchase</option>
                                                    <option value="sale">Sale and Purchase</option>
                                                    <option value="rental-to-rental">Rental to Purchase</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {activeSection === 3 && (
                                        <>
                                            <div className="col-span-1 md:col-span-2">
                                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                        <div className="mr-3">
                                                            <div className="w-6 h-6 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V9.375c0-.621.504-1.125 1.125-1.125H20.25M8.25 21l10.5 0m-11.25-9.375h11.25C18.621 11.625 19.125 11.121 19.125 10.5V9.15c0-.201-.075-.402-.225-.563L12.375 2.062a.75.75 0 00-1.061 0L4.8 8.587c-.15.161-.225.362-.225.563v.939c0 .621.504 1.125 1.125 1.125z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        Property Search & Basket
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-6">
                                                        Manage your property interests, add properties from Rightmove, and track your moving journey.
                                                    </p>
                                                    <PropertyBasket />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {activeSection === 5 && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Solicitor Contact</label>
                                                <input type="text" value={personalDetails.solicitorContact} onChange={e => updatePersonalDetail('solicitorContact', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[#1A237E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4]" placeholder="Solicitor name and contact details" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Key Dates & Notes</label>
                                                <textarea value={personalDetails.keyDates} onChange={e => updatePersonalDetail('keyDates', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-[#1A237E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4]" rows={3} placeholder="Important dates, deadlines, reminders..." />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={savePersonalDetails} className={`px-6 py-3 rounded-lg font-semibold shadow-md text-white transition-colors ${saving ? 'bg-[#80DEEA] cursor-not-allowed' : 'bg-[#00BCD4] hover:bg-[#00ACC1]'}`} disabled={saving}>
                                        {saving ? 'Saving…' : 'Save Details'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold text-[#1A237E] mb-6 flex items-center">
                                    <div className="mr-4">
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#00BCD4] to-[#17B7C7] rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                            </svg>
                                        </div>
                                    </div>
                                    Your Tasks from Academy
                                </h3>

                                <div className="space-y-6">
                                    {(['pre-move', 'in-move', 'post-move'] as TaskCategory[]).map(category => {
                                        const categoryTasks = getAcademyTasksByCategory(category);
                                        const categoryTitle = category === 'pre-move' ? 'Pre-Move' : category === 'in-move' ? 'In-Move' : 'Post-Move';
                                        const categoryIcon = category === 'pre-move' ? (
                                            <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                            </svg>
                                        ) : category === 'in-move' ? (
                                            <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V8.5a1.5 1.5 0 011.5-1.5h3.25V15a1.5 1.5 0 01-1.5 1.5H8.25zM10.5 18.75a1.5 1.5 0 01-1.5-1.5V15h1.5v3.75zm4.5-13.5V15a1.5 1.5 0 001.5 1.5h3.25a1.5 1.5 0 003-0V8.5a1.5 1.5 0 00-1.5-1.5H15zm4.5 13.5a1.5 1.5 0 01-1.5-1.5V15h1.5v3.75z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                            </svg>
                                        );
                                        return (
                                            <div key={category} className="border-2 border-[#00BCD4] bg-white rounded-xl p-0 shadow-lg overflow-hidden">
                                                <button type="button" onClick={() => toggleCategoryCollapsed(category)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#E0F7FA]/40 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0">{categoryIcon}</div>
                                                        <span className="font-bold text-[#1A237E] text-lg">{categoryTitle}</span>
                                                        <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">{categoryTasks.length}</span>
                                                    </div>
                                                    <svg className={`w-5 h-5 text-[#1A237E] transition-transform ${collapsedCategories[category] ? '-rotate-90' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>

                                                {!collapsedCategories[category] && (
                                                    categoryTasks.length > 0 ? (
                                                    <div className="space-y-3 px-6 pb-6">
                                                        {categoryTasks.map(task => (
                                                            <div key={task.id} className={`flex items-start space-x-3 p-4 rounded-lg transition-all duration-200 ${task.completed ? 'bg-[#E0F7FA] border-2 border-[#00BCD4] shadow-md' : 'bg-[#F5F5F5] border-2 border-gray-200 hover:border-[#00BCD4] hover:shadow-md'}`}>
                                                                <label className="flex items-center mt-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={task.completed}
                                                                        disabled={task.completed}
                                                                        onChange={() => !task.completed && completeAcademyTask(task.id)}
                                                                        className="w-5 h-5 text-[#00BCD4] bg-gray-100 border-gray-300 rounded focus:ring-[#00BCD4] focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
                                                                    />
                                                                </label>
                                                                <div className="flex-1">
                                                                    <div className={`font-semibold ${task.completed ? 'text-[#1A237E] line-through' : 'text-[#1A237E]'}`}>{task.title}</div>
                                                                    {task.description && <div className="text-sm text-gray-600 mt-1">{task.description}</div>}
                                                                    {task.source === 'lesson' && <div className="text-xs text-[#00BCD4] font-medium mt-1">From Academy</div>}
                                                                </div>
                                                                {task.completed && (
                                                                    <div className="text-[#00BCD4] mt-1">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    ) : (
                                                        <div className="px-6 pb-6">
                                                            <div className="p-6 rounded-lg bg-[#F5F5F5] text-gray-600 text-sm text-center border-2 border-dashed border-gray-300">No {categoryTitle} tasks in this section.</div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                        <div className="mr-4">
                                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        </div>
                                        Your Custom Tasks
                                    </h3>
                                    <button onClick={() => setShowCustomTaskInput(!showCustomTaskInput)} className="flex items-center space-x-2 px-6 py-3 bg-[#00BCD4] text-white rounded-xl hover:bg-[#00ACC1] transition-colors duration-200 font-semibold shadow-md">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Add Custom Task</span>
                                    </button>
                                </div>

                                {showCustomTaskInput && (
                                    <div className="bg-[#E0F7FA] border-2 border-[#00BCD4] rounded-xl p-6 mb-6 shadow-lg">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-[#1A237E] mb-2">Task Title</label>
                                                <input
                                                    type="text"
                                                    value={newCustomTask}
                                                    onChange={e => setNewCustomTask(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#1A237E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-colors"
                                                    placeholder="e.g. Book removal company"
                                                    aria-label="Custom task title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-[#1A237E] mb-2">Description (Optional)</label>
                                                <textarea
                                                    value={newCustomTaskDescription}
                                                    onChange={e => setNewCustomTaskDescription(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-[#1A237E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#00BCD4] transition-colors"
                                                    rows={2}
                                                    placeholder="e.g. Get 3 quotes from local movers"
                                                    aria-label="Custom task description"
                                                />
                                            </div>
                                            <div className="flex space-x-3">
                                                <button onClick={() => addCustomTask(activeSection)} className="px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-colors font-semibold shadow-md">Add Task</button>
                                                <button onClick={() => { setShowCustomTaskInput(false); setNewCustomTask(''); setNewCustomTaskDescription(''); }} className="px-6 py-3 bg-[#F5F5F5] text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {getCategoryTasks(activeSection, 'custom').map(task => (
                                        <div key={task.id} className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all duration-200 shadow-md ${task.completed ? 'bg-[#E0F7FA] border-[#00BCD4]' : 'bg-white border-gray-200 hover:border-[#00BCD4] hover:shadow-lg'}`}>
                                            <label className="flex items-center cursor-pointer mt-1">
                                                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(activeSection, task.id)} className="w-5 h-5 text-[#00BCD4] bg-gray-100 border-gray-300 rounded focus:ring-[#00BCD4] focus:ring-2" />
                                            </label>
                                            <div className="flex-1">
                                                <div className={`font-semibold ${task.completed ? 'text-[#1A237E] line-through' : 'text-[#1A237E]'}`}>{task.title}</div>
                                                {task.description && <div className="text-sm text-gray-600 mt-1">{task.description}</div>}
                                                <div className="text-xs text-[#00BCD4] font-medium mt-1">Custom Task</div>
                                                {task.completedDate && <div className="text-xs text-[#00BCD4] font-medium mt-1">✅ Completed on {new Date(task.completedDate).toLocaleDateString('en-GB')}</div>}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {task.completed && (
                                                    <div className="text-[#00BCD4]">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <button onClick={() => removeCustomTask(activeSection, task.id)} className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200" title="Remove custom task">
                                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {getCategoryTasks(activeSection, 'custom').length === 0 && (
                                        <div className="text-center py-12 bg-[#F5F5F5] rounded-xl">
                                            <div className="mb-4 flex justify-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-lg mb-2 text-[#1A237E] font-semibold">No custom tasks yet</p>
                                            <p className="text-sm text-gray-600">Click "Add Custom Task" to create personalized tasks for this section</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Section Navigation</h4>
                            <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
                                {moveSections.map(section => (
                                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={`p-3 rounded-lg text-center transition-all duration-200 ${
                                        activeSection === section.id
                                            ? 'bg-[#00BCD4] text-white border-2 border-[#00BCD4]'
                                            : getSectionProgress(section.id) === 100
                                            ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                                            : getSectionProgress(section.id) > 0
                                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 hover:bg-yellow-200'
                                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                                    }`}>
                                        <div className="text-lg mb-1 flex justify-center">
                                            <div className="w-5 h-5">{getSectionIcon(section.icon)}</div>
                                        </div>
                                        <div className="text-xs font-medium">{section.shortName}</div>
                                        <div className="text-xs">{getSectionProgress(section.id)}%</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

