import { Head } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import SubNavigationTabs from '@/components/housemover/SubNavigationTabs';
import CompleteMovingJourney from '@/components/housemover/CompleteMovingJourney';
import LearningJourney from '@/components/housemover/overview/LearningJourney';
import CTATasksManager from '@/components/housemover/overview/CTATasksManager';
import SimplePriorityTasksWidget from '@/components/housemover/overview/SimplePriorityTasksWidget';
import SimpleMoveCountdown from '@/components/housemover/overview/SimpleMoveCountdown';
import SimpleVouchersRewards from '@/components/housemover/overview/SimpleVouchersRewards';
import SimpleStatisticsDashboard from '@/components/housemover/overview/SimpleStatisticsDashboard';

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
    const getInitialTab = (): 'overview' | 'move-details' | 'achievements' | 'connections' => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab');
            const validTabs = ['overview', 'move-details', 'achievements', 'connections'];
            if (tabParam && validTabs.includes(tabParam)) {
                return tabParam as 'overview' | 'move-details' | 'achievements' | 'connections';
            }
        }
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState<'overview' | 'move-details' | 'achievements' | 'connections'>(getInitialTab());
    const [activeStage, setActiveStage] = useState<number>(2);

    // Navigation tabs configuration
    const navigationTabs = [
        { id: 'overview', icon: '🏠', label: 'OVERVIEW' },
        { id: 'move-details', icon: '📋', label: 'MOVE DETAILS', route: '/housemover/move-details' },
        { id: 'achievements', icon: '🏆', label: 'ACHIEVEMENTS', route: '/housemover/achievements' },
        { id: 'connections', icon: '🔗', label: 'CONNECTIONS', route: '/housemover/connections' },
        { id: 'settings', icon: '⚙️', label: 'SETTINGS', route: '/profile-settings' }
    ];

    // Function to handle tab change with URL update
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId as 'overview' | 'move-details' | 'achievements' | 'connections');
        
        // Update URL without page refresh
        const url = new URL(window.location.href);
        if (tabId === 'overview') {
            url.searchParams.delete('tab'); // Remove tab param for default overview
        } else {
            url.searchParams.set('tab', tabId);
        }
        window.history.pushState({}, '', url.toString());
    };

    // Load priority tasks on component mount
    useEffect(() => {
        loadPriorityTasks();
    }, []);

    // Load priority tasks from backend
    const loadPriorityTasks = async () => {
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
                }
            }
        } catch (error) {
            console.error('Failed to load priority tasks:', error);
        }
    };

    // Save task to priority list
    const saveToPriorityList = async (taskId: string) => {
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
                return data.success;
            }
        } catch (error) {
            console.error('Failed to save task to priority list:', error);
        }
        return false;
    };

    // Remove task from priority list
    const removeFromPriorityList = async (taskId: string) => {
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
                return data.success;
            }
        } catch (error) {
            console.error('Failed to remove task from priority list:', error);
        }
        return false;
    };
    const [showTaskCreator, setShowTaskCreator] = useState<number | null>(null);
    const [newTaskText, setNewTaskText] = useState('');
    const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(personalDetailsFromProps);
    const [selectedCtaTasks, setSelectedCtaTasks] = useState<Set<string>>(new Set());
    const [userPriorityTasks, setUserPriorityTasks] = useState<Task[]>([]);

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

    // Academy tasks (from lessons), fetched similarly to Move Details for parity
    const [academyTasks, setAcademyTasks] = useState<AcademyTask[]>([]);
    useEffect(() => {
        const loadAcademyTasks = async () => {
            try {
                const res = await fetch('/api/tasks', {
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
                setAcademyTasks(mapped);
            } catch (e) {
                // silent fail
            }
        };
        loadAcademyTasks();
    }, []);

    // Load custom tasks created in Move Details (from custom_tasks table)
    useEffect(() => {
        let isMounted = true;

        const loadCustomTasks = async () => {
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
                if (isMounted) setSectionTasks(next);
            } catch (_) {
                // ignore
            }
        };

        loadCustomTasks();

        // Refresh when the window/tab regains focus to pick up changes from Move Details page
        const onFocus = () => loadCustomTasks();
        window.addEventListener('focus', onFocus);
        return () => {
            isMounted = false;
            window.removeEventListener('focus', onFocus);
        };
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
        setActiveStage(stageId);
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

    // Compute section progress identical to Move Details: combine custom + academy tasks.
    const getSectionProgress = (sectionId: number) => {
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
    };

    // Overall progress: average of section progresses
    const overallMoveProgress = useMemo(() => {
        if (!moveStages.length) return 0;
        const sum = moveStages.reduce((acc, stage) => acc + getSectionProgress(stage.id), 0);
        return Math.round(sum / moveStages.length);
    }, [moveStages, academyTasks, sectionTasks]);

    // Match Move Details logic for coloring progress
    const getProgressColor = (progress: number) => (progress > 0 ? 'bg-[#00BCD4]' : 'bg-gray-300');

    // Get upcoming tasks from CTA buttons and current/next stages
    const getUpcomingTasks = () => {
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
    };

    // Group CTA tasks by category
    const getCtaTasksByCategory = () => {
        // Use allUserTasks to get all tasks, not just the limited upcomingTasks
        const ctaTasks = allUserTasks || [];
        return {
            'Pre-Move': ctaTasks.filter(task => task.category === 'Pre-Move'),
            'In-Move': ctaTasks.filter(task => task.category === 'In-Move'),
            'Post-Move': ctaTasks.filter(task => task.category === 'Post-Move')
        };
    };

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
                <EnhancedWelcomeBanner userName={auth.user.name} />
            </div>

            {/* Main Dashboard Container with Moovey Theme */}
            <div>
                <div>

            {/* Sub-Navigation Tabs */}
            <SubNavigationTabs 
                activeTab={activeTab}
                tabs={navigationTabs}
                onTabChange={handleTabChange}
            />

            {/* Main Dashboard Content - Professional Layout */}
            {activeTab === 'overview' && (
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Complete Moving Journey Timeline */}
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
                    />

                    {/* Learning Journey Section */}
                    <LearningJourney academyProgress={academyProgress} />

                    {/* Moving Tasks Management Section (CTA Tasks) */}
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

                    {/* Priority Tasks & Move Countdown Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <SimpleMoveCountdown personalDetails={personalDetails} />
                    </div>

                    {/* Vouchers & Rewards Section */}
                    <SimpleVouchersRewards />

                    {/* Statistics Dashboard */}
                    <SimpleStatisticsDashboard />

                    {/* Call-to-Action Area */}
                    <section className="text-center">
                        <a 
                            href="/housemover/move-details" 
                            className="inline-flex items-center px-10 py-4 bg-[#00BCD4] text-white font-semibold text-lg rounded-lg hover:bg-[#00ACC1] transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Continue Your Moving Journey
                            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                    </section>
                </div>
            )}

            {/* Settings Tab */}
            {/* Settings tab now routes to Profile Settings page; no internal rendering here */}



            </div>
            </div>

        </DashboardLayout>
    );
}