import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Search, Loader2, BookMarked, Layers, FileText, ChevronRight } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Barchasi');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/academic/subjects/');
        setSubjects(res.data.data.results);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchSubjects();
  }, []);

  const grades = ['Barchasi', ...new Set(subjects.map(s => s.grade.name))];
  const filtered = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'Barchasi' || s.grade.name === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  if (loading) return <div className="flex flex-col items-center justify-center p-20 gap-4"><Loader2 className="animate-spin text-blue-600" size={40}/><p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Ma'lumotlar yuklanmoqda</p></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Mening fanlarim</h1>
          <p className="text-slate-500 font-medium">Sinfingizga mos yo'nalishni tanlang</p>
        </div>
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Fan nomini qidirish..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-[20px] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 shadow-sm font-bold text-slate-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {grades.map(g => (
          <button 
            key={g} 
            onClick={() => setSelectedGrade(g)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedGrade === g ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-500 border border-slate-100 hover:bg-blue-50'}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(subject => (
          <div key={subject.id} className="group bg-white rounded-[32px] border border-slate-100 p-5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col">
            <div className="w-full h-32 rounded-2xl bg-slate-50 overflow-hidden mb-5 relative">
              {subject.image_url ? <img src={subject.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" /> : <div className="w-full h-full flex items-center justify-center text-blue-100"><BookMarked size={40}/></div>}
              <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-blue-600 border border-white/50 uppercase tracking-wider">{subject.grade.name}</div>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors truncate">{subject.name}</h3>
            <div className="flex items-center gap-3 mb-6">
               <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-[10px] font-extrabold text-slate-500 uppercase"><Layers size={14}/> {subject.topic_count} mavzu</div>
               {subject.book_pages && <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md text-[10px] font-extrabold text-slate-500 uppercase border-l border-slate-100"><FileText size={14}/> {subject.book_pages} bet</div>}
            </div>
            <Link to={`/student/subjects/${subject.id}`} className="w-full">
              <button className="w-full py-4 bg-slate-900 group-hover:bg-blue-600 text-white rounded-[18px] font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2">
                Boshlash <ChevronRight size={16} />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;