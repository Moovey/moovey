import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import EnhancedWelcomeBanner from '@/components/enhanced-welcome-banner';
import WelcomeFooter from '@/components/welcome/welcome-footer';
import OverviewTab from '@/components/housemover/OverviewTab';
import SubNavigationTabs from '@/components/housemover/SubNavigationTabs';

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
    isCustom: boolean;
    category: string;
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

    // Calculate overall move progress
    const overallMoveProgress = Math.round(
        moveStages.reduce((acc, stage) => acc + stage.progress, 0) / moveStages.length
    );

    // Section-specific tasks
    const [sectionTasks, setSectionTasks] = useState<Record<number, SectionTask[]>>({
        1: [
            { id: '1-1', title: 'Set moving budget', completed: true, isCustom: false, category: 'Financial' },
            { id: '1-2', title: 'Create moving timeline', completed: true, isCustom: false, category: 'Planning' },
            { id: '1-3', title: 'Research moving companies', completed: true, isCustom: false, category: 'Research' },
            { id: '1-4', title: 'Create moving folder/documents', completed: false, isCustom: false, category: 'Organization' }
        ],
        2: [
            { id: '2-1', title: 'Obtain property valuation', completed: true, isCustom: false, category: 'Property' },
            { id: '2-2', title: 'Declutter and deep clean', completed: true, isCustom: false, category: 'Preparation' },
            { id: '2-3', title: 'Make necessary repairs', completed: false, isCustom: false, category: 'Maintenance' },
            { id: '2-4', title: 'Stage home for viewings', completed: false, isCustom: false, category: 'Presentation' }
        ],
        3: [
            { id: '3-1', title: 'Connect with estate agent', completed: true, isCustom: false, category: 'Professional' },
            { id: '3-2', title: 'Attend property viewings', completed: true, isCustom: false, category: 'Viewing' },
            { id: '3-3', title: 'Research neighborhood amenities', completed: false, isCustom: false, category: 'Research' },
            { id: '3-4', title: 'Make property offer', completed: false, isCustom: false, category: 'Negotiation' }
        ],
        4: [
            { id: '4-1', title: 'Apply for mortgage pre-approval', completed: false, isCustom: false, category: 'Mortgage' },
            { id: '4-2', title: 'Gather financial documents', completed: false, isCustom: false, category: 'Documentation' },
            { id: '4-3', title: 'Arrange property insurance', completed: false, isCustom: false, category: 'Insurance' },
            { id: '4-4', title: 'Secure deposit funds', completed: false, isCustom: false, category: 'Financial' }
        ],
        5: [
            { id: '5-1', title: 'Hire conveyancing solicitor', completed: false, isCustom: false, category: 'Legal' },
            { id: '5-2', title: 'Arrange property survey', completed: false, isCustom: false, category: 'Survey' },
            { id: '5-3', title: 'Review and sign contracts', completed: false, isCustom: false, category: 'Contracts' },
            { id: '5-4', title: 'Complete property searches', completed: false, isCustom: false, category: 'Due Diligence' }
        ],
        6: [
            { id: '6-1', title: 'Book removal company', completed: false, isCustom: false, category: 'Services' },
            { id: '6-2', title: 'Order packing supplies', completed: false, isCustom: false, category: 'Supplies' },
            { id: '6-3', title: 'Start packing non-essentials', completed: false, isCustom: false, category: 'Packing' },
            { id: '6-4', title: 'Label boxes systematically', completed: false, isCustom: false, category: 'Organization' }
        ],
        7: [
            { id: '7-1', title: 'Confirm moving day logistics', completed: false, isCustom: false, category: 'Coordination' },
            { id: '7-2', title: 'Pack essential items box', completed: false, isCustom: false, category: 'Essentials' },
            { id: '7-3', title: 'Take meter readings', completed: false, isCustom: false, category: 'Utilities' },
            { id: '7-4', title: 'Conduct final walkthrough', completed: false, isCustom: false, category: 'Inspection' }
        ],
        8: [
            { id: '8-1', title: 'Unpack essential rooms first', completed: false, isCustom: false, category: 'Unpacking' },
            { id: '8-2', title: 'Set up utilities and internet', completed: false, isCustom: false, category: 'Services' },
            { id: '8-3', title: 'Register with local services', completed: false, isCustom: false, category: 'Registration' },
            { id: '8-4', title: 'Explore local amenities', completed: false, isCustom: false, category: 'Community' }
        ],
        9: [
            { id: '9-1', title: 'Update address with bank/employer', completed: false, isCustom: false, category: 'Administrative' },
            { id: '9-2', title: 'Register children for new schools', completed: false, isCustom: false, category: 'Education' },
            { id: '9-3', title: 'Find new healthcare providers', completed: false, isCustom: false, category: 'Healthcare' },
            { id: '9-4', title: 'Join community groups/clubs', completed: false, isCustom: false, category: 'Social' }
        ]
    });

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

    const getSectionProgress = (stageId: number) => {
        const tasks = sectionTasks[stageId] || [];
        if (tasks.length === 0) return 0;
        const completedTasks = tasks.filter(task => task.completed).length;
        return Math.round((completedTasks / tasks.length) * 100);
    };

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
                <OverviewTab
                    overallMoveProgress={overallMoveProgress}
                    moveStages={moveStages}
                    activeStage={activeStage}
                    handleStageClick={handleStageClick}
                    academyProgress={academyProgress}
                    allUserTasks={allUserTasks}
                    selectedCtaTasks={selectedCtaTasks}
                    setSelectedCtaTasks={setSelectedCtaTasks}
                    userPriorityTasks={userPriorityTasks}
                    setUserPriorityTasks={setUserPriorityTasks}
                    getCtaTasksByCategory={getCtaTasksByCategory}
                    handleCtaTaskToggle={handleCtaTaskToggle}
                    addSelectedTasksToPriority={addSelectedTasksToPriority}
                    handleDragStart={handleDragStart}
                    handleDropOnPriority={handleDropOnPriority}
                    handleDragOver={handleDragOver}
                    getCombinedPriorityTasks={getCombinedPriorityTasks}
                    handleTaskClick={handleTaskClick}
                    handleTaskComplete={handleTaskComplete}
                    removeFromPriorityList={removeFromPriorityList}
                    taskStats={taskStats}
                    personalDetails={personalDetails}
                />
            )}

            {/* Settings Tab */}
            {/* Settings tab now routes to Profile Settings page; no internal rendering here */}



            </div>
            </div>

        </DashboardLayout>
    );
}