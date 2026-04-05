import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  Plus, Search, Edit2, Trash2, Loader2, PlayCircle,
  FileText, CheckCircle2, MinusCircle, BookOpen,
  Hash, X, Filter, GraduationCap, Calendar, Clock,
  Paperclip, Link as LinkIcon, Download, Save, Check, Sparkles, Bot
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminTopics = () => {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  // --- RESOURCE STATES ---
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [activeTopicForResources, setActiveTopicForResources] = useState(null);
  const [resources, setResources] = useState([]);
  const [resourceFormData, setResourceFormData] = useState({
    title: '', description: '', url: '', file: null
  });

  const [formData, setFormData] = useState({
    title: '', description: '', video_url: '', subject: '', order: 1, is_active: true
  });

  useEffect(() => {
    fetchGrades();
    fetchSubjects();
    fetchData();
  }, [selectedSubject, selectedGrade]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/academic/topics/';
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`${url}?${params.toString()}`);
      let results = res.data.data.results || [];
      if (selectedGrade) {
        results = results.filter(t => t.subject?.grade?.id === selectedGrade);
      }
      setTopics(results);
    } catch (err) { console.error("Xato!"); }
    finally { setLoading(false); }
  };

  const fetchGrades = async () => {
    try {
      const res = await api.get('/academic/grades/');
      setGrades(res.data.data.results || []);
    } catch (err) { console.error("Sinflar yuklanmadi"); }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/academic/subjects/');
      setSubjects(res.data.data.results || []);
    } catch (err) { console.error("Fanlar yuklanmadi"); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
  };

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({
        title: topic.title, description: topic.description || '',
        video_url: topic.video_url || '', subject: topic.subject?.id,
        order: topic.order, is_active: topic.is_active
      });
    } else {
      setEditingTopic(null);
      setFormData({ title: '', description: '', video_url: '', subject: selectedSubject || '', order: topics.length + 1, is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, subject_id: formData.subject, order: parseInt(formData.order) };
    try {
      if (editingTopic) await api.patch(`/academic/topics/${editingTopic.id}/`, payload);
      else await api.post('/academic/topics/', payload);
      setIsModalOpen(false);
      fetchData();
      toast.success("Saqlandi");
    } catch (err) { toast.error("Xato!"); }
  };

  // --- RESOURCE HANDLERS (MATERIAL QO'SHISH) ---
  const handleOpenResourceCenter = async (topic) => {
    setActiveTopicForResources(topic);
    setIsResourceModalOpen(true);
    fetchResources(topic.id);
  };

  const fetchResources = async (topicId) => {
    try {
      const res = await api.get(`/academic/resources/?topic=${topicId}`);
      setResources(res.data.data.results || []);
    } catch (err) { toast.error("Resurslar yuklanmadi"); }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();

    // 1. Tekshirib ko'r: activeTopicForResources ichida ID bormi?
    if (!activeTopicForResources?.id) {
      console.error("Mavzu ID topilmadi!");
      return;
    }

    const data = new FormData();

    // MUHIM: Serializer 'topic' kutyapti, shuning uchun 'topic' deb yuboramiz
    data.append('topic', activeTopicForResources.id);
    data.append('title', resourceFormData.title);
    data.append('description', resourceFormData.description);

    if (resourceFormData.url) data.append('url', resourceFormData.url);
    if (resourceFormData.file) data.append('file', resourceFormData.file);

    try {
      const res = await api.post('/academic/resources/', data);
      toast.success("Material qo'shildi");
      setResourceFormData({ title: '', description: '', url: '', file: null });
      fetchResources(activeTopicForResources.id);
    } catch (err) {
      console.error("Xato:", err.response?.data);
      toast.error("Xatolik!");
    }
  };
  const handleDeleteResource = async (id) => {
    if (window.confirm("O'chirilsinmi?")) {
      await api.delete(`/academic/resources/${id}/`);
      fetchResources(activeTopicForResources.id);
      toast.success("O'chirildi");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Mavzular ombori</h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 italic">Kontent va Materiallar boshqaruvi</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-blue-100 flex items-center gap-2 uppercase tracking-widest transition-all active:scale-95">
          <Plus size={18} /> Yangi Dars
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Dars qidirish..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-black uppercase italic tracking-tighter cursor-pointer" value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedSubject(""); }}>
            <option value="">Barcha Sinflar</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-black uppercase italic tracking-tighter cursor-pointer" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="">Barcha Fanlar</option>
            {subjects.filter(s => !selectedGrade || s.grade?.id === selectedGrade).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">Order</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dars Sarlavhasi</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">Materiallar</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">Holati</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right italic">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topics.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map((topic) => (
                  <tr key={topic.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4 text-center"><span className="font-black text-slate-900 text-xs">#{topic.order}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[14px] leading-tight italic uppercase tracking-tighter">{topic.title}</span>
                        <span className="text-[9px] font-black text-slate-400 mt-1 uppercase italic tracking-widest">{topic.subject?.name} • {topic.subject?.grade?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenResourceCenter(topic)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto"
                      >
                        <Paperclip size={12} /> Materiallar
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {topic.is_active ? <span className="text-emerald-500 font-black text-[9px] uppercase italic">Active</span> : <span className="text-slate-300 font-black text-[9px] uppercase italic">Hidden</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenModal(topic)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                        <button onClick={async () => { if (window.confirm("O'chirilsinmi?")) { await api.delete(`/academic/topics/${topic.id}/`); fetchData(); } }} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── COMPACT & SMART AI MODAL ── */}
{isModalOpen && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-4xl rounded-[35px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
      
      {/* HEADER */}
      <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
            <Sparkles size={18} />
          </div>
          <h2 className="text-sm font-black text-slate-900 italic uppercase tracking-tighter">
            {editingTopic ? "Tahrirlash" : "Yangi Dars"}
          </h2>
        </div>
        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CHAP TOMON: TEXNIK (5 COL) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest italic">Mavzu Sarlavhasi</label>
                <input 
                  required type="text" placeholder="Masalan: 1-dars..." 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-400 font-bold text-xs italic transition-all shadow-inner"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest italic">Fan</label>
                    <select 
                      required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-[10px] italic cursor-pointer focus:bg-white focus:border-blue-400 shadow-inner transition-all appearance-none"
                      value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    >
                        <option value="">Fan...</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest italic">Tartib</label>
                    <input 
                      required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-400 font-black text-xs italic shadow-inner"
                      value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} 
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest italic">Video (YouTube)</label>
                <input 
                  type="url" placeholder="Embed URL..." 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-400 font-bold text-[10px] italic shadow-inner"
                  value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} 
                />
            </div>

            <div onClick={() => setFormData({...formData, is_active: !formData.is_active})} className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${formData.is_active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-200 text-slate-400'}`}>
                        <CheckCircle2 size={16} />
                    </div>
                    <span className={`text-[10px] font-black uppercase italic ${formData.is_active ? 'text-blue-600' : 'text-slate-400'}`}>
                        {formData.is_active ? 'Hozir Faol' : 'Yashirilgan'}
                    </span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${formData.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_active ? 'right-1' : 'left-1'}`}></div>
                </div>
            </div>
          </div>

          {/* O'NG TOMON: AI GENERATION TEXT (7 COL) */}
          <div className="lg:col-span-7 space-y-2 relative">
                <div className="flex justify-between items-center px-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Dars Izohi (Markdown)</label>
                    <button 
                        type="button"
                        onClick={async () => {
                            // 1. Tekshiruvlar
                            if(!formData.title || !formData.subject) {
                              return toast.error("Oldin mavzu nomi va fanni tanlang!");
                            }
                            
                            // 2. Tanlangan fanning nomini topib olish
                            const selectedSub = subjects.find(s => s.id == formData.subject);
                            const subjectInfo = selectedSub ? `${selectedSub.grade?.name} ${selectedSub.name}` : "";

                            setLoading(true);
                            try {
                                const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
                                const model = genAI.getGenerativeModel({ model: import.meta.env.VITE_GEMINI_MODEL });
                                
                                // 3. Promptni kuchaytiramiz
                                const prompt = `Sen professional o'zbek tili o'qituvchisisan. Hozir o'quvchi "${subjectInfo}" fani doirasida "${formData.title}" mavzusini o'rganyapti. 
                                Shu mavzu uchun daxshatli qiziqarli, bolalarbop dars matni yozib ber. 
                                - Markdown formatida bo'lsin.
                                - Sarlavhalar va ro'yxatlardan foydalan.
                                - Emojilar qo'sh.
                                - Faqat o'zbek tilida javob ber.`;

                                const result = await model.generateContent(prompt);
                                setFormData({...formData, description: result.response.text()});
                                toast.success("AI darsni tayyorladi! ✨");
                            } catch (e) { 
                                console.error(e);
                                toast.error("AI bilan bog'lanib bo'lmadi"); 
                            } finally { setLoading(false); }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-md shadow-blue-100"
                    >
                        <Sparkles size={12} /> AI Bilan Yozish
                    </button>
                </div>
                <textarea 
                    placeholder="Dars mazmuni..." 
                    className="w-full h-[280px] px-6 py-5 bg-slate-50 border border-slate-100 rounded-[25px] outline-none focus:bg-white focus:border-blue-400 font-medium text-xs leading-relaxed transition-all shadow-inner resize-none italic"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
                {loading && (
                    <div className="absolute inset-0 top-8 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-[25px]">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-blue-600" />
                            <span className="text-[9px] font-black text-blue-600 uppercase italic animate-pulse">AI dars yozmoqda...</span>
                        </div>
                    </div>
                )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex gap-3">
            <button type="submit" className="flex-1 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl transition-all flex items-center justify-center gap-2">
              <Save size={16} /> Saqlash
            </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* ── RESOURCE MODAL (MATERIALAR MARKAZI) ── */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[45px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-10 py-7 bg-slate-900 text-white flex justify-between items-center font-black italic uppercase text-xs tracking-widest">
              <div className="flex items-center gap-3">
                <Paperclip size={20} className="text-blue-400" />
                <span>{activeTopicForResources?.title} - Materiallar</span>
              </div>
              <button onClick={() => setIsResourceModalOpen(false)} className="hover:rotate-90 transition-all p-2 bg-white/10 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-10 flex flex-col md:flex-row gap-8 max-h-[75vh] overflow-y-auto">
              {/* Form: Yangi qo'shish */}
              <form onSubmit={handleAddResource} className="flex-1 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2">Yangi qo'shish</h4>
                <input required placeholder="Sarlavha..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-blue-400" value={resourceFormData.title} onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })} />
                <textarea rows="2" placeholder="Izoh..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-blue-400" value={resourceFormData.description} onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })} />
                <div className="space-y-3">
                  <div className="relative group">
                    <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input placeholder="Havola URL (https://...)" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[10px] outline-none" value={resourceFormData.url} onChange={(e) => setResourceFormData({ ...resourceFormData, url: e.target.value })} />
                  </div>
                  <label className="flex items-center justify-center gap-3 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100 transition-all">
                    <Download size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{resourceFormData.file ? resourceFormData.file.name : "Fayl yuklash"}</span>
                    <input type="file" className="hidden" onChange={(e) => setResourceFormData({ ...resourceFormData, file: e.target.files[0] })} />
                  </label>
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                  <Save size={16} /> Qo'shish
                </button>
              </form>

              {/* List: Mavjud resurslar */}
              <div className="flex-1 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2">Mavjud Materiallar ({resources.length})</h4>
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                  {resources.map((res) => (
                    <div key={res.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${res.file ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {res.file ? <FileText size={16} /> : <LinkIcon size={16} />}
                        </div>
                        <div>
                          <h5 className="text-[11px] font-black text-slate-800 uppercase italic leading-none">{res.title}</h5>
                          <p className="text-[8px] font-bold text-slate-400 mt-1 italic uppercase">{res.file ? 'Fayl' : 'Havola'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteResource(res.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {resources.length === 0 && <p className="text-[10px] font-bold text-slate-300 italic text-center py-10">Materiallar yo'q</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTopics;