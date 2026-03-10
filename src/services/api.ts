import axios from 'axios';
import {
    mockGrades, mockSubjects, mockTopics, mockTests,
    mockUsers, mockLeaderboard, mockStudents, mockComments
} from '@/mock/data';
import type {
    User, Grade, Subject, Topic, Test, LeaderboardEntry, TopicComment, Resource
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Mock delay helper
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

const USE_MOCK = true; // flip to false to use real backend

// ============ AUTH SERVICE ============
export const authService = {
    async login(username: string, password: string): Promise<{ user: User; access: string; refresh: string }> {
        if (USE_MOCK) {
            await delay(600);
            const user = mockUsers.find(u => u.username === username);
            if (!user || password !== 'password') {
                throw { message: "Username yoki parol noto'g'ri", status: 401 };
            }
            return { user, access: 'mock-access-token', refresh: 'mock-refresh-token' };
        }
        const res = await apiClient.post('/auth/login/', { username, password });
        return res.data;
    },

    async me(): Promise<User> {
        if (USE_MOCK) {
            await delay(300);
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : mockUsers[0];
        }
        const res = await apiClient.get('/auth/me/');
        return res.data;
    },

    async logout(): Promise<void> {
        if (USE_MOCK) { await delay(200); return; }
        await apiClient.post('/auth/logout/');
    },

    async updateProfile(id: number, data: Partial<User>): Promise<User> {
        if (USE_MOCK) {
            await delay(400);
            const stored = localStorage.getItem('user');
            const user = stored ? JSON.parse(stored) : mockUsers[0];
            const updated = { ...user, ...data };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        }
        const res = await apiClient.patch(`/auth/user/${id}/`, data);
        return res.data;
    },

    async getUsers(): Promise<User[]> {
        if (USE_MOCK) { await delay(400); return mockStudents; }
        const res = await apiClient.get('/auth/user/');
        return res.data.results;
    },
};

// ============ GRADE SERVICE ============
export const gradeService = {
    async getAll(): Promise<Grade[]> {
        if (USE_MOCK) { await delay(300); return mockGrades; }
        const res = await apiClient.get('/academic/grades/');
        return res.data;
    },

    async create(data: Partial<Grade>): Promise<Grade> {
        if (USE_MOCK) {
            await delay(400);
            const newGrade = { id: Date.now(), name: data.name || '', level: data.level || 7 };
            mockGrades.push(newGrade);
            return newGrade;
        }
        const res = await apiClient.post('/academic/grades/', data);
        return res.data;
    },

    async update(id: number, data: Partial<Grade>): Promise<Grade> {
        if (USE_MOCK) {
            await delay(400);
            const idx = mockGrades.findIndex(g => g.id === id);
            if (idx > -1) { mockGrades[idx] = { ...mockGrades[idx], ...data }; return mockGrades[idx]; }
            throw { message: 'Not found', status: 404 };
        }
        const res = await apiClient.patch(`/academic/grades/${id}/`, data);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        if (USE_MOCK) {
            await delay(400);
            const idx = mockGrades.findIndex(g => g.id === id);
            if (idx > -1) mockGrades.splice(idx, 1);
            return;
        }
        await apiClient.delete(`/academic/grades/${id}/`);
    },
};

// ============ SUBJECT SERVICE ============
export const subjectService = {
    async getAll(): Promise<Subject[]> {
        if (USE_MOCK) { await delay(400); return [...mockSubjects]; }
        const res = await apiClient.get('/academic/subjects/');
        return res.data.results;
    },

    async getById(id: number): Promise<Subject> {
        if (USE_MOCK) {
            await delay(300);
            const s = mockSubjects.find(s => s.id === id);
            if (!s) throw { message: 'Not found', status: 404 };
            return s;
        }
        const res = await apiClient.get(`/academic/subjects/${id}/`);
        return res.data;
    },

    async create(data: FormData | Partial<Subject>): Promise<Subject> {
        if (USE_MOCK) {
            await delay(500);
            const newSubject: Subject = {
                id: Date.now(),
                name: (data as any).name || 'Yangi fan',
                description: (data as any).description || '',
                image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&q=80',
                color: (data as any).color || '#2563EB',
                icon: (data as any).icon || '📚',
                topics_count: 0,
                has_book: false,
                created_at: new Date().toISOString(),
            };
            mockSubjects.push(newSubject);
            return newSubject;
        }
        const res = await apiClient.post('/academic/subjects/', data);
        return res.data;
    },

    async update(id: number, data: Partial<Subject>): Promise<Subject> {
        if (USE_MOCK) {
            await delay(400);
            const idx = mockSubjects.findIndex(s => s.id === id);
            if (idx > -1) { mockSubjects[idx] = { ...mockSubjects[idx], ...data }; return mockSubjects[idx]; }
            throw { message: 'Not found', status: 404 };
        }
        const res = await apiClient.patch(`/academic/subjects/${id}/`, data);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        if (USE_MOCK) {
            await delay(400);
            const idx = mockSubjects.findIndex(s => s.id === id);
            if (idx > -1) mockSubjects.splice(idx, 1);
            return;
        }
        await apiClient.delete(`/academic/subjects/${id}/`);
    },
};

// ============ TOPIC SERVICE ============
export const topicService = {
    async getAll(subjectId?: number): Promise<Topic[]> {
        if (USE_MOCK) {
            await delay(400);
            return subjectId ? mockTopics.filter(t => t.subject_id === subjectId) : [...mockTopics];
        }
        const params = subjectId ? `?subject=${subjectId}` : '';
        const res = await apiClient.get(`/academic/topics/${params}`);
        return res.data.results;
    },

    async getById(id: number): Promise<Topic> {
        if (USE_MOCK) {
            await delay(300);
            const t = mockTopics.find(t => t.id === id);
            if (!t) throw { message: 'Not found', status: 404 };
            return t;
        }
        const res = await apiClient.get(`/academic/topics/${id}/`);
        return res.data;
    },

    async create(data: Partial<Topic>): Promise<Topic> {
        if (USE_MOCK) {
            await delay(500);
            const newTopic: Topic = {
                id: Date.now(),
                subject_id: data.subject_id || 1,
                title: data.title || 'Yangi mavzu',
                description: data.description || '',
                video_url: data.video_url || '',
                resources: [],
                order: data.order || mockTopics.filter(t => t.subject_id === data.subject_id).length + 1,
                has_test: false,
                duration_minutes: data.duration_minutes || 15,
                created_at: new Date().toISOString(),
            };
            mockTopics.push(newTopic);
            return newTopic;
        }
        const res = await apiClient.post('/academic/topics/', data);
        return res.data;
    },

    async update(id: number, data: Partial<Topic>): Promise<Topic> {
        if (USE_MOCK) {
            await delay(400);
            const idx = mockTopics.findIndex(t => t.id === id);
            if (idx > -1) { mockTopics[idx] = { ...mockTopics[idx], ...data }; return mockTopics[idx]; }
            throw { message: 'Not found', status: 404 };
        }
        const res = await apiClient.patch(`/academic/topics/${id}/`, data);
        return res.data;
    },

    async delete(id: number): Promise<void> {
        if (USE_MOCK) {
            await delay(400);
            const idx = mockTopics.findIndex(t => t.id === id);
            if (idx > -1) mockTopics.splice(idx, 1);
            return;
        }
        await apiClient.delete(`/academic/topics/${id}/`);
    },

    async getComments(topicId: number): Promise<TopicComment[]> {
        if (USE_MOCK) {
            await delay(300);
            return mockComments[topicId] || [];
        }
        const res = await apiClient.get(`/academic/topics/${topicId}/comments/`);
        return res.data;
    },

    async addComment(topicId: number, text: string): Promise<TopicComment> {
        if (USE_MOCK) {
            await delay(400);
            const user = JSON.parse(localStorage.getItem('user') || JSON.stringify(mockUsers[0]));
            const newComment = {
                id: Date.now(),
                user,
                text,
                created_at: new Date().toISOString()
            };
            if (!mockComments[topicId]) mockComments[topicId] = [];
            mockComments[topicId].push(newComment);
            return newComment;
        }
        const res = await apiClient.post(`/academic/topics/${topicId}/comments/`, { text });
        return res.data;
    },
};

// ============ TEST SERVICE ============
export const testService = {
    async getByTopic(topicId: number): Promise<Test> {
        if (USE_MOCK) {
            await delay(500);
            const t = mockTests.find(t => t.topic_id === topicId);
            if (!t) throw { message: 'Bu mavzu uchun test mavjud emas', status: 404 };
            return t;
        }
        const res = await apiClient.get(`/academic/tests/?topic=${topicId}`);
        return res.data.results[0];
    },

    async getAll(): Promise<Test[]> {
        if (USE_MOCK) { await delay(400); return mockTests.slice(0, 20); }
        const res = await apiClient.get('/academic/tests/');
        return res.data.results;
    },

    async create(data: Partial<Test>): Promise<Test> {
        if (USE_MOCK) {
            await delay(500);
            const newTest: Test = {
                id: Date.now(),
                topic_id: data.topic_id || 0,
                title: data.title || 'Yangi test',
                time_limit_minutes: data.time_limit_minutes || 10,
                questions: data.questions || [],
            };
            mockTests.push(newTest);
            return newTest;
        }
        const res = await apiClient.post('/academic/tests/', data);
        return res.data;
    },
};

// ============ LEADERBOARD SERVICE ============
export const leaderboardService = {
    async getTop(query: { limit?: number; grade_id?: number; ordering?: string } = {}): Promise<LeaderboardEntry[]> {
        const { limit = 10, grade_id, ordering = '-points' } = query;
        if (USE_MOCK) {
            await delay(400);
            let result = [...mockLeaderboard];
            if (grade_id) {
                result = result.filter(e => e.grade.id === Number(grade_id));
            }
            if (ordering === '-points') {
                result.sort((a, b) => b.points - a.points);
            } else if (ordering === '-topics') {
                result.sort((a, b) => b.completed_topics - a.completed_topics);
            }
            return result.slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }));
        }
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (grade_id) params.append('grade_id', grade_id.toString());
        if (ordering) params.append('ordering', ordering);
        const res = await apiClient.get(`/academic/leaderboard/?${params.toString()}`);
        return res.data.results;
    },
};
