import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, X, Save, Loader2, Shuffle, ClipboardList,
  CheckCircle2, Circle, Gamepad2,
} from 'lucide-react';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Oson' },
  { value: 'MEDIUM', label: "O'rta" },
  { value: 'HARD', label: 'Qiyin' },
];
const DIFF_LABEL = { EASY: 'Oson', MEDIUM: "O'rta", HARD: 'Qiyin' };
const DIFF_BADGE = {
  EASY: 'bg-emerald-50 text-emerald-600',
  MEDIUM: 'bg-amber-50 text-amber-600',
  HARD: 'bg-red-50 text-red-600',
};

const emptyAnagram = () => ({
  title: '', description: '', difficulty: 'EASY', xp: 10, order: 1, is_active: true,
  words: Array.from({ length: 5 }, () => ({ text: '', hint: '' })),
});
const emptyQuiz = () => ({
  title: '', description: '', difficulty: 'MEDIUM', xp: 15, order: 1, is_active: true,
  questions: Array.from({ length: 5 }, () => ({
    text: '',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  })),
});

const AdminGames = () => {
  const [tab, setTab] = useState('anagram'); // 'anagram' | 'quiz'
  const [anagrams, setAnagrams] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAnagram());
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [a, q] = await Promise.all([
        api.get('/games/admin/anagrams/'),
        api.get('/games/admin/quizzes/'),
      ]);
      setAnagrams(a.data?.data?.results || []);
      setQuizzes(q.data?.data?.results || []);
    } catch {
      toast.error('Maʼlumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Modal ochish ──
  const openCreate = () => {
    setEditingId(null);
    setForm(tab === 'anagram' ? emptyAnagram() : emptyQuiz());
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    if (tab === 'anagram') {
      setForm({
        title: item.title, description: item.description || '',
        difficulty: item.difficulty, xp: item.xp, order: item.order, is_active: item.is_active,
        words: (item.words?.length ? item.words : emptyAnagram().words).map((w) => ({ text: w.text || '', hint: w.hint || '' })),
      });
    } else {
      setForm({
        title: item.title, description: item.description || '',
        difficulty: item.difficulty, xp: item.xp, order: item.order, is_active: item.is_active,
        questions: (item.questions?.length ? item.questions : emptyQuiz().questions).map((qq) => ({
          text: qq.text || '',
          options: (qq.options?.length ? qq.options : emptyQuiz().questions[0].options).map((o) => ({
            text: o.text || '', is_correct: !!o.is_correct,
          })),
        })),
      });
    }
    setModalOpen(true);
  };

  // ── Saqlash ──
  const save = async () => {
    if (!form.title.trim()) { toast.error('Sarlavha kiritilishi shart'); return; }

    let payload;
    if (tab === 'anagram') {
      const words = form.words
        .filter((w) => w.text.trim())
        .map((w, i) => ({ text: w.text.trim().toUpperCase(), hint: w.hint.trim(), order: i + 1 }));
      if (words.length === 0) { toast.error('Kamida 1 ta soʻz kiriting'); return; }
      payload = { ...form, xp: Number(form.xp) || 0, order: Number(form.order) || 1, words };
    } else {
      const questions = form.questions
        .filter((q) => q.text.trim())
        .map((q, i) => {
          const options = q.options.filter((o) => o.text.trim()).map((o) => ({ text: o.text.trim(), is_correct: o.is_correct }));
          return { text: q.text.trim(), order: i + 1, options };
        });
      if (questions.length === 0) { toast.error('Kamida 1 ta savol kiriting'); return; }
      for (const q of questions) {
        if (q.options.length < 2) { toast.error('Har bir savolda kamida 2 ta variant boʻlsin'); return; }
        if (!q.options.some((o) => o.is_correct)) { toast.error('Har bir savolda toʻgʻri javob belgilang'); return; }
      }
      payload = { ...form, xp: Number(form.xp) || 0, order: Number(form.order) || 1, questions };
    }

    const base = tab === 'anagram' ? '/games/admin/anagrams/' : '/games/admin/quizzes/';
    try {
      setSaving(true);
      if (editingId) await api.patch(`${base}${editingId}/`, payload);
      else await api.post(base, payload);
      toast.success(editingId ? 'Yangilandi' : 'Qoʻshildi');
      setModalOpen(false);
      fetchAll();
    } catch {
      // global toast
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`"${item.title}" oʻchirilsinmi?`)) return;
    const base = tab === 'anagram' ? '/games/admin/anagrams/' : '/games/admin/quizzes/';
    try {
      await api.delete(`${base}${item.id}/`);
      toast.success('Oʻchirildi');
      fetchAll();
    } catch {
      // global toast
    }
  };

  // ── Form helperlari ──
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setWord = (i, k, v) => setForm((f) => {
    const words = [...f.words]; words[i] = { ...words[i], [k]: v }; return { ...f, words };
  });
  const addWord = () => setForm((f) => ({ ...f, words: [...f.words, { text: '', hint: '' }] }));
  const removeWord = (i) => setForm((f) => ({ ...f, words: f.words.filter((_, idx) => idx !== i) }));

  const setQ = (qi, k, v) => setForm((f) => {
    const questions = [...f.questions]; questions[qi] = { ...questions[qi], [k]: v }; return { ...f, questions };
  });
  const setOpt = (qi, oi, k, v) => setForm((f) => {
    const questions = [...f.questions];
    const options = [...questions[qi].options];
    if (k === 'is_correct') options.forEach((o, idx) => { o.is_correct = idx === oi; });
    else options[oi] = { ...options[oi], [k]: v };
    questions[qi] = { ...questions[qi], options };
    return { ...f, questions };
  });
  const addQuestion = () => setForm((f) => ({
    ...f,
    questions: [...f.questions, { text: '', options: [
      { text: '', is_correct: true }, { text: '', is_correct: false },
      { text: '', is_correct: false }, { text: '', is_correct: false },
    ] }],
  }));
  const removeQuestion = (qi) => setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== qi) }));

  const list = tab === 'anagram' ? anagrams : quizzes;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">O&rsquo;yinlar boshqaruvi</h1>
          <p className="text-slate-500 font-medium">Anagram va kviz o&rsquo;yinlarini qo&rsquo;shing va tahrirlang</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-[16px] font-bold text-sm shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95"
        >
          <Plus size={18} /> {tab === 'anagram' ? 'Anagram qo\'shish' : 'Kviz qo\'shish'}
        </button>
      </div>

      {/* Tablar */}
      <div className="flex gap-2">
        {[
          { key: 'anagram', label: 'Anagramlar', icon: <Shuffle size={16} /> },
          { key: 'quiz', label: 'Kvizlar', icon: <ClipboardList size={16} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-500 border border-slate-100 hover:bg-blue-50'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : list.length === 0 ? (
        <div className="py-24 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Hozircha hech narsa yo&rsquo;q. Yangi qo&rsquo;shing.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((item) => (
            <div key={item.id} className="bg-white rounded-[24px] border border-slate-100 p-5 flex flex-col hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-slate-800 leading-tight">{item.title}</h3>
                <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${DIFF_BADGE[item.difficulty]}`}>
                  {DIFF_LABEL[item.difficulty]}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 font-medium flex-1">{item.description}</p>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase">
                <Gamepad2 size={13} /> {item.xp} XP
                <span className="text-slate-300">•</span>
                {tab === 'anagram' ? `${item.words?.length || 0} so'z` : `${item.questions?.length || 0} savol`}
                {!item.is_active && <span className="ml-auto text-red-400">Nofaol</span>}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(item)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <Edit2 size={14} /> Tahrirlash
                </button>
                <button onClick={() => remove(item)} className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl my-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-[28px] z-10">
              <h2 className="font-black text-slate-900 italic uppercase tracking-tight">
                {editingId ? 'Tahrirlash' : 'Yangi'} — {tab === 'anagram' ? 'Anagram' : 'Kviz'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Umumiy maydonlar */}
              <input
                value={form.title} onChange={(e) => setField('title', e.target.value)}
                placeholder="Sarlavha (masalan: Kompyuter Qurilmalari)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 font-bold text-slate-700"
              />
              <input
                value={form.description} onChange={(e) => setField('description', e.target.value)}
                placeholder="Qisqacha tavsif"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 font-medium text-slate-700"
              />
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={form.difficulty} onChange={(e) => setField('difficulty', e.target.value)}
                  className="px-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                >
                  {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <input
                  type="number" min="0" value={form.xp} onChange={(e) => setField('xp', e.target.value)}
                  placeholder="XP"
                  className="px-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                />
                <input
                  type="number" min="1" value={form.order} onChange={(e) => setField('order', e.target.value)}
                  placeholder="Tartib"
                  className="px-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} className="w-4 h-4 accent-blue-600" />
                Faol (o&rsquo;quvchilarga ko&rsquo;rinadi)
              </label>

              {/* ── ANAGRAM: so'zlar ── */}
              {tab === 'anagram' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">So&rsquo;zlar</p>
                    <button onClick={addWord} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"><Plus size={14} /> So&rsquo;z</button>
                  </div>
                  {form.words.map((w, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={w.text} onChange={(e) => setWord(i, 'text', e.target.value)}
                        placeholder={`So'z ${i + 1} (masalan: MONITOR)`}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono font-bold text-slate-700 uppercase"
                      />
                      <input
                        value={w.hint} onChange={(e) => setWord(i, 'hint', e.target.value)}
                        placeholder="Ishora"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-700"
                      />
                      <button onClick={() => removeWord(i)} className="px-2.5 rounded-xl text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── QUIZ: savollar ── */}
              {tab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Savollar</p>
                    <button onClick={addQuestion} className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"><Plus size={14} /> Savol</button>
                  </div>
                  {form.questions.map((q, qi) => (
                    <div key={qi} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                      <div className="flex gap-2">
                        <input
                          value={q.text} onChange={(e) => setQ(qi, 'text', e.target.value)}
                          placeholder={`Savol ${qi + 1}`}
                          className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                        />
                        <button onClick={() => removeQuestion(qi)} className="px-2.5 rounded-xl text-red-400 hover:bg-red-50"><Trash2 size={16} /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((o, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              onClick={() => setOpt(qi, oi, 'is_correct', true)}
                              title="To'g'ri javob"
                              className={o.is_correct ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}
                            >
                              {o.is_correct ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </button>
                            <input
                              value={o.text} onChange={(e) => setOpt(qi, oi, 'text', e.target.value)}
                              placeholder={`Variant ${oi + 1}`}
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm font-medium text-slate-700"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">✓ belgisini bosib to&rsquo;g&rsquo;ri javobni tanlang</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-[28px]">
              <button onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all">
                Bekor qilish
              </button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-60">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGames;
