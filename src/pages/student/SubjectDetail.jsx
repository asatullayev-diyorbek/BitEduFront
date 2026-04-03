import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import axios from 'axios';
import FlipBookViewer from '../../components/FlipBookViewer';
import usePdfBlobUrl from '../../hooks/usePdfBlobUrl';
import { 
  ArrowLeft, Layers, Loader2, ChevronRight, 
  Info, BookMarked, Calendar, Lock
} from 'lucide-react';

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookContainerRef = useRef(null);

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]); // Mavzular uchun state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('main'); 
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Fanning o'zini olish
        const res = await api.get(`/academic/subjects/${id}/`);
        const subjectData = res.data.data;
        setSubject(subjectData);

        // 2. Shu fanga tegishli mavzularni olish (subject id orqali)
        const topicsRes = await api.get(`/academic/topics/?subject=${id}`);
        setTopics(topicsRes.data.data.results || []);

        // 3. Kitob bo'lsa Blob sifatida yuklash
        if (subjectData.book_url) {
          try {
            const pdfRes = await axios.get(subjectData.book_url, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: 'application/pdf' }));
            setPdfBlobUrl(url);
          } catch (pdfErr) { console.error("PDF yuklashda xato:", pdfErr); }
        }
      } catch (err) {
        console.error("Ma'lumotlarda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => {
      document.removeEventListener('fullscreenchange', handleFs);
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [id]);

  const { blobUrl, loading: pdfLoading } = usePdfBlobUrl(subject?.book_url);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Yuklanmoqda...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER & NAVIGATION (Normal Mode) */}
      {!isFullscreen && (
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div>
            <nav className="flex gap-2 text-[10px] font-black text-slate-300 uppercase tracking-tighter mb-0.5">
              <Link to="/student/subjects" className="hover:text-blue-600">FANLAR</Link>
              <ChevronRight size={10} className="mt-0.5" />
              <span className="text-blue-600 truncate max-w-[150px] italic">{subject?.name}</span>
            </nav>
            <h1 className="text-2xl font-black text-slate-900 leading-none">{subject?.name}</h1>
          </div>
        </div>
      )}

      {/* TABS (Normal Mode) */}
      {!isFullscreen && (
        <div className="flex gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'main', label: 'Asosiy', icon: <Info size={16}/> },
            { id: 'topics', label: 'Mavzular', icon: <Layers size={16}/> },
            { id: 'book', label: 'Kitob', icon: <BookMarked size={16}/> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[450px]">
        
        {/* ASOSIY TAB */}
        {activeTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Fan tavsifi</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{subject?.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black italic">
                     {subject?.grade?.name?.charAt(0) || '5'}
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sinf</p>
                     <p className="font-black text-slate-800 tracking-tight">{subject?.grade?.name}</p>
                   </div>
                </div>
                <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Calendar size={18}/></div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Qo'shildi</p>
                     <p className="font-black text-slate-800 tracking-tight">{new Date(subject?.created_at).toLocaleDateString()}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center gap-4 h-fit">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[22px] flex items-center justify-center mx-auto mb-2 shadow-inner"><Layers size={32} /></div>
                <h4 className="text-4xl font-black text-slate-800">{topics.length}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Mavzular soni</p>
                <button onClick={() => setActiveTab('topics')} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg uppercase tracking-widest">O'rganishni boshlash</button>
            </div>
          </div>
        )}

       {/* MAVZULAR TAB (CHAPGA TEKISLANGAN VA IXCHAM) */}
{activeTab === 'topics' && (
  <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500">
    {topics.length > 0 ? (
      <div className="relative space-y-3 pl-2 max-w-2xl"> {/* max-w-2xl uni juda yoyilib ketishidan asraydi */}
        
        {/* Progress Chizig'i */}
        <div className="absolute left-[21px] top-6 bottom-6 w-[1.5px] bg-slate-100 z-0 hidden sm:block"></div>

        <div className="space-y-3 relative z-10">
          {topics.map((topic) => (
            <div 
              key={topic.id} 
              onClick={() => topic.is_active && navigate(`/student/subjects/${id}/topics/${topic.id}`)}
              className={`group flex items-center gap-4 transition-all ${!topic.is_active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              
              {/* Doira - Kichik */}
              <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center font-black text-xs border-2 transition-all duration-300
                ${topic.is_active 
                  ? 'bg-white border-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 shadow-sm' 
                  : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                {topic.order}
              </div>

              {/* Ixcham Karta */}
              <div className={`flex-1 bg-white p-3 px-5 rounded-[20px] border border-slate-100 flex items-center justify-between transition-all duration-300
                ${topic.is_active ? 'hover:shadow-md hover:border-blue-200' : ''}`}>
                
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    {topic.video_url ? (
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded">Video dars</span>
                    ) : (
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded">Matnli dars</span>
                    )}
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                    {topic.title}
                  </h3>
                </div>

                {/* O'ng tarafdagi holat belgisi */}
                <div className="shrink-0 ml-4">
                   {topic.is_active ? (
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <ChevronRight size={16} />
                     </div>
                   ) : (
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-200">
                        <Lock size={12} /> {/* Endi xato bermaydi */}
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="py-10 text-slate-300 italic text-sm font-medium">Bu fan bo'yicha mavzular hali yuklanmagan.</div>
    )}
  </div>
)}
        {activeTab === 'book' && (
            pdfLoading ? (
            <div>PDF yuklanmoqda...</div>
            ) : (
            <FlipBookViewer
                pdfBlobUrl={blobUrl}
                downloadUrl={subject?.book_url}
                bookName={subject?.name}
            />
            )
        )}
      </div>
    </div>
  );
};

export default SubjectDetail;