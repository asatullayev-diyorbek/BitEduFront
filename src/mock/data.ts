import type { Grade, Subject, Topic, Test, User, LeaderboardEntry } from '@/types';

// ============ GRADES ============
export const mockGrades: Grade[] = [
    { id: 1, name: '7-sinf', level: 7 },
    { id: 2, name: '8-sinf', level: 8 },
    { id: 3, name: '9-sinf', level: 9 },
    { id: 4, name: '10-sinf', level: 10 },
    { id: 5, name: '11-sinf', level: 11 },
];

// ============ SUBJECTS ============
export const mockSubjects: Subject[] = [
    {
        id: 1,
        name: 'Informatika',
        description: "Kompyuter fanlari, dasturlash asoslari va raqamli texnologiyalar bo'yicha kurs",
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
        color: '#2563EB',
        icon: '💻',
        topics_count: 10,
        has_book: true,
        book_url: '/mock/informatika.pdf',
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 2,
        name: 'Matematika',
        description: "Algebra, geometriya va tahlil bo'yicha chuqur matematik kurs",
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
        color: '#F59E0B',
        icon: '📐',
        topics_count: 10,
        has_book: true,
        book_url: '/mock/matematika.pdf',
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 3,
        name: 'Fizika',
        description: "Mexanika, termodinamika, elektr va optika bo'yicha fizika kursi",
        image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80',
        color: '#8B5CF6',
        icon: '⚛️',
        topics_count: 10,
        has_book: true,
        book_url: '/mock/fizika.pdf',
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 4,
        name: 'Kimyo',
        description: "Organik va noorganik kimyo, moddalar tuzilishi va reaktsiyalar",
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
        color: '#22C55E',
        icon: '🧪',
        topics_count: 10,
        has_book: true,
        book_url: '/mock/kimyo.pdf',
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        id: 5,
        name: 'Biologiya',
        description: "Tirik organizmlar, ekologiya, genetika va evolyutsiya asoslari",
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=400&q=80',
        color: '#EF4444',
        icon: '🌱',
        topics_count: 10,
        has_book: false,
        created_at: '2024-01-01T00:00:00Z',
    },
];

// ============ TOPICS ============
const generateTopics = (subjectId: number, subjectName: string): Topic[] => {
    const topicSets: Record<number, string[]> = {
        1: [
            "Kompyuter tarixi va rivojlanishi",
            "Axborot va ma'lumotlar",
            "Operatsion tizimlar",
            "Tarmoqlar va Internet",
            "HTML va veb-sahifalar",
            "CSS bilan dizayn",
            "JavaScript asoslari",
            "Algoritm va dasturlash",
            "Ma'lumotlar bazasi asoslari",
            "Kiber xavfsizlik asoslari",
        ],
        2: [
            "Natural sonlar va arifmetik amallar",
            "Kasrlar va o'nli sonlar",
            "Algebra asoslari",
            "Chiziqli tenglamalar",
            "Kvadrat tenglamalar",
            "Funksiyalar va grafiklar",
            "Geometriya asoslari",
            "Trigonometriya",
            "Vektorlar va koordinatlar",
            "Ehtimollik nazariyasi",
        ],
        3: [
            "Mexanika asoslari",
            "Kinematika",
            "Dinamika va Newton qonunlari",
            "Energiya va ish",
            "Termodinamika",
            "Elektrostatika",
            "Elektr toki",
            "Magnit maydon",
            "Optika",
            "Kvant fizikasi asoslari",
        ],
        4: [
            "Atom va molekula tuzilishi",
            "Kimyoviy formulalar",
            "Kimyoviy tenglamalar",
            "Oksidlanish va qayta tiklanish",
            "Organik kimyo asoslari",
            "Uglevodorodlar",
            "Spirtlar va efirlar",
            "Kislotalar va asoslar",
            "Tuzlar va eritmalar",
            "Kimyo va ekologiya",
        ],
        5: [
            "Biologiya fani va uning bo'limlari",
            "Hujayra tuzilishi",
            "Fotosintez jarayoni",
            "Nafas olish va energiya",
            "Genetika asoslari",
            "DNK va meros",
            "Evolyutsiya nazariyasi",
            "Ekosistemalar",
            "Inson anatomiyasi",
            "Immunitet tizimi",
        ],
    };

    const titles = topicSets[subjectId] || [];
    return titles.map((title, index) => ({
        id: subjectId * 100 + index + 1,
        subject_id: subjectId,
        title,
        description: `${title} mavzusi bo'yicha batafsil dars. Ushbu mavzuda asosiy tushunchalar, misollar va amaliy mashqlar keltirilgan.`,
        video_url: `https://www.youtube.com/watch?v=zOjov-2OZ0E`,
        resources: [
            { id: 1, name: 'Mavzu bo\'yicha tushuntirish (PDF)', url: 'https://example.com/slide.pdf' },
            { id: 2, name: 'Qo\'shimcha video darslik', url: 'https://youtube.com' },
            { id: 3, name: 'Amaliy topshiriqlar to\'plami', url: 'https://example.com/tasks' },
        ],
        order: index + 1,
        has_test: true,
        duration_minutes: 15 + Math.floor(Math.random() * 30),
        created_at: '2024-01-01T00:00:00Z',
    }));
};

