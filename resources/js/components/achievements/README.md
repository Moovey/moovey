# Achievement Components

This directory contains reusable React components for the achievement system in the Moovey application.

## Components Overview

### 🎉 AchievementCelebrationModal
A modal component that displays when a user unlocks a new achievement.

**Props:**
- `isVisible: boolean` - Controls modal visibility
- `achievement: Achievement | null` - The achievement that was unlocked
- `onClose: () => void` - Callback when modal is closed

**Usage:**
```tsx
<AchievementCelebrationModal 
    isVisible={showCelebration}
    achievement={newlyUnlocked}
    onClose={() => setShowCelebration(false)}
/>
```

### 🏆 AchievementCard
A card component that displays individual achievement information with different states (earned, in-progress, locked).

**Props:**
- `achievement: Achievement` - The achievement data to display
- `onClick: (achievement: Achievement) => void` - Callback when card is clicked
- `getTimeToComplete: (achievement: Achievement) => string` - Function to calculate completion time

**Features:**
- Interactive hover effects
- Progress bars for locked achievements
- Status indicators and badges
- Responsive design

### 📊 AchievementStats
A grid component displaying key achievement statistics.

**Props:**
- `statusCounts: StatusCounts` - Object containing earned, inProgress, locked, and totalPoints
- `totalAchievements: number` - Total number of achievements available

**Displays:**
- Achievements Earned
- In Progress count
- Total Points
- Completion Rate percentage

### 🔍 AchievementLegend
A component showing color-coded legend for achievement statuses.

**Props:**
- `statusCounts: StatusCounts` - Status counts for displaying numbers in legend

### 🏅 AchievementRankProgress
A component displaying the user's current rank and progress to the next rank.

**Props:**
- `statusCounts: StatusCounts` - Used to calculate current rank based on total points

**Features:**
- Dynamic rank calculation
- Progress bar to next rank
- Animated progress indicators
- Maximum rank achievement display

### 🎯 AchievementGalleryHeader
A comprehensive header component combining title, stats, and legend.

**Props:**
- `statusCounts: StatusCounts` - Achievement status counts
- `totalAchievements: number` - Total achievements available

**Contains:**
- Gallery title and subtitle
- AchievementStats component
- AchievementLegend component

### 🔧 AchievementFilters
A filtering component for achievements with search and category filters.

**Props:**
- `filter: 'all' | 'earned' | 'in-progress' | 'locked'` - Current status filter
- `setFilter: (filter) => void` - Status filter setter
- `categoryFilter: string` - Current category filter
- `setCategoryFilter: (category: string) => void` - Category filter setter
- `searchTerm: string` - Current search term
- `setSearchTerm: (term: string) => void` - Search term setter
- `categories: string[]` - Available categories for filtering

### 📂 AchievementCategoriesGrid
A comprehensive component that renders all achievement categories with filtering.

**Props:**
- `categories: string[]` - Array of category names
- `achievements: Achievement[]` - All achievements data
- `categoryFilter: string` - Current category filter
- `onAchievementClick: (achievement: Achievement) => void` - Achievement click handler
- `getTimeToComplete: (achievement: Achievement) => string` - Time calculation function

**Features:**
- Automatic category filtering
- Progress calculation per category
- Responsive grid layout

### 📑 AchievementCategorySection
A component for displaying a single category section with its achievements.

**Props:**
- `category: string` - Category name
- `achievements: Achievement[]` - Achievements for this category
- `categoryProgress: number` - Progress percentage for this category
- `onAchievementClick: (achievement: Achievement) => void` - Achievement click handler
- `getTimeToComplete: (achievement: Achievement) => string` - Time calculation function

### 🐛 AchievementDebugSection
A debug component for simulating achievement unlocks during development.

**Props:**
- `achievements: Achievement[]` - All achievements data
- `onSimulateUnlock: (achievementId: string) => void` - Function to simulate unlock

## Type Definitions

### Achievement Interface
```typescript
interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    status: 'earned' | 'in-progress' | 'locked';
    category: string;
    earnedDate?: string;
    progress?: number;
    maxProgress?: number;
    requirements?: string;
    points: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Expert';
}
```

