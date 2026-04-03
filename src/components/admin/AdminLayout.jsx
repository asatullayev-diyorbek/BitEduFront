import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

import {
  LayoutDashboard, BookOpen, Users, Settings, 
  LogOut, Bell, ChevronLeft, ChevronRight,
  ChevronDown, GraduationCap, ClipboardList,
  Layers, PlusCircle, Search
} from 'lucide-react';

// ── Avatar Component (Student bilan bir xil, image kalitida) ──────────────
const Avatar = ({ user, size = 36 }) => {
  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'A';
  if (user?.image) {
    return (
      <img src={user.image} alt={initials} className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35, background: '#2563eb' }}>
      {initials}
    </div>
  );
};

// ── Admin Menu (Guruhlangan holda) ─────────────────────────────────────────
const ADMIN_MENU = [
  { group: 'ASOSIY', items: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  ]},
  { group: 'AKADEMIK', items: [
    { icon: GraduationCap,   label: 'Sinflar',    path: '/admin/grades' },
    { icon: BookOpen,        label: 'Fanlar',     path: '/admin/subjects' },
    { icon: Layers,          label: 'Mavzular',   path: '/admin/topics' },
  ]},
  { group: 'NAZORAT', items: [
    { icon: ClipboardList,   label: 'Testlar',    path: '/admin/quizzes' },
    { icon: Users,           label: 'O\'quvchilar',path: '/admin/students' },
  ]},
  { group: 'TIZIM', items: [
    { icon: Settings,        label: 'Sozlamalar', path: '/admin/settings' },
  ]}
];

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-sans selection:bg-blue-100">
      
      {/* ── SIDEBAR ── */}
      <aside 
        className="flex flex-col sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out bg-white border-r border-slate-100 shadow-sm"
        style={{ width: collapsed ? 80 : 280 }}
      >
        {/* Logo Section */}
        <div className={`flex items-center h-20 px-4 border-b border-slate-50 shrink-0 overflow-hidden ${collapsed ? 'justify-center' : 'gap-3 px-6'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 shrink-0 italic">
            E
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg text-slate-800 tracking-tighter italic">EduAdmin</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Control Panel</span>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
          {ADMIN_MENU.map((group, gIdx) => (
            <div key={gIdx} className="mb-6 last:mb-0">
              {!collapsed && (
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 ml-4">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-2xl font-bold text-[13px] transition-all duration-200 group relative
                        ${collapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3.5'}
                        ${active 
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'}`}
                    >
                      <item.icon size={20} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      
                      {collapsed && (
                        <span className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 uppercase tracking-widest">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={() => logout()}
            className={`flex items-center w-full rounded-2xl font-bold text-[13px] text-red-500 hover:bg-red-50 transition-all
              ${collapsed ? 'justify-center p-3.5' : 'gap-3 px-4 py-3.5'}`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Tizimdan chiqish</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
          
          {/* Collapse Toggle & Search */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </button>
            
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 w-80 focus-within:border-blue-300 focus-within:bg-white transition-all group">
              <Search size={18} className="text-slate-300 group-focus-within:text-blue-600" />
              <input 
                type="text" 
                placeholder="Admin panelda qidirish..." 
                className="bg-transparent border-none outline-none px-3 text-sm font-medium w-full text-slate-600"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
            </button>
            
            <div className="h-8 w-[1px] bg-slate-100 mx-1" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-black text-slate-800 leading-none">{user?.full_name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1 italic">Super Admin</p>
              </div>
              <Avatar user={user} size={42} />
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Breadcrumbs or Page Title could go here */}
          <Outlet />
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default AdminLayout;