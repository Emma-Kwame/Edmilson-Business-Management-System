import React, { useState } from 'react';
import { Bell, Search, HelpCircle, Menu, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import type { Role } from '../data/mock';
import { USERS } from '../data/mock';
import { Avatar } from './ui';

const ROLE_USERS: Record<Role, number> = {
  owner: 1, manager: 2, accountant: 3, staff: 4,
};

interface TopNavProps {
  role: Role;
  onRoleChange: (r: Role) => void;
  onToggleSidebar: () => void;
  unread: number;
  onNav: (id: string) => void;
}

export default function TopNav({ role, onRoleChange, onToggleSidebar, unread, onNav }: TopNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [search, setSearch] = useState('');

  const user = USERS[ROLE_USERS[role] - 1];

  const roles: { value: Role; label: string }[] = [
    { value: 'owner', label: 'Owner / Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'staff', label: 'Staff' },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 flex-shrink-0 sticky top-0 z-50">
      {/* Menu toggle */}
      <button onClick={onToggleSidebar} className="text-slate-500 hover:text-slate-800 transition-colors p-1">
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search projects, staff, inventory..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg
            focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
      </div>

      <div className="flex-1" />

      {/* Role switcher (demo) */}
      <div className="relative">
        <button onClick={() => setRoleOpen(!roleOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50
            text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200">
          View as: {roles.find(r => r.value === role)?.label}
          <ChevronDown size={12} />
        </button>
        {roleOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">Switch Role</p>
            {roles.map(r => (
              <button key={r.value} onClick={() => { onRoleChange(r.value); setRoleOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${role === r.value ? 'text-indigo-600 font-semibold' : 'text-slate-700'}`}>
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Help */}
      <button className="text-slate-400 hover:text-slate-600 transition-colors">
        <HelpCircle size={18} />
      </button>

      {/* Notifications */}
      <button onClick={() => onNav('notifications')} className="relative text-slate-400 hover:text-slate-600 transition-colors">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Profile */}
      <div className="relative">
        <button onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar initials={user.avatar} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name.split(' ')[0]}</p>
            <p className="text-xs text-slate-400">{user.position}</p>
          </div>
          <ChevronDown size={12} className="text-slate-400" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button onClick={() => { onNav('settings'); setProfileOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <UserIcon size={14} /> Profile & Settings
            </button>
            <div className="border-t border-slate-100">
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
