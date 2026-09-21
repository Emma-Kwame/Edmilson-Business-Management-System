import React from 'react';
import type { Role } from '../data/mock';
import {
  LayoutDashboard, Clock, CheckSquare, FolderKanban, Package,
  DollarSign, BarChart3, Bell, Users, Settings, ChevronRight,
  ShieldCheck, FileText,
} from 'lucide-react';
import logo from '../assets/Logo-removebg-preview.png';
import { useData } from '../store';

type NavItem = { id: string; label: string; icon: React.ReactNode; roles: Role[] };

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, roles: ['staff','accountant','manager','owner'] },
  { id: 'attendance', label: 'Attendance', icon: <Clock size={16} />, roles: ['staff','accountant','manager','owner'] },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} />, roles: ['staff','manager','owner'] },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={16} />, roles: ['staff','manager','owner'] },
  { id: 'inventory', label: 'Inventory', icon: <Package size={16} />, roles: ['staff','manager','owner'] },
  { id: 'finance', label: 'Finance', icon: <DollarSign size={16} />, roles: ['accountant','manager','owner'] },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={16} />, roles: ['accountant','manager','owner'] },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} />, roles: ['staff','accountant','manager','owner'] },
  { id: 'staff', label: 'Staff', icon: <Users size={16} />, roles: ['manager','owner'] },
  { id: 'users', label: 'Users & Roles', icon: <ShieldCheck size={16} />, roles: ['owner'] },
  { id: 'audit', label: 'Audit Log', icon: <FileText size={16} />, roles: ['manager','owner'] },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, roles: ['staff','accountant','manager','owner'] },
];

const ROLE_COLORS: Record<Role, string> = {
  staff: 'bg-brand-teal/20 text-brand-teal',
  accountant: 'bg-brand-orange/20 text-brand-orange',
  manager: 'bg-brand-coral/20 text-brand-coral',
  owner: 'bg-indigo-500/20 text-indigo-300',
};

const ROLE_LABELS: Record<Role, string> = {
  staff: 'Staff', accountant: 'Accountant', manager: 'Manager', owner: 'Owner / Admin',
};

interface SidebarProps {
  role: Role;
  active: string;
  onNav: (id: string) => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ role, active, onNav, collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { unreadCount } = useData();
  const visible = NAV_ITEMS.filter(n => n.roles.includes(role));

  // Labels are shown on desktop (lg+, unless manually collapsed) and always
  // inside the mobile drawer; the tablet breakpoint stays an icon-only rail.
  const renderNav = (showLabels: boolean) => (
    <>
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
        <img src={logo} alt="Edmilson Graphics & Photography"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-[0_0_14px_3px_rgba(240,160,92,0.5)]" />
        {showLabels && (
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold font-display leading-tight truncate">Edmilson</p>
            <p className="text-slate-500 text-xs truncate">Graphics &amp; Photography</p>
          </div>
        )}
      </div>

      {showLabels && (
        <div className="px-3 py-3 border-b border-white/5">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${ROLE_COLORS[role]}`}>
            {ROLE_LABELS[role]}
          </span>
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visible.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {showLabels && (
                <>
                  <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 ? (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {unreadCount}
                    </span>
                  ) : isActive ? (
                    <ChevronRight size={12} className="opacity-60 flex-shrink-0" />
                  ) : null}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {showLabels && (
        <div className="px-3 py-4 border-t border-white/5 flex-shrink-0">
          <p className="text-xs text-slate-600 text-center">v1.0 · Edmilson GP</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop / tablet — persistent, non-overlay */}
      <aside
        className={`sidebar-scroll hidden md:flex h-screen flex-col overflow-x-hidden flex-shrink-0 transition-all
          md:w-16 ${collapsed ? 'lg:w-16' : 'lg:w-[220px]'}`}
        style={{ background: '#0D1117', borderRight: '1px solid #21262D' }}
      >
        {renderNav(!collapsed)}
      </aside>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-[60] ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}>
        <div onClick={onCloseMobile}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`} />
        <aside
          className={`sidebar-scroll absolute inset-y-0 left-0 w-72 max-w-[80vw] flex flex-col overflow-x-hidden
            transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ background: '#0D1117' }}
        >
          {renderNav(true)}
        </aside>
      </div>
    </>
  );
}
