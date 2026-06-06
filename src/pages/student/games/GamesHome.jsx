import React from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, ClipboardList, ChevronRight } from 'lucide-react';

const GAMES = [
  {
    to: 'anagram',
    title: 'Anagram O’yinlari',
    desc: 'Harflarni to’g’ri joylashtiring va so’zni toping!',
    icon: <Shuffle size={26} />,
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    to: 'quiz',
    title: 'Quiz O’yinlari',
    desc: 'Qiyinlik darajasini tanlang va bilimingizni sinang!',
    icon: <ClipboardList size={26} />,
    iconBg: 'bg-indigo-50 text-indigo-600',
  },
];

const GamesHome = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">O&rsquo;yinlar</h1>
        <p className="text-slate-500 font-medium">O&rsquo;ynab o&rsquo;rganing — har bir g&rsquo;alaba uchun ball yig&rsquo;ing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GAMES.map(({ to, title, desc, icon, iconBg }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white rounded-[28px] border border-slate-100 p-7 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col"
          >
            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg}`}>
              {icon}
            </div>
            <h2 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h2>
            <p className="mt-2 text-slate-400 font-medium text-sm flex-1">{desc}</p>
            <div className="mt-6 w-full py-4 bg-slate-900 group-hover:bg-blue-600 text-white rounded-[18px] font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2">
              Boshlash <ChevronRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GamesHome;
