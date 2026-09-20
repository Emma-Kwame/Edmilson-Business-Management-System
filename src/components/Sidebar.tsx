import React from 'react';
import type { Role } from '../data/mock';
import {
  LayoutDashboard, Clock, CheckSquare, FolderKanban, Package,
  DollarSign, BarChart3, Bell, Users, Settings, ChevronRight,
  Printer, ShieldCheck, FileText,
} from 'lucide-react';

type NavItem = { id: string; label: string; icon: React.ReactNode; roles: Role[]; badge?: number };

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, roles: ['staff','accountant','manager','owner'] },
  { id: 'attendance', label: 'Attendance', icon: <Clock size={16} />, roles: ['staff','manager','owner'] },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} />, roles: ['staff','manager','owner'] },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={16} />, roles: ['staff','manager','owner'] },
  { id: 'inventory', label: 'Inventory', icon: <Package size={16} />, roles: ['staff','manager','owner'] },
  { id: 'finance', label: 'Finance', icon: <DollarSign size={16} />, roles: ['accountant','manager','owner'] },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={16} />, roles: ['accountant','manager','owner'] },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} />, roles: ['staff','accountant','manager','owner'], badge: 3 },
  { id: 'staff', label: 'Staff', icon: <Users size={16} />, roles: ['manager','owner'] },
  { id: 'users', label: 'Users & Roles', icon: <ShieldCheck size={16} />, roles: ['owner'] },
  { id: 'audit', label: 'Audit Log', icon: <FileText size={16} />, roles: ['manager','owner'] },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, roles: ['staff','accountant','manager','owner'] },
];

const ROLE_COLORS: Record<Role, string> = {
  staff: 'bg-cyan-500/20 text-cyan-300',
  accountant: 'bg-amber-500/20 text-amber-300',
  manager: 'bg-purple-500/20 text-purple-300',
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
}

export default function Sidebar({ role, active, onNav, collapsed }: SidebarProps) {
  const visible = NAV_ITEMS.filter(n => n.roles.includes(role));

  return (
    <aside
      className="sidebar-scroll h-screen flex flex-col overflow-y-auto overflow-x-hidden flex-shrink-0 transition-all"
      style={{ width: collapsed ? 64 : 220, background: '#0D1117', borderRight: '1px solid #21262D' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Printer size={15} color="white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white text-sm font-bold font-display leading-tight">PrintCraft</p>
            <p className="text-slate-500 text-xs">Business Hub</p>
          </div>
        )}
      </div>

      {/* Role indicator */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-white/5">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${ROLE_COLORS[role]}`}>
            {ROLE_LABELS[role]}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
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
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge ? (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight size={12} className="opacity-60" />
                  ) : null}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-white/5">
          <p className="text-xs text-slate-600 text-center">v1.0 · PrintCraft BMS</p>
        </div>
      )}
    </aside>
  );
}
