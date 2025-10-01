// Global configuration and utilities for Moovey application
(function() {
    'use strict';

    // Initialize global config from meta tags
    function initializeMooveyConfig() {
        try {
            const isAuthenticatedMeta = document.querySelector('meta[name="auth-status"]');
            const currentLessonIdMeta = document.querySelector('meta[name="current-lesson-id"]');
            const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');

            window.mooveyConfig = {
                isAuthenticated: isAuthenticatedMeta ? isAuthenticatedMeta.content === 'true' : false,
                currentLessonId: currentLessonIdMeta && currentLessonIdMeta.content ? parseInt(currentLessonIdMeta.content) : null,
                csrfToken: csrfTokenMeta ? csrfTokenMeta.content : ''
            };
        } catch (error) {
            console.error('Failed to set moovey config:', error);
            window.mooveyConfig = {
                isAuthenticated: false,
                currentLessonId: null,
                csrfToken: document.querySelector('meta[name="csrf-token"]')?.content || ''
            };
        }
    }

    // Global function to add tasks to todo list
    window.addTaskToTodo = function(taskTitle, taskDescription, taskCategory, dueDate, buttonElement, moveSectionId) {
        // Ensure config is initialized
        if (!window.mooveyConfig) {
            initializeMooveyConfig();
        }

        // Check if user is authenticated
        if (!window.mooveyConfig.isAuthenticated) {
            // Show error toast for unauthenticated users
            if (window.showToast) {
                window.showToast('Please log in to add tasks to your to-do list', 'error');
            } else {
                alert('Please log in to add tasks to your to-do list');
            }
            return;
        }

        // Process due date - handle empty strings and ensure proper format
        let processedDueDate = null;
        if (dueDate && dueDate.trim() !== '' && dueDate !== 'undefined' && dueDate !== 'null') {
            processedDueDate = dueDate;
        }

        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': window.mooveyConfig.csrfToken,
            },
            body: JSON.stringify({
                title: taskTitle || 'Untitled Task',
                description: taskDescription || 'No description provided',
                priority: 'medium',
                category: taskCategory || 'Pre-Move',
                due_date: processedDueDate,
                source: 'lesson',
                source_id: window.mooveyConfig.currentLessonId,
                section_id: moveSectionId ? parseInt(moveSectionId, 10) : undefined,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message and update button state
                if (buttonElement && buttonElement.style) {
                    buttonElement.style.backgroundColor = '#16a34a';
                    buttonElement.innerHTML = `
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Added to To-Do List!
                    `;
                    buttonElement.disabled = true;
                }
                
                // Show success toast notification
                if (window.showToast) {
                    window.showToast(`✅ "${taskTitle || 'Task'}" has been added to your to-do list!`, 'success');
                } else if (window.showSuccessNotification) {
                    window.showSuccessNotification(data.message || 'Task added to your to-do list!');
                } else {
                    alert(data.message || 'Task added to your to-do list!');
                }
            } else {
                // Show error toast notification
                if (window.showToast) {
                    window.showToast(data.message || 'Failed to add task. Please try again.', 'error');
                } else if (window.showErrorNotification) {
                    window.showErrorNotification(data.message || 'Failed to add task');
                } else {
                    alert(data.message || 'Failed to add task');
                }
            }
        })
        .catch(error => {
            console.error('Error adding task:', error);
            const errorMessage = 'Failed to add task. Please try again.';
            if (window.showToast) {
                window.showToast(errorMessage, 'error');
            } else if (window.showErrorNotification) {
                window.showErrorNotification(errorMessage);
            } else {
                alert(errorMessage);
            }
        });
    };

    // Initialize config when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMooveyConfig);
    } else {
        initializeMooveyConfig();
    }
})();