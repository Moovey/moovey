import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';

// React component for the task button node view
const TaskButtonComponent = ({ node, updateAttributes, deleteNode }: any) => {
    const { taskTitle, taskDescription, buttonText, buttonColor, taskCategory, dueDate, moveSectionId } = node.attrs;
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    
    // Check if we're in admin/editor mode (when deleteNode is available)
    const isEditorMode = typeof deleteNode === 'function';

    const handleAddTask = async () => {
        if (isLoading || isCompleted) return;

        // Check if user is authenticated
        const authUser = (window as any).mooveyConfig?.isAuthenticated;
        if (!authUser) {
            if ((window as any).showToast) {
                (window as any).showToast('Please log in to add tasks to your to-do list', 'error');
            } else {
                alert('Please log in to add tasks to your to-do list');
            }
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (window as any).mooveyConfig?.csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    title: taskTitle || 'Untitled Task',
                    description: taskDescription || 'No description provided',
                    priority: 'medium',
                    category: taskCategory || 'Pre-Move',
                    due_date: dueDate || null,
                    source: 'lesson',
                    source_id: (window as any).mooveyConfig?.currentLessonId || null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsCompleted(true);
                // Show success toast notification
                if ((window as any).showToast) {
                    (window as any).showToast(`✅ "${taskTitle || 'Task'}" has been added to your to-do list!`, 'success');
                } else if ((window as any).showNotification) {
                    (window as any).showNotification(data.message || 'Task added to your to-do list!', 'success');
                } else {
                    alert(data.message || 'Task added to your to-do list!');
                }
            } else {
                // Show error toast notification
                if ((window as any).showToast) {
                    (window as any).showToast(data.message || 'Failed to add task. Please try again.', 'error');
                } else if ((window as any).showNotification) {
                    (window as any).showNotification(data.message || 'Failed to add task', 'error');
                } else {
                    alert(data.message || 'Failed to add task');
                }
            }
        } catch (error) {
            console.error('Error adding task:', error);
            const errorMessage = 'Failed to add task. Please try again.';
            if ((window as any).showToast) {
                (window as any).showToast(errorMessage, 'error');
            } else if ((window as any).showNotification) {
                (window as any).showNotification(errorMessage, 'error');
            } else {
                alert(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <NodeViewWrapper className="task-button-wrapper my-4">
            <div 
                className={`p-4 border-2 border-dashed rounded-lg bg-blue-50 relative transition-all ${
                    isEditorMode 
                        ? 'border-blue-300 hover:border-red-400 hover:bg-red-50 cursor-pointer' 
                        : 'border-blue-300'
                }`}
                contentEditable={false}
                title={isEditorMode ? "Click the × button to remove this task" : ""}
            >
                {/* Delete button for admin/editor mode */}
                {isEditorMode && (
                    <button
                        onClick={() => deleteNode()}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 shadow-md hover:shadow-lg hover:scale-110"
                        title="Remove this task button"
                        type="button"
                        style={{ fontSize: '14px', lineHeight: '1' }}
                    >
                        ×
                    </button>
                )}
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            {isCompleted ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                            📋 Task: {taskTitle || 'Untitled Task'}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                            {taskDescription || 'No description provided'}
                        </p>
                        {dueDate && (
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                                    📅 Due: {new Date(dueDate).toLocaleDateString()}
                                </span>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                    Category: {taskCategory || 'Pre-Move'}
                                </span>
                            </div>
                        )}
                        {!dueDate && (
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                    Category: {taskCategory || 'Pre-Move'}
                                </span>
                            </div>
                        )}
                        <button 
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                                isCompleted ? 'bg-green-600 hover:bg-green-700' :
                                buttonColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                buttonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                buttonColor === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                buttonColor === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                buttonColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                                'bg-teal-600 hover:bg-teal-700' // default teal
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm transition-colors ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            } ${isCompleted ? 'cursor-default' : ''}`}
                            onClick={handleAddTask}
                            disabled={isLoading || isCompleted}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </>
                            ) : isCompleted ? (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added to To-Do List!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    {buttonText || 'Add to My Tasks'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 italic">
                    {isCompleted ? (
                        `✅ Task "${taskTitle || 'Untitled Task'}" has been added to your dashboard to-do list.`
                    ) : (
                        `✨ When users click this button, "${taskTitle || 'Untitled Task'}" (${taskCategory || 'Pre-Move'})${dueDate ? ` with due date ${new Date(dueDate).toLocaleDateString()}` : ''} will be added to their dashboard to-do list. (Section: ${moveSectionId || 1})`
                    )}
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export interface TaskButtonOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        taskButton: {
            setTaskButton: (options: {
                taskTitle: string;
                taskDescription: string;
                buttonText: string;
                buttonColor: string;
                taskCategory: string;
                dueDate: string;
                moveSectionId: number;
            }) => ReturnType;
            deleteTaskButton: () => ReturnType;
        };
    }
}

export const TaskButton = Node.create<TaskButtonOptions>({
    name: 'taskButton',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    group: 'block',

    content: '',

    atom: true,

    addAttributes() {
        return {
            taskTitle: {
                default: '',
                parseHTML: element => element.getAttribute('data-task-title'),
                renderHTML: attributes => {
                    if (!attributes.taskTitle) {
                        return {};
                    }
                    return {
                        'data-task-title': attributes.taskTitle,
                    };
                },
            },
            taskDescription: {
                default: '',
                parseHTML: element => element.getAttribute('data-task-description'),
                renderHTML: attributes => {
                    if (!attributes.taskDescription) {
                        return {};
                    }
                    return {
                        'data-task-description': attributes.taskDescription,
                    };
                },
            },
            buttonText: {
                default: 'Add to My Tasks',
                parseHTML: element => element.getAttribute('data-button-text'),
                renderHTML: attributes => {
                    if (!attributes.buttonText) {
                        return {};
                    }
                    return {
                        'data-button-text': attributes.buttonText,
                    };
                },
            },
            buttonColor: {
                default: 'teal',
                parseHTML: element => element.getAttribute('data-button-color'),
                renderHTML: attributes => {
                    if (!attributes.buttonColor) {
                        return {};
                    }
                    return {
                        'data-button-color': attributes.buttonColor,
                    };
                },
            },
            taskCategory: {
                default: 'Pre-Move',
                parseHTML: element => element.getAttribute('data-task-category'),
                renderHTML: attributes => {
                    if (!attributes.taskCategory) {
                        return {};
                    }
                    return {
                        'data-task-category': attributes.taskCategory,
                    };
                },
            },
            dueDate: {
                default: '',
                parseHTML: element => element.getAttribute('data-due-date'),
                renderHTML: attributes => {
                    if (!attributes.dueDate) {
                        return {};
                    }
                    return {
                        'data-due-date': attributes.dueDate,
                    };
                },
            },
            moveSectionId: {
                default: 1,
                parseHTML: element => {
                    const val = element.getAttribute('data-move-section-id');
                    return val ? parseInt(val, 10) : 1;
                },
                renderHTML: attributes => {
                    if (!attributes.moveSectionId) {
                        return { 'data-move-section-id': 1 };
                    }
                    return {
                        'data-move-section-id': attributes.moveSectionId,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="task-button"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'task-button',
                'class': 'task-button-wrapper my-4 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50',
            }),
            [
                'div',
                { class: 'flex items-start space-x-4' },
                [
                    'div',
                    { class: 'flex-shrink-0' },
                    [
                        'div',
                        { class: 'w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center' },
                        [
                            'svg',
                            { 
                                class: 'w-4 h-4 text-white',
                                fill: 'none',
                                stroke: 'currentColor',
                                viewBox: '0 0 24 24'
                            },
                            [
                                'path',
                                {
                                    'stroke-linecap': 'round',
                                    'stroke-linejoin': 'round',
                                    'stroke-width': '2',
                                    d: 'M9 5l7 7-7 7'
                                }
                            ]
                        ]
                    ]
                ],
                [
                    'div',
                    { class: 'flex-1 min-w-0' },
                    [
                        'h4',
                        { class: 'text-sm font-medium text-gray-900 mb-1' },
                        `📋 Task: ${HTMLAttributes['data-task-title'] || 'Untitled Task'}`
                    ],
                    [
                        'p',
                        { class: 'text-sm text-gray-600 mb-2' },
                        HTMLAttributes['data-task-description'] || 'No description provided'
                    ],
                    [
                        'div',
                        { class: 'flex items-center space-x-2 mb-3' },
                        [
                            'span',
                            { class: 'text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800' },
                            `Category: ${HTMLAttributes['data-task-category'] || 'Pre-Move'}`
                        ],
                        ...(HTMLAttributes['data-due-date'] ? [
                            [
                                'span',
                                { class: 'text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800' },
                                `📅 Due: ${new Date(HTMLAttributes['data-due-date']).toLocaleDateString()}`
                            ]
                        ] : [])
                    ],
                    [
                        'button',
                        {
                            class: `inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                                HTMLAttributes['data-button-color'] === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                HTMLAttributes['data-button-color'] === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                HTMLAttributes['data-button-color'] === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                HTMLAttributes['data-button-color'] === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                HTMLAttributes['data-button-color'] === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                                'bg-teal-600 hover:bg-teal-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm transition-colors moovey-task-button`,
                            'data-task-title': HTMLAttributes['data-task-title'],
                            'data-task-description': HTMLAttributes['data-task-description'],
                            'data-task-category': HTMLAttributes['data-task-category'],
                            'data-due-date': HTMLAttributes['data-due-date'],
                            'data-move-section-id': HTMLAttributes['data-move-section-id'] || 1,
                            'onclick': 'window.addTaskToTodo && window.addTaskToTodo(this.dataset.taskTitle, this.dataset.taskDescription, this.dataset.taskCategory, this.dataset.dueDate, this, this.dataset.moveSectionId)'
                        },
                        [
                            'svg',
                            {
                                class: 'w-4 h-4 mr-2',
                                fill: 'none',
                                stroke: 'currentColor',
                                viewBox: '0 0 24 24'
                            },
                            [
                                'path',
                                {
                                    'stroke-linecap': 'round',
                                    'stroke-linejoin': 'round',
                                    'stroke-width': '2',
                                    d: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
                                }
                            ]
                        ],
                        HTMLAttributes['data-button-text'] || 'Add to My Tasks'
                    ]
                ]
            ],
            [
                'div',
                { class: 'mt-3 text-xs text-gray-500 italic' },
                `✨ When users click this button, "${HTMLAttributes['data-task-title'] || 'Untitled Task'}" (${HTMLAttributes['data-task-category'] || 'Pre-Move'})${HTMLAttributes['data-due-date'] ? ` with due date ${new Date(HTMLAttributes['data-due-date']).toLocaleDateString()}` : ''} will be added to their dashboard to-do list. (Section: ${HTMLAttributes['data-move-section-id'] || 1})`
            ]
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TaskButtonComponent);
    },

    addCommands() {
        return {
            setTaskButton: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
            deleteTaskButton: () => ({ state, dispatch }) => {
                const { selection } = state;
                const { from, to } = selection;
                
                // Check if we have a task button selected
                const { $from } = selection;
                const node = $from.nodeAfter || $from.nodeBefore;
                
                if (node && node.type.name === this.name) {
                    // Delete the selected task button
                    if (dispatch) {
                        const tr = state.tr.deleteRange(from, to);
                        dispatch(tr);
                    }
                    return true;
                }
                
                // Look for task button nodes in the selection range
                let taskButtonFound = false;
                state.doc.nodesBetween(from, to, (node, pos) => {
                    if (node.type.name === this.name && !taskButtonFound) {
                        if (dispatch) {
                            const tr = state.tr.deleteRange(pos, pos + node.nodeSize);
                            dispatch(tr);
                        }
                        taskButtonFound = true;
                        return false; // Stop searching
                    }
                });
                
                return taskButtonFound;
            },
        };
    },
});

export default TaskButton;