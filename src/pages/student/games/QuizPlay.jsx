import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Trophy } from 'lucide-react';

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { question_id: option_id }
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/games/quizzes/${id}/`);
        setQuiz(res.data?.data);
      } catch {
        // global toast
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const select = (questionId, optionId) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
  };

  const submit = async () => {
    const payload = Object.entries(answers).map(([question_id, selected_option_id]) => ({
      question_id, selected_option_id,
    }));
    if (payload.length === 0) {
      toast.error('Avval javobni tanlang');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post(`/games/quizzes/${id}/submit/`, { answers: payload });
      setResult(res.data?.data);
    } catch {
      // global toast
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase italic text-slate-400 tracking-[0.3em]">Yuklanmoqda...</p>
      </div>
    );
  }

  // ── Natija ekrani ──
  if (result) {
    return (
      <div className="max-w-md mx-auto py-10 animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[35px] border border-slate-100 shadow-2xl p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-lg ${result.is_correct ? 'bg-emerald-500 shadow-emerald-200 text-white' : 'bg-red-500 shadow-red-200 text-white'}`}>
            {result.is_correct ? <Trophy size={40} /> : <XCircle size={40} />}
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
            {result.is_correct ? 'Barakalla!' : 'Hali imkon bor!'}
          </h2>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[9px] tracking-widest">{result.message}</p>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Natija</p>
              <p className="text-lg font-black text-slate-800">{result.correct_count} / {result.total_questions}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Berilgan ball</p>
              <p className="text-lg font-black text-blue-600">+{result.points_awarded}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/student/games/quiz/${quiz.difficulty}`)}
            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 italic"
          >
            Kvizlarga qaytish
          </button>
        </div>
      </div>
    );
  }

  // ── O'yin ekrani ──
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to={`/student/games/quiz/${quiz?.difficulty}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> Orqaga
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">{quiz?.title}</h1>
        <p className="text-slate-500 font-medium">{quiz?.description}</p>
      </div>

      {quiz?.is_completed && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Allaqachon bajarilgan — ball qo&rsquo;shilmaydi
        </div>
      )}

      <div className="space-y-8">
        {(quiz?.questions || []).map((q, qi) => (
          <div key={q.id}>
            <div className="rounded-[24px] border border-blue-100 bg-blue-50/60 p-6">
              <h3 className="text-lg font-black italic text-blue-700 leading-snug">
                <span className="mr-2 text-blue-300">{qi + 1}.</span>{q.text}
              </h3>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">To&rsquo;g&rsquo;ri javobni tanlang:</p>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.options.map((opt) => {
                const isSel = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => select(q.id, opt.id)}
                    className={`rounded-[18px] border px-6 py-4 text-left font-mono font-bold transition-all ${
                      isSel
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-md shadow-blue-100'
                        : 'border-slate-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={submit}
          disabled={submitting}
          className="px-12 py-4 bg-blue-600 text-white rounded-[18px] font-black text-[11px] uppercase tracking-[0.2em] italic shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Tekshirish'}
        </button>
      </div>
    </div>
  );
};

export default QuizPlay;
