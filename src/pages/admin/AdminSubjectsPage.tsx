import { useEffect, useState } from 'react';
import { subjectService, gradeService } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import type { Subject, Grade } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/StateComponents';
import { FiPlus, FiEdit2, FiTrash2, FiBook, FiX } from 'react-icons/fi';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444'];
const ICONS = ['💻', '📐', '⚛️', '🧪', '🌱', '📚', '🔬', '🎨', '🌍', '⚙️'];

const INITIAL_FORM = { name: '', description: '', color: '#2563EB', icon: '📚', grade_id: 1, has_book: false };

export default function AdminSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<Subject | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const { addToast } = useUIStore();

    const load = async () => {
        const [subs, grs] = await Promise.all([subjectService.getAll(), gradeService.getAll()]);
        setSubjects(subs); setGrades(grs);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openCreate = () => { setForm(INITIAL_FORM); setEditTarget(null); setShowForm(true); };
    const openEdit = (s: Subject) => {
        setForm({ name: s.name, description: s.description, color: s.color, icon: s.icon, grade_id: s.grade_id || 1, has_book: s.has_book });
        setEditTarget(s); setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name) { addToast("Fan nomini kiriting", 'warning'); return; }
        try {
            if (editTarget) { await subjectService.update(editTarget.id, form); addToast("Yangilandi", 'success'); }
            else { await subjectService.create(form); addToast("Qo'shildi", 'success'); }
            setShowForm(false); load();
        } catch { addToast("Xatolik", 'error'); }
    };

    return (
        <div className="animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-black text-slate-800">Fanlar</h1><p className="text-slate-500 text-sm mt-0.5">Fanlarni boshqaring</p></div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Yangi fan</button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="card border-2 border-primary/30 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">{editTarget ? 'Tahrirlash' : "Yangi fan qo'shish"}</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Fan nomi *</label>
                            <input type="text" className="input" placeholder="Informatika" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Sinf</label>
                            <select className="input" value={form.grade_id} onChange={e => setForm({ ...form, grade_id: Number(e.target.value) })}>
                                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Tavsif</label>
                            <textarea className="input resize-none" rows={2} value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Rang</label>
                            <div className="flex gap-2 flex-wrap">
                                {COLORS.map(c => (
                                    <button key={c} onClick={() => setForm({ ...form, color: c })}
                                        className={`w-8 h-8 rounded-lg transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                                        style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Ikon</label>
                            <div className="flex gap-2 flex-wrap">
                                {ICONS.map(icon => (
                                    <button key={icon} onClick={() => setForm({ ...form, icon })}
                                        className={`w-9 h-9 rounded-lg text-xl transition-all ${form.icon === icon ? 'bg-primary-100 ring-2 ring-primary' : 'hover:bg-slate-100'}`}>
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="has_book" checked={form.has_book}
                                onChange={e => setForm({ ...form, has_book: e.target.checked })}
                                className="w-4 h-4 rounded accent-primary" />
                            <label htmlFor="has_book" className="text-sm font-medium text-slate-700">Kitob mavjud</label>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowForm(false)} className="btn-secondary">Bekor</button>
                        <button onClick={handleSave} className="btn-primary">💾 Saqlash</button>
                    </div>
                </div>
            )}

            {/* Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-shimmer h-36 rounded-2xl" />)}
                </div>
            ) : subjects.length === 0 ? <EmptyState icon="📚" title="Fanlar topilmadi" /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map(sub => (
                        <div key={sub.id} className="card hover:shadow-soft transition-all duration-200 group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: sub.color + '20' }}>
                                    {sub.icon}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary"><FiEdit2 size={14} /></button>
                                    <button onClick={() => setDeleteTarget(sub)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><FiTrash2 size={14} /></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">{sub.name}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-3">{sub.description}</p>
                            <div className="flex items-center gap-2">
                                <span className="badge bg-slate-100 text-slate-600">📋 {sub.topics_count} mavzu</span>
                                {sub.has_book && <span className="badge bg-primary-100 text-primary"><FiBook size={10} className="inline" /> Kitob</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal isOpen={!!deleteTarget} title="Fanni o'chirish"
                message={`"${deleteTarget?.name}" fanini o'chirishni tasdiqlaysizmi?`}
                onConfirm={async () => { await subjectService.delete(deleteTarget!.id); addToast("Fan o'chirildi", 'success'); setDeleteTarget(null); load(); }}
                onCancel={() => setDeleteTarget(null)} danger />
        </div>
    );
}
