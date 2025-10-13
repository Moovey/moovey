import { useState } from 'react';
import { Link } from '@inertiajs/react';

interface CTATask {
    id: number;
    title: string;
    description?: string;
    category: string;
    priority: string;
    completed: boolean;
    urgency: string;
    source?: string;
    created_at?: string;
}

interface CTATasksManagerProps {
    selectedCtaTasks: Set<string>;
    setSelectedCtaTasks: React.Dispatch<React.SetStateAction<Set<string>>>;
    getCtaTasksByCategory: () => {
        'Pre-Move': CTATask[];
        'In-Move': CTATask[];
        'Post-Move': CTATask[];
    };
    handleCtaTaskToggle: (taskId: string) => void;
    addSelectedTasksToPriority: () => Promise<void>;
    handleDragStart: (e: React.DragEvent, taskId: string) => void;
    handleDropOnPriority: (e: React.DragEvent) => Promise<void>;
    handleDragOver: (e: React.DragEvent) => void;
}

export default function CTATasksManager({
    selectedCtaTasks,
    setSelectedCtaTasks,
    getCtaTasksByCategory,
    handleCtaTaskToggle,
    addSelectedTasksToPriority,
    handleDragStart,
    handleDropOnPriority,
    handleDragOver
}: CTATasksManagerProps) {
    // Local state for collapsible CTA task categories (Pre-Move, In-Move, Post-Move)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    return (
        <div className="bg-[#E0F7FA] rounded-xl p-8 mb-10 shadow-sm">
            {/* CTA Tasks Management Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-[#1A237E] mb-2 flex items-center">
                            <span className="text-3xl mr-3">🎓</span>
                            My Moving Tasks
                        </h2>
                        <p className="text-gray-700">Drag & drop or select tasks to add to your Priority Tasks</p>
                    </div>
                    {selectedCtaTasks.size > 0 && (
                        <button
                            onClick={addSelectedTasksToPriority}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm"
                        >
                            <span>📌 Add {selectedCtaTasks.size} to Priority</span>
                        </button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Object.entries(getCtaTasksByCategory()).map(([category, tasks]) => (
                        <div key={category} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            {/* Clickable Header */}
                            <div 
                                className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors duration-200"
                                onClick={() => toggleCategory(category)}
                            >
                                <h3 className="text-xl font-bold text-[#1A237E] flex items-center">
                                    <span className="text-2xl mr-2">
                                        {category === 'Pre-Move' ? '📋' : category === 'In-Move' ? '🚚' : '🏡'}
                                    </span>
                                    {category}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-[#00BCD4] text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {tasks.length} tasks
                                    </span>
                                    {/* Expand/Collapse Icon */}
                                    <div className="transition-transform duration-200">
                                        {expandedCategories.has(category) ? (
                                            <svg className="w-5 h-5 text-[#1A237E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-[#1A237E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Collapsible Content */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                expandedCategories.has(category) ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="space-y-3">
                                    {tasks.length > 0 ? tasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id.toString())}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                            selectedCtaTasks.has(task.id.toString())
                                                ? 'border-[#00BCD4] bg-[#E0F7FA] shadow-md'
                                                : 'border-gray-200 bg-gray-50 hover:border-[#00BCD4] hover:shadow-md'
                                        }`}
                                        onClick={() => handleCtaTaskToggle(task.id.toString())}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCtaTasks.has(task.id.toString())}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleCtaTaskToggle(task.id.toString());
                                                        }}
                                                        className="w-4 h-4 text-[#00BCD4] bg-gray-100 border-gray-300 rounded focus:ring-[#00BCD4] focus:ring-2"
                                                    />
                                                    <h4 className="font-semibold text-[#1A237E] text-sm">
                                                        {task.title}
                                                    </h4>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {task.description || 'Academy learning task'}
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-[#E0F7FA] text-[#1A237E] text-xs font-medium px-2 py-1 rounded-full">
                                                        {task.priority} priority
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        From Lesson
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center space-y-2">
                                                <span className="text-lg">🎓</span>
                                                <div className="text-xs text-gray-500 text-center mb-2">
                                                    Drag to Priority
                                                </div>
                                                
                                                {/* Complete Button for Academy Learning Tasks */}
                                                <button 
                                                    className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        
                                                        // Show confirmation dialog
                                                        const isConfirmed = window.confirm(
                                                            `Are you sure you want to mark "${task.title}" as completed?\n\nThis action cannot be undone.`
                                                        );
                                                        
                                                        if (!isConfirmed) {
                                                            return;
                                                        }

                                                        try {
                                                            // Call API to mark task as complete
                                                            const response = await fetch(`/api/tasks/${task.id}/complete`, {
                                                                method: 'PATCH',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                },
                                                            });

                                                            if (response.ok) {
                                                                const data = await response.json();
                                                                if (data.success) {
                                                                    // Show success message
                                                                    alert(`"${task.title}" has been marked as completed! 🎉`);
                                                                    
                                                                    // Optionally reload the page or update state to reflect completion
                                                                    // You might want to add state management here to remove completed tasks from the UI
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
                                                    }}
                                                    title="Mark as Completed"
                                                >
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    )) : (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-2">
                                                {category === 'Pre-Move' ? '📋' : category === 'In-Move' ? '🚚' : '🏡'}
                                            </div>
                                            <p className="text-gray-500 text-sm">
                                                No {category.toLowerCase()} tasks available
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Complete academy lessons to unlock tasks
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Instructions */}
                <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h4 className="font-semibold text-[#1A237E] mb-2">How to add tasks to Priority:</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• <strong>Drag & Drop:</strong> Drag any task card to your Priority Tasks section below</li>
                                <li>• <strong>Select & Add:</strong> Check multiple tasks and click "Add to Priority" button</li>
                                <li>• <strong>Quick Add:</strong> Click on any task card to select/deselect it</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}