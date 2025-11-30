# Declutter List Component Structure

This directory contains a well-organized, reusable component structure for the Declutter List feature with **full responsive design** for all devices.

## 📱 Responsive Design

All components are optimized for:
- **📱 Mobile phones** (320px - 639px)
- **📱 Large phones** (640px - 767px) 
- **💻 Tablets** (768px - 1023px)
- **💻 Laptops/Desktops** (1024px - 1279px)
- **🖥️ Large screens** (1280px+)

### Responsive Features:
- ✅ Flexible grid layouts that adapt to screen size
- ✅ Touch-friendly buttons and inputs
- ✅ Optimized font sizes and spacing
- ✅ Proper image scaling
- ✅ Modal that works on all devices
- ✅ Horizontal scrolling prevention
- ✅ Stack layouts on mobile, side-by-side on desktop

## Directory Structure

```
declutter/
├── index.ts                # Central export file for all components and utilities
├── types.ts                # TypeScript interfaces and constants
├── utils.ts                # Utility functions (image handling, etc.)
├── StatsOverview.tsx       # Statistics dashboard component
├── FiltersSection.tsx      # Search and filter controls component
├── QuickActions.tsx        # Quick actions and tips component
├── ItemCard.tsx            # Individual item display component
├── ItemsList.tsx           # Items list container component
├── ImageUpload.tsx         # Image upload and preview component
└── ItemFormModal.tsx       # Add/Edit item form modal component
```

## Component Overview

### Core Types (`types.ts`)
- `DeclutterItem`: Main item interface
- `DeclutterFormData`: Form data structure
- `DeclutterStats`: Statistics interface
- `categories`: List of item categories
- `conditions`: List of item conditions with descriptions

### Utilities (`utils.ts`)
- `getImageUrl()`: Generates correct image URLs for cloud/local storage
- `handleImageError()`: Error handler with fallback image paths

### Components

#### StatsOverview
Displays statistics dashboard with total items, estimated value, and action counts.

**Props:**
- `stats`: DeclutterStats object
- `totalEstimatedValue`: Total estimated value of items to sell

#### FiltersSection
Search and filter controls for the items list.

**Props:**
- `searchTerm`: Current search term
- `setSearchTerm`: Function to update search term
- `filterCategory`: Current category filter
- `setFilterCategory`: Function to update category filter
- `filterAction`: Current action filter
- `setFilterAction`: Function to update action filter

#### QuickActions
Quick actions panel with marketplace listing count and pro tips.

**Props:**
- `listedCount`: Number of items currently listed in marketplace

#### ItemCard
Individual item display card with actions (edit, list/unlist, delete).

**Props:**
- `item`: DeclutterItem object
- `onEdit`: Function to handle edit action
- `onDelete`: Function to handle delete action
- `onListForSale`: Function to list item for sale
- `onUnlistFromSale`: Function to unlist item from sale

#### ItemsList
Container component for displaying filtered items.

**Props:**
- `filteredItems`: Array of filtered DeclutterItem objects
- `totalItems`: Total number of items (before filtering)
- `onEdit`: Function to handle edit action
- `onDelete`: Function to handle delete action
- `onListForSale`: Function to list item for sale
- `onUnlistFromSale`: Function to unlist item from sale

#### ImageUpload
Image upload interface with preview and management.

**Props:**
- `imagePreviewUrls`: Array of image preview URLs
- `onImageSelect`: Function to handle image selection
- `onRemoveImage`: Function to remove an image
- `isEditing`: Boolean indicating edit mode (optional)

#### ItemFormModal
Modal form for adding or editing items.

**Props:**
- `isOpen`: Boolean to control modal visibility
- `onClose`: Function to close modal
- `formData`: DeclutterFormData object
- `setFormData`: Function to update form data
- `editingItem`: DeclutterItem being edited (null for new item)
- `onSubmit`: Function to handle form submission
- `imagePreviewUrls`: Array of image preview URLs
- `onImageSelect`: Function to handle image selection
- `onRemoveImage`: Function to remove an image

## Usage Example

```tsx
import { 
  StatsOverview, 
  FiltersSection, 
  ItemsList,
  DeclutterItem,
  DeclutterStats 
} from './declutter';

// Use components in your main component
<StatsOverview stats={stats} totalEstimatedValue={totalValue} />
<FiltersSection 
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  filterCategory={filterCategory}
  setFilterCategory={setFilterCategory}
  filterAction={filterAction}
  setFilterAction={setFilterAction}
/>
<ItemsList 
  filteredItems={items}
  totalItems={allItems.length}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onListForSale={handleList}
  onUnlistFromSale={handleUnlist}
/>
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easy to locate and update specific functionality
4. **Testability**: Small, focused components are easier to test
5. **Type Safety**: Centralized types ensure consistency across components
6. **Clean Imports**: Central index file simplifies imports

## Future Enhancements

- Add unit tests for each component
- Create Storybook stories for component documentation
- Add error boundaries for better error handling
- Implement lazy loading for better performance
- Add accessibility improvements (ARIA labels, keyboard navigation)
