import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Plus, Search, Edit2, Trash2, GraduationCap, 
  X, Loader2, Hash, Calendar, AlertCircle 
} from 'lucide-react';

const AdminGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({ name: '', order: 1 });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/grades/');
      setGrades(res.data.data.results || []);
    } catch (err) {
      console.error("Sinflarni yuklashda xato!");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({ name: grade.name, order: grade.order || 1 });
    } else {
      setEditingGrade(null);
      setFormData({ name: '', order: grades.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.patch(`/academic/grades/${editingGrade.id}/`, formData);
      } else {
        await api.post('/academic/grades/', formData);
      }
      setIsModalOpen(false);
      fetchGrades();
    } catch (err) {
      alert(err.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ushbu sinfni o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/academic/grades/${id}/`);
        fetchGrades();
      } catch (err) {
        alert(err.response?.data?.message || "O'chirishda xato!");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">Sinflar Boshqaruvi</h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 italic">O'quv darajalarini sozlash</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-100 flex items-center gap-2 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
          Yangi Sinf
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Sinf nomini qidiring (masalan: 5-sinf)..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-sm font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRADES GRID (Kichik bo'lgani uchun Card uslubida qilamiz) */}
      {loading ? (
        <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map((grade) => (
            <div key={grade.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-slate-900 group-hover:scale-110 transition-transform">
                <GraduationCap size={100} />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner">
                  {grade.name.match(/\d+/)?.[0] || "#"}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(grade)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(grade.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="mt-4 relative z-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{grade.name}</h3>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Hash size={12} /> Tartib: {grade.order || '—'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} /> 2026
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h2 className="text-lg font-black italic">{editingGrade ? "Sinfni Tahrirlash" : "Yangi Sinf Qo'shish"}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 italic">Ma'lumotlarni kiriting</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sinf Nomi</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Masalan: 5-sinf"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-sm shadow-inner"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tartib Raqami</label>
                <input 
                  required 
                  type="number" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-sm shadow-inner"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  {editingGrade ? "Yangilash" : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGrades;