import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, Search, Filter, MoreVertical, Trash2, 
  Edit3, GraduationCap, Mail, Calendar, Loader2,
  ChevronLeft, ChevronRight, UserPlus, ShieldCheck,
    Star, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [grades, setGrades] = useState([]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // ── TO'G'RILANGAN URL ──
      // Backend'dagi filterset_fields: student_profile__grade ga mosladik
      // URL manzili: /auth/users/ (boyagi kodingda /users/user/ edi, tekshirib ol)
      const url = `/auth/user/?role=STUDENT&search=${search}&student_profile__grade=${gradeFilter}`;
      
      const [studentRes, gradeRes] = await Promise.all([
        api.get(url),
        api.get('/academic/grades/')
      ]);

      // Backend wrapperingga qarab ma'lumotni olamiz
      const studentData = studentRes.data.data?.results || studentRes.data.results || [];
      const gradeData = gradeRes.data.data?.results || gradeRes.data.results || [];

      setStudents(studentData);
      setGrades(gradeData);
    } catch (err) {
      toast.error("MA'LUMOTLARNI YUKLASHDA XATOLIK!");
    } finally {
      setLoading(false);
    }
  };

  // Search yozganda srazu backendga chopmasligi uchun biroz kutamiz (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, gradeFilter]);

  const handleDelete = async (id) => {
    if (window.confirm("HAQIQATDAN HAM USHBU O'QUVCHINI O'CHIRMOQCHIMISIZ?")) {
      try {
        await api.delete(`/auth/users/${id}/`);
        toast.success("O'QUVCHI O'CHIRILDI");
        fetchStudents();
      } catch (err) {
        toast.error("O'CHIRISHDA XATOLIK!");
      }
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
               <Users size={28} />
            </div>
            O'quvchilar
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-[0.2em] mt-2 ml-1">Tizim foydalanuvchilarini boshqarish</p>
        </div>
        <button className="group flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[25px] font-black text-[10px] uppercase tracking-widest italic hover:bg-blue-600 transition-all shadow-2xl active:scale-95">
          <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> Yangi o'quvchi qo'shish
        </button>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="ISM, FAMILIYA YOKI USERNAME..."
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[25px] outline-none focus:border-blue-400 font-bold text-[11px] uppercase italic transition-all shadow-sm focus:shadow-xl focus:shadow-blue-900/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <select 
            className="w-full pl-16 pr-10 py-5 bg-white border border-slate-100 rounded-[25px] outline-none appearance-none font-black text-[10px] uppercase italic text-slate-600 cursor-pointer shadow-sm focus:border-blue-400"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">BARCHA SINFLAR</option>
            {grades.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={45} />
            <p className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest">Yuklanmoqda...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-10 py-7 text-[9px] font-black text-slate-400 uppercase italic tracking-[0.2em]">O'quvchi ma'lumotlari</th>
                  <th className="px-6 py-7 text-[9px] font-black text-slate-400 uppercase italic tracking-[0.2em] text-center">Sinfi</th>
                  <th className="px-6 py-7 text-[9px] font-black text-slate-400 uppercase italic tracking-[0.2em] text-center">Jami Ball</th>
                  <th className="px-6 py-7 text-[9px] font-black text-slate-400 uppercase italic tracking-[0.2em]">Ro'yxatdan o'tgan</th>
                  <th className="px-10 py-7 text-[9px] font-black text-slate-400 uppercase italic tracking-[0.2em] text-right">Boshqaruv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[20px] bg-slate-50 border-2 border-white shadow-md overflow-hidden flex-shrink-0 group-hover:rotate-3 transition-transform">
                          {student.image ? (
                            <img src={student.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black italic text-lg uppercase">
                              {student.first_name?.[0]}{student.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-slate-900 uppercase italic tracking-tight group-hover:text-blue-600 transition-colors">
                            {student.first_name} {student.last_name}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-[9px] font-black text-slate-600 uppercase italic shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        {student.profile?.grade?.name || "SINFI YO'Q"}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                        <Star size={14} className="text-blue-500 fill-blue-500" />
                        <span className="text-xs font-black text-blue-700 italic">{student.profile?.total_points || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700 uppercase italic tracking-tighter">
                          {new Date(student.date_joined).toLocaleDateString('uz-UZ')}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase italic mt-1">
                           {new Date(student.date_joined).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                        <button className="p-3.5 bg-white border border-slate-100 rounded-[15px] text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all">
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-3.5 bg-white border border-slate-100 rounded-[15px] text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center opacity-30 py-20">
             <Users size={80} strokeWidth={1} />
             <p className="mt-4 font-black text-[10px] uppercase italic tracking-[0.3em]">O'quvchilar topilmadi</p>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
          <p className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest">JAMI RO'YXATDA: {students.length} TA</p>
          <div className="flex gap-3">
            <button className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-20">
              <ChevronLeft size={18} />
            </button>
            <button className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;