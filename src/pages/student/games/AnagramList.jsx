import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { Loader2, Gamepad2, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';

const AnagramList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/games/anagrams/');
        setGames(res.data?.data?.results || []);
      } catch {
        // global toast
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase italic text-slate-400 tracking-[0.3em]">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/student/games" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> Orqaga
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white text-[11px] font-black shadow-lg shadow-blue-100">
          abc
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Anagram O&rsquo;yinlari</h1>
          <p className="text-slate-500 font-medium">Harflarni to&rsquo;g&rsquo;ri joylashtiring va so&rsquo;zni toping!</p>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="py-24 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">O&rsquo;yinlar hali qo&rsquo;shilmagan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <div
              key={g.id}
              className="group bg-white rounded-[28px] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{g.title}</h3>
                <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-blue-600">
                  {g.xp} XP
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400 font-medium flex-1">{g.description}</p>

              <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-md bg-slate-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                {g.words_count} so&rsquo;z
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] font-extrabold text-slate-400 uppercase">
                <Gamepad2 size={14} />
                {g.played_count} marta o&rsquo;ynalgan
                {g.is_completed && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                    <CheckCircle2 size={12} /> Bajarilgan
                  </span>
                )}
              </div>

              <Link
                to={`/student/games/anagram/${g.id}`}
                className="mt-5 w-full py-4 bg-slate-900 group-hover:bg-blue-600 text-white rounded-[18px] font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2"
              >
                O&rsquo;ynash <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnagramList;
