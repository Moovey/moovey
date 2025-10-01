import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Lesson {
    id: string;
    title: string;
    description: string;
    lessonStage: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    uploadDate: string;
    status: 'Draft' | 'Published' | 'Archived';
    contentFile?: string;
    thumbnailFile?: string;
}

interface LessonsContextType {
    lessons: Lesson[];
    addLesson: (lesson: Omit<Lesson, 'id' | 'uploadDate'>) => void;
    updateLesson: (id: string, lesson: Partial<Lesson>) => void;
    deleteLesson: (id: string) => void;
    getPublishedLessons: () => Lesson[];
    getLessonsByStage: (stage: string) => Lesson[];
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

// Initial sample lessons
const initialLessons: Lesson[] = [
    {
        id: '1',
        title: 'Finding Your Moving Motivation',
        description: 'Discover the deeper reasons behind your move and how to stay motivated throughout the process.',
        lessonStage: 'Move Dreamer',
        duration: '15 mins',
        difficulty: 'Beginner',
        uploadDate: '2024-01-15',
        status: 'Published'
    },
    {
        id: '2',
        title: 'Common Moving Mistakes to Avoid',
        description: 'Learn from others experiences and avoid the most common pitfalls when planning your move.',
        lessonStage: 'Move Dreamer',
        duration: '12 mins',
        difficulty: 'Beginner',
        uploadDate: '2024-01-16',
        status: 'Published'
    },
    {
        id: '3',
        title: 'Why Move? Understanding Your Big Reason',
        description: 'Deep dive into the personal and practical reasons that drive the decision to relocate.',
        lessonStage: 'Move Dreamer',
        duration: '18 mins',
        difficulty: 'Beginner',
        uploadDate: '2024-01-17',
        status: 'Published'
    },
    {
        id: '4',
        title: 'Creating Your Moving Budget',
        description: 'Learn how to estimate costs and create a realistic budget for your upcoming move.',
        lessonStage: 'Plan Starter',
        duration: '18 mins',
        difficulty: 'Beginner',
        uploadDate: '2024-01-18',
        status: 'Published'
    },
    {
        id: '5',
        title: 'Moving Timeline Creation',
        description: 'Master the art of creating a detailed timeline that keeps your move on track.',
        lessonStage: 'Plan Starter',
        duration: '22 mins',
        difficulty: 'Intermediate',
        uploadDate: '2024-01-20',
        status: 'Published'
    },
    {
        id: '6',
        title: 'Choosing the Right Moving Company',
        description: 'Essential criteria and red flags to consider when selecting professional movers.',
        lessonStage: 'Plan Starter',
        duration: '25 mins',
        difficulty: 'Intermediate',
        uploadDate: '2024-01-21',
        status: 'Published'
    },
    {
        id: '7',
        title: 'Evaluating Moving Companies',
        description: 'Develop critical thinking skills to evaluate and compare moving service providers.',
        lessonStage: 'Moovey Critic',
        duration: '25 mins',
        difficulty: 'Intermediate',
        uploadDate: '2024-01-22',
        status: 'Published'
    },
    {
        id: '8',
        title: 'Reading Moving Reviews Effectively',
        description: 'Learn how to analyze reviews and testimonials to make informed decisions.',
        lessonStage: 'Moovey Critic',
        duration: '20 mins',
        difficulty: 'Intermediate',
        uploadDate: '2024-01-23',
        status: 'Published'
    },
    {
        id: '9',
        title: 'Packing Strategies for Fragile Items',
        description: 'Master advanced packing techniques to protect your most valuable belongings.',
        lessonStage: 'Prep Pioneer',
        duration: '30 mins',
        difficulty: 'Intermediate',
        uploadDate: '2024-01-25',
        status: 'Published'
    },
    {
        id: '10',
        title: 'Room-by-Room Preparation Guide',
        description: 'Systematic approach to preparing each room of your home for the moving day.',
        lessonStage: 'Prep Pioneer',
        duration: '35 mins',
        difficulty: 'Intermediate',
        uploadDate: '2024-01-26',
        status: 'Published'
    }
];

export function LessonsProvider({ children }: { children: ReactNode }) {
    const [lessons, setLessons] = useState<Lesson[]>(initialLessons);

    const addLesson = (lessonData: Omit<Lesson, 'id' | 'uploadDate'>) => {
        const newLesson: Lesson = {
            ...lessonData,
            id: Date.now().toString(),
            uploadDate: new Date().toISOString().split('T')[0]
        };
        setLessons(prev => [newLesson, ...prev]);
    };

    const updateLesson = (id: string, updatedData: Partial<Lesson>) => {
        setLessons(prev => prev.map(lesson => 
            lesson.id === id ? { ...lesson, ...updatedData } : lesson
        ));
    };

    const deleteLesson = (id: string) => {
        setLessons(prev => prev.filter(lesson => lesson.id !== id));
    };

    const getPublishedLessons = () => {
        return lessons.filter(lesson => lesson.status === 'Published');
    };

    const getLessonsByStage = (stage: string) => {
        return lessons.filter(lesson => 
            lesson.lessonStage === stage && lesson.status === 'Published'
        );
    };

    const value: LessonsContextType = {
        lessons,
        addLesson,
        updateLesson,
        deleteLesson,
        getPublishedLessons,
        getLessonsByStage
    };

    return (
        <LessonsContext.Provider value={value}>
            {children}
        </LessonsContext.Provider>
    );
}

export function useLessons() {
    const context = useContext(LessonsContext);
    if (context === undefined) {
        throw new Error('useLessons must be used within a LessonsProvider');
    }
    return context;
}