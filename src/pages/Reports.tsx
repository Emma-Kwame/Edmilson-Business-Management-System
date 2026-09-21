import React, { useState } from 'react';
import { useData, monthlySummary, weeklyAttendance } from '../store';
import { Card, PageHeader, Btn, StatCard, Tabs } from '../components/ui';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, FileText, BarChart3, Users, Package, Printer } from 'lucide-react';

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`;

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const escapeHtml = (s: string | number) =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

function tableHtml(headers: string[], rows: (string | number)[][]) {
  if (rows.length === 0) return '<p style="color:#94a3b8;font-size:13px;">No data recorded yet.</p>';
  return `<table><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')
  }</tbody></table>`;
}

// Real reports open in their own printable window — window.print() on the
// main app would just screenshot whatever's on screen (the sidebar, the
// wrong tab, empty overview cards); this always renders the actual report
// data regardless of what tab is active, and "Save as PDF" in the print
// dialog is how the browser turns it into a downloaded file.
function openPrintWindow(title: string, bodyHtml: string) {
  const win = window.open('', '_blank', 'width=850,height=1000');
  if (!win) { alert('Please allow pop-ups for this site to print or save a report as PDF.'); return; }
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>
    body { font-family: -apple-system, Segoe UI, Arial, sans-serif; padding: 32px; color: #1e293b; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    p.sub { color: #64748b; font-size: 12px; margin: 0 0 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
    @media print { body { padding: 0; } }
  </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Generated ${escapeHtml(new Date().toLocaleString())}</p>
    ${bodyHtml}
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { try { win.print(); } catch { /* pop-up blocked mid-flight, nothing to do */ } }, 300);
}

type ReportTarget = { type: 'tab'; tab: string } | { type: 'nav'; page: string };

const REPORTS: { id: string; icon: React.ReactNode; title: string; desc: string; target: ReportTarget }[] = [
  { id: 'attendance', icon: <Users size={18} />, title: 'Staff Attendance Report', desc: 'Daily, weekly, and monthly attendance records', target: { type: 'tab', tab: 'Attendance' } },
  { id: 'inventory', icon: <Package size={18} />, title: 'Inventory Report', desc: 'Stock levels, usage, and reorder alerts', target: { type: 'nav', page: 'inventory' } },
  { id: 'projects', icon: <FileText size={18} />, title: 'Project Report', desc: 'Project progress, timelines, and finances', target: { type: 'tab', tab: 'Projects' } },
  { id: 'financial', icon: <BarChart3 size={18} />, title: 'Financial Report', desc: 'Revenue, expenses, and profit summary', target: { type: 'tab', tab: 'Financial' } },
  { id: 'sales', icon: <BarChart3 size={18} />, title: 'Sales Report', desc: 'Sales by client, method, and date range', target: { type: 'nav', page: 'finance' } },
  { id: 'expenses', icon: <BarChart3 size={18} />, title: 'Expense Report', desc: 'Categorized expenses and vendor breakdown', target: { type: 'nav', page: 'finance' } },
];

export default function Reports({ onNav }: { onNav: (page: string) => void }) {
  const { projects: PROJECTS, inventory: INVENTORY, transactions: TRANSACTIONS, attendance: ATTENDANCE } = useData();
  const [tab, setTab] = useState('Overview');
  const [period, setPeriod] = useState('month');

  const monthly = monthlySummary(TRANSACTIONS, 6);
  const attendanceChart = weeklyAttendance(ATTENDANCE);
  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
  const totalProfit = monthly.reduce((s, m) => s + m.profit, 0);

  const exportForTab = () => {
    if (tab === 'Financial') {
      downloadCsv('financial-report.csv', ['Month', 'Revenue', 'Expenses', 'Profit'],
        monthly.map(m => [m.month, m.revenue, m.expenses, m.profit]));
    } else if (tab === 'Attendance') {
      downloadCsv('attendance-report.csv', ['Day', 'Present', 'Late', 'Absent'],
        attendanceChart.map(d => [d.day, d.present, d.late, d.absent]));
    } else if (tab === 'Projects') {
      downloadCsv('project-report.csv', ['ID', 'Name', 'Client', 'Amount', 'Paid', 'Balance', 'Status'],
        PROJECTS.map(p => [p.id, p.name, p.client, p.budget, p.paid, p.balance, p.status]));
    }
  };

  const exportReportCsv = (id: string) => {
    if (id === 'attendance') downloadCsv('attendance-report.csv', ['Day', 'Present', 'Late', 'Absent'], attendanceChart.map(d => [d.day, d.present, d.late, d.absent]));
    else if (id === 'inventory') downloadCsv('inventory-report.csv', ['Item', 'Category', 'Qty', 'Unit', 'Status'], INVENTORY.map(i => [i.name, i.category, i.qty, i.unit, i.status]));
    else if (id === 'projects') downloadCsv('project-report.csv', ['ID', 'Name', 'Client', 'Amount', 'Paid', 'Balance', 'Status'], PROJECTS.map(p => [p.id, p.name, p.client, p.budget, p.paid, p.balance, p.status]));
    else if (id === 'financial') downloadCsv('financial-report.csv', ['Month', 'Revenue', 'Expenses', 'Profit'], monthly.map(m => [m.month, m.revenue, m.expenses, m.profit]));
    else if (id === 'sales') downloadCsv('sales-report.csv', ['ID', 'Client', 'Amount', 'Method', 'Date'], TRANSACTIONS.filter(t => t.type === 'income').map(t => [t.id, t.client, t.amount, t.method, t.date]));
    else if (id === 'expenses') downloadCsv('expense-report.csv', ['ID', 'Vendor', 'Amount', 'Method', 'Date'], TRANSACTIONS.filter(t => t.type === 'expense').map(t => [t.id, t.client, t.amount, t.method, t.date]));
  };

  const viewReport = (r: typeof REPORTS[0]) => {
    if (r.target.type === 'tab') setTab(r.target.tab);
    else onNav(r.target.page);
  };

  const printReport = (id: string) => {
    if (id === 'financial') openPrintWindow('Financial Report', tableHtml(['Month', 'Revenue', 'Expenses', 'Profit'], monthly.map(m => [m.month, fmt(m.revenue), fmt(m.expenses), fmt(m.profit)])));
    else if (id === 'attendance') openPrintWindow('Staff Attendance Report', tableHtml(['Day', 'Present', 'Late', 'Absent'], attendanceChart.map(d => [d.day, d.present, d.late, d.absent])));
    else if (id === 'projects') openPrintWindow('Project Report', tableHtml(['ID', 'Name', 'Client', 'Budget', 'Paid', 'Balance', 'Status'], PROJECTS.map(p => [p.id, p.name, p.client, fmt(p.budget), fmt(p.paid), fmt(p.balance), p.status])));
    else if (id === 'inventory') openPrintWindow('Inventory Report', tableHtml(['Item', 'Category', 'Qty', 'Unit', 'Status'], INVENTORY.map(i => [i.name, i.category, i.qty, i.unit, i.status])));
    else if (id === 'sales') openPrintWindow('Sales Report', tableHtml(['ID', 'Client', 'Amount', 'Method', 'Date'], TRANSACTIONS.filter(t => t.type === 'income').map(t => [t.id, t.client, fmt(t.amount), t.method, t.date])));
    else if (id === 'expenses') openPrintWindow('Expense Report', tableHtml(['ID', 'Vendor', 'Amount', 'Method', 'Date'], TRANSACTIONS.filter(t => t.type === 'expense').map(t => [t.id, t.client, fmt(t.amount), t.method, t.date])));
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Reports & Analytics" sub="Generate and export business reports"
        breadcrumb={['Home', 'Reports']}
        actions={
          tab !== 'Overview' ? (
            <div className="flex gap-2">
              <Btn onClick={() => printReport(tab.toLowerCase())} variant="outline" size="sm" icon={<Printer size={14} />}>Print / Save as PDF</Btn>
              <Btn onClick={exportForTab} variant="outline" size="sm" icon={<Download size={14} />}>Export CSV</Btn>
            </div>
          ) : (
            <p className="text-xs text-slate-400 max-w-[220px] text-right">Pick a report below, or open a tab above, to print or export it.</p>
          )
        } />

      <Tabs tabs={['Overview', 'Financial', 'Attendance', 'Projects']} active={tab} onChange={setTab} />

      {/* Period Filter */}
      <div className="flex gap-1.5 overflow-x-auto max-w-full pb-0.5">
        {['today', 'week', 'month', 'quarter', 'year'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
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
              <Card key={r.id} className="p-5 hover:shadow-md hover:border-indigo-200 transition-all group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {r.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => viewReport(r)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    View Report
                  </button>
                  <button onClick={() => printReport(r.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1">
                    <Download size={11} /> PDF
                  </button>
                  <button onClick={() => exportReportCsv(r.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Revenue" value={fmt(totalRevenue)} sub="6 months" icon={<BarChart3 size={18} />} accent="green" />
            <StatCard label="Total Expenses" value={fmt(totalExpenses)} sub="6 months" icon={<BarChart3 size={18} />} accent="red" />
            <StatCard label="Net Profit" value={fmt(totalProfit)} sub="6 months" icon={<BarChart3 size={18} />} accent="indigo" />
          </div>
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 font-display mb-4">Monthly Financial Summary</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly}>
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
              <BarChart data={attendanceChart} barSize={20}>
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
