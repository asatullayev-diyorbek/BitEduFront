import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import type { Test, TestResult } from '@/types';
import { FiClock, FiCheck, FiX, FiArrowRight, FiAward } from 'react-icons/fi';

export default function TestPage() {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const { addToast } = useUIStore();

    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);

    useEffect(() => {
        testService.getByTopic(Number(topicId)).then(t => {
            setTest(t);
            setTimeLeft(t.time_limit_minutes * 60);
        }).catch(() => addToast("Test topilmadi", 'error')).finally(() => setLoading(false));
    }, [topicId]);

    const submitTest = useCallback(() => {
        if (!test) return;
        setSubmitted(true);
        const correct = test.questions.filter(q => selected[q.id] === q.correct_option_id).length;
        const score = Math.round((correct / test.questions.length) * 100);
        const passed = score >= 60;
        setResult({ score, total: test.questions.length, correct, wrong: test.questions.length - correct, time_taken: test.time_limit_minutes * 60 - timeLeft, passed });
        if (passed && user) updateUser({ points: (user.points || 0) + score });
        addToast(passed ? `🎉 Tabriklaymiz! ${score}% to'g'ri` : `😔 ${score}% — Qayta urining`, passed ? 'success' : 'error');
    }, [test, selected, timeLeft, user]);

    useEffect(() => {
        if (submitted || !test) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(timer); submitTest(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [test, submitted, submitTest]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return (
        <div className="min-h-screen bg-bgBase flex items-center justify-center">
            <div className="text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-600">Test yuklanmoqda...</p></div>
        </div>
    );

    if (!test) return (
        <div className="min-h-screen bg-bgBase flex items-center justify-center">
            <div className="text-center"><p className="text-slate-600 mb-4">Test topilmadi</p><button onClick={() => navigate(-1)} className="btn-primary">Orqaga</button></div>
        </div>
    );

    const question = test.questions[current];
    const progress = ((current + 1) / test.questions.length) * 100;
    const timePercent = (timeLeft / (test.time_limit_minutes * 60)) * 100;
    const isTimeWarning = timeLeft < 60;

    // Result screen
    if (result) return (
        <div className="min-h-screen bg-bgBase flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-soft p-8 text-center animate-slide-up">
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl ${result.passed ? 'bg-secondary-50' : 'bg-red-50'}`}>
                    {result.passed ? '🏆' : '📝'}
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">{result.passed ? 'Ajoyib natija!' : "Qayta urinib ko'ring"}</h2>
                <p className="text-slate-500 mb-6">{result.passed ? "Tabriklaymiz, siz testdan o'tdingiz!" : "Ko'proq o'rganib, qayta topshiring."}</p>

                <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center border-8 ${result.passed ? 'border-secondary bg-secondary-50' : 'border-red-300 bg-red-50'}`}>
                    <span className={`text-4xl font-black ${result.passed ? 'text-secondary' : 'text-red-500'}`}>{result.score}%</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4">
                        <div className="text-2xl font-black text-green-600">{result.correct}</div>
                        <div className="text-xs text-green-700 font-medium">To'g'ri</div>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <div className="text-2xl font-black text-red-500">{result.wrong}</div>
                        <div className="text-xs text-red-700 font-medium">Noto'g'ri</div>
                    </div>
                </div>

                {result.passed && (
                    <div className="bg-amber-50 rounded-xl p-3 mb-6 flex items-center gap-2 justify-center">
                        <FiAward className="text-amber-500" size={18} />
                        <span className="text-sm font-semibold text-amber-700">+{result.score} ball qo'shildi!</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Orqaga</button>
                    <button onClick={() => { setCurrent(0); setSelected({}); setSubmitted(false); setResult(null); setTimeLeft(test.time_limit_minutes * 60); }}
                        className="btn-primary flex-1">Qayta topshirish</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bgBase">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <FiX size={20} />
                </button>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{test.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">{current + 1}/{test.questions.length}</span>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${isTimeWarning ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                    <FiClock size={14} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question */}
            <div className="max-w-2xl mx-auto p-4 pt-8">
                <div className="animate-slide-up" key={current}>
                    <div className="mb-2">
                        <span className="badge bg-primary-100 text-primary">{current + 1}-savol</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">{question.text}</h2>

                    <div className="space-y-3">
                        {question.options.map((option, i) => {
                            const isSelected = selected[question.id] === option.id;
                            const letters = ['A', 'B', 'D', 'E'];
                            return (
                                <button key={option.id} onClick={() => setSelected({ ...selected, [question.id]: option.id })}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${isSelected
                                        ? 'border-primary bg-primary-50 text-primary shadow-md shadow-primary/20'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                        }`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {letters[i]}
                                    </div>
                                    {option.text}
                                    {isSelected && <FiCheck size={16} className="ml-auto shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 mt-8">
                        {current > 0 && (
                            <button onClick={() => setCurrent(c => c - 1)} className="btn-secondary">Oldingi</button>
                        )}
                        {current < test.questions.length - 1 ? (
                            <button onClick={() => setCurrent(c => c + 1)} disabled={!selected[question.id]}
                                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                                Keyingi <FiArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={submitTest} className="btn-primary flex-1 bg-secondary hover:bg-secondary-600">
                                Yakunlash ✅
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
