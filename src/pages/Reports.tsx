import React, { useState } from 'react';
import { MONTHLY_REVENUE, ATTENDANCE_CHART, PROJECTS } from '../data/mock';
import { Card, PageHeader, Btn, StatCard, Tabs } from '../components/ui';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, FileText, BarChart3, Users, Package } from 'lucide-react';

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`;

const REPORTS = [
  { id: 'attendance', icon: <Users size={18} />, title: 'Staff Attendance Report', desc: 'Daily, weekly, and monthly attendance records', accent: 'indigo' },
  { id: 'inventory', icon: <Package size={18} />, title: 'Inventory Report', desc: 'Stock levels, usage, and reorder alerts', accent: 'amber' },
  { id: 'projects', icon: <FileText size={18} />, title: 'Project Report', desc: 'Project progress, timelines, and finances', accent: 'purple' },
  { id: 'financial', icon: <BarChart3 size={18} />, title: 'Financial Report', desc: 'Revenue, expenses, and profit summary', accent: 'green' },
  { id: 'sales', icon: <BarChart3 size={18} />, title: 'Sales Report', desc: 'Sales by client, method, and date range', accent: 'cyan' },
  { id: 'expenses', icon: <BarChart3 size={18} />, title: 'Expense Report', desc: 'Categorized expenses and vendor breakdown', accent: 'red' },
];

export default function Reports() {
  const [tab, setTab] = useState('Overview');
  const [period, setPeriod] = useState('month');

  const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = MONTHLY_REVENUE.reduce((s, m) => s + m.expenses, 0);
  const totalProfit = MONTHLY_REVENUE.reduce((s, m) => s + m.profit, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Reports & Analytics" sub="Generate and export business reports"
        breadcrumb={['Home', 'Reports']}
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" icon={<Download size={14} />}>Export PDF</Btn>
            <Btn variant="outline" size="sm" icon={<Download size={14} />}>Export CSV</Btn>
          </div>
        } />

      <Tabs tabs={['Overview', 'Financial', 'Attendance', 'Projects']} active={tab} onChange={setTab} />

      {/* Period Filter */}
      <div className="flex gap-1.5">
        {['today', 'week', 'month', 'quarter', 'year'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              period === p ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
            }`}>
            {p === 'month' ? 'This Month' : p === 'week' ? 'This Week' : p === 'today' ? 'Today' : p === 'quarter' ? 'Quarter' : 'Year'}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-5">
          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORTS.map(r => (
              <Card key={r.id} className="p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {r.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    View Report
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1">
                    <Download size={11} /> PDF
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1">
                    <Download size={11} /> CSV
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'Financial' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Revenue" value={fmt(totalRevenue)} sub="6 months" icon={<BarChart3 size={18} />} accent="green" />
            <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub="6 months" icon={<BarChart3 size={18} />} accent="red" />
            <StatCard label="Net Profit" value={fmt(totalProfit)} sub="6 months" icon={<BarChart3 size={18} />} accent="indigo" />
          </div>
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 font-display mb-4">Monthly Financial Summary</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_REVENUE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₵${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`GH₵ ${Number(v).toLocaleString()}`, '']} contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#4F46E5" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4,4,0,0]} />
                <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'Attendance' && (
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 font-display mb-4">Weekly Attendance Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ATTENDANCE_CHART} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }} />
                <Bar dataKey="present" name="Present" fill="#10B981" radius={[3,3,0,0]} />
                <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[3,3,0,0]} />
                <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === 'Projects' && (
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 font-display mb-4">Project Summary</h3>
            <div className="space-y-3">
              {PROJECTS.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-indigo-600 font-mono">{p.id}</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.client}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-bold text-slate-900 font-mono">{fmt(p.budget)}</p>
                    <p className="text-xs text-green-700">{fmt(p.paid)} received</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
