import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { leaderboardService, gradeService } from '@/services/api';
import type { LeaderboardEntry, Grade } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { SkeletonList } from '@/components/ui/Skeleton';
import { FiFilter, FiBarChart2, FiAward } from 'react-icons/fi';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
    const { user } = useAuthStore();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGrade, setSelectedGrade] = useState<string>('');
    const [ordering, setOrdering] = useState<'-points' | '-topics'>('-points');

    useEffect(() => {
        gradeService.getAll().then(setGrades);
    }, []);

    useEffect(() => {
        setLoading(true);
        leaderboardService.getTop({
            limit: 10,
            grade_id: selectedGrade ? Number(selectedGrade) : undefined,
            ordering
        }).then(setEntries).finally(() => setLoading(false));
    }, [selectedGrade, ordering]);

    const userEntry = entries.find(e => e.user.id === user?.id);

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">🏆 Reyting</h1>
                    <p className="text-slate-500 text-sm mt-1">Eng yaxshi natijalar</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:flex-none">
                        <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="input pl-9 py-2 text-sm appearance-none bg-white pr-8"
                        >
                            <option value="">Barcha sinflar</option>
                            {grades.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Ordering Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                    onClick={() => setOrdering('-points')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${ordering === '-points' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FiAward size={16} /> Ballar bo'yicha
                </button>
                <button
                    onClick={() => setOrdering('-topics')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${ordering === '-topics' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FiBarChart2 size={16} /> Mavzular bo'yicha
                </button>
            </div>

            {/* Top 3 podium */}
            {!loading && entries.length >= 3 && (
                <div className="relative pt-10 pb-4 mb-8">
                    <div className="flex items-end justify-center gap-2 sm:gap-6 px-2">
                        {[1, 0, 2].map((idx, i) => {
                            const entry = entries[idx];
                            // Heights for Silver, Gold, Bronze
                            const heights = ['h-32', 'h-44', 'h-24'];
                            const heightIdx = idx === 1 ? 0 : (idx === 0 ? 1 : 2);

                            // Gradients
                            const gradients = [
                                'from-slate-200 via-slate-300 to-slate-400', // Silver
                                'from-amber-200 via-amber-400 to-amber-500', // Gold
                                'from-orange-300 via-orange-400 to-amber-700', // Bronze
                            ];

                            return (
                                <div
                                    key={entry.user.id}
                                    className={`flex flex-col items-center flex-1 max-w-[120px] transition-all duration-500 transform hover:-translate-y-1 ${idx === 0 ? 'z-10 animate-bounce-subtle' : 'z-0'
                                        }`}
                                >
                                    {/* Info above the bar */}
                                    <div className="flex flex-col items-center mb-2">
                                        <div className="relative mb-2">
                                            <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-3xl filter drop-shadow-sm ${idx === 0 ? 'scale-125' : ''}`}>
                                                {MEDALS[idx]}
                                            </span>
                                            <Avatar
                                                src={entry.user.avatar}
                                                name={entry.user.full_name}
                                                size={idx === 0 ? 'lg' : 'md'}
                                                className={`ring-4 ${idx === 0 ? 'ring-amber-300 shadow-amber-200' : 'ring-white'} shadow-xl`}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className={`font-bold text-slate-800 leading-tight truncate max-w-[80px] sm:max-w-[100px] ${idx === 0 ? 'text-sm' : 'text-xs'}`}>
                                                {entry.user.full_name.split(' ')[0]}
                                            </p>
                                            <p className={`font-black text-primary ${idx === 0 ? 'text-sm' : 'text-[10px]'}`}>
                                                {ordering === '-points'
                                                    ? `${entry.points.toLocaleString()} ball`
                                                    : `${entry.completed_topics} mavzu`
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* The Bar */}
                                    <div
                                        className={`w-full ${heights[heightIdx]} rounded-t-2xl bg-gradient-to-t ${gradients[heightIdx]} shadow-inner flex items-start justify-center pt-3 border-x border-t border-white/20`}
                                    >
                                        <div className="bg-white/20 rounded-full px-3 py-0.5 backdrop-blur-sm border border-white/30 text-white font-black text-sm uppercase tracking-tighter shadow-sm">
                                            #{idx + 1}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Full list */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-800">
                        {selectedGrade
                            ? `${grades.find(g => g.id === Number(selectedGrade))?.name} reytingi`
                            : 'Barcha o\'rinlar'
                        }
                    </h2>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {entries.length} ta natija
                    </span>
                </div>

                {loading ? <SkeletonList count={10} /> : (
                    <div className="space-y-2">
                        {entries.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 italic">
                                Sungi natijalar topilmadi
                            </div>
                        ) : entries.map((entry, index) => {
                            const isCurrentUser = entry.user.id === user?.id;
                            return (
                                <div key={entry.user.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isCurrentUser
                                        ? 'bg-primary-50 border-2 border-primary/30 shadow-sm'
                                        : 'hover:bg-slate-50'
                                        }`}>
                                    <div className="w-8 text-center shrink-0">
                                        {index < 3 ? (
                                            <span className="text-xl">{MEDALS[index]}</span>
                                        ) : (
                                            <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                                        )}
                                    </div>
                                    <Avatar src={entry.user.avatar} name={entry.user.full_name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-800 text-sm truncate">{entry.user.full_name}</p>
                                            {isCurrentUser && <span className="badge bg-primary text-white text-xs">Sen</span>}
                                        </div>
                                        <p className="text-xs text-slate-500">{entry.grade.name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-primary text-sm">
                                            {ordering === '-points'
                                                ? entry.points.toLocaleString()
                                                : entry.completed_topics
                                            }
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {ordering === '-points' ? 'ball' : 'mavzu'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* User rank banner (if not in current filtered list) */}
            {!loading && userEntry === undefined && user && !selectedGrade && (
                <div className="mt-4 p-4 bg-primary-50 border-2 border-primary/30 rounded-xl flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.full_name} size="sm" />
                    <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">Sening o'rning</p>
                        <p className="text-xs text-slate-500">Reytingda ko'rinish uchun ko'proq ball yig'ing</p>
                    </div>
                    <span className="font-bold text-primary">{(user.points || 0).toLocaleString()} ball</span>
                </div>
            )}
        </div>
    );
}
