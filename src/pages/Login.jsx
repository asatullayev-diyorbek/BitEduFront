import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Loader2, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
    // Backend username kutyapti, shuning uchun email'ni username'ga almashtirdik
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Agar foydalanuvchi tizimga kirgan bo'lsa, avtomatik yo'naltirish
    useEffect(() => {
        if (user) {
            if (user.role === 'ADMIN') navigate('/admin');
            else if (user.role === 'STUDENT') navigate('/student');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // Backend'ga { username, password } formatida yuboramiz
            const role = await login({ username, password });
            
            // Rolga qarab yo'naltirish
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'STUDENT') navigate('/student');
        } catch (err) {
            // Backenddan kelgan xatoni ko'rsatish
            setError('Username yoki parol xato kiritildi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-4 selection:bg-blue-100 relative overflow-hidden">
            
            {/* Orqa fondagi zamonaviy ambient effektlar (Tailwind v4 da ham ishlaydi) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-[120px] -z-10" />

            <div className="w-full max-w-[1000px] flex bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] overflow-hidden relative z-10">
                
                {/* Chap tomon: Branding */}
                <div className="hidden md:flex w-5/12 bg-slate-50 p-12 flex-col justify-between border-r border-slate-100">
                    <div className="flex items-center gap-2 group cursor-default">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-800 font-serif">EduPlatform</span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl font-bold text-slate-900 leading-[1.1]">
                            Kelajakni <br /> <span className="text-blue-600 font-extrabold italic">ilm bilan </span> <br /> quring.
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-[220px] font-medium">
                            O'zbekistondagi eng ilg'or interaktiv ta'lim tizimi.
                        </p>
                    </div>

                    <div className="flex gap-1.5">
                        <div className="h-1.5 w-10 bg-blue-600 rounded-full" />
                        <div className="h-1.5 w-2 bg-slate-200 rounded-full" />
                        <div className="h-1.5 w-2 bg-slate-200 rounded-full" />
                    </div>
                </div>

                {/* O'ng tomon: Login Formasi */}
                <div className="w-full md:w-7/12 p-8 md:p-16">
                    <div className="max-w-[340px] mx-auto">
                        <header className="mb-10 text-center md:text-left">
                            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Xush kelibsiz</h1>
                            <p className="text-slate-400 text-sm font-medium">Platformaga kirish uchun ma'lumotlarni kiriting.</p>
                        </header>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg flex items-center gap-2 animate-pulse">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-[0.1em]">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-4 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-700 text-sm font-semibold"
                                        placeholder="Username kiriting"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Parol</label>
                                    <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition">UNUTDINGIZMI?</button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-4 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-700 text-sm font-semibold"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="group w-full bg-slate-900 hover:bg-blue-600 text-white py-4.5 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                                ) : (
                                    <>
                                        Tizimga kirish
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <footer className="mt-12 pt-8 border-t border-slate-100 text-center">
                            <p className="text-slate-400 text-[12px] font-bold">
                                Hisobingiz yo'qmi? <span className="text-blue-600 hover:underline ml-1 cursor-pointer">Admin bilan bog'laning</span>
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;