import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { NodeView } from 'prosemirror-view';
import { NodeSelection } from 'prosemirror-state';

interface ImageOptions {
  HTMLAttributes: Record<string, any>;
  allowBase64: boolean;
  inline: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: { src: string; alt?: string; title?: string; width?: string; height?: string }) => ReturnType;
      updateImageSize: (options: { width?: string; height?: string }) => ReturnType;
    };
  }
}

class ResizableImageView implements NodeView {
  node: any;
  view: any;
  getPos: any;
  dom: HTMLElement;
  img: HTMLImageElement;
  resizeHandles: HTMLElement[] = [];
  isResizing = false;
  startX = 0;
  startY = 0;
  startWidth = 0;
  startHeight = 0;

  constructor(node: any, view: any, getPos: any) {
    console.log('🖼️ Creating ResizableImageView for:', node.attrs.src);
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // Create wrapper
    this.dom = document.createElement('div');
    this.dom.className = 'resizable-image-wrapper relative inline-block group cursor-move';
    this.dom.style.cssText = `
      position: relative;
      display: inline-block;
      max-width: 100%;
      margin: 16px 0;
    `;

    console.log('📦 Created wrapper div with classes:', this.dom.className);

    // Create image
    this.img = document.createElement('img');
    this.img.src = this.node.attrs.src;
    this.img.alt = this.node.attrs.alt || '';
    this.img.title = this.node.attrs.title || '';
    
    console.log('🖼️ Creating image element with src:', this.img.src);
    
    if (this.node.attrs.width) {
      this.img.style.width = this.node.attrs.width;
    }
    if (this.node.attrs.height) {
      this.img.style.height = this.node.attrs.height;
    }
    
    this.img.className = 'max-w-full h-auto rounded-lg border border-gray-200 block';
    this.img.style.cssText += `
      display: block;
      pointer-events: none;
    `;

    this.img.onload = () => console.log('✅ Image loaded successfully:', this.img.src);
    this.img.onerror = () => console.log('❌ Image failed to load:', this.img.src);

    this.dom.appendChild(this.img);
    console.log('📦 Added image to wrapper');

    // Create delete button
    this.createDeleteButton();

    // Create resize handles
    this.createResizeHandles();

    // Add event listeners
    this.dom.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.dom.addEventListener('dragstart', (e) => e.preventDefault());
  }

