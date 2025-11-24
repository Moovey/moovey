import { Link } from '@inertiajs/react';

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

interface SimpleTaskProps {
    id: number;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    completed: boolean;
}

interface SimplePriorityTasksWidgetProps {
    userPriorityTasks: Task[];
    setUserPriorityTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    getCombinedPriorityTasks: () => Task[];
    handleTaskClick: (taskId: string) => void;
    handleTaskComplete: (taskId: string, event: React.MouseEvent) => Promise<void>;
    removeFromPriorityList: (taskId: string) => Promise<boolean>;
    taskStats: {
        total: number;
        pending: number;
        completed: number;
    };
    handleDropOnPriority: (e: React.DragEvent) => Promise<void>;
    handleDragOver: (e: React.DragEvent) => void;
}

export default function SimplePriorityTasksWidget({
    userPriorityTasks,
    setUserPriorityTasks,
    getCombinedPriorityTasks,
    handleTaskClick,
    handleTaskComplete,
    removeFromPriorityList,
    taskStats,
    handleDropOnPriority,
    handleDragOver
}: SimplePriorityTasksWidgetProps) {
    return (
        <div 
            className="bg-white rounded-xl shadow-lg p-6"
            onDrop={handleDropOnPriority}
            onDragOver={handleDragOver}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#1A237E]">Priority Tasks</h2>
                    {userPriorityTasks.length > 0 && (
                        <span className="bg-[#00BCD4] text-white text-xs font-bold px-2 py-1 rounded-full">
                            +{userPriorityTasks.length} from Academy
                        </span>
                    )}
                </div>
                <Link 
                    href="/housemover/tasks" 
                    className="text-sm text-white hover:text-white font-semibold transition-colors duration-200 bg-[#00BCD4] px-3 py-1 rounded-lg hover:bg-[#00ACC1]"
                >
                    See All
                </Link>
            </div>

            {/* Drop Zone Indicator */}
            <div className="border-2 border-dashed border-[#00BCD4] rounded-lg p-3 mb-4 bg-[#E0F7FA] bg-opacity-50">
                <div className="flex items-center justify-center space-x-2 text-[#1A237E]">
                    <svg className="w-5 h-5 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">Drop CTA tasks here or scroll down to add them manually</span>
                </div>
            </div>
            
            <div className="space-y-3">
                {getCombinedPriorityTasks().slice(0, 5).map((task, index) => (
                    <div 
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                            userPriorityTasks.some(ut => ut.id === task.id)
                                ? 'bg-purple-50 hover:bg-purple-100 border-l-4 border-l-purple-400'
                                : 'bg-[#F5F5F5] hover:bg-[#E0F7FA] hover:shadow-md'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#00BCD4] to-[#00ACC1] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-[#1A237E] text-sm">{task.title}</p>
                                <p className="text-xs text-gray-500">
                                    {task.dueDate}
                                    {userPriorityTasks.some(ut => ut.id === task.id) && (
                                        <span className="ml-2 text-purple-600 font-medium">• From Academy</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                task.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                                task.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {task.urgency === 'urgent' ? 'HIGH' : task.urgency === 'moderate' ? 'MED' : 'LOW'}
                            </span>
                            {userPriorityTasks.some(ut => ut.id === task.id) ? (
                                <>
                                    {/* Complete Button for Academy Tasks */}
                                    <button 
                                        className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200 text-white"
                                        onClick={(e) => handleTaskComplete(task.id, e)}
                                        title="Mark as Completed"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    
                                    {/* Remove Button for Academy Tasks */}
                                    <button 
                                        className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200 text-white"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const success = await removeFromPriorityList(task.id);
                                            if (success) {
                                                setUserPriorityTasks(prev => prev.filter(ut => ut.id !== task.id));
                                            }
                                        }}
                                        title="Remove from Priority Tasks"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="p-2 rounded-full bg-[#00BCD4] hover:bg-[#00ACC1] transition-colors duration-200 text-white"
                                    onClick={(e) => handleTaskComplete(task.id, e)}
                                    title="Mark as Completed"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm font-medium text-[#1A237E]">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span>{taskStats.pending} tasks remaining</span>
                    </div>
                    <span className="bg-[#E0F7FA] px-2 py-1 rounded-full text-[#00BCD4] font-semibold flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Earn coins!</span>
                    </span>
                </div>
            </div>
        </div>
    );
}