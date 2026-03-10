import { useEffect, useState } from 'react';
import { testService, topicService, subjectService } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import type { Test, Topic, Subject } from '@/types';
import { EmptyState } from '@/components/ui/StateComponents';
import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

export default function AdminTestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const { addToast } = useUIStore();

    const EMPTY_QUESTION = () => ({
        text: '',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correct_option_index: 0,
    });

    const [form, setForm] = useState({
        topic_id: 0,
        title: '',
        time_limit_minutes: 10,
        questions: [EMPTY_QUESTION()],
    });

    const load = async () => {
        const [ts, tops, subs] = await Promise.all([testService.getAll(), topicService.getAll(), subjectService.getAll()]);
        setTests(ts); setTopics(tops); setSubjects(subs);
        if (tops.length > 0) setForm(f => ({ ...f, topic_id: tops[0].id, title: tops[0].title + ' - Test' }));
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const updateQuestion = (qi: number, field: string, value: any) => {
        setForm(f => ({
            ...f,
            questions: f.questions.map((q, i) => i === qi ? { ...q, [field]: value } : q)
        }));
    };
    const updateOption = (qi: number, oi: number, text: string) => {
        setForm(f => ({
            ...f,
            questions: f.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? { text } : o) } : q)
        }));
    };
    const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, EMPTY_QUESTION()] }));
    const removeQuestion = (qi: number) => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }));

    const handleSave = async () => {
        if (!form.title || form.questions.some(q => !q.text)) {
            addToast("Barcha maydonlarni to'ldiring", 'warning'); return;
        }
        try {
            const questionsMapped = form.questions.map((q, qi) => ({
                id: qi + 1,
                test_id: 0,
                text: q.text,
                options: q.options.map((o, oi) => ({ id: oi + 1, text: o.text })),
                correct_option_id: q.correct_option_index + 1,
            }));
            await testService.create({ ...form, questions: questionsMapped });
            addToast("Test muvaffaqiyatli yaratildi", 'success');
            setShowForm(false); load();
        } catch { addToast("Xatolik", 'error'); }
    };

    const OPTION_LETTERS = ['A', 'B', 'D', 'E'];

    return (
        <div className="animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-black text-slate-800">Testlar</h1><p className="text-slate-500 text-sm mt-0.5">Testlarni boshqaring</p></div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                    {showForm ? <FiX size={16} /> : <FiPlus size={16} />}
                    {showForm ? 'Yopish' : 'Yangi test'}
                </button>
            </div>

            {/* Create Test Form */}
            {showForm && (
                <div className="card border-2 border-primary/30 animate-slide-up space-y-5">
                    <h3 className="font-bold text-slate-800 text-lg">Yangi test yaratish</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Test nomi</label>
                            <input type="text" className="input" value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Mavzu</label>
                            <select className="input" value={form.topic_id}
                                onChange={e => { const t = topics.find(t => t.id === Number(e.target.value)); setForm({ ...form, topic_id: Number(e.target.value), title: t ? t.title + ' - Test' : form.title }); }}>
                                {topics.slice(0, 20).map(t => <option key={t.id} value={t.id}>{t.title.slice(0, 40)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Vaqt (daqiqa)</label>
                            <input type="number" className="input" min={5} value={form.time_limit_minutes}
                                onChange={e => setForm({ ...form, time_limit_minutes: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {form.questions.map((q, qi) => (
                            <div key={qi} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-700 text-sm">{qi + 1}-savol</span>
                                    {form.questions.length > 1 && (
                                        <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                                            <FiTrash2 size={12} /> O'chirish
                                        </button>
                                    )}
                                </div>
                                <input type="text" className="input" placeholder="Savol matni..." value={q.text}
                                    onChange={e => updateQuestion(qi, 'text', e.target.value)} />
                                <div className="space-y-2">
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-2">
                                            <button onClick={() => updateQuestion(qi, 'correct_option_index', oi)}
                                                className={`w-8 h-8 rounded-lg border-2 text-sm font-bold shrink-0 transition-all ${q.correct_option_index === oi ? 'border-green-500 bg-green-500 text-white' : 'border-slate-200 text-slate-400 hover:border-green-300'}`}>
                                                {q.correct_option_index === oi ? <FiCheck size={14} className="mx-auto" /> : OPTION_LETTERS[oi]}
                                            </button>
                                            <input type="text" className="input text-sm py-2" placeholder={`${OPTION_LETTERS[oi]} variant`}
                                                value={opt.text} onChange={e => updateOption(qi, oi, e.target.value)} />
                                        </div>
                                    ))}
                                    <p className="text-xs text-slate-400">Yashil tugma = to'g'ri javob</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button onClick={addQuestion} className="btn-secondary flex items-center gap-2"><FiPlus size={14} /> Savol qo'shish</button>
                        <button onClick={handleSave} className="btn-primary">💾 Testni saqlash</button>
                    </div>
                </div>
            )}

            {/* Test list */}
            <div className="space-y-3">
                {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-shimmer h-16 rounded-xl" />)
                    : tests.length === 0 ? <EmptyState icon="📝" title="Testlar topilmadi" />
                        : tests.map(test => {
                            const topic = topics.find(t => t.id === test.topic_id);
                            const subject = subjects.find(s => s.id === topic?.subject_id);
                            const isExpanded = expanded === test.id;
                            return (
                                <div key={test.id} className="card">
                                    <button onClick={() => setExpanded(isExpanded ? null : test.id)}
                                        className="w-full flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-xl"
                                            style={{ background: subject?.color + '20' }}>{subject?.icon || '📝'}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 truncate">{test.title}</p>
                                            <p className="text-xs text-slate-500">{test.questions.length} savol • {test.time_limit_minutes} daqiqa</p>
                                        </div>
                                        {isExpanded ? <FiChevronUp size={18} className="text-slate-400 shrink-0" /> : <FiChevronDown size={18} className="text-slate-400 shrink-0" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                                            {test.questions.map((q, qi) => (
                                                <div key={q.id} className="p-3 bg-slate-50 rounded-xl">
                                                    <p className="font-semibold text-slate-800 text-sm mb-2">{qi + 1}. {q.text}</p>
                                                    <div className="space-y-1">
                                                        {q.options.map(opt => (
                                                            <div key={opt.id} className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 ${opt.id === q.correct_option_id ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-600'}`}>
                                                                {opt.id === q.correct_option_id && <FiCheck size={12} />}
                                                                {opt.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
            </div>
        </div>
    );
}
