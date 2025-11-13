import { useState, useEffect } from 'react';

interface SectionTask {
    id: string;
    title: string;
    description?: string;
    category?: string;
    completed: boolean;
    isCustom?: boolean;
    completedDate?: string;
}

interface TaskData {
    recommendedTaskStates?: Record<string, Record<string, { completed: boolean; completedDate?: string }>>;
    customTasks?: Record<string, Array<SectionTask>>;
}

interface UseMoveProgressReturn {
    taskData: TaskData | null;
    loading: boolean;
    error: string | null;
}

export function useMoveProgress(): UseMoveProgressReturn {
    const [taskData, setTaskData] = useState<TaskData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMoveProgress = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('/api/move-details', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Extract task data in the same format as move-details receives
                const extractedTaskData: TaskData = {
                    recommendedTaskStates: data?.data?.recommendedTaskStates || {},
                    customTasks: data?.data?.customTasks || {},
                };

                setTaskData(extractedTaskData);
            } catch (err) {
                console.error('Failed to fetch move progress:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch move progress');
                // Set empty task data as fallback
                setTaskData({
                    recommendedTaskStates: {},
                    customTasks: {},
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMoveProgress();
    }, []);

    return { taskData, loading, error };
}