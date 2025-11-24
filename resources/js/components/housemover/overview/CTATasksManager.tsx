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
        <div className="bg-[#E0F7FA] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10 shadow-sm">
            {/* CTA Tasks Management Section - Responsive */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
                {/* Mobile Header */}
                <div className="block sm:hidden mb-4">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-[#1A237E] mb-2 flex items-center justify-center">
                            <svg className="w-6 h-6 mr-2 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Moving Tasks
                        </h2>
                        <p className="text-sm text-gray-700 mb-4">Select tasks to add to Priority</p>
                        {selectedCtaTasks.size > 0 && (
                            <button
                                onClick={addSelectedTasksToPriority}
                                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                <span>Add {selectedCtaTasks.size} to Priority</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tablet & Desktop Header */}
                <div className="hidden sm:flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A237E] mb-2 flex items-center">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 mr-3 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            My Moving Tasks
                        </h2>
                        <p className="text-sm sm:text-base lg:text-lg text-gray-700">Drag & drop or select tasks to add to your Priority Tasks</p>
                    </div>
                    {selectedCtaTasks.size > 0 && (
                        <button
                            onClick={addSelectedTasksToPriority}
                            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#00BCD4] text-white rounded-lg hover:bg-[#00ACC1] transition-all duration-200 font-semibold shadow-sm text-sm sm:text-base"
                        >
                            <span>📌 Add {selectedCtaTasks.size} to Priority</span>
                        </button>
                    )}
                </div>

                {/* Category Tabs - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {Object.entries(getCtaTasksByCategory()).map(([category, tasks]) => (
                        <div key={category} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
                            {/* Mobile Header */}
                            <div className="block sm:hidden">
                                <div 
                                    className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-50 -m-1 p-1 rounded-lg transition-colors duration-200"
                                    onClick={() => toggleCategory(category)}
                                >
                                    <h3 className="text-lg font-bold text-[#1A237E] flex items-center">
                                        <div className="w-5 h-5 mr-2 text-[#00BCD4]">
                                            {category === 'Pre-Move' ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            ) : category === 'In-Move' ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="hidden xs:inline">{category}</span>
                                        <span className="xs:hidden">{category.split('-')[0]}</span>
                                    </h3>
                                    <div className="flex items-center space-x-1">
                                        <span className="bg-[#00BCD4] text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {tasks.length}
                                        </span>
                                        <div className="transition-transform duration-200">
                                            {expandedCategories.has(category) ? (
                                                <svg className="w-4 h-4 text-[#1A237E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-[#1A237E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Header */}
                            <div className="hidden sm:block">
                                <div 
                                    className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors duration-200"
                                    onClick={() => toggleCategory(category)}
                                >
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1A237E] flex items-center">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 text-[#00BCD4] flex-shrink-0">
                                            {category === 'Pre-Move' ? (
                                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            ) : category === 'In-Move' ? (
                                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
                                                </svg>
                                            ) : (
                                                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            )}
                                        </div>
                                        {category}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-[#00BCD4] text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {tasks.length} tasks
                                        </span>
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
                            </div>

                            {/* Collapsible Content */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                expandedCategories.has(category) ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                                <div className="space-y-2 sm:space-y-3">
                                    {tasks.length > 0 ? tasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id.toString())}
                                        className={`p-2 sm:p-3 lg:p-4 rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                            selectedCtaTasks.has(task.id.toString())
                                                ? 'border-[#00BCD4] bg-[#E0F7FA] shadow-md'
                                                : 'border-gray-200 bg-gray-50 hover:border-[#00BCD4] hover:shadow-md'
                                        }`}
                                        onClick={() => handleCtaTaskToggle(task.id.toString())}
                                    >
                                        {/* Mobile Layout */}
                                        <div className="block sm:hidden">
                                            <div className="flex items-start space-x-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCtaTasks.has(task.id.toString())}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleCtaTaskToggle(task.id.toString());
                                                    }}
                                                    className="w-4 h-4 text-[#00BCD4] bg-gray-100 border-gray-300 rounded focus:ring-[#00BCD4] focus:ring-2 mt-0.5"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-[#1A237E] text-sm mb-1">
                                                        {task.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {task.description || 'Academy learning task'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-1 mb-2">
                                                        <span className="bg-[#E0F7FA] text-[#1A237E] text-xs font-medium px-2 py-1 rounded-full">
                                                            {task.priority}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                            Lesson
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center space-y-1">
                                                    <div className="w-6 h-6 rounded-full bg-[#00BCD4] flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                                                        </svg>
                                                    </div>
                                                    <button 
                                                        className="p-1.5 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            
                                                            const isConfirmed = window.confirm(
                                                                `Mark "${task.title}" as completed?`
                                                            );
                                                            
                                                            if (!isConfirmed) return;

                                                            try {
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
                                                                        alert(`"${task.title}" completed! 🎉`);
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
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:flex items-start justify-between">
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
                                                    <h4 className="font-semibold text-[#1A237E] text-sm lg:text-base">
                                                        {task.title}
                                                    </h4>
                                                </div>
                                                <p className="text-xs lg:text-sm text-gray-600 mb-2">
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
                                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#00BCD4] flex items-center justify-center">
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                                                    </svg>
                                                </div>
                                                <div className="text-xs text-gray-500 text-center mb-2 hidden lg:block">
                                                    Drag to Priority
                                                </div>
                                                
                                                {/* Complete Button for Academy Learning Tasks */}
                                                <button 
                                                    className="p-2 lg:p-2.5 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white shadow-sm hover:shadow-md"
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
                                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    )) : (
                                        <div className="text-center py-6 sm:py-8">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-2 rounded-full bg-[#E0F7FA] flex items-center justify-center">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-[#00BCD4]">
                                                    {category === 'Pre-Move' ? (
                                                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                        </svg>
                                                    ) : category === 'In-Move' ? (
                                                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm lg:text-base">
                                                No {category.toLowerCase()} tasks available
                                            </p>
                                            <p className="text-xs lg:text-sm text-gray-400 mt-1">
                                                Complete academy lessons to unlock tasks
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Instructions - Responsive */}
                <div className="mt-4 sm:mt-6 bg-white rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-200">
                    {/* Mobile Instructions */}
                    <div className="block sm:hidden text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#00BCD4] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-[#1A237E] mb-3 text-sm">Quick Tips:</h4>
                        <div className="space-y-2 text-xs text-gray-700">
                            <div className="bg-gray-50 p-2 rounded">📱 <strong>Tap</strong> task cards to select</div>
                            <div className="bg-gray-50 p-2 rounded">✅ <strong>Complete</strong> with green button</div>
                            <div className="bg-gray-50 p-2 rounded">📌 <strong>Add selected</strong> to Priority</div>
                        </div>
                    </div>

                    {/* Desktop Instructions */}
                    <div className="hidden sm:flex items-start space-x-3">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#00BCD4] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#1A237E] mb-2 text-base lg:text-lg">How to add tasks to Priority:</h4>
                            <ul className="text-sm lg:text-base text-gray-700 space-y-1">
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