import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { topicService, subjectService } from '@/services/api';
import type { Topic, Subject, TopicComment } from '@/types';
import { FiArrowLeft, FiClock, FiFileText, FiDownload, FiMessageSquare, FiPlay } from 'react-icons/fi';
import { EmptyState } from '@/components/ui/StateComponents';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function TopicPage() {
    const { subjectId, topicId } = useParams<{ subjectId: string; topicId: string }>();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'test' | 'resources' | 'comments'>('about');
    const [comments, setComments] = useState<TopicComment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuthStore();
    const { addToast } = useUIStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const [t, s, comms] = await Promise.all([
                    topicService.getById(Number(topicId)),
                    subjectService.getById(Number(subjectId)),
                    topicService.getComments(Number(topicId))
                ]);
                setTopic(t);
                setSubject(s);
                setComments(comms);
            } finally { setLoading(false); }
        };
        fetch();
    }, [topicId, subjectId]);

    const handleAddComment = async () => {
        if (!commentText.trim()) return;
        setSubmitting(true);
        try {
            const newComment = await topicService.addComment(Number(topicId), commentText);
            setComments([newComment, ...comments]);
            setCommentText('');
            addToast('Izohingiz qo\'shildi', 'success');
        } catch {
            addToast('Xatolik yuz berdi', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="space-y-5">
            <div className="skeleton-shimmer h-8 w-48 rounded-lg" />
            <div className="skeleton-shimmer h-80 rounded-2xl" />
            <div className="skeleton-shimmer h-32 rounded-2xl" />
        </div>
    );

    if (!topic) return <div className="text-center py-20 text-slate-500">Mavzu topilmadi</div>;

    // Convert YouTube URL to embed format
    const getEmbedUrl = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&\n?#]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <Link to={`/subjects/${subjectId}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm font-medium mb-5 transition-colors">
                <FiArrowLeft size={16} /> {subject?.name}
            </Link>

            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">{topic.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><FiClock size={14} /> {topic.duration_minutes} daqiqa</span>
                        {topic.has_test && <span className="badge bg-secondary-50 text-secondary-600">✅ Test mavjud</span>}
                    </div>
                </div>

                {/* Video Player */}
                <div className="rounded-2xl overflow-hidden shadow-card bg-black aspect-video">
                    <iframe
                        src={getEmbedUrl(topic.video_url)}
                        title={topic.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 px-1 -mx-4 sm:mx-0 sm:px-0">
                    {[
                        { id: 'about', label: 'Dars haqida', icon: <FiFileText /> },
                        { id: 'test', label: 'Test', icon: <FiPlay /> },
                        { id: 'resources', label: 'Resurslar', icon: <FiDownload /> },
                        { id: 'comments', label: 'Izohlar', icon: <FiMessageSquare /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-4 px-2 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                                }`}
                        >
                            <span className="shrink-0">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px] animate-slide-up">
                    {activeTab === 'about' && (
                        <div className="card">
                            <h2 className="font-bold text-slate-800 mb-3">Mavzu tavsifi</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{topic.description}</p>
                        </div>
                    )}

                    {activeTab === 'test' && (
                        <div className="space-y-4">
                            {!topic.has_test ? (
                                <EmptyState icon="📝" title="Ushbu mavzu uchun test mavjud emas" />
                            ) : (
                                <div className="card border-2 border-secondary/20 bg-gradient-to-br from-white to-secondary-50/30">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-secondary-100 text-secondary-600 flex items-center justify-center text-2xl">
                                            <FiPlay />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">Bilimingizni sinab ko'ring</h3>
                                            <p className="text-slate-500">Mavzuni o'zlashtirganingizni tekshirish uchun test topshiring</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                            <p className="text-xs text-slate-400 mb-1">Savollar soni</p>
                                            <p className="font-bold text-slate-700">5 ta MCQ</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                                            <p className="text-xs text-slate-400 mb-1">Vaqt chegarasi</p>
                                            <p className="font-bold text-slate-700">10 daqiqa</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/test/${topic.id}`)}
                                        className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary/20"
                                    >
                                        Testni boshlash
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="space-y-4">
                            {!topic.resources || topic.resources.length === 0 ? (
                                <EmptyState icon="📂" title="Resurslar topilmadi" />
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {topic.resources.map(res => (
                                        <a
                                            key={res.id}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-soft transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl text-slate-500 group-hover:bg-primary-100 group-hover:text-primary transition-colors">
                                                <FiDownload />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 truncate">{res.name}</h4>
                                                <p className="text-xs text-slate-400">Turi: Foydali manba</p>
                                            </div>
                                            <FiArrowLeft className="rotate-180 text-slate-300 group-hover:text-primary transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="space-y-6">
                            {/* Comment Form */}
                            <div className="card">
                                <h3 className="font-bold text-slate-800 mb-4">Fikringizni qoldiring</h3>
                                <div className="flex gap-3">
                                    <Avatar name={user?.full_name || ''} src={user?.avatar} size="sm" />
                                    <div className="flex-1 space-y-3">
                                        <textarea
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            placeholder="Savol yoki fikringizni yozing..."
                                            className="input min-h-[100px] resize-none"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleAddComment}
                                                disabled={!commentText.trim() || submitting}
                                                className="btn-primary px-6"
                                            >
                                                {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <p className="text-slate-500">Hali izohlar yo'q. Birinchi bo'lib fikr bildiring!</p>
                                    </div>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 animate-slide-up">
                                            <Avatar name={c.user.full_name} src={c.user.avatar} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h5 className="font-bold text-slate-800 text-sm">{c.user.full_name}</h5>
                                                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
