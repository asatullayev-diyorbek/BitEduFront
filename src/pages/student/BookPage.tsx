import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subjectService } from '@/services/api';
import type { Subject } from '@/types';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Mock PDF pages (in real app, use a PDF library like react-pdf)
const MOCK_PAGES = Array.from({ length: 12 }, (_, i) => ({
    page: i + 1,
    content: [
        ['Kirish', 'Bu fanning asosiy tushunchalari va maqsadlari bilan tanishamiz.'],
        ['1-bob', 'Asosiy nazariya va qonunlar. Muhim formulalar va ta\'riflar keltirilgan.'],
        ["2-bob", "Amaliy mashqlar va misol masalalar. Har bir masala bosqichma-bosqich yechilgan."],
        ['3-bob', 'Kengaytirilgan mavzular. Chuqurroq tushunish uchun qo\'shimcha material.'],
        ['4-bob', 'Laboratoriya ishlari va tajribalar tavsifi.'],
        ['5-bob', 'Mustaqil ishlash uchun topshiriqlar va vazifalar.'],
        ['6-bob', 'Nazorat savollari va testlar.'],
        ['7-bob', 'Qo\'shimcha adabiyotlar va manbalar ro\'yxati.'],
        ['8-bob', 'Glossariy - asosiy atamalar va izohlari.'],
        ['9-bob', 'Formulas va jadvallar.'],
        ['10-bob', 'Javoblar va yechimlar.'],
        ['Xulosa', 'Kurs bo\'yicha yakuniy xulosalar va keyingi qadamlar.'],
    ][i] || ['Sahifa', 'Kontent yuklanmoqda...'],
}));

export default function BookPage() {
    const { id } = useParams<{ id: string }>();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const totalPages = MOCK_PAGES.length;

    useEffect(() => {
        subjectService.getById(Number(id)).then(setSubject).finally(() => setLoading(false));
    }, [id]);

    const page = MOCK_PAGES[currentPage - 1];

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <Link to={`/subjects/${id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm font-medium mb-5 transition-colors">
                <FiArrowLeft size={16} /> {loading ? '...' : subject?.name}
            </Link>

            <div className="card mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="font-black text-slate-800 text-xl">{subject?.name} — Darslik</h1>
                        <p className="text-slate-500 text-sm">{totalPages} ta sahifa</p>
                    </div>
                    <span className="badge bg-primary-100 text-primary">PDF Ko'ruvchi</span>
                </div>

                {/* Page progress bar */}
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                        style={{ width: `${(currentPage / totalPages) * 100}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 text-right mt-1">{currentPage} / {totalPages}</p>
            </div>

            {/* PDF Page Viewer */}
            <div className="card min-h-[500px] relative overflow-hidden" style={{ boxShadow: '0 4px 40px rgba(37,99,235,0.1)' }}>
                {/* Page decoration */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

                <div className="pt-4 pb-8 px-2 sm:px-6 min-h-[460px] flex flex-col">
                    {/* Page header */}
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">{subject?.name} — Darslik</span>
                        <span className="text-xs text-slate-400">Sahifa {currentPage}</span>
                    </div>

                    {/* Page content */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-800 mb-4">{page.content[0]}</h2>
                        <p className="text-slate-600 leading-relaxed mb-6">{page.content[1]}</p>

                        {/* Mock content blocks */}
                        <div className="space-y-4">
                            {currentPage % 3 === 0 && (
                                <div className="bg-primary-50 border-l-4 border-primary rounded-r-xl p-4">
                                    <p className="text-sm font-semibold text-primary mb-1">Muhim ta'rif</p>
                                    <p className="text-slate-700 text-sm">Bu mavzuning asosiy ta'rifi yoki formulasi bu yerda keltirilgan bo'ladi.</p>
                                </div>
                            )}
                            {currentPage % 2 === 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {[1, 2].map(n => (
                                        <div key={n} className="bg-slate-50 rounded-xl p-3">
                                            <p className="text-xs font-bold text-slate-500 mb-1">Misol {n}</p>
                                            <p className="text-slate-700 text-sm">Bu yerda {page.content[0]} bo'yicha {n}-misol keltirilgan.</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="text-slate-600 text-sm leading-7 space-y-3">
                                <p>Ushbu darslikning ushbu bo'limida siz {page.content[0].toLowerCase()} mavzusini chuqur o'rganasiz. Materiallar bosqichma-bosqich tushuntirilgan va amaliy misolllar bilan boyitilgan.</p>
                                <p>Har bir bo'limda nazariy bilimlar va amaliy ko'nikmalar parallel ravishda shakllantiriladi.</p>
                            </div>
                        </div>
                    </div>

                    {/* Page footer */}
                    <div className="pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">EduPlatform — {new Date().getFullYear()}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <FiChevronLeft size={16} /> Oldingi
                </button>

                <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.min(Math.max(currentPage - 2 + i, 1), totalPages - 4 + i);
                        return (
                            <button key={i} onClick={() => setCurrentPage(page)}
                                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Keyingi <FiChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
