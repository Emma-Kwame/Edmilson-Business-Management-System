import React, { useState } from 'react';
import { Bell, Search, HelpCircle, Menu, ChevronDown, LogOut, User as UserIcon, X } from 'lucide-react';
import type { Role } from '../data/mock';
import { useData } from '../store';
import { Avatar } from './ui';

interface TopNavProps {
  role: Role;
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
  unread: number;
  onNav: (id: string) => void;
  title: string;
  onLogout: () => void;
}

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner / Admin', manager: 'Manager', accountant: 'Accountant', staff: 'Staff',
};

export default function TopNav({ role, onToggleSidebar, onOpenMobileNav, unread, onNav, title, onLogout }: TopNavProps) {
  const { profile, projects: PROJECTS, users: USERS, inventory: INVENTORY } = useData();
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const runSearch = () => {
    const q = search.trim().toLowerCase();
    if (!q) return;
    if (PROJECTS.some(p => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))) { onNav('projects'); return; }
    if (USERS.some(u => u.name.toLowerCase().includes(q))) { onNav('staff'); return; }
    if (INVENTORY.some(i => i.name.toLowerCase().includes(q))) { onNav('inventory'); return; }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-3 sm:px-4 gap-2 sm:gap-4 flex-shrink-0 sticky top-0 z-50">
      {/* Mobile: opens the slide-out drawer */}
      <button onClick={onOpenMobileNav} className="md:hidden text-slate-500 hover:text-slate-800 transition-colors p-1 flex-shrink-0" aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Tablet/desktop: collapses the persistent sidebar */}
      <button onClick={onToggleSidebar} className="hidden md:block text-slate-500 hover:text-slate-800 transition-colors p-1 flex-shrink-0" aria-label="Toggle sidebar">
        <Menu size={20} />
      </button>

      {/* Mobile page title (hidden while the mobile search field is open) */}
      {!mobileSearchOpen && (
        <h1 className="md:hidden text-sm font-semibold text-slate-800 truncate flex-1 min-w-0">{title}</h1>
      )}

      {/* Search — inline on tablet/desktop */}
      <div className="hidden md:block relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()}
          placeholder="Search projects, staff, inventory..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg
            focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
      </div>

      {/* Search — expandable field on mobile */}
      {mobileSearchOpen && (
        <div className="md:hidden relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (runSearch(), setMobileSearchOpen(false))}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg
              focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
        </div>
      )}

      {/* Mobile search toggle */}
      <button onClick={() => setMobileSearchOpen(o => !o)}
        className="md:hidden text-slate-400 hover:text-slate-600 transition-colors p-1 flex-shrink-0"
        aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}>
        {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
      </button>

      <div className="hidden md:block flex-1" />

      {/* Real role badge — read-only, set by the signed-in account, not a switcher */}
      <span className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 flex-shrink-0">
        {ROLE_LABELS[role]}
      </span>

      {/* Help — collapses away below lg */}
      <div className="relative hidden lg:block flex-shrink-0">
        <button onClick={() => setHelpOpen(!helpOpen)} className="text-slate-400 hover:text-slate-600 transition-colors">
          <HelpCircle size={18} />
        </button>
        {helpOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setHelpOpen(false)} />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50">
              <p className="text-sm font-bold text-slate-900 mb-1">Need help?</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Use the sidebar to navigate between modules. The pages and actions you can see are
                determined by your account's role — enforced by the server, not just this screen.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <button onClick={() => onNav('notifications')} className="relative text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0" aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Profile */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar initials={profile?.avatar || '?'} src={profile?.avatarUrl} size="sm" />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{profile?.name || '—'}</p>
            <p className="text-xs text-slate-400">{profile?.position || ROLE_LABELS[role]}</p>
          </div>
          <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">{profile?.name}</p>
              <p className="text-xs text-slate-500">@{profile?.username}</p>
            </div>
            <button onClick={() => { onNav('settings'); setProfileOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <UserIcon size={14} /> Profile & Settings
            </button>
            <div className="border-t border-slate-100">
              <button onClick={() => { setProfileOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
