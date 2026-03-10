import { useEffect, useState } from 'react';
import { gradeService } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import type { Grade } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/StateComponents';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

export default function AdminGradesPage() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Grade | null>(null);
    const [newGrade, setNewGrade] = useState({ name: '', level: 7 });
    const [showAdd, setShowAdd] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);
    const { addToast } = useUIStore();

    const load = () => gradeService.getAll().then(setGrades).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        if (!newGrade.name) { addToast("Sinf nomini kiriting", 'warning'); return; }
        try {
            await gradeService.create(newGrade);
            addToast("Sinf muvaffaqiyatli qo'shildi", 'success');
            setShowAdd(false); setNewGrade({ name: '', level: 7 }); load();
        } catch { addToast("Xatolik yuz berdi", 'error'); }
    };

    const handleUpdate = async () => {
        if (!editing) return;
        try {
            await gradeService.update(editing.id, editing);
            addToast("Muvaffaqiyatli yangilandi", 'success');
            setEditing(null); load();
        } catch { addToast("Xatolik yuz berdi", 'error'); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await gradeService.delete(deleteTarget.id);
            addToast("Sinf o'chirildi", 'success');
            setDeleteTarget(null); load();
        } catch { addToast("Xatolik", 'error'); }
    };

    return (
        <div className="animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Sinflar</h1>
                    <p className="text-slate-500 text-sm mt-0.5">O'quv sinflarini boshqaring</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
                    <FiPlus size={16} /> Yangi sinf
                </button>
            </div>

            {showAdd && (
                <div className="card border-2 border-primary/30 animate-slide-up">
                    <h3 className="font-bold text-slate-800 mb-4">Yangi sinf qo'shish</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Sinf nomi</label>
                            <input type="text" className="input" placeholder="7-sinf" value={newGrade.name}
                                onChange={e => setNewGrade({ ...newGrade, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Daraja</label>
                            <select className="input" value={newGrade.level} onChange={e => setNewGrade({ ...newGrade, level: Number(e.target.value) })}>
                                {[7, 8, 9, 10, 11].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowAdd(false)} className="btn-secondary flex items-center gap-2"><FiX size={14} /> Bekor</button>
                        <button onClick={handleCreate} className="btn-primary flex items-center gap-2"><FiSave size={14} /> Saqlash</button>
                    </div>
                </div>
            )}

            <div className="card">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-shimmer h-12 rounded-lg mb-2" />)
                ) : grades.length === 0 ? <EmptyState icon="🎓" title="Sinflar topilmadi" /> : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <th className="pb-3 pr-4">#</th>
                                <th className="pb-3 pr-4">Sinf nomi</th>
                                <th className="pb-3 pr-4">Daraja</th>
                                <th className="pb-3 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((grade, i) => (
                                <tr key={grade.id} className="border-b border-slate-50 last:border-0">
                                    <td className="py-3 pr-4 text-slate-500 text-sm">{i + 1}</td>
                                    <td className="py-3 pr-4">
                                        {editing?.id === grade.id ? (
                                            <input type="text" className="input py-1.5 text-sm" value={editing.name}
                                                onChange={e => setEditing({ ...editing, name: e.target.value })} />
                                        ) : (
                                            <span className="font-semibold text-slate-800">{grade.name}</span>
                                        )}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className="badge bg-primary-100 text-primary">{grade.level}-sinf</span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {editing?.id === grade.id ? (
                                                <>
                                                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"><FiX size={15} /></button>
                                                    <button onClick={handleUpdate} className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-600"><FiSave size={15} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setEditing(grade)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary transition-colors"><FiEdit2 size={15} /></button>
                                                    <button onClick={() => setDeleteTarget(grade)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FiTrash2 size={15} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ConfirmModal isOpen={!!deleteTarget} title="Sinfni o'chirish"
                message={`"${deleteTarget?.name}" sinfini o'chirishni tasdiqlaysizmi?`}
                onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
        </div>
    );
}
