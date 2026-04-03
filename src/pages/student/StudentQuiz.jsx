import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  CheckCircle2, Trophy, ArrowRight, Loader2, 
  XCircle, ArrowLeft, HelpCircle, Star, Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentQuiz = () => {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => { fetchQuestions(); }, [topicId]);

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/tests/questions/?topic=${topicId}`);
      // JSON strukturang: res.data.data.results
      setQuestions(res.data?.data?.results || []);
    } catch (err) { toast.error("Testlar yuklanmadi"); }
    finally { setLoading(false); }
  };

  const handleSelectOption = (optionId) => {
    const qId = questions[currentIdx].id;
    const newAnswers = answers.filter(a => a.question_id !== qId);
    setAnswers([...newAnswers, { question_id: qId, selected_option_id: optionId }]);
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.post('/tests/submit/', {
        topic_id: topicId,
        answers: answers
      });
      // JSON strukturang: res.data.data (Natijalar shu yerda)
      setResult(res.data?.data);
      toast.success("Test yakunlandi!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik!");
    } finally { setLoading(false); }
  };

  if (loading && !result) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  // ── NATIJA SAHIFASI (IXCHAM VA CHIROYLI) ──
  if (result) return (
  <div className="max-w-md mx-auto py-10 animate-in zoom-in-95 duration-500 px-4">
    <div className="bg-white rounded-[35px] border border-slate-100 shadow-2xl overflow-hidden p-8 text-center">
      <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-lg ${result.passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {result.passed ? <Trophy size={40} /> : <XCircle size={40} />}
      </div>
      
      <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
          {result.passed ? "Muvaffaqiyatli!" : "Hali imkon bor!"}
      </h2>
      <p className="text-slate-400 font-bold mt-2 uppercase text-[9px] tracking-widest">{result.advice}</p>

      <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Natija</p>
              <p className="text-lg font-black text-slate-800">{result.correct_answers} / {result.total_questions}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Berilgan ball</p>
              <p className="text-lg font-black text-blue-600">+{result.points_awarded}</p>
          </div>
      </div>

      {/* MANA SHU YERDA YO'LNI TO'G'IRLADIM */}
      <button 
          onClick={() => navigate(`/student/subjects/${subjectId}/topics/${topicId}`)} 
          className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95 italic"
      >
          Darsga qaytish
      </button>
    </div>
  </div>
);

  // ── TEST SAVOLLARI ──
  const currentQ = questions[currentIdx];
  const selectedOpt = answers.find(a => a.question_id === currentQ?.id)?.selected_option_id;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 px-4 pb-20">
      
      {/* PROGRESS HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black italic text-xs">
                {currentIdx + 1}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Savol {currentIdx + 1} / {questions.length}</span>
         </div>
         <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
         </div>
      </div>

      {/* SAVOL KARTASI */}
      <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl space-y-8">
         <h2 className="text-lg font-black text-slate-800 italic tracking-tight leading-snug uppercase">
            {currentQ?.title}
         </h2>
         
         <div className="grid grid-cols-1 gap-3">
            {currentQ?.options?.map((opt, i) => (
                <div 
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${selectedOpt === opt.id ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md shadow-blue-50' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-600'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] transition-all ${selectedOpt === opt.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                            {String.fromCharCode(65 + i)}
                        </div>
                        <span className="font-bold text-sm italic">{opt.text}</span>
                    </div>
                    {selectedOpt === opt.id && <CheckCircle2 size={18} className="text-blue-600" />}
                </div>
            ))}
         </div>

         <div className="pt-4 flex items-center justify-between gap-3">
            <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest italic disabled:opacity-30"
            >
                Orqaga
            </button>
            {currentIdx === questions.length - 1 ? (
                <button 
                    disabled={answers.length < questions.length}
                    onClick={handleSubmitQuiz}
                    className="flex-[2] py-3.5 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                    Yakunlash
                </button>
            ) : (
                <button 
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                    Keyingi <ArrowRight size={16} />
                </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default StudentQuiz;