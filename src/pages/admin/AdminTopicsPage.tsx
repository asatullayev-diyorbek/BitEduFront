import { useEffect, useState } from 'react';
import { topicService, subjectService } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import type { Topic, Subject } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/StateComponents';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiFilter } from 'react-icons/fi';

export default function AdminTopicsPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSubject, setFilterSubject] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<Topic | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
    const [form, setForm] = useState({ title: '', description: '', video_url: '', subject_id: 1, order: 1, duration_minutes: 15 });
    const { addToast } = useUIStore();

    const load = async () => {
        const [tops, subs] = await Promise.all([topicService.getAll(), subjectService.getAll()]);
        setTopics(tops); setSubjects(subs); setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const filtered = filterSubject ? topics.filter(t => t.subject_id === filterSubject) : topics;

    const openEdit = (t: Topic) => {
        setForm({ title: t.title, description: t.description, video_url: t.video_url, subject_id: t.subject_id, order: t.order, duration_minutes: t.duration_minutes });
        setEditTarget(t); setShowForm(true);
    };
    const openCreate = () => {
        setForm({ title: '', description: '', video_url: '', subject_id: subjects[0]?.id || 1, order: 1, duration_minutes: 15 });
        setEditTarget(null); setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title) { addToast("Mavzu nomini kiriting", 'warning'); return; }
        try {
            if (editTarget) { await topicService.update(editTarget.id, form); addToast("Yangilandi", 'success'); }
            else { await topicService.create(form); addToast("Qo'shildi", 'success'); }
            setShowForm(false); load();
        } catch { addToast("Xatolik", 'error'); }
    };

    return (
        <div className="animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-black text-slate-800">Mavzular</h1><p className="text-slate-500 text-sm mt-0.5">Barcha mavzularni boshqaring</p></div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Yangi mavzu</button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <FiFilter size={14} className="text-slate-400" />
                <button onClick={() => setFilterSubject(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!filterSubject ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                    Barchasi
                </button>
                {subjects.map(s => (
                    <button key={s.id} onClick={() => setFilterSubject(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterSubject === s.id ? 'text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        style={filterSubject === s.id ? { backgroundColor: s.color } : {}}>
                        {s.icon} {s.name}
                    </button>
                ))}
            </div>

            {/* Form */}
            {showForm && (
                <div className="card border-2 border-primary/30 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">{editTarget ? 'Tahrirlash' : "Yangi mavzu"}</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><FiX size={18} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Mavzu nomi *</label>
                            <input type="text" className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Fan</label>
                            <select className="input" value={form.subject_id} onChange={e => setForm({ ...form, subject_id: Number(e.target.value) })}>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Tavsif</label>
                            <textarea className="input resize-none" rows={2} value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Video URL (YouTube)</label>
                            <input type="text" className="input" placeholder="https://youtu.be/..." value={form.video_url}
                                onChange={e => setForm({ ...form, video_url: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Tartib raqami</label>
                            <input type="number" className="input" min={1} value={form.order}
                                onChange={e => setForm({ ...form, order: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Davomiyligi (daqiqa)</label>
                            <input type="number" className="input" min={5} value={form.duration_minutes}
                                onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowForm(false)} className="btn-secondary">Bekor</button>
                        <button onClick={handleSave} className="btn-primary">💾 Saqlash</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="card">
                <p className="text-sm text-slate-500 mb-3">{filtered.length} ta mavzu</p>
                {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-shimmer h-14 rounded-lg mb-2" />)
                    : filtered.length === 0 ? <EmptyState icon="📋" title="Mavzular topilmadi" />
                        : (
                            <div className="space-y-2">
                                {filtered.map(topic => {
                                    const subject = subjects.find(s => s.id === topic.subject_id);
                                    return (
                                        <div key={topic.id} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                                                style={{ background: subject?.color + '20', color: subject?.color }}>
                                                {topic.order}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm truncate">{topic.title}</p>
                                                <p className="text-xs text-slate-500">{subject?.name} • {topic.duration_minutes} daqiqa</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(topic)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary"><FiEdit2 size={14} /></button>
                                                <button onClick={() => setDeleteTarget(topic)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
            </div>

            <ConfirmModal isOpen={!!deleteTarget} title="Mavzuni o'chirish"
                message={`"${deleteTarget?.title}" mavzusini o'chirishni tasdiqlaysizmi?`}
                onConfirm={async () => { await topicService.delete(deleteTarget!.id); addToast("O'chirildi", 'success'); setDeleteTarget(null); load(); }}
                onCancel={() => setDeleteTarget(null)} danger />
        </div>
    );
}
