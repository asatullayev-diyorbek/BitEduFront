import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import {
  Trophy, Medal, Star, Loader2,
  ChevronLeft, ChevronRight, GraduationCap, TrendingUp, ChevronDown, Check, User
} from 'lucide-react';

const AdminLeaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/academic/grades/');
        setGrades(res.data.data?.results || res.data.results || []);
      } catch (err) { console.error("Sinflar yuklanmadi"); }
    };
    fetchGrades();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      let url = `/results/leaderboard/?page=${page}`;
      if (selectedGrade) url += `&grade=${selectedGrade.id}`;
      const res = await api.get(url);
      const responseData = res.data.data;
      setLeaders(responseData.results || []);
      if (responseData.count) setTotalPages(Math.ceil(responseData.count / 10));
    } catch (err) { setLeaders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaders(); }, [page, selectedGrade]);

  if (loading && page === 1) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase italic text-slate-400 animate-pulse">Reyting yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 animate-in fade-in duration-700">

      {/* ── HEADER & FILTER ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10">
        <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-3">
                <Trophy className="text-blue-600" size={32} /> O'quvchilar Reytingi
            </h1>
            <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-[0.2em] mt-1">Admin Panel - Bilimlar Reytingi</p>
        </div>

        {/* CUSTOM DROPDOWN */}
        <div className="relative w-full md:w-64" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between bg-white px-5 py-3 rounded-[20px] border transition-all cursor-pointer shadow-sm ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                    <GraduationCap size={18} className="text-blue-600"/>
                    <span className="text-[11px] font-black uppercase italic tracking-tighter text-slate-700">{selectedGrade ? selectedGrade.name : "Barcha Sinflar"}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white rounded-[22px] border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        <div onClick={() => { setSelectedGrade(null); setIsOpen(false); setPage(1); }} className="px-6 py-4 hover:bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-50 text-[10px] font-black uppercase italic text-slate-400">Barcha Sinflar</div>
                        {grades.map(g => (
                            <div key={g.id} onClick={() => { setSelectedGrade(g); setIsOpen(false); setPage(1); }} className="px-6 py-4 hover:bg-blue-50 flex items-center justify-between cursor-pointer group">
                                <span className={`text-[10px] font-black uppercase italic ${selectedGrade?.id === g.id ? 'text-blue-600' : 'text-slate-700'}`}>{g.name}</span>
                                {selectedGrade?.id === g.id && <Check size={14} className="text-blue-600" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* ── MAIN LEADERBOARD TABLE ── */}
      <div className="bg-white rounded-[35px] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">

        {/* TABLE HEADER */}
        <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-2">
                <Star className="text-blue-600" size={16} fill="currentColor" />
                <h3 className="text-[10px] font-black text-slate-900 uppercase italic tracking-[0.2em]">O'quvchilar Reytingi</h3>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase italic">
                <TrendingUp size={14} /> Global Status
            </div>
        </div>

        {/* TABLE BODY */}
        <div className="divide-y divide-slate-50">
          {leaders.map((item) => {
            const isTop3 = item.rank <= 3;
            return (
              <div key={item.id} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-8">
                    {/* Rank Indicator */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black italic border-2 transition-all ${
                        item.rank === 1 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' :
                        item.rank === 2 ? 'bg-slate-50 border-slate-200 text-slate-500' :
                        item.rank === 3 ? 'bg-orange-50 border-orange-200 text-orange-600' :
                        'bg-white border-transparent text-slate-300 group-hover:text-blue-400'
                    }`}>
                        {item.rank}
                    </div>

                    {/* Name & Grade */}
                    <div>
                        <h4 className={`text-[15px] font-black uppercase italic tracking-tighter leading-none transition-colors ${isTop3 ? 'text-slate-900' : 'text-slate-700'} group-hover:text-blue-600`}>
                            {item.full_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                {item.grade_name}
                            </span>
                            {isTop3 && (
                                <span className={`text-[8px] font-black uppercase italic px-2 py-0.5 rounded flex items-center gap-1 ${
                                    item.rank === 1 ? 'bg-yellow-400 text-white' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    <Medal size={8} /> {item.rank === 1 ? 'Chempion' : 'Top 3'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-10">
                    <div className="hidden sm:block text-right pr-6 border-r border-slate-50">
                        <p className="text-[11px] font-black text-slate-900 italic leading-none">{item.completed_topics_count}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase italic mt-1 tracking-tighter">Darslar</p>
                    </div>
                    <div className="text-right min-w-[70px]">
                        <p className={`text-2xl font-black italic leading-none ${isTop3 ? 'text-blue-600' : 'text-slate-400'}`}>
                            {item.total_points}
                        </p>
                        <p className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest mt-1">Ball</p>
                    </div>
                </div>
              </div>
            );
          })}

          {!loading && leaders.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-black italic uppercase">Reytingda o'quvchilar yo'q</div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
            <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-center items-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="px-6 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-black italic text-slate-600">
                    {page} / {totalPages}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeaderboard;