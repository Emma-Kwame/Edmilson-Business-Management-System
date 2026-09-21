import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import SetupRequired from './pages/SetupRequired';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Inventory from './pages/Inventory';
import Finance from './pages/Finance';
import type { FinancePrefill } from './pages/Finance';
import Attendance from './pages/Attendance';
import Staff from './pages/Staff';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AuditLog from './pages/AuditLog';
import Users from './pages/Users';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import { useData } from './store';

type Page = 'dashboard'|'attendance'|'tasks'|'projects'|'inventory'|'finance'|'reports'
  |'notifications'|'staff'|'settings'|'audit'|'users';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard', attendance: 'Attendance', tasks: 'Tasks', projects: 'Projects',
  inventory: 'Inventory', finance: 'Finance', reports: 'Reports', notifications: 'Notifications',
  staff: 'Staff', settings: 'Settings', audit: 'Audit Log', users: 'Users & Roles',
};

export default function App() {
  const { configured, session, loading, authError, role, unreadCount, signOut, lastError, clearLastError } = useData();
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [taskProjectFilter, setTaskProjectFilter] = useState('');
  const [financePrefill, setFinancePrefill] = useState<FinancePrefill | null>(null);

  // One-shot handoffs: Tasks/Finance read these only at mount (via lazy
  // useState initializers), so clear them right after so a later, unrelated
  // sidebar navigation to the same page doesn't re-apply a stale filter.
  useEffect(() => {
    if (page === 'tasks' && taskProjectFilter) setTaskProjectFilter('');
    if (page === 'finance' && financePrefill) setFinancePrefill(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleViewProjectTasks = (projectName: string) => {
    setTaskProjectFilter(projectName);
    setPage('tasks');
  };

  const handleRecordPayment = (payload: FinancePrefill) => {
    setFinancePrefill(payload);
    setPage('finance');
  };

  const handleNav = (id: string) => {
    setPage(id as Page);
    setMobileNavOpen(false);
  };

  if (!configured) {
    return <SetupRequired />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-sm text-center">
          <p className="font-bold text-slate-900 font-display mb-2">Couldn't load your account</p>
          <p className="text-sm text-slate-500 mb-5">{authError}</p>
          <button onClick={signOut} className="text-sm text-indigo-600 font-semibold hover:underline">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard role={role} onNav={p => setPage(p as Page)} />;
      case 'attendance': return <Attendance role={role} />;
      case 'tasks': return <Tasks role={role} initialProjectFilter={taskProjectFilter} />;
      case 'projects': return <Projects role={role} onViewTasks={handleViewProjectTasks} onRecordPayment={handleRecordPayment} />;
      case 'inventory': return <Inventory />;
      case 'finance': return <Finance prefill={financePrefill} />;
      case 'reports': return <Reports onNav={handleNav} />;
      case 'notifications': return <Notifications />;
      case 'staff': return <Staff onNav={handleNav} onViewTasks={handleViewProjectTasks} />;
      case 'settings': return <Settings />;
      case 'audit': return <AuditLog />;
      case 'users': return <Users />;
      default: return <Dashboard role={role} onNav={p => setPage(p as Page)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        role={role}
        active={page}
        onNav={handleNav}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav
          role={role}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          unread={unreadCount}
          onNav={handleNav}
          title={PAGE_TITLES[page]}
          onLogout={signOut}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {lastError && (
              <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                <span className="flex-1">{lastError}</span>
                <button onClick={clearLastError} className="text-red-400 hover:text-red-600 flex-shrink-0 font-bold">✕</button>
              </div>
            )}
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
