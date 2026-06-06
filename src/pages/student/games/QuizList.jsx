import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../../api/axios';
import { Loader2, Gamepad2, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';

const LABELS = { EASY: 'Oson', MEDIUM: "O'rta", HARD: 'Qiyin' };

const QuizList = () => {
  const { difficulty } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/games/quizzes/?difficulty=${difficulty}`);
        setQuizzes(res.data?.data?.results || []);
      } catch {
        // global toast
      } finally {
        setLoading(false);
      }
    })();
  }, [difficulty]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/student/games/quiz" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> Orqaga
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Quiz O&rsquo;yinlari</h1>
        <p className="text-slate-500 font-medium">{LABELS[difficulty] || ''} darajadagi kvizlar</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="py-24 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Bu darajada kvizlar yo&rsquo;q.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((q) => (
            <div key={q.id} className="group bg-white rounded-[28px] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{q.title}</h3>
                <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-blue-600">
                  {q.xp} XP
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400 font-medium flex-1">{q.description}</p>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-extrabold text-slate-400 uppercase">
                <Gamepad2 size={14} />
                {q.played_count} marta
                {q.is_completed && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                    <CheckCircle2 size={12} /> Bajarilgan
                  </span>
                )}
              </div>

              <Link
                to={`/student/games/quiz/play/${q.id}`}
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

export default QuizList;
