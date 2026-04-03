import React from 'react';
import { Star, Trophy, CheckCircle, Zap, BookUser, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentHome = () => {
  const stats = [
    { id: 1, label: 'UMUMIY BALL', value: '0', sub: 'O’sishda davom eting', icon: <Star className="text-blue-500" />, bg: 'bg-blue-50' },
    { id: 2, label: 'REITING O’RNI', value: '—', sub: 'Top 10 ga intiling', icon: <Trophy className="text-orange-500" />, bg: 'bg-orange-50' },
    { id: 3, label: 'O’TILGAN MAVZULAR', value: '0', sub: 'O’zlashtirilgan darslar', icon: <CheckCircle className="text-green-500" />, bg: 'bg-green-50' },
    { id: 4, label: 'O’RTACHA NATIJA', value: '0%', sub: 'Muvaffaqiyat ko’rsatkichi', icon: <Zap className="text-purple-500" />, bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">Salom! 👋</h1>
          <p className="text-slate-500 font-medium text-lg">Bugun yangi bilimlarni egallash vaqti</p>
        </div>
        <div className="bg-white border border-slate-100 p-2 px-4 rounded-xl flex items-center gap-2 shadow-sm">
           <Star size={18} className="text-blue-500 fill-blue-500" />
           <span className="font-black text-blue-600 text-lg">0 ball</span>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{s.label}</p>
              <p className="text-2xl font-black text-slate-800 leading-none my-1">{s.value}</p>
              <p className="text-[11px] font-medium text-slate-400 tracking-tight">{s.sub}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-xl font-black text-slate-900">Oxirgi mavzular</h2>
            <Link to="/student/subjects" className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Barchasi <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-10 opacity-40 text-center">
            <BookUser size={60} strokeWidth={1.5} />
            <p className="mt-4 font-bold text-slate-500">Hali birorta darsni boshlamadingiz</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-16">Top 3 🏆</h2>
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <Trophy size={60} strokeWidth={1.5} />
            <p className="mt-4 font-bold text-slate-500 text-center">Reyting shakllanmagan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;