export const mockTopics: Topic[] = mockSubjects.flatMap(s => generateTopics(s.id, s.name));


// ============ TESTS ============
const generateTest = (topicId: number, topicTitle: string): Test => {
    const questions = Array.from({ length: 5 }, (_, qi) => {
        const options = [
            { id: topicId * 100 + qi * 4 + 1, text: `To'g'ri javob - ${String.fromCharCode(65 + qi)}` },
            { id: topicId * 100 + qi * 4 + 2, text: `Noto'g'ri javob 1` },
            { id: topicId * 100 + qi * 4 + 3, text: `Noto'g'ri javob 2` },
            { id: topicId * 100 + qi * 4 + 4, text: `Noto'g'ri javob 3` },
        ];
        return {
            id: topicId * 100 + qi + 1,
            test_id: topicId,
            text: `${topicTitle} bo'yicha ${qi + 1}-savol: Bu mavzuning asosiy tushunchasi nima?`,
            options,
            correct_option_id: topicId * 100 + qi * 4 + 1,
        };
    });

    return {
        id: topicId,
        topic_id: topicId,
        title: `${topicTitle} - Test`,
        time_limit_minutes: 10,
        questions,
    };
};

export const mockTests: Test[] = mockTopics.map(t => generateTest(t.id, t.title));

// ============ STUDENTS ============
const firstNames = ['Ali', 'Bobur', 'Diyora', 'Feruza', 'Hasan', 'Iroda', 'Jasur', 'Kamola', 'Lochinbek', 'Malika',
    'Nodir', 'Oydin', 'Parizod', 'Ravshan', 'Sarvar', 'Tohir', 'Ulmas', 'Vasila', 'Xurshid', 'Yulduz',
    'Zafar', 'Aziz', 'Barno', 'Dilnoza', 'Eldor'];
const lastNames = ['Toshmatov', 'Karimov', 'Rahimov', 'Yusupov', 'Mirzayev', 'Hasanov', 'Ismoilov',
    'Nazarov', 'Qodirov', 'Sobirov', 'Tursunov', 'Umarov', 'Xolmatov'];

export const mockStudents: User[] = Array.from({ length: 30 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const grade = mockGrades[(i % 5)];
    return {
        id: i + 10,
        username: `student${i + 1}`,
        full_name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}${i + 1}@edu.uz`,
        role: 'student',
        grade,
        grade_id: grade.id,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}`,
        points: Math.floor(Math.random() * 4500) + 100,
        completed_lessons: Math.floor(Math.random() * 40),
        joined_at: '2024-09-01T00:00:00Z',
    };
});

// ============ MOCK USERS (Auth) ============
export const mockUsers: User[] = [
    {
        id: 1,
        username: 'student',
        full_name: 'Ali Toshmatov',
        email: 'ali@edu.uz',
        role: 'student',
        grade: mockGrades[2], // 9-sinf
        grade_id: 3,
        avatar: 'https://thumbs.dreamstime.com/b/d-icon-avatar-student-man-reading-book-school-concept-education-learning-isolated-transparent-png-background-cartoon-352289965.jpg',
        points: 2450,
        completed_lessons: 18,
        joined_at: '2024-09-01T00:00:00Z',
    },
    {
        id: 2,
        username: 'admin',
        full_name: 'Sardor Adminov',
        email: 'admin@edu.uz',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        points: 0,
        completed_lessons: 0,
        joined_at: '2024-01-01T00:00:00Z',
    },
];

// ============ LEADERBOARD ============
export const mockLeaderboard: LeaderboardEntry[] = [...mockStudents]
    .sort((a, b) => b.points - a.points)
    .map((user, index) => ({
        rank: index + 1,
        user,
        points: user.points,
        completed_topics: user.completed_lessons,
        grade: user.grade!,
    }));

// ============ COMMENTS ============
export const mockComments: Record<number, any[]> = mockTopics.reduce((acc, topic) => {
    acc[topic.id] = [
        { id: 1, user: mockStudents[0], text: "Juda foydali dars bo'ldi, rahmat!", created_at: '2024-10-02T10:00:00Z' },
        { id: 2, user: mockStudents[1], text: "3-daqiqa dagi misolni tushunmadim, qayta tushuntirib yubora olasizlarmi?", created_at: '2024-10-02T11:30:00Z' },
        { id: 3, user: mockStudents[2], text: "Test savollari ham qiziqarli ekan.", created_at: '2024-10-02T12:00:00Z' },
    ];
    return acc;
}, {} as Record<number, any[]>);
