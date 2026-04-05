import React, { useState, useEffect } from 'react';
import { Star, Trophy, CheckCircle, Zap, BookUser, ChevronRight, Loader2, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const StudentHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/auth/student/dashboard/stats/');
      const result = res.data.data || res.data;
      setData(result);
    } catch (err) {
      console.error("Dashboard yuklanmadi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-[500px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={45} />
      <p className="text-[10px] font-black uppercase italic text-slate-400 tracking-[0.3em]">Yuklanmoqda...</p>
    </div>
  );

  const stats = [
    { id: 1, label: 'UMUMIY BALL', value: data?.total_points || '0', sub: 'O’sishda davom eting', icon: <Star className="text-blue-500" />, bg: 'bg-blue-50' },
    { id: 2, label: 'REYTING O’RNI', value: data?.rank ? `#${data.rank}` : '—', sub: 'Top 10 ga intiling', icon: <Trophy className="text-orange-500" />, bg: 'bg-orange-50' },
    { id: 3, label: 'O’TILGAN MAVZULAR', value: data?.completed_topics_count || '0', sub: 'O’zlashtirilgan darslar', icon: <CheckCircle className="text-green-500" />, bg: 'bg-green-50' },
    { id: 4, label: 'O’RTACHA NATIJA', value: `${data?.average_score || 0}%`, sub: 'Muvaffaqiyat ko’rsatkichi', icon: <Zap className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-none italic uppercase tracking-tighter">
            Salom, {data?.full_name?.split(' ')[0] || 'O\'quvchi'}! 👋
          </h1>
          <p className="text-slate-400 font-bold text-lg italic mt-2 tracking-tight">Bugun yangi marralarni zabt etish vaqti!</p>
        </div>
        <div className="bg-white border-2 border-blue-50 p-3 px-8 rounded-[25px] flex items-center gap-4 shadow-xl shadow-blue-900/5">
           <div className="bg-blue-500 p-2 rounded-xl">
                <Award size={20} className="text-white" />
           </div>
           <span className="font-black text-blue-600 text-2xl italic tracking-tighter">{data?.total_points || 0} BALL</span>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.id} className="bg-white p-7 rounded-[35px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-16 h-16 rounded-[24px] ${s.bg} flex items-center justify-center`}>
                {React.cloneElement(s.icon, { size: 28 })}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase italic">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none my-1.5 italic">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 italic leading-none">{s.sub}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* ── OXIRGI MAVZULAR (RECENT TOPICS) ── */}
        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[45px] border border-slate-100 shadow-sm min-h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-3">
                <BookUser className="text-blue-600" /> Oxirgi mavzular
            </h2>
            <Link to="/student/subjects" className="text-blue-600 font-black text-[10px] uppercase italic flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">
              Barchasi <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {data?.recent_topics && data.recent_topics.length > 0 ? (
              data.recent_topics.map((item, i) => (
                <Link 
                  key={i} 
                  // URL TO'G'RILANDI: /student/subjects/:subject_id/topics/:topic_id
                  to={`/student/subjects/${item.subject_id}/topics/${item.id}`}
                  className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[30px] border border-transparent hover:bg-white hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-black text-slate-800 italic uppercase tracking-tighter">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase italic bg-slate-100 px-2.5 py-1 rounded-lg">
                            {item.subject_name}
                        </span>
                        <span className={`text-[9px] font-black uppercase italic ${item.status === 'Tugallangan' ? 'text-green-500' : 'text-orange-400'}`}>
                            • {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 opacity-20 text-center flex-grow">
                <BookUser size={100} strokeWidth={1} />
                <p className="mt-6 font-black text-slate-500 uppercase italic text-sm">Hali darslarni boshlamadingiz</p>
              </div>
            )}
          </div>
        </div>

        {/* ── TOP 3 ── */}
        <div className="bg-white p-8 md:p-10 rounded-[45px] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight mb-10 flex items-center gap-3">
             <Trophy className="text-yellow-500" /> Top 3 🏆
          </h2>
          
          <div className="space-y-6 flex-grow">
            {data?.leaderboard_top3 && data.leaderboard_top3.length > 0 ? (
              data.leaderboard_top3.map((student, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-[25px] hover:bg-slate-50 transition-colors group">
                   <div className="flex items-center gap-5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black italic shadow-inner ${
                        i === 0 ? 'bg-yellow-400 text-white shadow-yellow-200' : 
                        i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-slate-800 uppercase italic leading-none">{student.full_name}</h4>
                        <p className="text-[10px] font-black text-blue-500 italic mt-1.5">{student.points} BALL</p>
                      </div>
                   </div>
                   {i === 0 && <Star size={16} className="text-yellow-400 fill-yellow-400 animate-pulse" />}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 h-full">
                <Trophy size={100} strokeWidth={1} />
                <p className="mt-6 font-black text-slate-500 text-center uppercase italic text-sm">Reyting bo'sh</p>
              </div>
            )}
          </div>

          {/* TUGMA ENDI HAR DOIM CARD PASTIDA (mt-auto) */}
          <Link 
            to="/student/leaderboard" 
            className="mt-auto flex items-center justify-center py-5 bg-slate-50 rounded-[25px] text-[10px] font-black text-slate-400 uppercase italic hover:bg-blue-600 hover:text-white transition-all tracking-[0.2em] shadow-sm active:scale-95"
          >
            Barcha chempionlar
          </Link>
        </div>

      </div>
    </div>
  );
};

export default StudentHome;