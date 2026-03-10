// ============ Auth ============
export interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
    role: 'student' | 'admin';
    grade?: Grade;
    grade_id?: number;
    avatar?: string;
    points: number;
    completed_lessons: number;
    joined_at: string;
}

// ============ Academic ============
export interface Grade {
    id: number;
    name: string;
    level: number;
}

export interface Subject {
    id: number;
    name: string;
    description: string;
    image: string;
    color: string;
    icon: string;
    topics_count: number;
    has_book: boolean;
    book_url?: string;
    grade_id?: number;
    created_at: string;
}

export interface Resource {
    id: number;
    name: string;
    url: string;
}

export interface TopicComment {
    id: number;
    user: User;
    text: string;
    created_at: string;
}

export interface Topic {
    id: number;
    subject_id: number;
    title: string;
    description: string;
    video_url: string;
    resources: Resource[];
    order: number;
    has_test: boolean;
    duration_minutes: number;
    created_at: string;
}

export interface Question {
    id: number;
    test_id: number;
    text: string;
    options: Option[];
    correct_option_id: number;
}

export interface Option {
    id: number;
    text: string;
}

export interface Test {
    id: number;
    topic_id: number;
    title: string;
    time_limit_minutes: number;
    questions: Question[];
}

export interface TestResult {
    score: number;
    total: number;
    correct: number;
    wrong: number;
    time_taken: number;
    passed: boolean;
}

export interface LeaderboardEntry {
    rank: number;
    user: User;
    points: number;
    completed_topics: number;
    grade: Grade;
}

// ============ API Response Helpers ============
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ApiError {
    message: string;
    status: number;
}

// ============ Form Types ============
export interface LoginForm {
    username: string;
    password: string;
}

export interface SubjectForm {
    name: string;
    description: string;
    grade_id: number;
    image?: File;
    book?: File;
    color: string;
    icon: string;
}

export interface TopicForm {
    title: string;
    description: string;
    video_url: string;
    subject_id: number;
    order: number;
    duration_minutes: number;
}

export interface QuestionForm {
    text: string;
    options: { text: string }[];
    correct_option_index: number;
}

export interface TestForm {
    title: string;
    topic_id: number;
    time_limit_minutes: number;
    questions: QuestionForm[];
}