### StatusCounts Interface
```typescript
interface StatusCounts {
    earned: number;
    inProgress: number;
    locked: number;
    totalPoints: number;
}
```

## Usage Example

```tsx
import { 
    AchievementCelebrationModal, 
    AchievementGalleryHeader,
    AchievementFilters,
    AchievementRankProgress,
    AchievementCategoriesGrid,
    AchievementDebugSection
} from '@/components/achievements';

function AchievementsPage() {
    // ... component state and logic

    return (
        <div>
            <AchievementCelebrationModal 
                isVisible={showCelebration}
                achievement={newlyUnlocked}
                onClose={() => setShowCelebration(false)}
            />
            
            <AchievementGalleryHeader 
                statusCounts={statusCounts}
                totalAchievements={achievements.length}
            />
            
            <AchievementRankProgress statusCounts={statusCounts} />
            
            <AchievementFilters
                filter={filter}
                setFilter={setFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
            />
            
            <AchievementCategoriesGrid
                categories={categories}
                achievements={achievements}
                categoryFilter={categoryFilter}
                onAchievementClick={handleAchievementClick}
                getTimeToComplete={getTimeToComplete}
            />
            
            <AchievementDebugSection
                achievements={achievements}
                onSimulateUnlock={simulateAchievementUnlock}
            />
        </div>
    );
}
```

## Benefits of This Architecture

1. **Reusability**: Components can be used across different pages
2. **Maintainability**: Changes to achievement display logic are centralized
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Performance**: Smaller, focused components with optimized re-renders
5. **Testing**: Each component can be tested independently
6. **Consistency**: Uniform styling and behavior across the application

## Styling

All components use Tailwind CSS classes and maintain consistency with the Moovey design system:
- Primary color: `#00BCD4` (cyan)
- Hover color: `#0097A7` (darker cyan)
- Rounded corners: `rounded-2xl` for cards, `rounded-xl` for buttons
- Shadow: `shadow-lg` for elevated components
- Animation: Smooth transitions and hover effectschievement Components

This directory contains reusable components for the achievement system.

## Components

### AchievementCard
A reusable card component that displays individual achievements with their status, progress, and interactions.

**Props:**
- `achievement: Achievement` - The achievement data to display
- `onClick: (achievement: Achievement) => void` - Click handler for achievement interactions
- `getTimeToComplete: (achievement: Achievement) => string` - Function to calculate estimated completion time

**Features:**
- Status-aware styling (earned, in-progress, locked)
- Progress bars for achievements with progress tracking
- Hover effects and animations
- Click handling for sharing and requirements display

### AchievementCelebrationModal
A modal component that displays when an achievement is unlocked, providing a celebratory experience.

**Props:**
- `isVisible: boolean` - Controls modal visibility
- `achievement: Achievement | null` - The achievement that was unlocked
- `onClose: () => void` - Callback to close the modal

**Features:**
- Animated celebration display
- Achievement details with points
- Auto-close functionality
- Responsive design

## Types

### Achievement
Located in `@/types/achievement.ts`, this interface defines the structure of achievement data:

```typescript
interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    status: 'earned' | 'in-progress' | 'locked';
    category: string;
    earnedDate?: string;
    progress?: number;
    maxProgress?: number;
    requirements?: string;
    points: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Expert';
}
```

## Usage

```tsx
import { AchievementCard, AchievementCelebrationModal } from '@/components/achievements';

// Achievement Card
<AchievementCard 
    achievement={achievement}
    onClick={handleAchievementClick}
    getTimeToComplete={getTimeToComplete}
/>

// Celebration Modal
<AchievementCelebrationModal 
    isVisible={showCelebration}
    achievement={unlockedAchievement}
    onClose={() => setShowCelebration(false)}
/>
```

## Benefits

1. **Reusability**: Components can be used across different parts of the application
2. **Maintainability**: Changes to achievement display only need to be made in one place
3. **Type Safety**: Proper TypeScript interfaces ensure data consistency
4. **Separation of Concerns**: UI logic is separated from business logic
5. **Testability**: Individual components can be easily unit tested