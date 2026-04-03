import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, Search, Edit2, Trash2, BookOpen, FileText, Loader2, 
  X, Upload, Hash, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Serializer maydonlariga moslangan formData
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade_id: '',
    book_pages: '',
    image_file: null,
    book_file: null
  });

  useEffect(() => {
    fetchData();
    fetchGrades();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/subjects/');
      setSubjects(res.data.data.results || []);
    } catch (err) { toast.error("Ma'lumotlarni yuklashda xato!"); }
    finally { setLoading(false); }
  };

  const fetchGrades = async () => {
    try {
      const res = await api.get('/academic/grades/');
      setGrades(res.data.data.results || []);
    } catch (err) { console.error("Sinflar yuklanmadi"); }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        description: subject.description || '',
        grade_id: subject.grade?.id || '',
        book_pages: subject.book_pages || '',
        image_file: null,
        book_file: null
      });
    } else {
      setEditingSubject(null);
      setFormData({ name: '', description: '', grade_id: '', book_pages: '', image_file: null, book_file: null });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validatsiya: grade_id bo'sh bo'lsa jo'natma
    if (!formData.grade_id) {
      toast.error("Sinfni tanlash majburiy!");
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('grade_id', formData.grade_id); // UUID formatda ketishi kerak
    
    // Agar book_pages raqam bo'lsa, string qilib yuboramiz
    if (formData.book_pages) {
      data.append('book_pages', formData.book_pages);
    }
    
    // Fayllarni faqat ular tanlangan bo'lsagina yuboramiz
    if (formData.image_file instanceof File) {
      data.append('image_file', formData.image_file);
    }
    
    if (formData.book_file instanceof File) {
      data.append('book_file', formData.book_file);
    }

    try {
      if (editingSubject) {
        await api.patch(`/academic/subjects/${editingSubject.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Fan yangilandi!");
      } else {
        await api.post('/academic/subjects/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Yangi fan yaratildi!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err.response?.data);
      toast.error(err.response?.data?.message || "Serverda xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Fanlar Boshqaruvi</h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Sizda {subjects.length} ta fan bor</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95">
          <Plus size={18} /> Yangi Fan
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Fan nomini qidiring..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fan</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinf</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sahifalar</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((subject) => (
                <tr key={subject.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 overflow-hidden shrink-0">
                        {subject.image_url ? <img src={subject.image_url} className="w-full h-full object-cover" /> : <BookOpen className="w-full h-full p-2.5 text-blue-400"/>}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{subject.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 italic font-bold text-slate-500 text-xs">
                    {subject.grade?.name}
                  </td>
                  <td className="px-6 py-4 text-center font-black text-blue-600 text-xs italic">
                    {subject.book_pages || 0} bet
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(subject)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16}/></button>
                      <button onClick={async () => {
                        if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
                          await api.delete(`/academic/subjects/${subject.id}/`);
                          fetchData();
                        }
                      }} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black italic">{editingSubject ? "Fanni Tahrirlash" : "Yangi Fan Qo'shish"}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Sahifalar va darslik ma'lumotlari</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24}/></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fan Nomi</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 font-bold text-sm transition-all"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Sinf</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 font-bold text-sm appearance-none"
                    value={formData.grade_id} onChange={(e) => setFormData({...formData, grade_id: e.target.value})}>
                    <option value="">Tanlang...</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kitob Sahifalari</label>
                  <div className="relative">
                    <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="number" placeholder="Masalan: 120" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 font-bold text-sm transition-all"
                      value={formData.book_pages} onChange={(e) => setFormData({...formData, book_pages: e.target.value})} />
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fan Tavsifi</label>
                  <textarea rows="2" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 font-medium text-sm transition-all"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Rasm (Thumbnail)</label>
                  <div className="relative h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 hover:border-blue-200 transition-all cursor-pointer">
                    <Upload size={16} className="text-slate-400 mr-2" />
                    <span className="text-[10px] font-bold text-slate-500 truncate">{formData.image_file ? formData.image_file.name : "Tanlash..."}</span>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Darslik (PDF)</label>
                  <div className="relative h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 hover:border-blue-200 transition-all cursor-pointer">
                    <FileText size={16} className="text-slate-400 mr-2" />
                    <span className="text-[10px] font-bold text-slate-500 truncate">{formData.book_file ? formData.book_file.name : "Tanlash..."}</span>
                    <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, book_file: e.target.files[0]})} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Bekor Qilish</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">SAQLASH</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;