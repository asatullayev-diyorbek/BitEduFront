import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  Users, BookOpen, Layers, GraduationCap, 
  TrendingUp, Clock, AlertCircle, Calendar,
  ArrowUpRight, Loader2, PlayCircle, PlusCircle
} from 'lucide-react';

// ── Statistik Karta Komponenti (Dinamik trend bilan) ───────────────────────
const StatCard = ({ title, total, thisMonth, icon: Icon, color }) => {
  // Trendni hisoblash: (Shu oyda qo'shilganlar / Umumiy) * 100
  const trend = total > 0 ? Math.round((thisMonth / total) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
          <TrendingUp size={12} />
          +{trend}%
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{total}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">{title}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/academic/dashboard/stats/'); // Backend yo'ling
        setData(res.data.data);
      } catch (err) {
        console.error("Dashboard yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Statistika yig'ilmoqda...</p>
    </div>
  );

  const { stats, recent_activities } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <GraduationCap size={250} />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black tracking-tight italic">Xush kelibsiz, Admin!</h1>
          <p className="text-blue-100 text-sm font-medium opacity-80 max-w-md italic">
            Bugun platformangizda {stats.students.this_month} ta yangi o'quvchi qo'shildi. Ishlar joyida!
          </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 px-6 rounded-3xl border border-white/20 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic leading-none">Bugun</p>
            <p className="font-bold text-sm leading-none mt-1">30-Mart, 2026</p>
          </div>
          <Calendar size={24} className="text-blue-100" />
        </div>
      </div>

      {/* 2. STATS GRID (API'dan kelgan real ma'lumotlar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="O'quvchilar" 
          total={stats.students.total} 
          thisMonth={stats.students.this_month}
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Fanlar" 
          total={stats.subjects.total} 
          thisMonth={stats.subjects.this_month}
          icon={BookOpen} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Darslar" 
          total={stats.topics.total} 
          thisMonth={stats.topics.this_month}
          icon={Layers} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Sinflar" 
          total={stats.grades.total} 
          thisMonth={stats.grades.this_month}
          icon={GraduationCap} 
          color="bg-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. RECENT ACTIVITY (API'dan kelgan real loglar) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 italic tracking-tight uppercase tracking-widest">So'nggi faollik</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all italic">Loglarni ko'rish</button>
          </div>
          
          <div className="space-y-4">
            {recent_activities.length > 0 ? recent_activities.map((act, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] border border-slate-100/50 group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm font-black italic
                    ${act.type === 'TOPIC' ? 'bg-red-50 text-red-500' : 
                      act.type === 'SUBJECT' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {act.type === 'TOPIC' ? <PlayCircle size={20}/> : <PlusCircle size={20}/>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 tracking-tight">{act.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">{act.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase italic">
                    {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-slate-300 italic font-bold">Hozircha hech qanday harakat yo'q.</p>
            )}
          </div>
        </div>

        {/* 4. SYSTEM STATUS (Statik bo'lsa ham chiroyli) */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-widest leading-none">Tizim holati</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
                <span>Bazadagi yuklama</span>
                <span className="text-emerald-500">Normal</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
                <span>Media Files</span>
                <span className="text-blue-500">Barqaror</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>

            <div className="p-5 bg-blue-50 rounded-[24px] border border-blue-100 flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-blue-900 leading-relaxed italic">
                Tizim avtomatik zaxira nusxasini (Backup) muvaffaqiyatli yakunladi. Xavotirga o'rin yo'q.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;