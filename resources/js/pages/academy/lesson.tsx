import { Head } from '@inertiajs/react';
import IndividualLessonView from '@/components/academy/IndividualLessonView';

interface Lesson {
    id: number;
    title: string;
    description: string;
    lesson_stage: string;
    duration: string;
    difficulty: string;
    lesson_order: number;
    status: string;
    content_html?: string;
    content_file_url?: string;
    thumbnail_file_url?: string;
    created_at: string;
    updated_at: string;
    is_accessible: boolean;
    is_completed: boolean;
    progress_percentage: number;
    started_at?: string;
    completed_at?: string;
    has_previous: boolean;
    has_next: boolean;
}

interface StageProgress {
    total: number;
    completed: number;
    percentage: number;
}

interface LessonPageProps {
    lesson: Lesson;
    stageLessons?: Lesson[];
    stage?: string;
    stageBadge?: string;
    stageProgress?: StageProgress;
    isAuthenticated: boolean;
}

export default function LessonPage(props: LessonPageProps) {
    return <IndividualLessonView {...props} />;
}