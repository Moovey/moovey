import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    created_at: string;
    completed_at?: string;
    due_date?: string;
    source: string;
    source_id?: number;
    category: string;
    urgency: string;
    is_overdue: boolean;
}

interface TasksProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    tasks: {
        pending: Task[];
        completed: Task[];
    };
    taskStats: {
        total: number;
        pending: number;
        completed: number;
        overdue: number;
    };
}

export default function Tasks({ auth, tasks, taskStats }: TasksProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'lesson':
                return '🎓';
            case 'manual':
                return '✏️';
            default:
                return '📋';
        }
    };

    const handleCompleteTask = async (taskId: number) => {
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

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
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
                alert(data.message || 'Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        }
    };

    return (
        <DashboardLayout>
            <Head title="My Tasks" />
            
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                            <span className="text-3xl mr-3">📋</span>
                            My Tasks
                        </h1>
                        <p className="text-gray-600">Manage all your tasks and track your progress</p>
                    </div>
                    <Link
                        href="/housemover/dashboard"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>

                {/* Task Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#E0F7FA] rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-[#1A237E]">{taskStats.total}</div>
                        <div className="text-sm font-medium text-gray-600">Total Tasks</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-700">{taskStats.pending}</div>
                        <div className="text-sm font-medium text-gray-600">Pending</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-700">{taskStats.completed}</div>
                        <div className="text-sm font-medium text-gray-600">Completed</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-700">{taskStats.overdue}</div>
                        <div className="text-sm font-medium text-gray-600">Overdue</div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                            activeTab === 'pending'
                                ? 'bg-white text-[#1A237E] shadow-sm'
                                : 'text-gray-600 hover:text-[#1A237E]'
                        }`}
                    >
                        Pending Tasks ({taskStats.pending})
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                            activeTab === 'completed'
                                ? 'bg-white text-[#1A237E] shadow-sm'
                                : 'text-gray-600 hover:text-[#1A237E]'
                        }`}
                    >
                        Completed Tasks ({taskStats.completed})
                    </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
                {activeTab === 'pending' && (
                    <>
                        {tasks.pending.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-xl font-bold text-[#1A237E] mb-2">No Pending Tasks!</h3>
                                <p className="text-gray-600">You're all caught up. Great job!</p>
                            </div>
                        ) : (
                            tasks.pending.map((task) => (
                                <div key={task.id} className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className="text-2xl">{getSourceIcon(task.source)}</span>
                                                <div>
                                                    <h3 className="font-bold text-[#1A237E] text-lg">{task.title}</h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                            {task.priority.toUpperCase()} PRIORITY
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {task.source === 'lesson' ? 'From Academy Lesson' : 'Custom Task'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">•</span>
                                                        <span className="text-xs text-gray-500">Created {task.created_at}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 mb-4">{task.description}</p>
                                            {task.due_date && (
                                                <div className={`text-sm font-medium ${task.is_overdue ? 'text-red-600' : 'text-gray-600'}`}>
                                                    📅 Due: {task.due_date} {task.is_overdue && '(Overdue)'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <Button
                                                onClick={() => handleCompleteTask(task.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                size="sm"
                                            >
                                                ✓ Complete
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteTask(task.id)}
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                size="sm"
                                            >
                                                🗑️ Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'completed' && (
                    <>
                        {tasks.completed.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-xl font-bold text-[#1A237E] mb-2">No Completed Tasks Yet</h3>
                                <p className="text-gray-600">Complete some tasks to see them here!</p>
                            </div>
                        ) : (
                            tasks.completed.map((task) => (
                                <div key={task.id} className="bg-white rounded-xl shadow-lg p-6 opacity-75">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className="text-2xl">{getSourceIcon(task.source)}</span>
                                                <div>
                                                    <h3 className="font-bold text-[#1A237E] text-lg line-through">{task.title}</h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            ✓ COMPLETED
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {task.source === 'lesson' ? 'From Academy Lesson' : 'Custom Task'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">•</span>
                                                        <span className="text-xs text-gray-500">Completed {task.completed_at}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 mb-4">{task.description}</p>
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <Button
                                                onClick={() => handleDeleteTask(task.id)}
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                size="sm"
                                            >
                                                🗑️ Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}