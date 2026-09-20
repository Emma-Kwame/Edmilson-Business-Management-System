import React, { useState } from 'react';
import { NOTIFICATIONS } from '../data/mock';
import { Badge, Btn, Card, PageHeader, Tabs } from '../components/ui';

export default function Notifications() {
  const [tab, setTab] = useState('All');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));

  const typeFilter: Record<string, string> = {
    All: '', Task: 'task', Project: 'project', Inventory: 'inventory',
    Finance: 'finance', Attendance: 'attendance', System: 'system',
  };

  const filtered = notifications.filter(n =>
    !typeFilter[tab] || n.type === typeFilter[tab]
  );

  const unread = notifications.filter(n => !n.read).length;

  const typeBadgeColor: Record<string, string> = {
    task: 'bg-blue-100 text-blue-700',
    project: 'bg-purple-100 text-purple-700',
    inventory: 'bg-amber-100 text-amber-700',
    finance: 'bg-green-100 text-green-700',
    attendance: 'bg-cyan-100 text-cyan-700',
    system: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" sub={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
        breadcrumb={['Home', 'Notifications']}
        actions={
          <Btn onClick={markAllRead} variant="outline" size="sm">Mark All Read</Btn>
        } />

      <Tabs tabs={['All', 'Task', 'Project', 'Inventory', 'Finance', 'Attendance', 'System']}
        active={tab} onChange={setTab} />

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-3xl mb-2">🔔</p>
            <p className="font-semibold text-slate-700 font-display">No notifications</p>
            <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
          </Card>
        )}
        {filtered.map(n => (
          <div key={n.id}
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
              !n.read ? 'bg-white border-indigo-200 shadow-sm' : 'bg-white border-slate-100'
            }`}
            onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              !n.read ? 'bg-indigo-50' : 'bg-slate-50'
            }`}>
              <span className="text-lg">{n.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={`text-sm font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadgeColor[n.type]}`}>
                    {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                  </span>
                  {!n.read && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
