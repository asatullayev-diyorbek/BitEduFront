import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // Markdown uchun
import api from '../../api/axios';
import { 
  ArrowLeft, PlayCircle, FileText, ChevronRight, 
  Loader2, Trophy, Star, Target, Download, Link as LinkIcon, 
  HelpCircle, Sparkles, MessageSquare, Bot 
} from 'lucide-react';
import AIChat from '../../components/AIChat';

const TopicDetail = () => {
  const { subjectId, topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/academic/topics/${topicId}/`);
        setTopic(res.data.data);
      } catch (err) {
        console.error("Xato:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
    window.scrollTo(0, 0);
  }, [topicId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (!topic) return <div className="p-20 text-center font-bold text-slate-400 uppercase italic">Dars topilmadi.</div>;

  const progress = topic.student_progress;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all active:scale-90">
          <ArrowLeft size={18} />
        </button>
        <div>
          <nav className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest italic mb-0.5">
            <Link to="/student/subjects" className="hover:text-blue-600 transition-colors">FANLAR</Link>
            <ChevronRight size={10} />
            <span className="text-slate-400 truncate max-w-[150px]">{topic.subject?.name}</span>
          </nav>
          <h1 className="text-xl font-black text-slate-900 uppercase italic leading-none">{topic.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: VIDEO, TEXT (MARKDOWN), RESOURCES (8 COLUMNS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* VIDEO */}
          <div className="aspect-video bg-slate-900 rounded-[35px] overflow-hidden shadow-xl border-4 border-white relative group">
            {topic.video_url ? (
              <iframe src={topic.video_url} className="w-full h-full" title={topic.title} frameBorder="0" allowFullScreen />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                <PlayCircle size={60} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">Video mavjud emas</p>
              </div>
            )}
          </div>

          {/* DARS MATNI (MARKDOWN) */}
          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic mb-6 border-b border-slate-50 pb-4 font-black">
              <FileText size={16} className="text-blue-600" /> Dars ma'lumotlari
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed italic markdown-body">
                <ReactMarkdown>
                    {topic.description || "Matnli ma'lumot kiritilmagan."}
                </ReactMarkdown>
            </div>
          </div>

          {/* QO'SHIMCHA MATERIALLLAR (Matn tagida) */}
          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between border-b border-slate-50 pb-5 mb-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                    <Download size={16} className="text-orange-500" /> Qo'shimcha materiallar
                </h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topic.resources && topic.resources.length > 0 ? (
                  topic.resources.map((res) => {
                    const isFile = !!res.file;
                    return (
                      <div key={res.id} className="p-4 bg-slate-50/50 rounded-[25px] border border-transparent hover:border-blue-100 hover:bg-white transition-all group/item flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isFile ? 'bg-orange-100 text-orange-500' : 'bg-emerald-100 text-emerald-500'}`}>
                          {isFile ? <Download size={18} /> : <LinkIcon size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[11px] font-black text-slate-800 uppercase truncate italic leading-none">{res.title}</h5>
                          <a href={res.file || res.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1 text-[9px] font-black text-blue-600 hover:underline uppercase">
                            {isFile ? "YUKLAB OLISH" : "LINKKA O'TISH"}
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-4 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase italic italic">Materiallar mavjud emas</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* RIGHT: TEST & AI CHAT (4 COLUMNS) */}
        <div className="lg:col-span-4 space-y-6">
          
          

          {/* ── AI CHAT (Testni tagida) ── */}
          <div className="sticky top-6">
             <AIChat 
                topicTitle={topic.title} 
                subjectName={topic.subject?.name} 
                gradeName={topic.grade} 
             />
          </div>

          {/* TEST BLOKI (Tepada) */}
          <div className="bg-slate-900 p-8 rounded-[35px] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500"><Trophy size={150} /></div>
             <div className="relative z-10 space-y-6">
                <div>
                   <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic">Bilimni tekshirish</span>
                   <h3 className="text-2xl font-black mt-1 italic uppercase tracking-tighter">Test topshirish</h3>
                </div>

                {progress ? (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[9px] font-black uppercase text-slate-300">Eng yaxshi natija:</span>
                        <span className="text-sm font-black text-emerald-400">{progress.best_score} to'g'ri javob</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[9px] font-black uppercase text-slate-300">Urinishlar soni:</span>
                        <span className="text-sm font-black text-emerald-400">{progress.attempts_count}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-[10px] font-bold italic">Hali topshirilmadi</p>
                )}

                <button 
                  onClick={() => navigate(`/student/subjects/${subjectId}/topics/${topicId}/quiz`)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl active:scale-95 shadow-blue-900/40"
                >
                  {progress ? "QAYTA TOPSHIRISH" : "TESTNI BOSHLASH"}
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopicDetail;