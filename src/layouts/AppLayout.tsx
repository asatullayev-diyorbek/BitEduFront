import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';
import {
    FiGrid, FiBook, FiAward, FiUser, FiMenu, FiX, FiLogOut, FiChevronLeft
} from 'react-icons/fi';

const navItems = [
    { to: '/', icon: FiGrid, label: 'Dashboard', exact: true },
    { to: '/subjects', icon: FiBook, label: 'Fanlar' },
    { to: '/leaderboard', icon: FiAward, label: 'Reyting' },
    { to: '/profile', icon: FiUser, label: 'Profil' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const { user, logout } = useAuthStore();

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
                        <span className="text-white font-black text-sm">Edu</span>
                    </div>
                    <span className="text-xl font-black text-slate-800">Platform</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 lg:hidden">
                        <FiX size={20} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 sidebar-scroll overflow-y-auto">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">Menyu</p>
                <div className="space-y-1">
                    {navItems.map(({ to, icon: Icon, label, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
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

            {/* User */}
            <div className="p-4 border-t border-slate-100">
                {user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                        <Avatar src={user.avatar} name={user.full_name} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{user.grade?.name}</p>
                        </div>
                        <button
                            onClick={() => { logout(); }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Chiqish"
                        >
                            <FiLogOut size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AppLayout() {
    const { sidebarOpen, setSidebarOpen } = useUIStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile drawer on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    return (
        <div className="flex h-screen bg-bgBase overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-100 transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                {sidebarOpen ? (
                    <SidebarContent />
                ) : (
                    <CollapsedSidebar />
                )}
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl">
                        <SidebarContent onClose={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(true); }}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors lg:hidden"
                    >
                        <FiMenu size={20} />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors hidden lg:flex items-center"
                    >
                        {sidebarOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
                    </button>
                    <div className="flex-1" />
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function CollapsedSidebar() {
    const { logout } = useAuthStore();
    const { setSidebarOpen } = useUIStore();

    return (
        <div className="flex flex-col items-center h-full py-4 gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center mb-4">
                <span className="text-white font-black text-sm">E</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500">
                <FiMenu size={20} />
            </button>
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'} title={label}
                    className={({ isActive }) =>
                        `p-2.5 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`
                    }
                >
                    <Icon size={20} />
                </NavLink>
            ))}
            <div className="flex-1" />
            <button onClick={logout} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Chiqish">
                <FiLogOut size={20} />
            </button>
        </div>
    );
}
