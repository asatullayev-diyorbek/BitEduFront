import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Mail, Loader2, Sparkles, ArrowRight, GraduationCap } from 'lucide-react';
import axios from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        grade_id: '',
        email: '',
        password: '',
        password_confirm: ''
    });
    const [grades, setGrades] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Sinflarni yuklash
    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get('/academic/grades/');
                setGrades(response.data.data?.results || []);
            } catch (err) {
                console.error('Sinflarni yuklashda xatolik:', err);
            }
        };
        fetchGrades();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Parol mosligini tekshirish
        if (formData.password !== formData.password_confirm) {
            setError('Parollar mos kelmaydi');
            setIsLoading(false);
            return;
        }

        try {
            const submitData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                grade_id: formData.grade_id,
                email: formData.email,
                password: formData.password
            };

            const response = await axios.post('/auth/register/', submitData);

            // Muvaffaqiyatli registratsiyadan keyin avtomatik login
            const loginData = {
                username: formData.email,
                password: formData.password
            };

            await login(loginData);
            navigate('/student');
        } catch (err) {
            console.error('Registratsiya xatoligi:', err);
            if (err.response?.data) {
                // Backend xatolarini ko'rsatish
                const errors = Object.values(err.response.data).flat();
                setError(errors.join(', '));
            } else {
                setError('Registratsiya jarayonida xatolik yuz berdi');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#fcfcfd] flex items-center justify-center p-4 selection:bg-blue-100 relative overflow-hidden">

            {/* Orqa fondagi zamonaviy ambient effektlar */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-200/15 rounded-full blur-[80px] -z-10" />

            <div className="w-full max-w-4xl h-full max-h-[90vh] flex bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden relative z-10">

                {/* Chap taraf - Ma'lumot */}
                <div className="hidden lg:flex flex-col justify-center items-center w-2/5 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 relative">
                    <div className="absolute top-6 left-6">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                            <span className="text-lg font-bold text-blue-900">BitEdu</span>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                            <Sparkles className="w-8 h-8 text-blue-600" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-2">
                                Bilim olamiga xush kelibsiz!
                            </h1>
                            <p className="text-slate-600 text-base leading-relaxed">
                                O'z bilim darajangizni oshirish uchun ro'yxatdan o'ting va interaktiv ta'lim tajribasini boshlang.
                            </p>
                        </div>
                    </div>
                </div>

                {/* O'ng taraf - Registratsiya formasi */}
                <div className="w-full lg:w-3/5 p-6 lg:p-8 flex items-center">
                    <div className="w-full max-w-md mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-1">
                                Ro'yxatdan o'tish
                            </h2>
                            <p className="text-slate-600 text-sm">
                                Ma'lumotlaringizni kiriting va bilim sayohatini boshlang
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Chap ustun */}
                            <div className="space-y-4">
                                {/* Ism */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Ism *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ismingizni kiriting"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Familiya */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Familiya *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Familiyangizni kiriting"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Sinf */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Sinf *
                                    </label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            name="grade_id"
                                            value={formData.grade_id}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                                            required
                                        >
                                            <option value="">Sinfni tanlang</option>
                                            {grades.map(grade => (
                                                <option key={grade.id} value={grade.id}>
                                                    {grade.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* O'ng ustun */}
                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="email@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Parol */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Parol *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Parolni kiriting (min. 8 ta belgidan)"
                                            minLength="8"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Parol tasdiqlash */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Parolni tasdiqlang *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            name="password_confirm"
                                            value={formData.password_confirm}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Parolni qayta kiriting"
                                            minLength="8"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Xatolik xabari */}
                            {error && (
                                <div className="col-span-1 md:col-span-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit tugmasi */}
                            <div className="col-span-1 md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Ro'yxatdan o'tilyapti...
                                        </>
                                    ) : (
                                        <>
                                            Ro'yxatdan o'tish
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Login ga o'tish */}
                        <div className="text-center mt-4">
                            <p className="text-slate-600 text-sm">
                                Allaqachon hisobingiz bormi?{' '}
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Kirish
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;