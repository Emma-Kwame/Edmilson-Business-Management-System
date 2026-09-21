import React, { useState } from 'react';
import type { Role } from '../data/mock';
import { useData, TODAY, monthlySummary, momChange, weeklyAttendance, titleCase } from '../store';
import { useNow, greetingFor, formatLiveDateTime } from '../hooks/useNow';
import { StatCard, Card, SectionHeader, Badge, Table, Td, PageHeader, Btn, ProgressBar } from '../components/ui';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, Package, Users, FolderKanban, Clock,
  CheckSquare, AlertTriangle, ArrowRight, BellRing,
} from 'lucide-react';

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`;

const STATUS_COLORS: Record<string, string> = {
  'in-progress': '#4F46E5', completed: '#10B981', 'on-hold': '#F59E0B', overdue: '#EF4444', pending: '#64748B',
};

const trendProp = (pct: number | null) => pct === null ? undefined : { dir: (pct >= 0 ? 'up' : 'down') as 'up' | 'down', val: `${Math.abs(pct).toFixed(1)}%` };

// ─── Owner Dashboard ──────────────────────────────────────────────────────────
function OwnerDashboard({ onNav }: { onNav: (p: string) => void }) {
  const { projects: PROJECTS, inventory: INVENTORY, transactions: TRANSACTIONS, attendance: ATTENDANCE, users: USERS, currentUserName } = useData();
  const now = useNow();
  const [period, setPeriod] = useState('month');
  const monthly = monthlySummary(TRANSACTIONS, 6);
  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const lowStock = INVENTORY.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock').length;
  const outstanding = PROJECTS.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const activeStaffCount = USERS.filter(u => u.status === 'active').length;
  const presentToday = ATTENDANCE.filter(a => a.date === TODAY && (a.status === 'present' || a.status === 'late')).length;

  const projectStatusData = Object.entries(
    PROJECTS.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {})
  ).map(([status, value]) => ({ name: titleCase(status), value, color: STATUS_COLORS[status] || '#94A3B8' }));

  const attendanceChart = weeklyAttendance(ATTENDANCE);

  const expenseByVendor = Object.entries(
    TRANSACTIONS.filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, t) => { acc[t.client] = (acc[t.client] || 0) + t.amount; return acc; }, {})
  ).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxExpense = Math.max(1, ...expenseByVendor.map(e => e.amount));

  const periods = ['today','week','month','quarter','year'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title="Owner Dashboard" sub={`Welcome back, ${currentUserName.split(' ')[0] || 'there'}. ${formatLiveDateTime(now)}`}
          breadcrumb={['Home', 'Dashboard']} />
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto max-w-full">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-shrink-0 whitespace-nowrap px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                period === p ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
              }`}>{p === 'month' ? 'This Month' : p === 'week' ? 'This Week' : p === 'today' ? 'Today' : p === 'quarter' ? 'Quarter' : 'This Year'}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={fmt(totalRevenue)} sub="6-month period"
          icon={<DollarSign size={18} />} accent="green" trend={trendProp(momChange(monthly, 'revenue'))} />
        <StatCard label="Net Profit" value={fmt(netProfit)} sub="After expenses"
          icon={<TrendingUp size={18} />} accent="indigo" />
        <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub="All categories"
          icon={<DollarSign size={18} />} accent="amber" trend={trendProp(momChange(monthly, 'expenses'))} />
        <StatCard label="Outstanding" value={fmt(outstanding)} sub={`${PROJECTS.filter(p => p.balance > 0).length} invoices pending`}
          icon={<AlertTriangle size={18} />} accent="red" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Projects" value={PROJECTS.filter(p => p.status === 'in-progress').length} sub="In progress"
          icon={<FolderKanban size={18} />} accent="indigo" />
        <StatCard label="Overdue Projects" value={PROJECTS.filter(p => p.status === 'overdue').length} sub="Needs attention"
          icon={<AlertTriangle size={18} />} accent="red" />
        <StatCard label="Staff Present" value={`${presentToday} / ${activeStaffCount}`} sub="Today"
          icon={<Users size={18} />} accent="green" />
        <StatCard label="Low Stock Items" value={lowStock} sub="Reorder required"
          icon={<Package size={18} />} accent="amber" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <SectionHeader title="Revenue vs Expenses" action={
            <span className="text-xs text-slate-400">Last 6 months</span>
          } />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₵${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`GH₵ ${Number(v).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" strokeWidth={2}
                fill="url(#revGrad)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2}
                fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <SectionHeader title="Project Status" />
          {projectStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value">
                    {projectStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {projectStatusData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No projects yet.</p>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Staff Attendance Chart */}
        <Card className="p-5">
          <SectionHeader title="Staff Attendance This Week" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceChart} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="#10B981" radius={[3,3,0,0]} />
              <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[3,3,0,0]} />
              <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Expenses Breakdown */}
        <Card className="p-5">
          <SectionHeader title="Top Expenses by Vendor" action={<span className="text-xs text-slate-400">{now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>} />
          {expenseByVendor.length > 0 ? (
            <div className="space-y-3 mt-2">
              {expenseByVendor.map(e => (
                <div key={e.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{e.category}</span>
                    <span className="font-semibold text-slate-800 font-mono">{fmt(e.amount)}</span>
                  </div>
                  <ProgressBar value={e.amount} max={maxExpense} color={e.amount > maxExpense * 0.66 ? 'indigo' : e.amount > maxExpense * 0.25 ? 'amber' : 'green'} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">No expenses recorded yet.</p>
          )}
        </Card>
      </div>

      {/* Bottom tables */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <Card>
          <div className="p-5 border-b border-slate-100">
            <SectionHeader title="Recent Transactions" action={
              <button onClick={() => onNav('finance')} className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            } />
          </div>
          <Table headers={['Description', 'Amount', 'Status']}>
            {TRANSACTIONS.slice(0, 5).map(t => (
              <tr key={t.id}>
                <Td>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{t.client}</p>
                    <p className="text-xs text-slate-400">{t.date}</p>
                  </div>
                </Td>
                <Td>
                  <span className={`font-semibold font-mono text-xs ${t.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} {fmt(t.amount)}
                  </span>
                </Td>
                <Td><Badge status={t.type} /></Td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <div className="p-5 border-b border-slate-100">
            <SectionHeader title="Low Stock Alerts" action={
              <button onClick={() => onNav('inventory')} className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                Manage <ArrowRight size={12} />
              </button>
            } />
          </div>
          <Table headers={['Item', 'Stock', 'Status']}>
            {INVENTORY.filter(i => i.status !== 'in-stock').slice(0, 5).map(item => (
              <tr key={item.id}>
                <Td>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </div>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-slate-600">{item.qty} {item.unit}</span>
                </Td>
                <Td><Badge status={item.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────
function ManagerDashboard({ onNav }: { onNav: (p: string) => void }) {
  const { projects: PROJECTS, tasks: TASKS, inventory: INVENTORY, attendance: ATTENDANCE, users: USERS, currentUserName } = useData();
  const now = useNow();
  const overdueTasks = TASKS.filter(t => t.status === 'overdue').length;
  const activeTasks = TASKS.filter(t => t.status === 'in-progress').length;
  const activeStaffCount = USERS.filter(u => u.status === 'active').length;
  const presentToday = ATTENDANCE.filter(a => a.date === TODAY && (a.status === 'present' || a.status === 'late')).length;
  const tasksDueToday = TASKS.filter(t => t.deadline === TODAY);
  const urgentDueToday = tasksDueToday.filter(t => t.priority === 'urgent').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Manager Dashboard" sub={`Welcome back, ${currentUserName.split(' ')[0] || 'there'}. ${formatLiveDateTime(now)}`}
        breadcrumb={['Home', 'Dashboard']} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Staff Present" value={`${presentToday} / ${activeStaffCount}`} sub={`${Math.max(0, activeStaffCount - presentToday)} absent today`} icon={<Users size={18} />} accent="green" />
        <StatCard label="Active Projects" value={PROJECTS.filter(p => p.status === 'in-progress').length} sub="In progress" icon={<FolderKanban size={18} />} accent="indigo" />
        <StatCard label="Tasks Due Today" value={tasksDueToday.length} sub={`${urgentDueToday} urgent`} icon={<CheckSquare size={18} />} accent="amber" />
        <StatCard label="Low Stock Items" value={INVENTORY.filter(i => i.status !== 'in-stock').length} sub="Needs reorder" icon={<Package size={18} />} accent="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active Projects */}
        <Card>
          <div className="p-5 border-b border-slate-100">
            <SectionHeader title="Active Projects" action={
              <button onClick={() => onNav('projects')} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
            } />
          </div>
          <div className="divide-y divide-slate-50">
            {PROJECTS.filter(p => p.status === 'in-progress' || p.status === 'on-hold' || p.status === 'overdue').slice(0, 5).map(p => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.client} · Due {p.deadline}</p>
                  </div>
                  <Badge status={p.status} />
                </div>
                <ProgressBar value={p.paid} max={p.budget} color={p.status === 'overdue' ? 'red' : 'indigo'} />
                <p className="text-xs text-slate-400 mt-1">{fmt(p.paid)} / {fmt(p.budget)} received</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <div className="p-5 border-b border-slate-100">
            <SectionHeader title="Today's Attendance" action={
              <button onClick={() => onNav('attendance')} className="text-xs text-indigo-600 font-semibold hover:underline">Full report</button>
            } />
          </div>
          <Table headers={['Staff', 'Clock In', 'Status']}>
            {ATTENDANCE.filter(a => a.date === TODAY).map(a => (
              <tr key={a.id}>
                <Td><span className="text-xs font-semibold text-slate-800">{a.staff}</span></Td>
                <Td mono>{a.clockIn || '—'}</Td>
                <Td><Badge status={a.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {/* Urgent Tasks */}
      <Card>
        <div className="p-5 border-b border-slate-100">
          <SectionHeader title="Urgent & Overdue Tasks" action={
            <Btn onClick={() => onNav('tasks')} variant="outline" size="sm" icon={<ArrowRight size={13} />}>All Tasks</Btn>
          } />
        </div>
        <Table headers={['Task', 'Assigned To', 'Priority', 'Deadline', 'Status']}>
          {TASKS.filter(t => t.priority === 'urgent' || t.status === 'overdue').map(t => (
            <tr key={t.id}>
              <Td>
                <p className="text-xs font-semibold text-slate-800 max-w-xs truncate">{t.name}</p>
                <p className="text-xs text-slate-400">{t.project}</p>
              </Td>
              <Td><span className="text-xs text-slate-600">{t.assigned}</span></Td>
              <Td><Badge status={t.priority} /></Td>
              <Td mono><span className="text-xs">{t.deadline}</span></Td>
              <Td><Badge status={t.status} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── Accountant Dashboard ─────────────────────────────────────────────────────
function AccountantDashboard({ onNav }: { onNav: (p: string) => void }) {
  const { projects: PROJECTS, transactions: TRANSACTIONS, currentUserName } = useData();
  const now = useNow();
  const monthly = monthlySummary(TRANSACTIONS, 6);
  const income = TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const outstanding = PROJECTS.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Accountant Dashboard" sub={`Welcome back, ${currentUserName.split(' ')[0] || 'there'}. ${formatLiveDateTime(now)}`}
        breadcrumb={['Home', 'Dashboard']} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value={fmt(income)} sub="Recorded payments" icon={<TrendingUp size={18} />} accent="green" trend={trendProp(momChange(monthly, 'revenue'))} />
        <StatCard label="Expenses" value={fmt(expenses)} sub={now.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} icon={<DollarSign size={18} />} accent="red" />
        <StatCard label="Net Income" value={fmt(income - expenses)} sub="After expenses" icon={<DollarSign size={18} />} accent="indigo" />
        <StatCard label="Outstanding" value={fmt(outstanding)} sub="Awaiting payment" icon={<AlertTriangle size={18} />} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Revenue chart */}
        <Card className="p-5">
          <SectionHeader title="Monthly Revenue Trend" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₵${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`GH₵ ${Number(v).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#4F46E5" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Outstanding payments */}
        <Card>
          <div className="p-5 border-b border-slate-100">
            <SectionHeader title="Outstanding Balances" action={
              <button onClick={() => onNav('finance')} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
            } />
          </div>
          <Table headers={['Project / Client', 'Amount', 'Paid', 'Balance']}>
            {PROJECTS.filter(p => p.balance > 0).slice(0, 5).map(p => (
              <tr key={p.id}>
                <Td>
                  <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.client}</p>
                </Td>
                <Td mono><span className="text-xs">{fmt(p.budget)}</span></Td>
                <Td mono><span className="text-xs text-green-700">{fmt(p.paid)}</span></Td>
                <Td mono><span className="text-xs font-bold text-red-600">{fmt(p.balance)}</span></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <div className="p-5 border-b border-slate-100">
          <SectionHeader title="Recent Transactions" action={
            <Btn onClick={() => onNav('finance')} variant="primary" size="sm">+ Record Payment</Btn>
          } />
        </div>
        <Table headers={['ID', 'Type', 'Client / Vendor', 'Amount', 'Method', 'Date', 'Status']}>
          {TRANSACTIONS.map(t => (
            <tr key={t.id}>
              <Td mono><span className="text-xs text-slate-400">{t.id}</span></Td>
              <Td><Badge status={t.type} /></Td>
              <Td>
                <p className="text-xs font-semibold text-slate-800">{t.client}</p>
                {t.project && <p className="text-xs text-slate-400">{t.project}</p>}
              </Td>
              <Td mono>
                <span className={`text-xs font-bold ${t.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </span>
              </Td>
              <Td><span className="text-xs text-slate-500">{t.method}</span></Td>
              <Td mono><span className="text-xs">{t.date}</span></Td>
              <Td><Badge status={t.status} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── Staff Dashboard ──────────────────────────────────────────────────────────
function StaffDashboard({ onNav }: { onNav: (p: string) => void }) {
  const { tasks: TASKS, attendance, clockIn, clockOut, currentUserName } = useData();
  const now = useNow();
  const myTasks = TASKS.filter(t => t.assigned === currentUserName);
  const myAttendanceToday = attendance.find(a => a.staff === currentUserName && a.date === TODAY);
  const clockedIn = !!myAttendanceToday?.clockIn && !myAttendanceToday?.clockOut;

  return (
    <div className="space-y-6">
      <PageHeader title="My Dashboard" sub={`${greetingFor(now)}, ${currentUserName.split(' ')[0] || 'there'}! ${formatLiveDateTime(now)}`}
        breadcrumb={['Home', 'Dashboard']} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Clock-In Time" value={myAttendanceToday?.clockIn || '—'} sub={clockedIn ? 'Currently working' : 'Not yet clocked in'} icon={<Clock size={18} />} accent="green" />
        <StatCard label="Hours Worked" value={myAttendanceToday?.hours && myAttendanceToday.hours !== '-' ? myAttendanceToday.hours : '—'} sub="Today so far" icon={<Clock size={18} />} accent="indigo" />
        <StatCard label="My Tasks" value={myTasks.length} sub="Assigned to me" icon={<CheckSquare size={18} />} accent="cyan" />
        <StatCard label="Pending Tasks" value={myTasks.filter(t => t.status !== 'completed').length} sub="Need action" icon={<AlertTriangle size={18} />} accent="amber" />
      </div>

      {/* Clock In/Out */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-4 ${clockedIn ? 'bg-green-100' : 'bg-slate-100'}`}>
            {clockedIn && <div className="pulse-ring" />}
            <Clock size={32} className={clockedIn ? 'text-green-600' : 'text-slate-400'} />
          </div>
          <p className="font-bold text-slate-900 font-display mb-1">{clockedIn ? 'Clocked In' : 'Not Clocked In'}</p>
          <p className="text-sm text-slate-500 mb-4">
            {clockedIn ? `Since ${myAttendanceToday?.clockIn}` : myAttendanceToday?.clockOut ? `Clocked out at ${myAttendanceToday.clockOut}` : 'You haven\'t clocked in yet'}
          </p>
          <button
            onClick={() => clockedIn ? clockOut() : clockIn()}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              clockedIn
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-5 border-b border-slate-100">
            <SectionHeader title="My Tasks" action={
              <button onClick={() => onNav('tasks')} className="text-xs text-indigo-600 font-semibold hover:underline">View all</button>
            } />
          </div>
          <Table headers={['Task', 'Project', 'Priority', 'Deadline', 'Status']}>
            {myTasks.map(t => (
              <tr key={t.id}>
                <Td>
                  <p className="text-xs font-semibold text-slate-800 max-w-[180px] truncate">{t.name}</p>
                </Td>
                <Td><span className="text-xs text-slate-500">{t.project}</span></Td>
                <Td><Badge status={t.priority} /></Td>
                <Td mono><span className="text-xs">{t.deadline}</span></Td>
                <Td><Badge status={t.status} /></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="p-5">
        <SectionHeader title="Upcoming Deadlines" />
        <div className="space-y-3">
          {myTasks.filter(t => t.status !== 'completed').slice(0, 4).map(t => (
            <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`w-1 h-10 rounded-full ${
                t.priority === 'urgent' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-400">Due: {t.deadline}</p>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Dashboard({ role, onNav }: { role: Role; onNav: (p: string) => void }) {
  if (role === 'owner') return <OwnerDashboard onNav={onNav} />;
  if (role === 'manager') return <ManagerDashboard onNav={onNav} />;
  if (role === 'accountant') return <AccountantDashboard onNav={onNav} />;
  return <StaffDashboard onNav={onNav} />;
}
