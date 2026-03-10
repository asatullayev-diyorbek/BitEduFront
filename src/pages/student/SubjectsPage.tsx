import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subjectService } from '@/services/api';
import type { Subject } from '@/types';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateComponents';
import { FiBook, FiList, FiArrowRight } from 'react-icons/fi';

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        subjectService.getAll().then(setSubjects).finally(() => setLoading(false));
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-800">Fanlar</h1>
                <p className="text-slate-500 text-sm mt-1">O'rganmoqchi bo'lgan fanni tanlang</p>
            </div>

            {loading ? <SkeletonCard count={5} /> : subjects.length === 0 ? (
                <EmptyState icon="📚" title="Fanlar topilmadi" />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {subjects.map(subject => (
                        <Link key={subject.id} to={`/subjects/${subject.id}`} className="group card-hover overflow-hidden p-0">
                            <div className="relative h-44 overflow-hidden">
                                <img src={subject.image} alt={subject.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 left-4 text-white">
                                    <span className="text-3xl">{subject.icon}</span>
                                </div>
                                {subject.has_book && (
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-semibold text-slate-700">
                                        <FiBook size={12} /> Kitob
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{subject.name}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{subject.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                        <FiList size={14} />
                                        <span>{subject.topics_count} mavzu</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                                        Boshlash <FiArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