  createDeleteButton() {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '✕';
    deleteButton.className = 'absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center text-xs font-bold hover:bg-red-600';
    deleteButton.style.cssText = `
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.deleteImage();
    });

    this.dom.appendChild(deleteButton);
  }

  deleteImage() {
    const pos = this.getPos();
    const tr = this.view.state.tr;
    tr.delete(pos, pos + this.node.nodeSize);
    this.view.dispatch(tr);
  }

  createResizeHandles() {
    const positions = [
      { class: 'top-left', cursor: 'nw-resize', position: 'top: -4px; left: -4px;' },
      { class: 'top-right', cursor: 'ne-resize', position: 'top: -4px; right: -4px;' },
      { class: 'bottom-left', cursor: 'sw-resize', position: 'bottom: -4px; left: -4px;' },
      { class: 'bottom-right', cursor: 'se-resize', position: 'bottom: -4px; right: -4px;' },
      { class: 'top-center', cursor: 'n-resize', position: 'top: -4px; left: 50%; transform: translateX(-50%);' },
      { class: 'bottom-center', cursor: 's-resize', position: 'bottom: -4px; left: 50%; transform: translateX(-50%);' },
      { class: 'left-center', cursor: 'w-resize', position: 'left: -4px; top: 50%; transform: translateY(-50%);' },
      { class: 'right-center', cursor: 'e-resize', position: 'right: -4px; top: 50%; transform: translateY(-50%);' },
    ];

    positions.forEach(({ class: className, cursor, position }) => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${className} absolute w-2 h-2 bg-blue-500 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10`;
      handle.style.cssText = `
        ${position}
        cursor: ${cursor};
        width: 8px;
        height: 8px;
        background: #3b82f6;
        border: 1px solid white;
        border-radius: 50%;
        position: absolute;
        z-index: 10;
      `;
      
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.startResize(e, className);
      });

      this.resizeHandles.push(handle);
      this.dom.appendChild(handle);
    });
  }

  handleMouseDown(e: MouseEvent) {
    if (this.isResizing) return;
    
    // Check if clicking on a resize handle
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      return;
    }

    // Start drag for repositioning
    this.startDrag(e);
  }

  startDrag(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = this.dom.getBoundingClientRect();

    this.dom.style.opacity = '0.7';
    this.dom.style.transform = 'scale(0.95)';
    this.dom.style.transition = 'all 0.2s ease';

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      this.dom.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.95)`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      this.dom.style.opacity = '1';
      this.dom.style.transform = '';
      this.dom.style.transition = '';

      // Find drop position
      const dropY = e.clientY;
      const editor = this.view;
      const pos = editor.posAtCoords({ left: e.clientX, top: dropY });
      
      if (pos && pos.pos !== this.getPos()) {
        // Move the image to new position
        const currentPos = this.getPos();
        const tr = editor.state.tr;
        
        // Delete from current position
        tr.delete(currentPos, currentPos + this.node.nodeSize);
        
        // Insert at new position
        const newPos = pos.pos > currentPos ? pos.pos - this.node.nodeSize : pos.pos;
        tr.insert(newPos, this.node);
        
        editor.dispatch(tr);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  startResize(e: MouseEvent, direction: string) {
    e.preventDefault();
    e.stopPropagation();

    this.isResizing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = this.img.offsetWidth;
    this.startHeight = this.img.offsetHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - this.startX;
      const deltaY = e.clientY - this.startY;

      let newWidth = this.startWidth;
      let newHeight = this.startHeight;

      switch (direction) {
        case 'top-left':
          newWidth = this.startWidth - deltaX;
          newHeight = this.startHeight - deltaY;
          break;
        case 'top-right':
          newWidth = this.startWidth + deltaX;
          newHeight = this.startHeight - deltaY;
          break;
        case 'bottom-left':
          newWidth = this.startWidth - deltaX;
          newHeight = this.startHeight + deltaY;
          break;
        case 'bottom-right':
          newWidth = this.startWidth + deltaX;
          newHeight = this.startHeight + deltaY;
          break;
        case 'top-center':
          newHeight = this.startHeight - deltaY;
          break;
        case 'bottom-center':
          newHeight = this.startHeight + deltaY;
          break;
        case 'left-center':
          newWidth = this.startWidth - deltaX;
          break;
        case 'right-center':
          newWidth = this.startWidth + deltaX;
          break;
      }

      // Maintain aspect ratio for corner handles
      if (['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(direction)) {
        const aspectRatio = this.startWidth / this.startHeight;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      // Apply constraints
      newWidth = Math.max(50, Math.min(newWidth, 800));
      newHeight = Math.max(50, Math.min(newHeight, 600));

      this.img.style.width = `${newWidth}px`;
      this.img.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      this.isResizing = false;

      // Update the node attributes
      const pos = this.getPos();
      const tr = this.view.state.tr;
      tr.setNodeMarkup(pos, null, {
        ...this.node.attrs,
        width: this.img.style.width,
        height: this.img.style.height,
      });
      this.view.dispatch(tr);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  update(node: any) {
    if (node.type !== this.node.type) return false;
    
    this.node = node;
    this.img.src = node.attrs.src;
    this.img.alt = node.attrs.alt || '';
    this.img.title = node.attrs.title || '';
    
    if (node.attrs.width) {
      this.img.style.width = node.attrs.width;
    }
    if (node.attrs.height) {
      this.img.style.height = node.attrs.height;
    }
    
    return true;
  }

  destroy() {
    this.resizeHandles.forEach(handle => handle.remove());
  }
}

export const ResizableImage = Node.create<ImageOptions>({
  name: 'resizableImage',

  addOptions() {
    return {
      HTMLAttributes: {},
      allowBase64: false,
      inline: false,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          const img = element as HTMLImageElement;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.style.width || img.getAttribute('width'),
            height: img.style.height || img.getAttribute('height'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, height, ...otherAttrs } = HTMLAttributes;
    const style = [];
    if (width) style.push(`width: ${width}`);
    if (height) style.push(`height: ${height}`);
    
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, otherAttrs, {
        style: style.length > 0 ? style.join('; ') : undefined,
      }),
    ];
  },

  addNodeView() {
    return ({ node, view, getPos }) => {
      return new ResizableImageView(node, view, getPos);
    };
  },

  addCommands() {
    return {
      setImage: (options) => ({ tr, dispatch }) => {
        const { selection } = tr;
        const node = this.type.create(options);

        if (dispatch) {
          tr.replaceRangeWith(selection.from, selection.to, node);
        }

        return true;
      },
      updateImageSize: (options) => ({ tr, state, dispatch }) => {
        const { selection } = state;
        
        // Check if this is a NodeSelection with a node
        let node = null;
        if (selection instanceof NodeSelection) {
          node = selection.node;
        }

        if (node && node.type.name === this.name) {
          if (dispatch) {
            tr.setNodeMarkup(selection.from, null, {
              ...node.attrs,
              ...options,
            });
          }
        }

        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Delete: () => {
        const { selection } = this.editor.state;
        if (selection instanceof NodeSelection && selection.node.type.name === this.name) {
          return this.editor.chain().deleteSelection().run();
        }
        return false;
      },
      Backspace: () => {
        const { selection } = this.editor.state;
        if (selection instanceof NodeSelection && selection.node.type.name === this.name) {
          return this.editor.chain().deleteSelection().run();
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('resizableImage'),
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const hasFiles = event.dataTransfer && 
                               event.dataTransfer.files && 
                               event.dataTransfer.files.length;

              if (!hasFiles) {
                return false;
              }

              const images = Array.from(event.dataTransfer.files).filter(file =>
                /image/i.test(file.type)
              );

              if (images.length === 0) {
                return false;
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              images.forEach(async (image) => {
                // Create FormData for upload
                const formData = new FormData();
                formData.append('image', image);

                try {
                  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                  
                  const response = await fetch('/admin/lesson-images/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                      'X-CSRF-TOKEN': csrfToken || '',
                      'Accept': 'application/json',
                    },
                  });

                  const result = await response.json();
                  
                  if (result.success && coordinates) {
                    const node = schema.nodes.resizableImage.create({
                      src: result.url,
                      alt: image.name,
                      title: image.name,
                    });

                    const transaction = view.state.tr.insert(coordinates.pos, node);
                    view.dispatch(transaction);
                  }
                } catch (error) {
                  console.error('Error uploading dropped image:', error);
                }
              });

              return true;
            },
          },
        },
      }),
    ];
  },
});