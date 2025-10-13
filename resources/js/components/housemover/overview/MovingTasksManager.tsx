import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

interface CTATask {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    stage?: string;
    icon?: string;
    dueDate?: string;
    estimatedDuration?: string;
}

interface MovingTasksManagerProps {
    tasks?: CTATask[];
    onTaskComplete?: (taskId: number) => void;
    onTaskCreate?: (task: Omit<CTATask, 'id'>) => void;
}

export default function MovingTasksManager({ 
    tasks = [], 
    onTaskComplete,
    onTaskCreate 
}: MovingTasksManagerProps) {
    const [localTasks, setLocalTasks] = useState<CTATask[]>(tasks);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState<{
        title: string;
        description: string;
        category: string;
        priority: 'high' | 'medium' | 'low';
        stage: string;
    }>({
        title: '',
        description: '',
        category: 'moving',
        priority: 'medium',
        stage: 'planning'
    });

    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    const handleTaskComplete = async (taskId: number) => {
        setLocalTasks(prev => 
            prev.map(task => 
                task.id === taskId 
                    ? { ...task, completed: true }
                    : task
            )
        );
        
        if (onTaskComplete) {
            onTaskComplete(taskId);
        }
    };

    const handleAddTask = () => {
        if (newTask.title.trim()) {
            const task = {
                ...newTask,
                completed: false,
                icon: getCategoryIcon(newTask.category)
            };
            
            if (onTaskCreate) {
                onTaskCreate(task);
            } else {
                // Fallback for local state
                setLocalTasks(prev => [...prev, { ...task, id: Date.now() }]);
            }
            
            setNewTask({
                title: '',
                description: '',
                category: 'moving',
                priority: 'medium',
                stage: 'planning'
            });
            setShowAddTask(false);
        }
    };

    const getCategoryIcon = (category: string): string => {
        const icons: Record<string, string> = {
            'moving': '📦',
            'packing': '📦',
            'property': '🏠',
            'legal': '📋',
            'utilities': '⚡',
            'financial': '💰',
            'personal': '👤',
            'insurance': '🛡️',
            'transport': '🚛',
            'cleaning': '🧽'
        };
        return icons[category.toLowerCase()] || '📋';
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const incompleteTasks = localTasks.filter(task => !task.completed);
    const completedTasks = localTasks.filter(task => task.completed);

    return (
        <section className="bg-white rounded-xl shadow-lg p-6">
            {/* CTA Tasks Management Section */}
            <div className="bg-[#E8F5E8] rounded-xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                            <span className="text-3xl mr-3">📋</span>
                            Moving Tasks Manager
                        </h2>
                        <p className="text-lg font-medium text-gray-700">
                            Organize and track your moving tasks efficiently
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddTask(!showAddTask)}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span>+</span>
                        <span>Add Task</span>
                    </button>
                </div>

                {/* Add New Task Form */}
                {showAddTask && (
                    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border-2 border-[#4CAF50]">
                        <h3 className="text-lg font-bold text-[#1A237E] mb-4">Add New Task</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                                    placeholder="Enter task title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={newTask.category}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                                >
                                    <option value="moving">Moving</option>
                                    <option value="packing">Packing</option>
                                    <option value="property">Property</option>
                                    <option value="legal">Legal</option>
                                    <option value="utilities">Utilities</option>
                                    <option value="financial">Financial</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="transport">Transport</option>
                                    <option value="cleaning">Cleaning</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                                >
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                                <select
                                    value={newTask.stage}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, stage: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                                >
                                    <option value="planning">Planning</option>
                                    <option value="research">Research</option>
                                    <option value="booking">Booking</option>
                                    <option value="preparation">Preparation</option>
                                    <option value="execution">Execution</option>
                                    <option value="completion">Completion</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                                rows={3}
                                placeholder="Enter task description..."
                            />
                        </div>
                        <div className="flex space-x-3 mt-4">
                            <button
                                onClick={handleAddTask}
                                className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-all duration-200 font-semibold"
                            >
                                Add Task
                            </button>
                            <button
                                onClick={() => setShowAddTask(false)}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Tasks Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Tasks */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                <span className="text-xl mr-2">⏳</span>
                                Pending Tasks
                            </h3>
                            <div className="bg-[#E8F5E8] text-[#4CAF50] px-3 py-1 rounded-full text-sm font-bold">
                                {incompleteTasks.length} tasks
                            </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {incompleteTasks.length > 0 ? (
                                incompleteTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-[#4CAF50] hover:shadow-sm transition-all duration-200"
                                    >
                                        <div className="flex items-start space-x-3 flex-1">
                                            <span className="text-2xl">{task.icon || getCategoryIcon(task.category)}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-semibold text-[#1A237E]">{task.title}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                                        {task.category}
                                                    </span>
                                                    {task.stage && (
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {task.stage}
                                                        </span>
                                                    )}
                                                    {task.estimatedDuration && (
                                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                            {task.estimatedDuration}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleTaskComplete(task.id)}
                                            className="ml-3 px-3 py-1 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-all duration-200 text-sm font-semibold"
                                        >
                                            Complete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <p className="text-gray-500 font-medium">No pending tasks!</p>
                                    <p className="text-sm text-gray-400">All caught up with your moving tasks</p>
                                </div>
                            )}
                        </div>

                        {incompleteTasks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link
                                    href="/tasks"
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold text-sm"
                                >
                                    <span>View All Tasks</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                <span className="text-xl mr-2">✅</span>
                                Completed Tasks
                            </h3>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                {completedTasks.length} completed
                            </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {completedTasks.length > 0 ? (
                                completedTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-start space-x-3 p-4 border border-green-200 rounded-lg bg-green-50"
                                    >
                                        <span className="text-2xl">{task.icon || getCategoryIcon(task.category)}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-semibold text-green-800 line-through">
                                                    {task.title}
                                                </h4>
                                                <span className="text-green-600 text-lg">✓</span>
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-green-700 opacity-75 mb-2">
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-3 text-xs text-green-600">
                                                <span className="bg-green-200 px-2 py-1 rounded">
                                                    {task.category}
                                                </span>
                                                {task.stage && (
                                                    <span className="bg-green-200 px-2 py-1 rounded">
                                                        {task.stage}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">📋</div>
                                    <p className="text-gray-500 font-medium">No completed tasks yet</p>
                                    <p className="text-sm text-gray-400">Complete tasks to see them here</p>
                                </div>
                            )}
                        </div>

                        {completedTasks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                                <div className="text-center">
                                    <p className="text-sm text-green-700 font-medium">
                                        🎉 Great job! You've completed {completedTasks.length} tasks
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/tasks/create"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">+</span>
                        <span>Add Custom Task</span>
                    </Link>
                    
                    <Link
                        href="/tasks/templates"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">📋</span>
                        <span>Task Templates</span>
                    </Link>
                    
                    <Link
                        href="/tasks/calendar"
                        className="flex items-center justify-center space-x-2 p-4 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm"
                    >
                        <span className="text-xl">📅</span>
                        <span>Task Calendar</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}