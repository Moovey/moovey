import { useState, useEffect } from 'react';

interface PriorityTask {
    id: number;
    title: string;
    description: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    category: string;
    dueDate?: string;
    estimatedDuration?: string;
    completed: boolean;
    order: number;
}

interface PriorityTasksWidgetProps {
    tasks?: PriorityTask[];
    onTaskReorder?: (tasks: PriorityTask[]) => void;
    onTaskComplete?: (taskId: number) => void;
    onTaskUpdate?: (task: PriorityTask) => void;
}

export default function PriorityTasksWidget({
    tasks = [],
    onTaskReorder,
    onTaskComplete,
    onTaskUpdate
}: PriorityTasksWidgetProps) {
    const [priorityTasks, setPriorityTasks] = useState<PriorityTask[]>(tasks);
    const [draggedTask, setDraggedTask] = useState<PriorityTask | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        setPriorityTasks(tasks.sort((a, b) => a.order - b.order));
    }, [tasks]);

    const handleDragStart = (e: React.DragEvent, task: PriorityTask) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        
        if (!draggedTask) return;

        const draggedIndex = priorityTasks.findIndex(task => task.id === draggedTask.id);
        
        if (draggedIndex === dropIndex) return;

        const newTasks = [...priorityTasks];
        const [removed] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(dropIndex, 0, removed);

        // Update order values
        const reorderedTasks = newTasks.map((task, index) => ({
            ...task,
            order: index
        }));

        setPriorityTasks(reorderedTasks);
        setDraggedTask(null);
        setDragOverIndex(null);

        if (onTaskReorder) {
            onTaskReorder(reorderedTasks);
        }
    };

    const handleTaskComplete = (taskId: number) => {
        setPriorityTasks(prev => 
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

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getPriorityIcon = (priority: string): string => {
        switch (priority) {
            case 'urgent': return '🚨';
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
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

    const incompleteTasks = priorityTasks.filter(task => !task.completed);
    const completedTasks = priorityTasks.filter(task => task.completed);

    return (
        <section className="bg-white rounded-xl shadow-lg p-6">
            {/* Priority Tasks Section - Orange Container */}
            <div className="bg-[#FFF3E0] rounded-xl p-8 shadow-lg">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                        <span className="text-3xl mr-3">🎯</span>
                        Priority Tasks Widget
                    </h2>
                    <p className="text-lg font-medium text-gray-700">
                        Drag and drop to prioritize your most important tasks
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Priority Tasks (Drag & Drop) */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                <span className="text-xl mr-2">🎯</span>
                                Priority Tasks
                            </h3>
                            <div className="bg-[#FFF3E0] text-[#FF9800] px-3 py-1 rounded-full text-sm font-bold">
                                {incompleteTasks.length} tasks
                            </div>
                        </div>

                        {incompleteTasks.length > 0 ? (
                            <div className="space-y-3">
                                <div className="text-xs text-gray-500 mb-3 flex items-center space-x-2">
                                    <span>💡</span>
                                    <span>Drag tasks to reorder by priority</span>
                                </div>
                                
                                {incompleteTasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className={`
                                            flex items-start justify-between p-4 border-2 rounded-lg cursor-move transition-all duration-200
                                            ${dragOverIndex === index 
                                                ? 'border-[#FF9800] bg-[#FFF3E0] shadow-lg' 
                                                : 'border-gray-200 hover:border-[#FF9800] hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="flex flex-col items-center space-y-1">
                                                <span className="text-gray-400 text-xs font-bold">#{index + 1}</span>
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-xs">⋮⋮</span>
                                                </div>
                                            </div>
                                            
                                            <span className="text-2xl">
                                                {getCategoryIcon(task.category)}
                                            </span>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-semibold text-[#1A237E]">{task.title}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                                                        {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
                                                    </span>
                                                </div>
                                                
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                                )}
                                                
                                                <div className="flex items-center space-x-3 text-xs">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                        {task.category}
                                                    </span>
                                                    
                                                    {task.dueDate && (
                                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                                            Due: {task.dueDate}
                                                        </span>
                                                    )}
                                                    
                                                    {task.estimatedDuration && (
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {task.estimatedDuration}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col space-y-2 ml-3">
                                            <button
                                                onClick={() => handleTaskComplete(task.id)}
                                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-xs font-semibold"
                                                title="Mark as complete"
                                            >
                                                ✓
                                            </button>
                                            
                                            <button
                                                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-xs font-semibold"
                                                title="Edit task"
                                            >
                                                ✎
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🎯</div>
                                <p className="text-gray-500 font-medium">No priority tasks set</p>
                                <p className="text-sm text-gray-400">Add important tasks to prioritize them</p>
                            </div>
                        )}
                    </div>

                    {/* Completed Priority Tasks */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                <span className="text-xl mr-2">✅</span>
                                Completed
                            </h3>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                {completedTasks.length} done
                            </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {completedTasks.length > 0 ? (
                                completedTasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        className="flex items-start space-x-3 p-4 border border-green-200 rounded-lg bg-green-50"
                                    >
                                        <span className="text-2xl opacity-75">
                                            {getCategoryIcon(task.category)}
                                        </span>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-semibold text-green-800 line-through">
                                                    {task.title}
                                                </h4>
                                                <span className="text-green-600 text-lg">✓</span>
                                            </div>
                                            
                                            {task.description && (
                                                <p className="text-sm text-green-700 opacity-75 mb-2 line-through">
                                                    {task.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center space-x-3 text-xs text-green-600">
                                                <span className="bg-green-200 px-2 py-1 rounded">
                                                    {task.category}
                                                </span>
                                                
                                                <span className={`px-2 py-1 rounded opacity-75 ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-4">📋</div>
                                    <p className="text-gray-500 font-medium">No completed tasks yet</p>
                                    <p className="text-sm text-gray-400">Completed priority tasks will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Priority Task Statistics */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">🚨</div>
                        <div className="text-sm text-gray-600">Urgent</div>
                        <div className="text-xl font-bold text-red-600">
                            {incompleteTasks.filter(t => t.priority === 'urgent').length}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">🔴</div>
                        <div className="text-sm text-gray-600">High</div>
                        <div className="text-xl font-bold text-orange-600">
                            {incompleteTasks.filter(t => t.priority === 'high').length}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">🟡</div>
                        <div className="text-sm text-gray-600">Medium</div>
                        <div className="text-xl font-bold text-yellow-600">
                            {incompleteTasks.filter(t => t.priority === 'medium').length}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                        <div className="text-2xl mb-2">✅</div>
                        <div className="text-sm text-gray-600">Completed</div>
                        <div className="text-xl font-bold text-green-600">
                            {completedTasks.length}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <button className="inline-flex items-center space-x-2 px-4 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-all duration-200 font-semibold text-sm">
                        <span>+</span>
                        <span>Add Priority Task</span>
                    </button>
                    
                    <button className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1A237E] text-white rounded-lg hover:bg-[#303F9F] transition-all duration-200 font-semibold text-sm">
                        <span>📊</span>
                        <span>View Analytics</span>
                    </button>
                    
                    <button className="inline-flex items-center space-x-2 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-all duration-200 font-semibold text-sm">
                        <span>⚡</span>
                        <span>Auto-Prioritize</span>
                    </button>
                </div>
            </div>
        </section>
    );
}