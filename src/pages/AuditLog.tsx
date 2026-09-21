import React, { useState } from 'react';
import { useData } from '../store';
import { Card, PageHeader, SearchInput, Table, Td, Select } from '../components/ui';
import { Avatar } from '../components/ui';

export default function AuditLog() {
  const { auditLogs: AUDIT_LOGS } = useData();
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const modules = ['Finance', 'Inventory', 'Tasks', 'Projects', 'Attendance'];
  const moduleColors: Record<string, string> = {
    Finance: 'bg-green-100 text-green-700', Inventory: 'bg-amber-100 text-amber-700',
    Tasks: 'bg-blue-100 text-blue-700', Projects: 'bg-purple-100 text-purple-700',
    Attendance: 'bg-cyan-100 text-cyan-700',
  };

  const filtered = AUDIT_LOGS.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === 'all' || l.module === filterModule;
    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Audit Log" sub="Complete record of all system actions"
        breadcrumb={['Home', 'Audit Log']} />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search actions or users..." />
        </div>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="input-base w-auto py-1.5 text-sm">
          <option value="all">All Modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <Card>
        <Table headers={['User', 'Action', 'Module', 'Date', 'Time', 'IP Address']}>
          {filtered.map(log => (
            <tr key={log.id}>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar initials={log.user.split(' ').map(n => n[0]).join('').slice(0, 2)} size="sm" />
                  <span className="text-xs font-semibold text-slate-800">{log.user}</span>
                </div>
              </Td>
              <Td><p className="text-xs text-slate-700 max-w-sm">{log.action}</p></Td>
              <Td>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${moduleColors[log.module] || 'bg-slate-100 text-slate-600'}`}>
                  {log.module}
                </span>
              </Td>
              <Td mono><span className="text-xs">{log.date}</span></Td>
              <Td mono><span className="text-xs">{log.time}</span></Td>
              <Td mono><span className="text-xs text-slate-400">{log.ip}</span></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
