import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subjectService, topicService } from '@/services/api';
import type { Subject, Topic } from '@/types';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateComponents';
import { FiBook, FiPlay, FiClock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

export default function SubjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sub, tops] = await Promise.all([
                    subjectService.getById(Number(id)),
                    topicService.getAll(Number(id)),
                ]);
                setSubject(sub);
                setTopics(tops.sort((a, b) => a.order - b.order));
            } catch {
                setError('Fan topilmadi');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (error) return <ErrorState message={error} />;

    return (
        <div className="animate-fade-in">
            <Link to="/subjects" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm font-medium mb-5 transition-colors">
                <FiArrowLeft size={16} /> Fanlar
            </Link>

            {loading ? (
                <div className="space-y-5">
                    <div className="skeleton-shimmer h-48 rounded-2xl" />
                    <SkeletonList count={5} />
                </div>
            ) : subject && (
                <>
                    {/* Subject header */}
                    <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: subject.color + '15' }}>
                        <div className="p-6 flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-5xl shrink-0 bg-white shadow-soft">
                                {subject.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-black text-slate-800 mb-1">{subject.name}</h1>
                                <p className="text-slate-500 text-sm mb-3">{subject.description}</p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="badge bg-slate-100 text-slate-600 gap-1"><FiCheckCircle size={12} /> {topics.length} mavzu</span>
                                    {subject.has_book && (
                                        <Link to={`/subjects/${id}/book`}
                                            className="badge bg-primary-100 text-primary gap-1 hover:bg-primary hover:text-white transition-colors">
                                            <FiBook size={12} /> Kitobni ochish
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Topics list */}
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Mavzular</h2>
                    <div className="space-y-3">
                        {topics.map((topic, index) => (
                            <Link key={topic.id}
                                to={`/subjects/${id}/topics/${topic.id}`}
                                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                                    style={{ background: subject.color + '20', color: subject.color }}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 truncate">{topic.title}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-slate-500 flex items-center gap-1"><FiClock size={11} /> {topic.duration_minutes} daqiqa</span>
                                        {topic.has_test && <span className="text-xs text-secondary flex items-center gap-1"><FiCheckCircle size={11} /> Test mavjud</span>}
                                    </div>
                                </div>
                                <FiPlay size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
