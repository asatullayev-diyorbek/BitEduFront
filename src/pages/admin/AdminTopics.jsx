import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, Search, Edit2, Trash2, Loader2, PlayCircle, 
  FileText, CheckCircle2, MinusCircle, BookOpen, 
  Hash, X, Filter, GraduationCap, Calendar, Clock,
  Paperclip, Link as LinkIcon, Download, Save
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
    if(window.confirm("O'chirilsinmi?")) {
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
                        <button onClick={() => handleOpenModal(topic)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                        <button onClick={async () => { if(window.confirm("O'chirilsinmi?")) { await api.delete(`/academic/topics/${topic.id}/`); fetchData(); } }} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── TOPIC MODAL (O'sha-o'sha) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white font-black italic uppercase text-xs tracking-widest">
              <span>{editingTopic ? "Tahrirlash" : "Yangi Dars"}</span>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <input required type="text" placeholder="Dars sarlavhasi" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 font-black text-sm italic" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm italic cursor-pointer" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}>
                    <option value="">Fan...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade?.name})</option>)}
                </select>
                <input required type="number" placeholder="Tartib" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm italic" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} />
              </div>
              <input type="url" placeholder="YouTube Embed URL" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm italic" value={formData.video_url} onChange={(e) => setFormData({...formData, video_url: e.target.value})} />
              <textarea rows="3" placeholder="Dars tavsifi" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm italic" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl">Saqlash</button>
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
              <button onClick={() => setIsResourceModalOpen(false)} className="hover:rotate-90 transition-all p-2 bg-white/10 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-10 flex flex-col md:flex-row gap-8 max-h-[75vh] overflow-y-auto">
                {/* Form: Yangi qo'shish */}
                <form onSubmit={handleAddResource} className="flex-1 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2">Yangi qo'shish</h4>
                    <input required placeholder="Sarlavha..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-blue-400" value={resourceFormData.title} onChange={(e) => setResourceFormData({...resourceFormData, title: e.target.value})} />
                    <textarea rows="2" placeholder="Izoh..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-blue-400" value={resourceFormData.description} onChange={(e) => setResourceFormData({...resourceFormData, description: e.target.value})} />
                    <div className="space-y-3">
                        <div className="relative group">
                            <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input placeholder="Havola URL (https://...)" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-[10px] outline-none" value={resourceFormData.url} onChange={(e) => setResourceFormData({...resourceFormData, url: e.target.value})} />
                        </div>
                        <label className="flex items-center justify-center gap-3 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100 transition-all">
                            <Download size={18} className="text-blue-500" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{resourceFormData.file ? resourceFormData.file.name : "Fayl yuklash"}</span>
                            <input type="file" className="hidden" onChange={(e) => setResourceFormData({...resourceFormData, file: e.target.files[0]})} />
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
                                        {res.file ? <FileText size={16}/> : <LinkIcon size={16}/>}
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