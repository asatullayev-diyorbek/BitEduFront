import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, ChevronUp, Trash2, CheckCheck, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ── ⌨️ TYPEWRITER EFFEKTI ── */
const Typewriter = ({ text, speed = 10, onUpdate }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (onUpdate) onUpdate();
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className="markdown-content prose prose-sm max-w-none">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
    </div>
  );
};

const AIChat = ({ topicTitle, subjectName, gradeName }) => {
  const { topicId } = useParams();
  const storageKey = `chat_history_${topicId}`;
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const getTimestamp = () => new Date().toISOString();
  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    // MUHIM: Role nomlarini tekshirib olamiz
    return saved ? JSON.parse(saved).map(m => ({ ...m, isNew: false })) : [
      { 
        role: 'model', 
        content: `Assalomu alaykum! Men sening **${subjectName}** mentoriman. "${topicTitle}" mavzusini birga o'rganamiz! 🚀`,
        timestamp: getTimestamp(),
        isNew: false
      }
    ];
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Saqlashdan oldin isNew ni false qilamiz
    const toSave = messages.map(m => ({ ...m, isNew: false }));
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  }, [messages]);

  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!input.trim() || loading) return;

  const userMessage = { role: 'user', content: input, timestamp: getTimestamp(), isNew: false };
  
  // 1. Ekrandagi xabarlarga foydalanuvchi xabarini qo'shamiz
  const currentMessages = [...messages, userMessage];
  setMessages(currentMessages);
  
  const currentInput = input;
  setInput('');
  setLoading(true);

  try {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash",
      systemInstruction: `Sen ${gradeName}-sinf o'qituvchisisan. Fan: ${subjectName}. Mavzu: ${topicTitle}. Faqat o'zbek tilida javob ber. Javoblaringni qisqa, aniq va tushunarli qilib ber. Keraksiz ma'lumotlarni qo'shma.`
    });

    // 2. MUHIM: Gemini tarixni FAQAT 'user' xabari bilan boshlanishini talab qiladi.
    // Shuning uchun birinchi AI salomini (messages[0]) tarixga qo'shmaymiz.
    const chatHistory = currentMessages
      .slice(1, -1) // Birinchi AI salomini va eng oxirgi (hozir yuborilgan) xabarni olib tashlaymiz
      .map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // 3. Chatni boshlaymiz
    const chat = model.startChat({ history: chatHistory });
    
    // 4. Oxirgi xabarni yuboramiz
    const result = await chat.sendMessage(currentInput);
    const responseText = result.response.text();
    
    setMessages(prev => [...prev, { 
      role: 'model', 
      content: responseText, 
      timestamp: getTimestamp(),
      isNew: true 
    }]);
  } catch (error) {
    console.error("Gemini API Error:", error);
    setMessages(prev => [...prev, { 
      role: 'model', 
      content: "Ulanishda xato. Iltimos, qaytadan urinib ko'r. 🔄", 
      timestamp: getTimestamp(), 
      isNew: true 
    }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={`w-full bg-white rounded-[35px] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-700 ${isExpanded ? 'h-[550px]' : 'h-[80px]'}`}>
      
      {/* HEADER */}
      <div onClick={() => setIsExpanded(!isExpanded)} className={`px-6 py-5 flex justify-between items-center cursor-pointer transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-all duration-500 ${isExpanded ? 'bg-blue-600 rotate-[360deg] shadow-lg shadow-blue-500/40' : 'bg-slate-100'}`}>
             <Bot size={20} className={isExpanded ? 'text-white' : 'text-blue-600'} />
          </div>
          <div>
            <h4 className="text-[13px] font-black uppercase tracking-widest italic leading-none">AI Mentor</h4>
            <p className="text-[10px] font-bold mt-1 text-blue-400 uppercase italic leading-none">{gradeName} • {subjectName}</p>
          </div>
        </div>
        <ChevronUp className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {/* CONTENT */}
      <div className={`flex flex-col h-[470px] bg-[#f8fafc] transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                       <div className={`relative p-4 px-5 rounded-[22px] text-[13.5px] shadow-sm max-w-[88%] ${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                           <div className="prose prose-sm max-w-none font-medium italic leading-relaxed">
                                {!isUser && msg.isNew ? (
                                    <Typewriter text={msg.content} onUpdate={scrollToBottom} />
                                ) : (
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                )}
                            </div>
                           <div className={`flex items-center justify-end gap-1 mt-2 text-[8px] font-black uppercase tracking-tighter ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                               {formatTime(msg.timestamp)} {isUser && <CheckCheck size={12} />}
                           </div>
                       </div>
                    </div>
                );
            })}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-[22px] shadow-sm border border-slate-100 flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                </div>
            )}
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-100 p-1.5 rounded-full focus-within:bg-white focus-within:ring-2 ring-blue-500/10 transition-all">
                <input type="text" placeholder="Xabarni yozing..." className="flex-1 bg-transparent border-none px-4 py-2 text-[13px] font-bold outline-none" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
                <button type="submit" className="p-3 bg-blue-600 text-white rounded-full transition-all disabled:bg-slate-300" disabled={loading || !input.trim()}><Send size={16} /></button>
            </form>
            <div className="flex justify-between px-4 mt-2">
                <button onClick={() => {if(window.confirm("Tozalansinmi?")) {setMessages([]); localStorage.removeItem(storageKey);}}} className="text-[8px] font-black text-slate-300 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                    <Trash2 size={10} /> Tozalash
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;