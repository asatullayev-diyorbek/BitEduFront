import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { authService } from '@/services/api';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const { addToast } = useUIStore();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) { addToast("Iltimos, barcha maydonlarni to'ldiring", 'warning'); return; }
        setLoading(true);
        try {
            const { user, access } = await authService.login(username, password);
            setAuth(user, access);
            addToast(`Xush kelibsiz, ${user.full_name}!`, 'success');
            navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
        } catch (err: any) {
            addToast(err.message || "Login yoki parol noto'g'ri", 'error');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (role: 'student' | 'admin') => {
        setUsername(role);
        setPassword('password');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-700 items-center justify-center shadow-lg shadow-primary/30 mb-4">
                        <span className="text-white font-black text-xl">Edu</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800">EduPlatform</h1>
                    <p className="text-slate-500 mt-1">O'quv platformasiga xush kelibsiz</p>
                </div>

                {/* Card */}
                <div className="card shadow-soft">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Kirish</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Foydalanuvchi nomi</label>
                            <div className="relative">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    className="input pl-10"
                                    placeholder="username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Parol</label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="input pl-10 pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
                            {loading ? <FiLoader className="animate-spin" size={18} /> : null}
                            {loading ? 'Kirish...' : 'Kirish'}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Demo login</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => quickLogin('student')}
                                className="py-2 px-3 rounded-lg border-2 border-primary/30 hover:border-primary hover:bg-primary-50 text-primary text-sm font-semibold transition-all duration-150">
                                🎓 Student
                            </button>
                            <button onClick={() => quickLogin('admin')}
                                className="py-2 px-3 rounded-lg border-2 border-slate-300 hover:border-slate-600 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-all duration-150">
                                🔧 Admin
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-center">Parol: <code className="bg-white px-1 rounded">password</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
