import React, { useState } from 'react';
import type { Role } from './data/mock';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Inventory from './pages/Inventory';
import Finance from './pages/Finance';
import Attendance from './pages/Attendance';
import Staff from './pages/Staff';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AuditLog from './pages/AuditLog';
import Users from './pages/Users';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

type Page = 'dashboard'|'attendance'|'tasks'|'projects'|'inventory'|'finance'|'reports'
  |'notifications'|'staff'|'settings'|'audit'|'users';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('owner');
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogin = (r: Role) => {
    setRole(r);
    setLoggedIn(true);
    setPage('dashboard');
  };

  const handleRoleChange = (r: Role) => {
    setRole(r);
    setPage('dashboard');
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard role={role} onNav={p => setPage(p as Page)} />;
      case 'attendance': return <Attendance />;
      case 'tasks': return <Tasks />;
      case 'projects': return <Projects />;
      case 'inventory': return <Inventory />;
      case 'finance': return <Finance />;
      case 'reports': return <Reports />;
      case 'notifications': return <Notifications />;
      case 'staff': return <Staff />;
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
        onNav={id => setPage(id as Page)}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav
          role={role}
          onRoleChange={handleRoleChange}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          unread={3}
          onNav={id => setPage(id as Page)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
