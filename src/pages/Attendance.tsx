import React, { useState } from 'react';
import { ATTENDANCE, USERS } from '../data/mock';
import { Badge, Btn, Card, PageHeader, Table, Td, StatCard, Tabs } from '../components/ui';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CALENDAR_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CALENDAR_DATA: Record<number, string> = {
  1: 'present', 2: 'present', 3: 'late', 4: 'present', 5: 'present',
  8: 'present', 9: 'absent', 10: 'present', 11: 'present', 12: 'present',
  15: 'present', 16: 'present', 17: 'present', 18: 'present',
};

export default function Attendance() {
  const [tab, setTab] = useState('Today');
  const [clockedIn, setClockedIn] = useState(false);

  const todayAtt = ATTENDANCE.filter(a => a.date === '2025-09-18');

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" sub="Thursday, 18 September 2025" breadcrumb={['Home', 'Attendance']} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present Today" value={todayAtt.filter(a => a.status === 'present').length} sub="On time" icon={<CheckCircle size={18} />} accent="green" />
        <StatCard label="Late" value={todayAtt.filter(a => a.status === 'late').length} sub="Today" icon={<AlertTriangle size={18} />} accent="amber" />
        <StatCard label="Absent" value={todayAtt.filter(a => a.status === 'absent').length} sub="Today" icon={<XCircle size={18} />} accent="red" />
        <StatCard label="Avg. Hours" value="8h 32m" sub="This week" icon={<Clock size={18} />} accent="indigo" />
      </div>

      <Tabs tabs={['Today', 'History', 'Calendar']} active={tab} onChange={setTab} />

      {tab === 'Today' && (
        <div className="space-y-4">
          {/* Clock in card for staff */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 font-display mb-1">My Attendance — Today</h3>
                <p className="text-sm text-slate-500">Thu, 18 Sep 2025 · {clockedIn ? 'Currently working' : 'Not yet clocked in'}</p>
              </div>
              <div className="flex gap-2">
                {!clockedIn ? (
                  <Btn onClick={() => setClockedIn(true)} variant="primary" size="md" icon={<Clock size={14} />}>Clock In</Btn>
                ) : (
                  <Btn onClick={() => setClockedIn(false)} variant="danger" size="md" icon={<Clock size={14} />}>Clock Out</Btn>
                )}
              </div>
            </div>
            {clockedIn && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Clock In</p>
                  <p className="font-bold font-mono text-green-700">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Duration</p>
                  <p className="font-bold font-mono text-slate-700">0h 00m</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <Badge status="present" />
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 font-display">Team Attendance Today</h3>
            </div>
            <Table headers={['Staff', 'Department', 'Clock In', 'Clock Out', 'Hours', 'Status']}>
              {USERS.filter(u => u.role === 'staff').map(staff => {
                const att = todayAtt.find(a => a.staffId === staff.id);
                return (
                  <tr key={staff.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {staff.avatar.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{staff.name}</span>
                      </div>
                    </Td>
                    <Td><span className="text-xs text-slate-500">{staff.dept}</span></Td>
                    <Td mono><span className="text-xs">{att?.clockIn || '—'}</span></Td>
                    <Td mono><span className="text-xs">{att?.clockOut || '—'}</span></Td>
                    <Td mono><span className="text-xs">{att?.hours || '—'}</span></Td>
                    <Td><Badge status={att?.status || 'absent'} /></Td>
                  </tr>
                );
              })}
            </Table>
          </Card>
        </div>
      )}

      {tab === 'History' && (
        <Card>
          <Table headers={['Date', 'Staff', 'Clock In', 'Clock Out', 'Hours', 'Status']}>
            {ATTENDANCE.map(a => (
              <tr key={a.id}>
                <Td mono><span className="text-xs">{a.date}</span></Td>
                <Td><span className="text-xs font-semibold text-slate-800">{a.staff}</span></Td>
                <Td mono><span className="text-xs">{a.clockIn || '—'}</span></Td>
                <Td mono><span className="text-xs">{a.clockOut || '—'}</span></Td>
                <Td mono><span className="text-xs font-semibold">{a.hours}</span></Td>
                <Td><Badge status={a.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === 'Calendar' && (
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 font-display mb-4">September 2025 — Abena Darko</h3>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {CALENDAR_DAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* offset: Sep 1 = Monday */}
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
              const status = CALENDAR_DATA[day];
              const statusColors: Record<string, string> = {
                present: 'bg-green-100 text-green-700 border-green-200',
                late: 'bg-amber-100 text-amber-700 border-amber-200',
                absent: 'bg-red-100 text-red-600 border-red-200',
              };
              return (
                <div key={day}
                  className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                    status ? statusColors[status] : day > 18 ? 'bg-slate-50 text-slate-200 border-transparent' : 'bg-slate-50 text-slate-300 border-transparent'
                  } ${day === 18 ? 'ring-2 ring-indigo-400' : ''}`}>
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs">
            {[['bg-green-100 border-green-200 text-green-700', 'Present'], ['bg-amber-100 border-amber-200 text-amber-700', 'Late'], ['bg-red-100 border-red-200 text-red-600', 'Absent']].map(([cls, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded border ${cls}`} />
                <span className="text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
