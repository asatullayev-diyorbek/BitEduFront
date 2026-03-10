import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';
import {
    FiGrid, FiBook, FiFileText, FiList, FiUsers, FiMenu, FiX, FiLogOut
} from 'react-icons/fi';

const adminNav = [
    { to: '/admin', icon: FiGrid, label: 'Dashboard', exact: true },
    { to: '/admin/grades', icon: FiList, label: "Sinflar" },
    { to: '/admin/subjects', icon: FiBook, label: "Fanlar" },
    { to: '/admin/topics', icon: FiFileText, label: "Mavzular" },
    { to: '/admin/tests', icon: FiUsers, label: "Testlar" },
];

export default function AdminLayout() {
    const { user, logout } = useAuthStore();
    const { setSidebarOpen } = useUIStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <span className="text-white font-black text-xs">ADM</span>
                    </div>
                    <div>
                        <span className="text-lg font-black text-slate-800">EduAdmin</span>
                        <p className="text-xs text-slate-500">Boshqaruv paneli</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 lg:hidden">
                        <FiX size={20} />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 overflow-y-auto sidebar-scroll">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">Boshqaruv</p>
                <div className="space-y-1">
                    {adminNav.map(({ to, icon: Icon, label, exact }) => (
                        <NavLink key={to} to={to} end={exact} onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                                    ? 'bg-slate-800 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-100">
                {user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <Avatar src={user.avatar} name={user.full_name} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.full_name}</p>
                            <p className="text-xs text-slate-500">Administrator</p>
                        </div>
                        <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
                            <FiLogOut size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-bgBase overflow-hidden">
            <aside className="hidden lg:block w-64 bg-white border-r border-slate-100 shrink-0">
                <SidebarContent />
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
                        <SidebarContent onClose={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
                    <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 lg:hidden">
                        <FiMenu size={20} />
                    </button>
                    <h1 className="font-bold text-slate-800 text-lg">Admin Panel</h1>
                    <div className="flex-1" />
                    <div className="text-sm text-slate-500">EduPlatform</div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
