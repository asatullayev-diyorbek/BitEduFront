import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  ArrowLeft, PlayCircle, FileText, ChevronRight, 
  Loader2, Trophy, Star, Target, Download, Link as LinkIcon, HelpCircle
} from 'lucide-react';

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
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: VIDEO & TEXT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-slate-900 rounded-[30px] overflow-hidden shadow-xl border-4 border-white relative group">
            {topic.video_url ? (
              <iframe src={topic.video_url} className="w-full h-full" title={topic.title} frameBorder="0" allowFullScreen />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                <PlayCircle size={60} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">Video mavjud emas</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic mb-4 border-b border-slate-50 pb-3 font-black">
              <FileText size={14} className="text-blue-600" /> Dars matni
            </h2>
            <p className="text-slate-600 font-bold leading-relaxed text-[15px] whitespace-pre-wrap italic">
                {topic.description || "Matnli ma'lumot kiritilmagan."}
            </p>
          </div>
        </div>

        {/* RIGHT: TEST & RESOURCES */}
        <div className="space-y-6">
          {/* TEST BLOKI */}
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
                        <div className="flex items-center gap-2">
                            <Star size={14} className="text-orange-400" />
                            <span className="text-[9px] font-black uppercase text-slate-300">Eng yaxshi ball:</span>
                        </div>
                        <span className="text-sm font-black text-emerald-400">{progress.best_score}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-blue-400" />
                            <span className="text-[9px] font-black uppercase text-slate-300">Urinishlar:</span>
                        </div>
                        <span className="text-sm font-black">{progress.attempts_count}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-[10px] font-bold italic leading-relaxed">
                     Siz hali ushbu mavzu bo'yicha test topshirmadingiz.
                  </p>
                )}

                <button 
                  onClick={() => navigate(`/student/subjects/${subjectId}/topics/${topicId}/quiz`)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl active:scale-95 shadow-blue-900/40"
                >
                  {progress ? "TESTNI QAYTA TOPSHIRISH" : "TESTNI BOSHLASH"}
                  <ChevronRight size={16} />
                </button>
             </div>
          </div>

          {/* QO'SHIMCHA MATERIALLLAR (Yangi Qo'shildi) */}
          <div className="bg-white p-7 rounded-[35px] border border-slate-100 shadow-sm space-y-5">
             <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Qo'shimcha materiallar</h4>
                <Download size={14} className="text-slate-200" />
             </div>
             
             <div className="space-y-3">
                {topic.resources && topic.resources.length > 0 ? (
                  topic.resources.map((res) => {
                    const isFile = !!res.file;
                    return (
                      <div key={res.id} className="p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group/item">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isFile ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {isFile ? <Download size={16} /> : <LinkIcon size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-black text-slate-800 uppercase truncate italic leading-none">{res.title}</h5>
                            <p className="text-[9px] text-slate-400 font-bold line-clamp-1 mt-1 italic">{res.description || "Darsga oid resurs"}</p>
                            <a 
                              href={res.file || res.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 mt-3 text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                            >
                              {isFile ? "Yuklab olish" : "Havolaga o'tish"}
                              <ChevronRight size={10} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center">
                    <HelpCircle size={30} className="mx-auto text-slate-100 mb-2" />
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Materiallar yo'q</p>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopicDetail;