import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, Search, Edit2, Trash2, HelpCircle, X, 
  CheckCircle2, Circle, Save, Loader2, ChevronRight, 
  ArrowLeft, BrainCircuit 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminQuizzes = () => {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState(null); 
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    topic: "", title: "", description: "", order: 1, is_active: true,
    options: [
      { text: "", is_correct: true }, { text: "", is_correct: false },
      { text: "", is_correct: false }, { text: "", is_correct: false },
    ]
  });

  useEffect(() => { fetchSubjects(); fetchTopics(); }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/academic/subjects/');
      setSubjects(res.data?.data?.results || []);
    } catch (err) { console.error("Fanlar yuklanmadi"); }
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      let url = '/academic/topics/';
      if (selectedSubject) url += `?subject=${selectedSubject}`;
      const res = await api.get(url);
      setTopics(res.data?.data?.results || []);
    } catch (err) { toast.error("Mavzularni yuklashda xatolik!"); }
    finally { setLoading(false); }
  };

  const fetchQuestions = async (topicId) => {
    setLoading(true);
    try {
      const res = await api.get(`/tests/admin/questions/?topic=${topicId}`);
      // Sening JSON strukturing: res.data.data.results
      const data = res.data?.data?.results || [];
      setQuestions(data);
    } catch (err) { toast.error("Savollarni yuklashda xatolik!"); setQuestions([]); }
    finally { setLoading(false); }
  };

  const handleEnterTopic = (topic) => {
    setActiveTopic(topic);
    fetchQuestions(topic.id);
  };

  const handleOpenModal = (q = null) => {
    if (q) {
      setEditingId(q.id);
      setFormData({
        topic: activeTopic.id, title: q.title, description: q.description || "",
        order: q.order, is_active: q.is_active, options: q.options || []
      });
    } else {
      setEditingId(null);
      setFormData({
        topic: activeTopic.id, title: "", description: "", order: questions.length + 1, is_active: true,
        options: [{ text: "", is_correct: true }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/tests/admin/questions/${editingId}/`, formData);
        toast.success("Yangilandi!");
      } else {
        await api.post('/tests/admin/questions/', formData);
        toast.success("Qo'shildi!");
      }
      setIsModalOpen(false);
      fetchQuestions(activeTopic.id);
    } catch (err) { toast.error("Xatolik yuz berdi!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Savol o'chirilsinmi?")) {
      try {
        await api.delete(`/tests/admin/questions/${id}/`);
        fetchQuestions(activeTopic.id);
        toast.success("O'chirildi");
      } catch (err) { toast.error("Xatolik!"); }
    }
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* ── HEADER ── */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          {activeTopic && (
            <button onClick={() => setActiveTopic(null)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-200 transition-all">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase italic">
              {activeTopic ? activeTopic.title : "Testlar Markazi"}
            </h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic">
              {activeTopic ? `Jami ${questions.length} ta savol` : "Mavzuni tanlang"}
            </p>
          </div>
        </div>
        {activeTopic && (
          <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
            <Plus size={16} /> Savol qo'shish
          </button>
        )}
      </div>

      {!activeTopic ? (
        /* ── MAVZULAR RO'YXATI ── */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4">
            <select className="md:w-64 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none cursor-pointer" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">Barcha fanlar</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <div key={topic.id} onClick={() => handleEnterTopic(topic)} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm hover:border-blue-400 transition-all cursor-pointer group flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <BrainCircuit size={24} />
                    </div>
                    <div className="max-w-[180px]">
                        <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{topic.title}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1 italic">{topic.subject?.name}</p>
                    </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── SAVOLLAR RO'YXATI ── */
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : questions.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
               <p className="text-slate-400 font-bold italic">Hali savollar qo'shilmagan.</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex gap-3">
                      <span className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black italic text-xs">{idx + 1}</span>
                      <h4 className="text-[16px] font-black text-slate-800 italic uppercase tracking-tight leading-snug">{q.title}</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                      {q.options?.map((opt, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${opt.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-[13px] font-bold">{opt.text}</span>
                          {opt.is_correct && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 justify-end">
                    <button onClick={() => handleOpenModal(q)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(q.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center font-black italic uppercase text-[10px]">
              <span>{editingId ? "Tahrirlash" : "Yangi Savol"}</span>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase italic">Savol nomi</label>
                <textarea required rows="2" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm italic" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-3">
                {formData.options.map((opt, index) => (
                  <div key={index} className={`flex items-center gap-3 p-2 rounded-2xl border ${opt.is_correct ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                    <button type="button" onClick={() => {
                        const newOpts = formData.options.map((o, i) => ({ ...o, is_correct: i === index }));
                        setFormData({...formData, options: newOpts});
                    }} className={`w-9 h-9 rounded-xl flex items-center justify-center ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-white text-slate-200'}`}>
                      {opt.is_correct ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <input required placeholder={`${index+1}-variant...`} className="flex-1 bg-transparent border-none outline-none font-bold text-sm" value={opt.text} onChange={(e) => {
                      const newOpts = [...formData.options]; newOpts[index].text = e.target.value; setFormData({...formData, options: newOpts});
                    }} />
                  </div>
                ))}
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl">SAQLASH</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;