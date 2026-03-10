import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authService } from '@/services/api';
import { mockGrades } from '@/mock/data';
import Avatar from '@/components/ui/Avatar';
import {
    FiEdit2, FiSave, FiX, FiStar, FiAward, FiBookOpen,
    FiTrendingUp, FiCheckCircle, FiClock, FiSettings, FiCamera
} from 'react-icons/fi';

type ProfileTab = 'overview' | 'activity' | 'badges';

const ACHIEVEMENTS = [
    { id: 1, title: 'Ilk qadam', desc: 'Birinchi darsni yakunladingiz', icon: '🌱', date: '2024-09-02', color: 'bg-green-100 text-green-600' },
    { id: 2, title: 'Bilimdon', desc: '5 ta testdan 100% natija', icon: '🧠', date: '2024-09-15', color: 'bg-blue-100 text-blue-600' },
    { id: 3, title: 'Tirishqoq', desc: '7 kun ketma-ket dars qildingiz', icon: '🔥', date: '2024-10-01', color: 'bg-orange-100 text-orange-600' },
    { id: 4, title: 'Master', desc: 'Informatika fanini yakunladingiz', icon: '🏆', date: '2024-11-20', color: 'bg-purple-100 text-purple-600' },
    { id: 5, title: 'A’lochi', desc: 'Umumiy reytingda top-3 ga kirdingiz', icon: '🥇', date: '—', locked: true, color: 'bg-slate-100 text-slate-400' },
];

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();
    const { addToast } = useUIStore();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
    const [form, setForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        grade_id: user?.grade_id || 1,
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            const updated = await authService.updateProfile(user!.id, {
                ...form,
                grade: mockGrades.find(g => g.id === form.grade_id),
            });
            updateUser(updated);
            setEditing(false);
            addToast("Profil yangilandi", 'success');
        } catch {
            addToast("Xatolik", 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10">
            {/* Header / Cover Section */}
            <div className="relative mb-20">
                <div className="h-44 sm:h-56 w-full rounded-3xl bg-gradient-to-r from-primary to-primary-800 shadow-xl overflow-hidden relative">
                    {/* Abstract pattern decoration */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl -ml-32 -mb-32" />
                    </div>
                </div>

                {/* Profile Info Overlay */}
                <div className="absolute top-10 left-6 sm:left-10 flex items-end gap-5">
                    <div className="relative group">
                        <Avatar src={user.avatar} name={user.full_name} size="xl" className="w-24 h-24 sm:w-32 sm:h-32 ring-4 ring-white shadow-2xl" />
                        <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg text-slate-500 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                            <FiCamera size={16} />
                        </button>
                    </div>
                    <div className="mb-4">
                        <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{user.full_name}</h1>
                        <p className="text-primary-100 font-medium">@{user.username}</p>
                    </div>
                </div>

                <div className="absolute top-10 right-6 sm:right-10 flex gap-2">
                    <button
                        onClick={() => { setEditing(!editing); setForm({ full_name: user.full_name, email: user.email, grade_id: user.grade_id || 1 }); }}
                        className="btn-secondary bg-white/90 backdrop-blur shadow-lg flex items-center gap-2"
                    >
                        {editing ? <><FiX /> Yopish</> : <><FiEdit2 /> Tahrirlash</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Meta */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FiStar className="text-amber-500" /> Profil holati
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Tajriba (Points)</span>
                                <span className="font-bold text-primary">{user.points.toLocaleString()} XP</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '65%' }} />
                            </div>
                            <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider">Keyingi darajagacha 550 XP qoldi</p>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="bg-slate-50 p-3 rounded-xl text-center">
                                    <FiBookOpen className="mx-auto mb-1 text-primary" />
                                    <p className="text-lg font-black text-slate-800">{user.completed_lessons}</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Darslar</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl text-center">
                                    <FiCheckCircle className="mx-auto mb-1 text-secondary" />
                                    <p className="text-lg font-black text-slate-800">12</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Testlar</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FiSettings className="text-slate-500" /> Ma'lumotlar
                        </h3>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Email</span>
                                <span className="text-sm font-semibold text-slate-700">{user.email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Sinf</span>
                                <span className="text-sm font-semibold text-slate-700">{user.grade?.name}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">A'zo bo'ldi</span>
                                <span className="text-sm font-semibold text-slate-700">{new Date(user.joined_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tabs & Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex border-b border-slate-200 gap-6 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', label: 'Umumiy', icon: FiTrendingUp },
                            { id: 'badges', label: 'Yutuqlar', icon: FiAward },
                            { id: 'activity', label: 'Faollik', icon: FiClock },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ProfileTab)}
                                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-fade-in min-h-[300px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {editing ? (
                                    <div className="card animate-slide-up">
                                        <h3 className="font-bold text-slate-800 mb-4">Profilni tahrirlash</h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Ism familiya</label>
                                                    <input type="text" className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
                                                    <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1.5">Sinf</label>
                                                <select className="input" value={form.grade_id} onChange={e => setForm({ ...form, grade_id: Number(e.target.value) })}>
                                                    {mockGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Bekor qilish</button>
                                                <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                                                    {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="card flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <FiStar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">Eng yaxshi natija</p>
                                                <p className="text-lg font-bold text-slate-800">100% (Informatika)</p>
                                            </div>
                                        </div>
                                        <div className="card flex items-center gap-4 bg-gradient-to-br from-white to-slate-50">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                                <FiTrendingUp size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">O'rtacha ball</p>
                                                <p className="text-lg font-bold text-slate-800">86%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="card">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <FiTrendingUp size={18} className="text-primary" /> O'zlashtirish grafigi
                                    </h3>
                                    <div className="h-48 flex items-end justify-between px-2 gap-2">
                                        {[40, 70, 50, 90, 80, 100, 85].map((h, i) => (
                                            <div key={i} className="flex-1 group relative">
                                                <div className="h-2 bg-slate-100 rounded-full w-full absolute bottom-0" />
                                                <div
                                                    className="w-full bg-primary rounded-t-lg transition-all duration-500 hover:bg-primary-400 cursor-pointer relative"
                                                    style={{ height: `${h}%` }}
                                                >
                                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                                                </div>
                                                <span className="block mt-2 text-[10px] text-center text-slate-400 font-bold">Dars {i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'badges' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ACHIEVEMENTS.map(badge => (
                                    <div key={badge.id} className={`card border border-transparent transition-all ${badge.locked ? 'grayscale opacity-70' : 'hover:border-primary/20 hover:shadow-lg'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${badge.color}`}>
                                                {badge.locked ? '🔒' : badge.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{badge.title}</h4>
                                                <p className="text-xs text-slate-500 mb-1">{badge.desc}</p>
                                                <span className="text-[10px] text-slate-400">{badge.locked ? 'Hali ochilmagan' : badge.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="space-y-4">
                                {[
                                    { title: "Test yakunlandi: HTML", date: "Bugun, 14:20", score: "100%", icon: "✅" },
                                    { title: "Video ko'rildi: Kompyuter tarixi", date: "Bugun, 13:45", icon: "📺" },
                                    { title: "Platformaga kirish", date: "Kecha, 09:15", icon: "🔑" },
                                    { title: "Mavzu tugatildi: Informatika asoslari", date: "2 kun oldin", icon: "🏁" }
                                ].map((act, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-50">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm">{act.icon}</div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800">{act.title}</p>
                                            <p className="text-xs text-slate-400">{act.date}</p>
                                        </div>
                                        {act.score && <span className="font-bold text-secondary text-sm">{act.score}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

