import React, { useState } from 'react';
import type { Role } from '../data/mock';
import { useData, TODAY } from '../store';
import { Badge, Btn, Card, PageHeader, Table, Td, StatCard, Tabs } from '../components/ui';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const CALENDAR_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Parses "9h 03m" / "-" into minutes, so real average hours can be computed instead of shown as a fixed string. */
function hoursToMinutes(hours: string) {
  const match = hours.match(/(\d+)h\s*(\d+)?m?/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2] || 0);
}
function minutesToHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export default function Attendance({ role }: { role: Role }) {
  const { attendance: ATTENDANCE, users: USERS, clockIn, clockOut, currentUserName } = useData();
  const [tab, setTab] = useState('Today');
  // Everyone but the Owner clocks in/out — staff, managers, and accountants
  // are all staff in the org-chart sense, they just have different access.
  const canClockIn = role !== 'owner';
  // Plain staff only see their own record; managers/accountants/owner get
  // the full team view since they supervise attendance.
  const restrictToOwn = role === 'staff';

  const todayAtt = ATTENDANCE.filter(a => a.date === TODAY);
  const myAttendance = ATTENDANCE.filter(a => a.staff === currentUserName);
  const myAttendanceToday = todayAtt.find(a => a.staff === currentUserName);
  const clockedIn = !!myAttendanceToday?.clockIn && !myAttendanceToday?.clockOut;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const weekEntries = (restrictToOwn ? myAttendance : ATTENDANCE).filter(a => a.date >= weekAgoStr && a.hours && a.hours !== '-');
  const avgHours = weekEntries.length
    ? minutesToHours(weekEntries.reduce((s, a) => s + hoursToMinutes(a.hours), 0) / weekEntries.length)
    : '—';

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" sub={todayLabel} breadcrumb={['Home', 'Attendance']} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present Today" value={todayAtt.filter(a => a.status === 'present').length} sub="On time" icon={<CheckCircle size={18} />} accent="green" />
        <StatCard label="Late" value={todayAtt.filter(a => a.status === 'late').length} sub="Today" icon={<AlertTriangle size={18} />} accent="amber" />
        <StatCard label="Absent" value={todayAtt.filter(a => a.status === 'absent').length} sub="Today" icon={<XCircle size={18} />} accent="red" />
        <StatCard label="Avg. Hours" value={avgHours} sub="This week" icon={<Clock size={18} />} accent="indigo" />
      </div>

      <Tabs tabs={['Today', 'History', 'Calendar']} active={tab} onChange={setTab} />

      {tab === 'Today' && (
        <div className="space-y-4">
          {/* Clock in card — staff, managers, and accountants */}
          {canClockIn && (
            <Card className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 font-display mb-1">My Attendance — Today</h3>
                  <p className="text-sm text-slate-500">
                    {clockedIn ? `Currently working · Since ${myAttendanceToday?.clockIn}` : myAttendanceToday?.clockOut ? `Clocked out at ${myAttendanceToday.clockOut}` : 'Not yet clocked in'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!clockedIn ? (
                    <Btn onClick={clockIn} variant="primary" size="md" icon={<Clock size={14} />} className="w-full sm:w-auto justify-center">Clock In</Btn>
                  ) : (
                    <Btn onClick={clockOut} variant="danger" size="md" icon={<Clock size={14} />} className="w-full sm:w-auto justify-center">Clock Out</Btn>
                  )}
                </div>
              </div>
              {myAttendanceToday && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Clock In</p>
                    <p className="font-bold font-mono text-green-700">{myAttendanceToday.clockIn || '—'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">{clockedIn ? 'Status' : 'Duration'}</p>
                    <p className="font-bold font-mono text-slate-700">{clockedIn ? 'In Progress' : (myAttendanceToday.hours !== '-' ? myAttendanceToday.hours : '—')}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <Badge status={myAttendanceToday.status} />
                  </div>
                </div>
              )}
            </Card>
          )}

          {restrictToOwn ? (
            <Card>
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 font-display">My Attendance Record</h3>
              </div>
              <Table headers={['Date', 'Clock In', 'Clock Out', 'Duration', 'Status']} empty={myAttendance.length === 0}>
                {myAttendance.map(a => (
                  <tr key={a.id}>
                    <Td mono><span className="text-xs">{a.date}</span></Td>
                    <Td mono><span className="text-xs">{a.clockIn || '—'}</span></Td>
                    <Td mono><span className="text-xs">{a.clockOut || '—'}</span></Td>
                    <Td mono><span className="text-xs font-semibold">{a.hours}</span></Td>
                    <Td><Badge status={a.status} /></Td>
                  </tr>
                ))}
              </Table>
            </Card>
          ) : (
            <Card>
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 font-display">Team Attendance Today</h3>
              </div>
              <Table headers={['Staff', 'Department', 'Clock In', 'Clock Out', 'Hours', 'Status']}>
                {USERS.filter(u => u.role !== 'owner').map(staff => {
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
                      <Td><Badge status={att?.status || 'not-clocked-in'} /></Td>
                    </tr>
                  );
                })}
              </Table>
            </Card>
          )}
        </div>
      )}

      {tab === 'History' && (
        <Card>
          {restrictToOwn ? (
            <Table headers={['Date', 'Clock In', 'Clock Out', 'Hours', 'Status']} empty={myAttendance.length === 0}>
              {myAttendance.map(a => (
                <tr key={a.id}>
                  <Td mono><span className="text-xs">{a.date}</span></Td>
                  <Td mono><span className="text-xs">{a.clockIn || '—'}</span></Td>
                  <Td mono><span className="text-xs">{a.clockOut || '—'}</span></Td>
                  <Td mono><span className="text-xs font-semibold">{a.hours}</span></Td>
                  <Td><Badge status={a.status} /></Td>
                </tr>
              ))}
            </Table>
          ) : (
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
          )}
        </Card>
      )}

      {tab === 'Calendar' && (
        <Card className="p-5">
          {(() => {
            const now = new Date();
            const year = now.getFullYear(), month = now.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            // getDay(): 0=Sun..6=Sat → shift so Monday is column 0
            const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
            const byDate = Object.fromEntries(myAttendance.map(a => [a.date, a.status]));
            const statusColors: Record<string, string> = {
              present: 'bg-green-100 text-green-700 border-green-200',
              late: 'bg-amber-100 text-amber-700 border-amber-200',
              absent: 'bg-red-100 text-red-600 border-red-200',
              'early-departure': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            };
            return (
              <>
                <h3 className="font-bold text-slate-800 font-display mb-4">
                  {now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} — {currentUserName}
                </h3>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {CALENDAR_DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-400 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstWeekday }, (_, i) => <div key={`pad-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const status = byDate[dateStr];
                    const isFuture = dateStr > TODAY;
                    return (
                      <div key={day}
                        className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg border transition-all hover:shadow-sm ${
                          status ? statusColors[status] || 'bg-slate-50 text-slate-400 border-transparent' : 'bg-slate-50 text-slate-300 border-transparent'
                        } ${dateStr === TODAY ? 'ring-2 ring-indigo-400' : ''} ${isFuture ? 'opacity-50' : ''}`}>
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-4 text-xs flex-wrap">
                  {[['bg-green-100 border-green-200 text-green-700', 'Present'], ['bg-amber-100 border-amber-200 text-amber-700', 'Late'], ['bg-red-100 border-red-200 text-red-600', 'Absent']].map(([cls, label]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded border ${cls}`} />
                      <span className="text-slate-500">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
