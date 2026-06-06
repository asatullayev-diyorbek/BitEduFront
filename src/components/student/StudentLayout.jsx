import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Trophy, User,
  LogOut, Bell, ChevronLeft, ChevronRight,
  ChevronDown, Gamepad2
} from 'lucide-react';

// ── Avatar initials helper ─────────────────────────────────────────────────
const getInitials = (name = '', username = '') => {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (username) return username.slice(0, 2).toUpperCase();
  return 'U';
};

// ── Avatar component (Sizning API dagi 'image' kalitiga moslandi) ───────────
const Avatar = ({ user, size = 36, className = '' }) => {
  const initials = getInitials(user?.full_name, user?.username);
  
  // Muhim: API dan rasm 'image' bo'lib kelyapti
  if (user?.image) {
    return (
      <img
        src={user.image}
        alt={initials}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => { e.target.src = ""; e.target.style.display = 'none'; }} 
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}
      style={{
        width: size, height: size, fontSize: size * 0.35,
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      }}
    >
      {initials}
    </div>
  );
};

const MENU = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/student' },
  { icon: BookOpen,        label: 'Fanlar',     path: '/student/subjects' },
  { icon: Gamepad2,        label: "O'yinlar",   path: '/student/games' },
  { icon: Trophy,          label: 'Reyting',    path: '/student/leaderboard' },
  { icon: User,            label: 'Profil',     path: '/student/profile' },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) =>
    path === '/student'
      ? location.pathname === '/student'
      : location.pathname.startsWith(path);

  return (
    <aside
      className="flex flex-col sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out bg-white border-r border-slate-100"
      style={{ width: collapsed ? 72 : 260 }}
    >
      {/* Logo: KO'K RANG VA "E" HARFI */}
      <div className={`flex items-center h-20 px-4 border-b border-slate-50 shrink-0 overflow-hidden ${collapsed ? 'justify-center' : 'gap-3 px-5'}`}>
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100 shrink-0"
          style={{ fontFamily: 'Georgia, serif' }}>
          E
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-slate-800 tracking-tight whitespace-nowrap overflow-hidden"
            style={{ fontFamily: 'Georgia, serif' }}>
            EduPlatform
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1 p-3 overflow-hidden">
        {MENU.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-xl font-semibold text-sm transition-all duration-200 group relative
                ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
                ${active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg
                  opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 z-50">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card (Bottom) */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-50 shrink-0">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Avatar user={user} size={36} />
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate leading-tight">
                {user?.full_name || user?.username}
              </p>
              <p className="text-slate-400 text-[11px] font-medium mt-0.5 uppercase tracking-tighter">
                {user?.role === 'STUDENT' ? 'Talaba' : user?.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="shrink-0 flex items-center justify-center h-11 border-t border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
      >
        {collapsed ? <ChevronRight size={18} /> : (
          <span className="flex items-center gap-2 text-xs font-semibold">
            <ChevronLeft size={16} /> Yig'ish
          </span>
        )}
      </button>
    </aside>
  );
};

// ── Profile dropdown ───────────────────────────────────────────────────────
const ProfileDropdown = ({ user, logout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 pl-4 border-l border-slate-100 group"
      >
        <Avatar user={user} size={36} className="ring-2 ring-white group-hover:ring-blue-200 transition-all" />
        <div className="text-left hidden sm:block">
          <p className="text-sm font-bold text-slate-700 leading-tight truncate max-w-[120px]">
            {user?.full_name || user?.username}
          </p>
          <p className="text-[11px] text-slate-400 font-medium tracking-tight">Profil sozlamalari</p>
        </div>
        <ChevronDown size={15} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden z-50">
          <div className="px-4 py-3.5 border-b border-slate-50 flex items-center gap-3">
            <Avatar user={user} size={40} />
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{user?.full_name}</p>
              <p className="text-[11px] text-slate-400 font-medium">@{user?.username}</p>
            </div>
          </div>
          <div className="p-1.5">
            <button onClick={() => { setOpen(false); navigate('/student/profile'); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <User size={16} className="text-slate-400" /> Profilim
            </button>
            <button onClick={() => { setOpen(false); logout(); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors mt-0.5">
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── StudentLayout ──────────────────────────────────────────────────────────
const StudentLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-end gap-5 sticky top-0 z-20 shadow-sm shadow-slate-100/60">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <ProfileDropdown user={user} logout={logout} />
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;