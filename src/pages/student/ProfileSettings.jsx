import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { 
  User, Mail, Camera, Lock, Save, Loader2, 
  UserCircle, Award, ShieldCheck, KeyRound, GraduationCap, 
  CalendarDays, History, ChevronDown, Check, Fingerprint
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passUpdating, setPassUpdating] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); // RASM UCHUN LOADER
  
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    grade_id: ''
  });

  const [passData, setPassData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const fetchData = async () => {
    try {
      const [userRes, gradesRes] = await Promise.all([
        api.get('/auth/me/'),
        api.get('/academic/grades/')
      ]);
      const userData = userRes.data.data || userRes.data;
      setUser(userData);
      setGrades(gradesRes.data.data?.results || gradesRes.data.results || []);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        username: userData.username || '',
        email: userData.email || '',
        grade_id: userData.profile?.grade?.id || ''
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    fetchData(); 
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsGradeOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── RASM YUKLASH FUNKSIYASI (FORMDATA BILAN) ──
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        return toast.error("FAQAT RASM YUKLASH MUMKIN!");
    }

    const imgFormData = new FormData();
    imgFormData.append('image', file);

    setImageLoading(true);
    try {
      await api.patch(`/auth/user/${user.id}/update-image/`, imgFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("PROFIL RASMI YANGILANDI 📸");
      fetchData(); // Ma'lumotni yangilash
    } catch (err) {
      toast.error("RASM YUKLASHDA XATOLIK!");
    } finally {
      setImageLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.patch(`/auth/user/${user.id}/`, formData);
      toast.success("PROFIL MUVAFFAQIYATLI YANGILANDI ✨");
      fetchData();
    } catch (err) { toast.error("XATOLIK!"); } 
    finally { setUpdating(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
        return toast.error("YANGI PAROLLAR MOS KELMADI!");
    }
    setPassUpdating(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passData.old_password,
        new_password: passData.new_password
      });
      toast.success("PAROL YANGILANDI 🛡️");
      setPassData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) { toast.error(err.response?.data?.detail || "XATOLIK!"); } 
    finally { setPassUpdating(false); }
  };

  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="pt-10 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-50 pb-8 text-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Sozlamalar</h1>
          <p className="text-[10px] font-bold text-slate-400 italic uppercase mt-1 tracking-widest text-start">Ma'lumotlar va xavfsizlik</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-blue-600 rounded-[25px] text-white shadow-xl shadow-blue-100">
           <Award size={20} />
           <div className="text-right">
              <p className="text-[8px] font-black uppercase opacity-60">Reyting Ballaring</p>
              <p className="text-lg font-black italic leading-none">{user.profile?.total_points || 0}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <div className={`w-32 h-32 rounded-[45px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden transition-all group-hover:rotate-3 ${imageLoading ? 'opacity-50' : ''}`}>
                {imageLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : user.image ? (
                    <img src={user.image} className="w-full h-full object-cover" alt="" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50 font-black text-4xl">{user.first_name?.[0]}</div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl border-4 border-white shadow-lg group-hover:scale-110 transition-transform"><Camera size={16} /></div>
              
              {/* YASHIRIN INPUT TO'G'RILANDI */}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <h3 className="mt-6 text-xl font-black text-slate-900 italic uppercase tracking-tight">{user.first_name} {user.last_name}</h3>
            <p className="text-[10px] font-bold text-blue-500 uppercase italic mt-1">@{user.username}</p>
          </div>

          {/* HISTORY CARD */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-6">
                <History size={18} className="text-slate-400" />
                <h3 className="text-[10px] font-black uppercase italic text-slate-400 tracking-widest text-start">Tarix</h3>
             </div>
             <div className="space-y-6 relative text-start before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                <div className="relative pl-8">
                   <div className="absolute left-0 top-1 w-5 h-5 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div></div>
                   <p className="text-[8px] font-black text-slate-400 uppercase italic tracking-tighter">Qo'shilgan sana</p>
                   <p className="text-[11px] font-bold text-slate-700 italic">{new Date(user.date_joined).toLocaleDateString()}</p>
                </div>
                <div className="relative pl-8">
                   <div className="absolute left-0 top-1 w-5 h-5 bg-green-50 rounded-full border border-green-100 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div></div>
                   <p className="text-[8px] font-black text-slate-400 uppercase italic tracking-tighter">Oxirgi faollik</p>
                   <p className="text-[11px] font-bold text-slate-700 italic">{new Date().toLocaleDateString()}</p>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-8 text-start">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/20 flex items-center gap-3">
               <Fingerprint className="text-blue-600" size={18} />
               <h3 className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 text-start">Asosiy ma'lumotlar</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic tracking-widest text-start">Ism</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold text-xs italic focus:bg-white transition-all shadow-inner" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic tracking-widest text-start">Familiya</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold text-xs italic focus:bg-white transition-all shadow-inner" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic tracking-widest text-start">Email Manzili</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold text-xs italic focus:bg-white transition-all shadow-inner" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic tracking-widest text-start">Sinfingiz</label>
                  <div onClick={() => setIsGradeOpen(!isGradeOpen)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] flex justify-between items-center cursor-pointer hover:bg-white transition-all shadow-inner">
                    <span className="text-xs font-bold italic text-slate-700">{grades.find(g => g.id === formData.grade_id)?.name || "Tanlang"}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isGradeOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isGradeOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-[25px] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="max-h-48 overflow-y-auto">
                            {grades.map(g => (
                                <div key={g.id} onClick={() => { setFormData({...formData, grade_id: g.id}); setIsGradeOpen(false); }} className="px-6 py-4 hover:bg-blue-50 flex items-center justify-between cursor-pointer group">
                                    <span className={`text-[10px] font-black uppercase italic ${formData.grade_id === g.id ? 'text-blue-600' : 'text-slate-600'}`}>{g.name}</span>
                                    {formData.grade_id === g.id && <Check size={14} className="text-blue-600" />}
                                </div>
                            ))}
                        </div>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={updating} className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black text-[10px] uppercase tracking-[0.4em] italic shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
                {updating ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} SAQLASH
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/20 flex items-center gap-3">
               <KeyRound className="text-blue-600" size={18} />
               <h3 className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 text-start">Xavfsizlik</h3>
            </div>
            <form onSubmit={handlePasswordUpdate} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic tracking-widest text-start">Eski Parol</label>
                <input type="password" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold text-xs shadow-inner" value={passData.old_password} onChange={(e) => setPassData({...passData, old_password: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic tracking-widest text-start">Yangi Parol</label>
                    <input type="password" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold text-xs shadow-inner" value={passData.new_password} onChange={(e) => setPassData({...passData, new_password: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic tracking-widest text-start">Tasdiqlash</label>
                    <input type="password" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] outline-none font-bold text-xs shadow-inner" value={passData.confirm_password} onChange={(e) => setPassData({...passData, confirm_password: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={passUpdating} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[25px] font-black text-[10px] uppercase tracking-[0.4em] italic shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
                {passUpdating ? <Loader2 className="animate-spin" size={16}/> : <Lock size={16}/>} PAROLNI YANGILASH
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;