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
import './rich-text-editor.css';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
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
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4 border border-gray-200 block',
                },
                allowBase64: true,
                inline: false,
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
                // Prevent navigation when clicking on images in the editor
                const target = event.target as HTMLElement;
                if (target.tagName === 'IMG') {
                    event.preventDefault();
                    event.stopPropagation();
                    return true; // Handled
                }
                return false; // Not handled, continue with default behavior
            },
        },
    });

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.webp';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                try {
                    // Get CSRF token
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                    if (!csrfToken) {
                        alert('CSRF token not found. Please refresh the page.');
                        return;
                    }

                    console.log('Uploading image:', file.name, 'Type:', file.type);

                    const response = await fetch('/admin/lesson-images/upload', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json',
                        },
                    });

                    console.log('Response status:', response.status);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Response error:', errorText);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();
                    console.log('Upload result:', result);
                    
                    if (result.success) {
                        console.log('=== IMAGE UPLOAD SUCCESS ===');
                        console.log('Available URLs:', result.debug);
                        console.log('Primary URL:', result.url);
                        console.log('Editor state:', {
                            exists: !!editor,
                            viewExists: !!(editor && editor.view),
                            destroyed: editor?.isDestroyed,
                            focusable: editor?.isFocused
                        });
                        
                        // Test the URL immediately
                        console.log('Testing image URL accessibility...');
                        fetch(result.url, { method: 'HEAD' })
                            .then(urlResponse => {
                                console.log('URL test result:', {
                                    status: urlResponse.status,
                                    ok: urlResponse.ok,
                                    statusText: urlResponse.statusText
                                });
                            })
                            .catch(urlError => {
                                console.error('URL test failed:', urlError);
                            });
                        
                        // Insert the image using the basic Image extension
                        if (editor && editor.view && !editor.isDestroyed) {
                            try {
                                console.log('Attempting to insert image...');
                                
                                // Get current editor content before insertion
                                const beforeHTML = editor.getHTML();
                                console.log('Editor content before insertion:', beforeHTML);
                                
                                // Focus the editor first
                                editor.commands.focus();
                                console.log('Editor focused, inserting resizable image...');
                                
                                // Insert the image using the ResizableImage command
                                console.log('Available schema nodes:', Object.keys(editor.schema.nodes));
                                console.log('Available commands:', Object.keys(editor.commands));
                                console.log('Looking for resizableImage node type...');
                                console.log('Schema nodes in detail:', editor.schema.nodes);
                                
                                // Try using the built-in setImage command from ResizableImage extension first
                                let success = false;
                                
                                if ((editor.commands as any).setImage) {
                                    console.log('✅ setImage command found, using it...');
                                    console.log('Current selection:', editor.state.selection);
                                    console.log('Current doc:', editor.state.doc.toString());
                                    
                                    success = editor.chain().focus().setImage({
                                        src: result.url,
                                        alt: 'Uploaded lesson image',
                                        title: 'Lesson image',
                                        width: undefined,
                                        height: undefined
                                    }).run();
                                    console.log('setImage command result:', success);
                                    console.log('Doc after setImage:', editor.state.doc.toString());
                                    
                                    // If setImage didn't work, try forcing a transaction
                                    if (success && editor.getHTML() === '<p></p>') {
                                        console.log('🔄 setImage returned true but no content changed, trying manual approach...');
                                        
                                        // Check if resizableImage node exists in schema
                                        if (editor.schema.nodes.resizableImage) {
                                            console.log('✅ resizableImage node found in schema, creating manually...');
                                            success = editor.chain().focus().command(({ tr, dispatch, editor }) => {
                                                if (dispatch) {
                                                    try {
                                                        const node = editor.schema.nodes.resizableImage.create({
                                                            src: result.url,
                                                            alt: 'Uploaded lesson image',
                                                            title: 'Lesson image'
                                                        });
                                                        console.log('Created node:', node);
                                                        
                                                        // Get the current document state
                                                        const { from, to } = tr.selection;
                                                        const currentNode = tr.doc.nodeAt(from - 1);
                                                        console.log('Selection from:', from, 'to:', to);
                                                        console.log('Current node at position:', currentNode);
                                                        console.log('Document structure:', tr.doc.toString());
                                                        
                                                        // Try different insertion methods
                                                        if (tr.doc.content.size === 2 && tr.doc.firstChild?.type.name === 'paragraph' && tr.doc.firstChild?.textContent === '') {
                                                            // Document only has empty paragraph, replace the entire content
                                                            console.log('Replacing entire document content with image');
                                                            tr.replaceWith(0, tr.doc.content.size, node);
                                                        } else {
                                                            // Insert at current position
                                                            console.log('Inserting at current position');
                                                            tr.insert(from, node);
                                                        }
                                                        
                                                        console.log('Transaction doc after operation:', tr.doc.toString());
                                                        console.log('Transaction steps:', tr.steps);
                                                        
                                                    } catch (error) {
                                                        console.error('❌ Error in manual node creation:', error);
                                                        return false;
                                                    }
                                                }
                                                return true;
                                            }).run();
                                            
                                            console.log('Manual insertion result:', success);
                                            console.log('Editor content after manual insertion:', editor.getHTML());
                                            console.log('Editor doc state:', editor.state.doc.toString());
                                            
                                            // If still no success, try insertContent as absolute fallback
                                            if (!success || editor.getHTML() === '<p></p>') {
                                                console.log('🔄 Manual node insertion failed, trying insertContent without clearing...');
                                                success = editor.chain().focus().insertContent(`
                                                    <div class="resizable-image-wrapper" style="position: relative; display: inline-block; max-width: 100%; margin: 16px 0;">
                                                        <img src="${result.url}" alt="Uploaded lesson image" title="Lesson image" class="max-w-full h-auto rounded-lg border border-gray-200 block" style="display: block;" />
                                                    </div>
                                                `).run();
                                                console.log('HTML insertion result:', success);
                                                console.log('Editor content after HTML insertion:', editor.getHTML());
                                                
                                                // If everything fails, manually set the content with raw HTML
                                                if (!success || editor.getHTML() === '<p></p>') {
                                                    console.log('🔴 All insertion methods failed, trying basic image node...');
                                                    
                                                    // Try using standard image node
                                                    const basicImageSuccess = editor.chain().focus().setImage({
                                                        src: result.url,
                                                        alt: 'Uploaded lesson image'
                                                    }).run();
                                                    
                                                    console.log('Basic image insertion result:', basicImageSuccess);
                                                    console.log('Editor content after basic image:', editor.getHTML());
                                                    
                                                    if (!basicImageSuccess || editor.getHTML() === '<p></p>') {
                                                        console.log('🔴 Even basic image failed, setting HTML directly...');
                                                        const imageHTML = `<p><img src="${result.url}" alt="Uploaded lesson image" title="Lesson image" class="max-w-full h-auto rounded-lg border border-gray-200 block" style="display: block;" /></p>`;
                                                        editor.commands.setContent(imageHTML);
                                                        console.log('Direct HTML set result, editor content:', editor.getHTML());
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else if (editor.schema.nodes.resizableImage) {
                                    console.log('🔄 setImage command not found, trying manual node creation...');
                                    success = editor.chain().focus().command(({ tr, dispatch, editor }) => {
                                        if (dispatch) {
                                            try {
                                                const node = editor.schema.nodes.resizableImage.create({
                                                    src: result.url,
                                                    alt: 'Uploaded lesson image',
                                                    title: 'Lesson image',
                                                    width: undefined,
                                                    height: undefined
                                                });
                                                console.log('✅ Created resizable image node:', node);
                                                tr.replaceSelectionWith(node);
                                                console.log('✅ Added node to transaction');
                                            } catch (error) {
                                                console.error('❌ Error creating resizable image node:', error);
                                                return false;
                                            }
                                        }
                                        return true;
                                    }).run();
                                } else {
                                    console.error('❌ resizableImage node type not found in schema!');
                                    // Fallback: Try using the extension's built-in command if available
                                    if ((editor.commands as any).setImage) {
                                        console.log('🔄 Trying fallback setImage command...');
                                        success = editor.chain().focus().setImage({
                                            src: result.url,
                                            alt: 'Uploaded lesson image',
                                            title: 'Lesson image'
                                        }).run();
                                    } else {
                                        console.log('🔄 Trying direct HTML insertion as final fallback...');
                                        success = editor.chain().focus().insertContent(`<img src="${result.url}" alt="Uploaded lesson image" class="max-w-full h-auto rounded-lg my-4 border border-gray-200 block" />`).run();
                                    }
                                }
                                
                                // Get content after insertion
                                const afterHTML = editor.getHTML();
                                console.log('Image insertion success:', success);
                                console.log('Editor content after insertion:', afterHTML);
                                console.log('Content changed:', beforeHTML !== afterHTML);
                                
                                // Check if image was actually inserted
                                if (afterHTML.includes(result.url)) {
                                    console.log('✅ Image URL found in editor content!');
                                } else {
                                    console.error('❌ Image URL NOT found in editor content!');
                                }
                                
                                // Check for img tags
                                const imgTags = afterHTML.match(/<img[^>]*>/g);
                                console.log('Found img tags:', imgTags);
                                
                            } catch (editorError) {
                                console.error('Editor error during image insertion:', editorError);
                            }
                        } else {
                            console.error('Editor is not available for image insertion');
                            alert('Editor is not ready. Please try uploading the image again.');
                        }
                    } else {
                        alert('Failed to upload image: ' + result.message);
                        console.error('Upload failed:', result);
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Error uploading image. Please check console for details.');
                }
            }
        };
        input.click();
    };

    const addLink = () => {
        const url = window.prompt('Enter the URL');
        if (url) {
            editor?.chain().focus().setLink({ href: url }).run();
        }
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
                            editor?.chain().focus().command(({ tr, dispatch, editor }) => {
                                if (dispatch) {
                                    const node = editor.schema.nodes.resizableImage.create({
                                        src: url,
                                        alt: 'Image from URL',
                                        title: 'Image from URL',
                                        width: 'auto',
                                        height: 'auto'
                                    });
                                    tr.replaceSelectionWith(node);
                                }
                                return true;
                            }).run();
                        }
                    }}
                    className="px-3 py-1 text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-100"
                >
                    🌐 URL
                </button>
                <button
                    type="button"
                    onClick={() => {
                        // Delete selected image or node
                        const { selection } = editor.state;
                        
                        // Check if we have a node selection (entire node selected)
                        if (selection instanceof NodeSelection) {
                            const node = selection.node;
                            if (node && node.type.name === 'resizableImage') {
                                editor.chain().focus().deleteSelection().run();
                                console.log('Selected image deleted');
                                return;
                            }
                        }
                        
                        // Otherwise, try to find image around cursor position
                        const { from, to } = selection;
                        let imageFound = false;
                        
                        editor.state.doc.nodesBetween(from, to, (node, pos) => {
                            if (node.type.name === 'resizableImage') {
                                editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
                                console.log('Image near cursor deleted');
                                imageFound = true;
                                return false; // Stop iteration
                            }
                        });
                        
                        if (!imageFound) {
                            alert('Please click on an image to delete it, or place your cursor next to an image');
                        }
                    }}
                    className="px-3 py-1 text-sm font-medium rounded bg-red-100 text-red-800 hover:bg-red-200"
                >
                    🗑️ Delete Image
                </button>
                <button
                    type="button"
                    onClick={() => {
                        // Test with different URL formats
                        const filename = '1758094504_N6sbre2PTQ.jpg';
                        const testUrls = [
                            `/lesson-image/${filename}`,
                            `/storage/lesson_images/${filename}`,
                            `http://127.0.0.1:8000/lesson-image/${filename}`,
                            `http://127.0.0.1:8000/storage/lesson_images/${filename}`,
                            `http://localhost/Moovey/moovey/lesson-image/${filename}`,
                            `http://localhost/Moovey/moovey/storage/lesson_images/${filename}`
                        ];
                        
                        console.log('🧪 Testing multiple image URLs...');
                        
                        testUrls.forEach((testUrl, index) => {
                            console.log(`Testing URL ${index + 1}: ${testUrl}`);
                            
                            // Test if image loads
                            const testImg = document.createElement('img');
                            testImg.onload = () => {
                                console.log(`✅ URL ${index + 1} loads successfully: ${testUrl}`);
                                
                                // If this URL works, try inserting it
                                const success = editor?.chain().focus().command(({ tr, dispatch, editor }) => {
                                    if (dispatch) {
                                        const node = editor.schema.nodes.resizableImage.create({
                                            src: testUrl,
                                            alt: `Test image from URL ${index + 1}`,
                                            title: `Test image from URL ${index + 1}`,
                                            width: 'auto',
                                            height: 'auto'
                                        });
                                        tr.replaceSelectionWith(node);
                                    }
                                    return true;
                                }).run();
                                console.log(`Image insertion success for URL ${index + 1}:`, success);
                            };
                            testImg.onerror = () => console.log(`❌ URL ${index + 1} failed to load: ${testUrl}`);
                            testImg.src = testUrl;
                        });
                    }}
                    className="px-3 py-1 text-sm font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                >
                    🧪 Test
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
                    placeholder={placeholder}
                />
                
                {/* Helper text for image manipulation */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
                    💡 Upload images via the 📷 button or drag & drop
                </div>
            </div>
        </div>
    );
}