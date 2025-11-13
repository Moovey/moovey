import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import { NodeSelection } from 'prosemirror-state';
import TaskButton from './tiptap-extensions/task-button';
import CustomImage from './tiptap-extensions/custom-image';
import './rich-text-editor.css';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const [showTaskModal, setShowTaskModal] = React.useState(false);
    const [taskFormData, setTaskFormData] = React.useState({
        taskTitle: '',
        taskDescription: '',
        buttonText: 'Add to My Tasks',
        taskCategory: 'Pre-Move',
        buttonColor: 'teal',
        dueDate: '',
        moveSectionId: 1,
    });

    // Local copy of move sections (id + short/long name) for selection.
    // Keep in sync with move-details page if that list changes.
    const moveSections = [
        { id: 1, name: 'Planning & Budgeting', shortName: 'Planning' },
        { id: 2, name: 'Sell/Prep Current Home', shortName: 'Prep Home' },
        { id: 3, name: 'Find New Property', shortName: 'Find Property' },
        { id: 4, name: 'Secure Finances', shortName: 'Finances' },
        { id: 5, name: 'Legal & Admin', shortName: 'Legal' },
        { id: 6, name: 'Packing & Removal', shortName: 'Packing' },
        { id: 7, name: 'Move Day Execution', shortName: 'Move Day' },
        { id: 8, name: 'Settling In', shortName: 'Settling' },
        { id: 9, name: 'Post Move Integration', shortName: 'Integration' },
    ];

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    HTMLAttributes: {
                        class: 'text-gray-900 font-bold',
                    },
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc list-inside text-gray-900 ml-4',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-inside text-gray-900 ml-4',
                    },
                },
                listItem: {
                    HTMLAttributes: {
                        class: 'text-gray-900',
                    },
                },
            }),
            Underline,
            CustomImage.configure({
                allowBase64: true,
                inline: false,
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Dropcursor.configure({
                color: '#3b82f6',
                width: 2,
            }),
            Gapcursor,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TaskButton,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-gray max-w-none focus:outline-none p-4 min-h-[200px] text-gray-900 bg-white',
            },
            handleClick: (view, pos, event) => {
                // Handle image clicks for selection
                const target = event.target as HTMLElement;
                if (target.tagName === 'IMG') {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Find the image node in the document
                    let imageNodePos = -1;
                    view.state.doc.descendants((node, nodePos) => {
                        if (node.type.name === 'customImage') {
                            // Check if this is the clicked image by comparing src
                            const imgSrc = target.getAttribute('src');
                            const nodeSrc = node.attrs.src;
                            if (imgSrc === nodeSrc && nodePos <= pos && pos <= nodePos + node.nodeSize) {
                                imageNodePos = nodePos;
                                return false; // Stop searching
                            }
                        }
                    });
                    
                    if (imageNodePos >= 0) {
                        const nodeSelection = NodeSelection.create(view.state.doc, imageNodePos);
                        view.dispatch(view.state.tr.setSelection(nodeSelection));
                        return true;
                    }
                }
                return false;
            },
        },
    });

    // Function to get the current size of selected image
    const getCurrentImageSize = () => {
        const { selection } = editor.state;
        
        if (selection instanceof NodeSelection && selection.node.type.name === 'customImage') {
            // First check if the node has the data-size attribute directly
            const dataSize = selection.node.attrs['data-size'];
            if (dataSize) {
                return dataSize;
            }
            
            // Fallback: check the HTML content
            const html = editor.getHTML();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const images = doc.querySelectorAll('img');
            
            for (const img of images) {
                if (img.src === selection.node.attrs.src) {
                    return img.getAttribute('data-size') || 'full';
                }
            }
        }
        
        return null;
    };

    // Function to get image size class based on selection
    const getImageSizeClass = (size: string) => {
        switch (size) {
            case 'small':
                return 'w-32 h-auto'; // 128px
            case 'medium':
                return 'w-64 h-auto'; // 256px
            case 'large':
                return 'w-96 h-auto'; // 384px
            case 'full':
                return 'max-w-full h-auto'; // Full width
            default:
                return 'w-64 h-auto'; // Default to medium
        }
    };

    // Function to get inline style for size
    const getImageSizeStyle = (size: string) => {
        switch (size) {
            case 'small':
                return 'width: 128px; height: auto; display: block; margin: 16px auto;';
            case 'medium':
                return 'width: 256px; height: auto; display: block; margin: 16px auto;';
            case 'large':
                return 'width: 384px; height: auto; display: block; margin: 16px auto;';
            case 'full':
                return 'width: 100%; height: auto; display: block; margin: 16px auto;';
            default:
                return 'width: 256px; height: auto; display: block; margin: 16px auto;';
        }
    };

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Use medium as default size
                const size = 'medium';

                const formData = new FormData();
                formData.append('image', file);

                try {
                    // Get CSRF token
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    if (!csrfToken) {
                        alert('CSRF token not found. Please refresh the page.');
                        return;
                    }

                    const response = await fetch('/admin/lesson-images/upload', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();
                    
                    if (result.success) {
                        console.log('Image upload successful:', result);
                        
                        // Insert the image with selected size
                        if (editor && !editor.isDestroyed) {
                            const inlineStyle = getImageSizeStyle(size.toLowerCase());
                            
                            // Insert image as HTML with inline styles and data attribute
                            const imageHTML = `<img src="${result.url}" alt="Uploaded image" class="editor-image" style="${inlineStyle}" data-size="${size.toLowerCase()}" />`;
                            
                            const success = editor.chain().focus().insertContent(imageHTML).run();
                            
                            // Fallback to basic setCustomImage if HTML insertion fails
                            if (!success) {
                                editor.chain().focus().setCustomImage({
                                    src: result.url,
                                    alt: 'Uploaded lesson image',
                                    'data-size': size.toLowerCase(),
                                    style: inlineStyle
                                }).run();
                            }
                            
                            // Show success message
                            alert('Image uploaded successfully!');
                        }
                    } else {
                        console.error('Image upload failed:', result);
                        alert('Failed to upload image: ' + (result.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Image upload error:', error);
                    alert('Error uploading image. Please check your connection and try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
            }
        };
        input.click();
    };

    const resizeSelectedImage = (size: string) => {
        const { selection, tr } = editor.state;
        
        console.log(`Attempting to resize image to: ${size}`);
        
        // First, try to find a selected image
        if (selection instanceof NodeSelection && selection.node.type.name === 'customImage') {
            const currentSrc = selection.node.attrs.src;
            const currentAlt = selection.node.attrs.alt || 'Image';
            
            // Update the image node attributes directly
            const newAttrs = {
                ...selection.node.attrs,
                'data-size': size,
                style: getImageSizeStyle(size)
            };
            
            // Use setNodeMarkup to update the existing node
            const newTr = tr.setNodeMarkup(selection.from, null, newAttrs);
            editor.view.dispatch(newTr);
            
            console.log(`Successfully resized selected image to: ${size}`);
            
            // Force a re-render by briefly losing and regaining focus
            setTimeout(() => {
                editor.commands.focus();
            }, 10);
            
            return;
        }
        
        // If no image is selected, look for images near the cursor
        const { from, to } = selection;
        let imageFound = false;
        
        // Search in a reasonable range around the cursor
        const searchFrom = Math.max(0, from - 5);
        const searchTo = Math.min(editor.state.doc.content.size, to + 5);
        
        editor.state.doc.nodesBetween(searchFrom, searchTo, (node, pos) => {
            if (node.type.name === 'customImage' && !imageFound) {
                // Create a NodeSelection for this image
                const nodeSelection = NodeSelection.create(editor.state.doc, pos);
                
                // Apply the selection first
                const selectionTr = editor.state.tr.setSelection(nodeSelection);
                editor.view.dispatch(selectionTr);
                
                // Then update the image
                setTimeout(() => {
                    const newAttrs = {
                        ...node.attrs,
                        'data-size': size,
                        style: getImageSizeStyle(size)
                    };
                    
                    const updateTr = editor.state.tr.setNodeMarkup(pos, null, newAttrs);
                    editor.view.dispatch(updateTr);
                    
                    console.log(`Successfully resized nearby image to: ${size}`);
                    
                    // Focus after update
                    setTimeout(() => {
                        editor.commands.focus();
                    }, 10);
                }, 10);
                
                imageFound = true;
                return false; // Stop searching
            }
        });
        
        if (!imageFound) {
            alert('Please click on an image first to resize it, or place your cursor near an image.');
        }
    };

    const addLink = () => {
        const url = window.prompt('Enter the URL');
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
    };

    const addTaskButton = () => {
        setShowTaskModal(true);
    };

    const handleTaskFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!taskFormData.taskTitle.trim()) {
            alert('Please enter a task title');
            return;
        }

        console.log('Form submitted with data:', taskFormData);
        console.log('Editor available:', !!editor);
        console.log('setTaskButton command available:', !!editor?.commands.setTaskButton);

        const result = editor?.commands.setTaskButton({
            taskTitle: taskFormData.taskTitle,
            taskDescription: taskFormData.taskDescription,
            buttonText: taskFormData.buttonText,
            buttonColor: taskFormData.buttonColor,
            taskCategory: taskFormData.taskCategory,
            dueDate: taskFormData.dueDate,
            moveSectionId: taskFormData.moveSectionId,
        });

        console.log('setTaskButton result:', result);

        // Reset form and close modal
        setTaskFormData({
            taskTitle: '',
            taskDescription: '',
            buttonText: 'Add to My Tasks',
            taskCategory: 'Pre-Move',
            buttonColor: 'teal',
            dueDate: '',
            moveSectionId: 1,
        });
        setShowTaskModal(false);
    };

    const handleAddTaskButton = () => {
        if (!taskFormData.taskTitle.trim()) {
            alert('Please enter a task title');
            return;
        }

        console.log('Add task button clicked with data:', taskFormData);
        console.log('Editor available:', !!editor);
        console.log('setTaskButton command available:', !!editor?.commands.setTaskButton);

        const result = editor?.commands.setTaskButton({
            taskTitle: taskFormData.taskTitle,
            taskDescription: taskFormData.taskDescription,
            buttonText: taskFormData.buttonText,
            buttonColor: taskFormData.buttonColor,
            taskCategory: taskFormData.taskCategory,
            dueDate: taskFormData.dueDate,
            moveSectionId: taskFormData.moveSectionId,
        });

        console.log('setTaskButton result:', result);

        // Reset form and close modal
        setTaskFormData({
            taskTitle: '',
            taskDescription: '',
            buttonText: 'Add to My Tasks',
            taskCategory: 'Pre-Move',
            buttonColor: 'teal',
            dueDate: '',
            moveSectionId: 1,
        });
        setShowTaskModal(false);
    };

    const handleTaskFormChange = (field: string, value: string) => {
        setTaskFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    Bold
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    Italic
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('underline') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    Underline
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Headings */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    H1
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    H3
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Lists */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    1. List
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Alignment */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    ←
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    ↔
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    →
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Media & Links */}
                <button
                    type="button"
                    onClick={handleImageUpload}
                    className="px-3 py-1 text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-100"
                >
                    📷 Image
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const url = window.prompt('Enter image URL:');
                        if (url) {
                            const inlineStyle = getImageSizeStyle('medium');
                            const imageHTML = `<img src="${url}" alt="Image from URL" class="editor-image" style="${inlineStyle}" data-size="medium" />`;
                            editor?.chain().focus().insertContent(imageHTML).run();
                        }
                    }}
                    className="px-3 py-1 text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-100"
                >
                    🌐 URL
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Image Size Controls */}
                {(() => {
                    const currentSize = getCurrentImageSize();
                    return (
                        <>
                            <button
                                type="button"
                                onClick={() => resizeSelectedImage('small')}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-150 ${
                                    currentSize === 'small' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300'
                                }`}
                                title="Resize selected image to small (128px)"
                            >
                                S
                            </button>
                            <button
                                type="button"
                                onClick={() => resizeSelectedImage('medium')}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-150 ${
                                    currentSize === 'medium' || (!currentSize && editor.state.selection instanceof NodeSelection)
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300'
                                }`}
                                title="Resize selected image to medium (256px)"
                            >
                                M
                            </button>
                            <button
                                type="button"
                                onClick={() => resizeSelectedImage('large')}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-150 ${
                                    currentSize === 'large' 
                                        ? 'bg-orange-600 text-white' 
                                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200 active:bg-orange-300'
                                }`}
                                title="Resize selected image to large (384px)"
                            >
                                L
                            </button>
                            <button
                                type="button"
                                onClick={() => resizeSelectedImage('full')}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-150 ${
                                    currentSize === 'full' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200 active:bg-purple-300'
                                }`}
                                title="Resize selected image to full width (100%)"
                            >
                                Full
                            </button>
                        </>
                    );
                })()}

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <button
                    type="button"
                    onClick={() => {
                        // Delete selected image
                        const { selection } = editor.state;
                        
                        if (selection instanceof NodeSelection && selection.node.type.name === 'customImage') {
                            editor.chain().focus().deleteSelection().run();
                        } else {
                            // Find image near cursor
                            const { from, to } = selection;
                            let imageFound = false;
                            
                            editor.state.doc.nodesBetween(from, to, (node, pos) => {
                                if (node.type.name === 'customImage') {
                                    editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
                                    imageFound = true;
                                    return false;
                                }
                            });
                            
                            if (!imageFound) {
                                alert('Please click on an image to delete it');
                            }
                        }
                    }}
                    className="px-3 py-1 text-sm font-medium rounded bg-red-100 text-red-800 hover:bg-red-200"
                >
                    🗑️ Delete
                </button>
                <button
                    type="button"
                    onClick={addLink}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('link') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    🔗 Link
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Task/CTA Button */}
                <button
                    type="button"
                    onClick={addTaskButton}
                    className="px-3 py-1 text-sm font-medium rounded bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm"
                    title="Add Task/CTA Button - Creates a button that adds tasks to user's to-do list"
                >
                    📋 Task CTA
                </button>

                {/* Delete Task CTA Button */}
                <button
                    type="button"
                    onClick={() => {
                        const result = editor?.commands.deleteTaskButton();
                        if (!result) {
                            alert('Please click on a task button first to delete it, or place your cursor near one');
                        }
                    }}
                    className="px-3 py-1 text-sm font-medium rounded bg-red-500 text-white hover:bg-red-600 shadow-sm"
                    title="Delete Task/CTA Button - Remove the selected task button"
                >
                    🗑️ Remove Task
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Other */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`px-3 py-1 text-sm font-medium rounded ${
                        editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    Quote
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="px-3 py-1 text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-100"
                >
                    ─ Rule
                </button>
            </div>

            {/* Editor */}
            <div className="relative">
                <EditorContent 
                    editor={editor} 
                    className="bg-white min-h-[300px] text-gray-900"
                    style={{
                        '--tw-prose-headings': '#111827',
                        '--tw-prose-body': '#111827',
                        '--tw-prose-lists': '#111827',
                    } as any}
                />
                
                {/* Helper text */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
                    💡 Click images to select • Use S(128px)/M(256px)/L(384px)/Full buttons to resize
                </div>
            </div>

            {/* Task Button Modal */}
            {showTaskModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowTaskModal(false);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setShowTaskModal(false);
                        }
                    }}
                    style={{ zIndex: 9999 }}
                >
                    <div 
                        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Add Task CTA Button</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Debug Info - Remove this after testing */}
                           
                            <div className="space-y-4">
                                {/* Task Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={taskFormData.taskTitle || ''}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            handleTaskFormChange('taskTitle', e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                        placeholder="Enter task title..."
                                        autoFocus
                                        required
                                    />
                                </div>

                                {/* Task Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Description
                                    </label>
                                    <textarea
                                        value={taskFormData.taskDescription || ''}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            handleTaskFormChange('taskDescription', e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                        placeholder="Enter task description (optional)..."
                                        rows={3}
                                    />
                                </div>

                                {/* Task Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Category *
                                    </label>
                                    <select
                                        value={taskFormData.taskCategory || 'Pre-Move'}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            handleTaskFormChange('taskCategory', e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer"
                                        required
                                        style={{ 
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="Pre-Move" className="text-gray-900 bg-white">Pre-Move</option>
                                        <option value="In-Move" className="text-gray-900 bg-white">In-Move</option>
                                        <option value="Post-Move" className="text-gray-900 bg-white">Post-Move</option>
                                    </select>
                                </div>

                                {/* Move Section Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Move Section *
                                    </label>
                                    <select
                                        value={taskFormData.moveSectionId}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            handleTaskFormChange('moveSectionId', parseInt(e.target.value, 10) as any);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer"
                                        required
                                        style={{ 
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.5rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        {moveSections.map(s => (
                                            <option key={s.id} value={s.id} className="text-gray-900 bg-white">{s.shortName}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">The task button will only show in the selected move section.</p>
                                </div>

                                {/* Due Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={taskFormData.dueDate || ''}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            handleTaskFormChange('dueDate', e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {/* Button Text */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Text
                                    </label>
                                    <input
                                        type="text"
                                        value={taskFormData.buttonText || ''}
                                        onChange={(e) => {
                                            e.preventDefault();
                                            handleTaskFormChange('buttonText', e.target.value);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                        placeholder="Enter button text..."
                                    />
                                </div>

                                {/* Button Color */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Color
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['teal', 'blue', 'green', 'red', 'yellow', 'purple'].map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleTaskFormChange('buttonColor', color)}
                                                className={`px-3 py-2 rounded-md text-white text-sm font-medium transition-all ${
                                                    color === 'teal' ? 'bg-teal-600 hover:bg-teal-700' :
                                                    color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                                                    color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                                    color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                                    color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                                    'bg-purple-600 hover:bg-purple-700'
                                                } ${taskFormData.buttonColor === color ? 'ring-2 ring-offset-2 ring-gray-900' : ''}`}
                                            >
                                                {color.charAt(0).toUpperCase() + color.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Preview */}
                                {taskFormData.taskTitle && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preview
                                        </label>
                                        <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                                                        📋 Task: {taskFormData.taskTitle}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {taskFormData.taskDescription || 'No description provided'}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                            Category: {taskFormData.taskCategory}
                                                        </span>
                                                        {taskFormData.dueDate && (
                                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                                                                📅 Due: {new Date(taskFormData.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        disabled
                                                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                                                            taskFormData.buttonColor === 'teal' ? 'bg-teal-600' :
                                                            taskFormData.buttonColor === 'blue' ? 'bg-blue-600' :
                                                            taskFormData.buttonColor === 'green' ? 'bg-green-600' :
                                                            taskFormData.buttonColor === 'red' ? 'bg-red-600' :
                                                            taskFormData.buttonColor === 'yellow' ? 'bg-yellow-600' :
                                                            'bg-purple-600'
                                                        } opacity-75 cursor-not-allowed`}
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        {taskFormData.buttonText}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-xs text-gray-500 italic">
                                                ✨ When users click this button, "{taskFormData.taskTitle}" ({taskFormData.taskCategory}){taskFormData.dueDate ? ` with due date ${new Date(taskFormData.dueDate).toLocaleDateString()}` : ''} will be added to their dashboard to-do list.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowTaskModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddTaskButton}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Add Task Button
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}