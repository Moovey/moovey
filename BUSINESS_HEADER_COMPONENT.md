# BusinessHeader Component

## Overview
A reusable header component for all business pages that provides consistent styling, avatar upload functionality, and customizable content.

## Features
- **Consistent Design**: Gradient background with decorative elements
- **Avatar Upload**: Click-to-upload profile picture functionality
- **Customizable Content**: Props for title and subtitle
- **Error Handling**: File validation and upload error handling
- **Responsive Design**: Works across different screen sizes

## Usage

### Basic Usage
```tsx
import BusinessHeader from '@/components/business/BusinessHeader';

<BusinessHeader 
  title="Welcome back"
  subtitle="Your Business Overview"
  showAvatar={true}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Welcome back"` | Main heading text |
| `subtitle` | `string` | `"Your Business Overview"` | Subtitle text below heading |
| `showAvatar` | `boolean` | `true` | Whether to show avatar upload section |

### Examples

#### Overview Page
```tsx
<BusinessHeader 
  title="Welcome back"
  subtitle="Your Business Overview"
  showAvatar={true}
/>
```

#### Analytics Page
```tsx
<BusinessHeader 
  title="Business Analytics"
  subtitle="Track your performance"
  showAvatar={true}
/>
```

#### Leads Page
```tsx
<BusinessHeader 
  title="Customer Leads"
  subtitle="Manage your leads"
  showAvatar={true}
/>
```

#### Services Page
```tsx
<BusinessHeader 
  title="My Services"
  subtitle="Set up your Free Basic Listing"
  showAvatar={true}
/>
```

#### Settings Page
```tsx
<BusinessHeader 
  title="Business Settings"
  subtitle="Manage your business account and preferences"
  showAvatar={true}
/>
```

## Features

### Avatar Upload
- **File Types**: Images only (validated)
- **Size Limit**: 2MB maximum
- **API Endpoint**: `/api/avatar/upload`
- **Error Handling**: Toast notifications for errors
- **Success Handling**: Page refresh after successful upload

### User Experience
- **Dynamic Names**: Shows authenticated user's name in title
- **Fallback Avatars**: Generates initials-based avatars when no image uploaded
- **Loading States**: Spinner during upload process
- **Upload Indicator**: Plus icon overlay on avatar

## Dependencies
- `@inertiajs/react` - For page props and authentication
- `react-toastify` - For error/success notifications
- `@/utils/fileUtils` - For avatar URL handling

## Implementation Notes
- Component uses Inertia's `usePage()` to get authenticated user data
- Handles file validation (type and size) before upload
- Automatically refreshes page after successful upload
- Gracefully handles upload errors without breaking functionality
- Uses same avatar upload system as housemover components

## Files Updated
- `resources/js/pages/business/overview.tsx`
- `resources/js/pages/business/analytics.tsx`
- `resources/js/pages/business/leads.tsx`
- `resources/js/pages/business/services.tsx`
- `resources/js/pages/business/settings.tsx`

All business pages now use the consistent BusinessHeader component for a unified user experience.