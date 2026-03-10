import { useEffect, useState } from 'react';
import { authService, gradeService, subjectService, topicService, testService } from '@/services/api';
import { SkeletonStat } from '@/components/ui/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ students: 0, subjects: 0, topics: 0, tests: 0 });
    const [loading, setLoading] = useState(true);
    const [subjectData, setSubjectData] = useState<{ name: string; mavzular: number; color: string }[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [users, subjects, topics, tests] = await Promise.all([
                    authService.getUsers(),
                    subjectService.getAll(),
                    topicService.getAll(),
                    testService.getAll(),
                ]);
                setStats({
                    students: users.length,
                    subjects: subjects.length,
                    topics: topics.length,
                    tests: tests.length,
                });
                setSubjectData(subjects.map(s => ({
                    name: s.name,
                    mavzular: topics.filter(t => t.subject_id === s.id).length,
                    color: s.color,
                })));
            } finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const statCards = [
        { label: "O'quvchilar", value: stats.students, icon: '👥', gradient: 'from-blue-500 to-blue-600' },
        { label: 'Fanlar', value: stats.subjects, icon: '📚', gradient: 'from-amber-400 to-amber-500' },
        { label: 'Mavzular', value: stats.topics, icon: '📋', gradient: 'from-purple-500 to-purple-600' },
        { label: 'Testlar', value: stats.tests, icon: '✅', gradient: 'from-green-500 to-green-600' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Platformaning umumiy statistikasi</p>
            </div>

            {loading ? <SkeletonStat /> : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((s, i) => (
                        <div key={i} className="relative overflow-hidden card">
                            <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-3xl bg-gradient-to-bl ${s.gradient} opacity-10`} />
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                                {s.icon}
                            </div>
                            <div className="text-3xl font-black text-slate-800">{s.value}</div>
                            <div className="text-sm text-slate-500 font-medium mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar chart */}
                <div className="card">
                    <h2 className="font-bold text-slate-800 mb-4">Fanlardagi mavzular soni</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={subjectData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="mavzular" radius={[6, 6, 0, 0]}>
                                {subjectData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div className="card">
                    <h2 className="font-bold text-slate-800 mb-4">Fanlar taqsimoti</h2>
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width="60%" height={200}>
                            <PieChart>
                                <Pie data={subjectData} cx="50%" cy="50%" outerRadius={80} dataKey="mavzular" nameKey="name">
                                    {subjectData.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 flex-1">
                            {subjectData.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color || COLORS[i % COLORS.length] }} />
                                    <span className="text-slate-700 truncate">{s.name}</span>
                                    <span className="text-slate-500 ml-auto">{s.mavzular}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
