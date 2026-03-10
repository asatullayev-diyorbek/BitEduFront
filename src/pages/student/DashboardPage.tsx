import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { subjectService, topicService, leaderboardService } from '@/services/api';
import type { Subject, Topic, LeaderboardEntry } from '@/types';
import { SkeletonStat } from '@/components/ui/Skeleton';
import Avatar from '@/components/ui/Avatar';
import { FiBook, FiCheckCircle, FiStar, FiArrowRight, FiPlay } from 'react-icons/fi';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subs, tops, lb] = await Promise.all([
                    subjectService.getAll(),
                    topicService.getAll(),
                    leaderboardService.getTop({ limit: 5 }),
                ]);
                setSubjects(subs);
                setRecentTopics(tops.slice(0, 4));
                setLeaderboard(lb);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: 'Jami ball', value: user?.points?.toLocaleString() || '0', icon: '⭐', color: 'from-amber-400 to-amber-500' },
        { label: 'Fanlar', value: subjects.length, icon: '📚', color: 'from-primary to-primary-600' },
        { label: 'Darslar', value: user?.completed_lessons || 0, icon: '✅', color: 'from-secondary to-secondary-600' },
        { label: 'Daraja', value: user?.grade?.name || '—', icon: '🎓', color: 'from-purple-400 to-purple-600' },
    ];

    const userRank = leaderboard.findIndex(e => e.user.id === user?.id) + 1;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-700 p-6 text-white">
                <div className="relative z-10">
                    <p className="text-primary-200 text-sm font-medium mb-1">Xush kelibsiz 👋</p>
                    <h1 className="text-2xl font-black mb-1">{user?.full_name}</h1>
                    <p className="text-primary-200 text-sm">{user?.grade?.name} • {user?.points} ball</p>
                    {userRank > 0 && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
                            <FiStar size={14} /> Reyting: #{userRank}
                        </div>
                    )}
                </div>
                <div className="absolute right-0 top-0 h-full w-40 opacity-10">
                    <div className="text-[120px] leading-none -mr-4 mt-2">🎓</div>
                </div>
            </div>

            {/* Stats */}
            {loading ? <SkeletonStat /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="card flex flex-col gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl`}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Topics */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Mavzular</h2>
                        <Link to="/subjects" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                            Barchasi <FiArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="skeleton-shimmer h-16 rounded-xl" />
                            ))
                        ) : recentTopics.map(topic => {
                            const subject = subjects.find(s => s.id === topic.subject_id);
                            return (
                                <Link key={topic.id}
                                    to={`/subjects/${topic.subject_id}/topics/${topic.id}`}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                                        style={{ background: `${subject?.color}20` }}>
                                        {subject?.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{topic.title}</p>
                                        <p className="text-xs text-slate-500">{subject?.name} • {topic.duration_minutes} daqiqa</p>
                                    </div>
                                    <FiPlay size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Leaderboard Preview */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Reyting</h2>
                        <Link to="/leaderboard" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                            Barchasi <FiArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="card space-y-3">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="skeleton-shimmer h-12 rounded-lg" />
                            ))
                        ) : leaderboard.map((entry, index) => (
                            <div key={entry.user.id}
                                className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${entry.user.id === user?.id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50'}`}>
                                <span className={`text-lg font-black w-6 text-center shrink-0 ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-400 text-sm'}`}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </span>
                                <Avatar src={entry.user.avatar} name={entry.user.full_name} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{entry.user.full_name}</p>
                                    <p className="text-xs text-slate-500">{entry.grade.name}</p>
                                </div>
                                <span className="text-sm font-bold text-primary shrink-0">{entry.points.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
