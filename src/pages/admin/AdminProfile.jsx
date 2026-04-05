import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  User, Mail, ShieldCheck, Key, Camera, Save, 
  Loader2, Globe, Eye, EyeOff, X, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Parol modal uchun state-lar
  const [showPassModal, setShowPassModal] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passData, setPassData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  });

  // 1. PROFILNI YUKLASH
  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me/');
      const userData = res.data.data || res.data;
      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        username: userData.username || ''
      });
    } catch (err) {
      toast.error("Profilni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  // 2. RASM O'ZGARTIRISH (FormData bilan)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error("Faqat rasm yuklashingiz mumkin!");
    }

    const imgFormData = new FormData();
    imgFormData.append('image', file);

    setImageLoading(true);
    try {
      await api.patch(`/auth/user/${user?.id}/update-image/`, imgFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Profil rasmi yangilandi!");
      fetchProfile();
    } catch (err) {
      toast.error("Rasmni yuklashda xatolik!");
    } finally {
      setImageLoading(false);
    }
  };

  // 3. MA'LUMOTLARNI SAQLASH
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/auth/user/${user?.id}/`, formData);
      toast.success("Ma'lumotlar saqlandi!");
      fetchProfile();
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  // 4. PAROLNI YANGILASH
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      return toast.error("Yangi parollar mos kelmadi!");
    }
    setPassLoading(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passData.old_password,
        new_password: passData.new_password
      });
      toast.success("Parol yangilandi!");
      setShowPassModal(false);
      setPassData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Eski parol xato!");
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase italic text-slate-400">Yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-700">
      
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-4">
           <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl">
              <ShieldCheck size={28} />
           </div>
           Profil Sozlamalari
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start">
        
        {/* AVATAR QISMI */}
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            
            <div className="relative inline-block mt-4">
              <div className={`w-32 h-32 rounded-[40px] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-all duration-500 ${imageLoading ? 'opacity-40' : ''}`}>
                {imageLoading ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100"><Loader2 className="animate-spin" /></div>
                ) : user?.image ? (
                  <img src={user.image} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-4xl italic">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                )}
              </div>
              
              <input type="file" id="avatarInput" hidden accept="image/*" onChange={handleImageChange} />
              
              <button 
                onClick={() => document.getElementById('avatarInput').click()}
                disabled={imageLoading}
                className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-slate-900 transition-all active:scale-90"
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="mt-8 space-y-1">
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{user?.first_name} {user?.last_name}</h3>
              <p className="text-[10px] font-bold text-blue-500 italic uppercase tracking-widest">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* FORMA QISMI */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 italic uppercase mb-10 flex items-center gap-3">
               <User size={20} className="text-blue-600" /> Ma'lumotlarni tahrirlash
            </h2>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest ml-1">Ism</label>
                <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 font-bold text-sm italic" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest ml-1">Familiya</label>
                <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 font-bold text-sm italic" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest ml-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 font-bold text-sm italic" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest ml-1">Username</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 font-bold text-sm italic" />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" disabled={saving} className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[22px] font-black text-[10px] uppercase italic tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all active:scale-95">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Saqlash
                </button>
              </div>
            </form>
          </div>

          {/* XAVFSIZLIK QISMI */}
          <div className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 italic uppercase mb-10 flex items-center gap-3">
               <Key size={20} className="text-orange-500" /> Maxfiylik
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-orange-50/50 rounded-[30px] border border-orange-100">
               <div className="flex items-center gap-5 text-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm"><Key size={22} /></div>
                  <div>
                     <p className="text-sm font-black text-slate-800 uppercase italic">Parolni yangilash</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase italic mt-1">Xavfsizlik uchun vaqti-vaqti bilan almashtiring</p>
                  </div>
               </div>
               <button onClick={() => setShowPassModal(true)} className="px-8 py-4 bg-white text-slate-900 border border-orange-200 rounded-2xl font-black text-[9px] uppercase italic hover:bg-orange-500 hover:text-white transition-all shadow-sm">
                  Almashtirish
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAROL ALMASHTIRISH MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <h3 className="text-xs font-black uppercase italic text-slate-800 tracking-widest flex items-center gap-2">
                 <Key size={16} className="text-orange-500" /> Yangi parol o'rnatish
               </h3>
               <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleChangePassword} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Eski parol</label>
                <div className="relative">
                  <input type={showOldPass ? "text" : "password"} required className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-bold text-sm italic" value={passData.old_password} onChange={(e) => setPassData({...passData, old_password: e.target.value})} />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">{showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Yangi parol</label>
                <div className="relative">
                  <input type={showNewPass ? "text" : "password"} required className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-bold text-sm italic" value={passData.new_password} onChange={(e) => setPassData({...passData, new_password: e.target.value})} />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">{showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">Tasdiqlang</label>
                <input type={showNewPass ? "text" : "password"} required className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-bold text-sm italic" value={passData.confirm_password} onChange={(e) => setPassData({...passData, confirm_password: e.target.value})} />
              </div>
              <button disabled={passLoading} type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black text-[10px] uppercase italic tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                {passLoading ? <Loader2 className="animate-spin" size={18} /> : "Yangilash"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;