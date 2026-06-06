import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { Loader2, ArrowLeft } from 'lucide-react';

const STYLES = {
  EASY: {
    title: 'Oson', desc: 'Boshlang’ich savol va topshiriqlar',
    dot: 'bg-emerald-500 shadow-lg shadow-emerald-200',
    text: 'text-emerald-600', border: 'border-emerald-100 hover:border-emerald-300',
    badge: 'bg-emerald-50 text-emerald-600',
  },
  MEDIUM: {
    title: 'O’rta', desc: 'O’rtacha qiyinlikdagi savollar',
    dot: 'bg-amber-500 shadow-lg shadow-amber-200',
    text: 'text-amber-600', border: 'border-amber-100 hover:border-amber-300',
    badge: 'bg-amber-50 text-amber-600',
  },
  HARD: {
    title: 'Qiyin', desc: 'Murakkab savol va topshiriqlar',
    dot: 'bg-red-500 shadow-lg shadow-red-200',
    text: 'text-red-600', border: 'border-red-100 hover:border-red-300',
    badge: 'bg-red-50 text-red-600',
  },
};

const QuizDifficulty = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/games/quizzes/difficulties/');
        setLevels(res.data?.data || []);
      } catch {
        // global toast
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/student/games" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> Orqaga
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Quiz O&rsquo;yinlari</h1>
        <p className="text-slate-500 font-medium">Qiyinlik darajasini tanlang</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((lvl) => {
            const s = STYLES[lvl.key] || STYLES.MEDIUM;
            const hasQuiz = lvl.count > 0;
            const Card = (
              <div className={`bg-white rounded-[28px] border ${s.border} p-8 text-center transition-all duration-300 ${hasQuiz ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10' : 'opacity-50'}`}>
                <div className={`mx-auto mb-6 h-16 w-16 rounded-full ${s.dot}`} />
                <h3 className={`text-2xl font-black italic ${s.text}`}>{s.title}</h3>
                <p className="mt-2 text-sm font-medium text-slate-400">{s.desc}</p>
                <span className={`mt-5 inline-block rounded-lg px-4 py-1.5 text-[11px] font-black uppercase tracking-wider ${s.badge}`}>
                  {hasQuiz ? `${lvl.count} ta savol mavjud` : 'Hozircha yo’q'}
                </span>
              </div>
            );
            return hasQuiz ? (
              <Link key={lvl.key} to={`/student/games/quiz/${lvl.key}`}>{Card}</Link>
            ) : (
              <div key={lvl.key}>{Card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizDifficulty;
