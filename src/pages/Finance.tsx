import React, { useState } from 'react';
import { TRANSACTIONS, PROJECTS, MONTHLY_REVENUE } from '../data/mock';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, Textarea, StatCard, Tabs } from '../components/ui';
import { Plus, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`;

export default function Finance() {
  const [tab, setTab] = useState('Transactions');
  const [addOpen, setAddOpen] = useState(false);
  const [txType, setTxType] = useState<'income'|'expense'>('income');
  const [search, setSearch] = useState('');

  const income = TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const outstanding = PROJECTS.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);

  const filteredTx = TRANSACTIONS.filter(t =>
    t.client.toLowerCase().includes(search.toLowerCase()) ||
    (t.project || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Finance" sub="September 2025 financial overview" breadcrumb={['Home', 'Finance']}
        actions={
          <div className="flex gap-2">
            <Btn onClick={() => { setTxType('expense'); setAddOpen(true); }} variant="outline" size="sm" icon={<TrendingDown size={14} />}>Record Expense</Btn>
            <Btn onClick={() => { setTxType('income'); setAddOpen(true); }} variant="primary" size="sm" icon={<Plus size={14} />}>Record Income</Btn>
          </div>
        } />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={fmt(income)} sub="Sep 2025" icon={<TrendingUp size={18} />} accent="green" trend={{ dir: 'up', val: '14%' }} />
        <StatCard label="Total Expenses" value={fmt(expenses)} sub="Sep 2025" icon={<TrendingDown size={18} />} accent="red" />
        <StatCard label="Net Income" value={fmt(income - expenses)} sub="This month" icon={<DollarSign size={18} />} accent="indigo" />
        <StatCard label="Outstanding" value={fmt(outstanding)} sub="Unpaid invoices" icon={<AlertTriangle size={18} />} accent="amber" />
      </div>

      {/* Revenue Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800 font-display">Revenue vs Expenses (6 Months)</h2>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" /> Revenue</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" /> Expenses</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-0.5 bg-green-500 inline-block rounded" /> Profit</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MONTHLY_REVENUE}>
            <defs>
              {['#4F46E5', '#EF4444', '#10B981'].map((color, i) => (
                <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₵${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`GH₵ ${Number(v).toLocaleString()}`, '']} contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #E2E8F0' }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#g0)" />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#g1)" />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} fill="url(#g2)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabs */}
      <Tabs tabs={['Transactions', 'Outstanding', 'Expenses']} active={tab} onChange={setTab} />

      {/* Search */}
      <div className="max-w-xs">
        <SearchInput value={search} onChange={setSearch} placeholder="Search transactions..." />
      </div>

      {tab === 'Transactions' && (
        <Card>
          <Table headers={['ID', 'Type', 'Client / Vendor', 'Project', 'Amount', 'Method', 'Date', 'Status', 'Recorded By']}>
            {filteredTx.map(t => (
              <tr key={t.id}>
                <Td mono><span className="text-xs text-indigo-600 font-bold">{t.id}</span></Td>
                <Td><Badge status={t.type} label={t.type === 'income' ? 'Income' : 'Expense'} /></Td>
                <Td><span className="text-xs font-semibold text-slate-800">{t.client}</span></Td>
                <Td><span className="text-xs text-slate-400">{t.project || '—'}</span></Td>
                <Td mono>
                  <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                </Td>
                <Td><span className="text-xs text-slate-500">{t.method}</span></Td>
                <Td mono><span className="text-xs">{t.date}</span></Td>
                <Td><Badge status={t.status} /></Td>
                <Td><span className="text-xs text-slate-400">{t.recordedBy}</span></Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === 'Outstanding' && (
        <Card>
          <Table headers={['Project ID', 'Project', 'Client', 'Total Budget', 'Amount Paid', 'Balance', 'Status', 'Action']}>
            {PROJECTS.filter(p => p.balance > 0).map(p => (
              <tr key={p.id}>
                <Td mono><span className="text-xs text-indigo-600 font-bold">{p.id}</span></Td>
                <Td><span className="text-xs font-semibold text-slate-800">{p.name}</span></Td>
                <Td><span className="text-xs text-slate-500">{p.client}</span></Td>
                <Td mono><span className="text-xs font-semibold">{fmt(p.budget)}</span></Td>
                <Td mono><span className="text-xs text-green-700 font-semibold">{fmt(p.paid)}</span></Td>
                <Td mono><span className="text-xs font-bold text-red-600">{fmt(p.balance)}</span></Td>
                <Td><Badge status={p.status} /></Td>
                <Td>
                  <Btn variant="outline" size="sm" onClick={() => { setTxType('income'); setAddOpen(true); }}>
                    Record Payment
                  </Btn>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === 'Expenses' && (
        <Card>
          <Table headers={['Date', 'Description', 'Category', 'Amount', 'Method', 'Recorded By', 'Note']}>
            {TRANSACTIONS.filter(t => t.type === 'expense').map(t => (
              <tr key={t.id}>
                <Td mono><span className="text-xs">{t.date}</span></Td>
                <Td><span className="text-xs font-semibold text-slate-800">{t.client}</span></Td>
                <Td><span className="text-xs text-slate-500">Materials</span></Td>
                <Td mono><span className="text-sm font-bold text-red-600">-{fmt(t.amount)}</span></Td>
                <Td><span className="text-xs text-slate-500">{t.method}</span></Td>
                <Td><span className="text-xs text-slate-400">{t.recordedBy}</span></Td>
                <Td><span className="text-xs text-slate-400">{t.note}</span></Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Add Transaction Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}
        title={txType === 'income' ? 'Record Income' : 'Record Expense'} width="max-w-lg">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setTxType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${txType === 'income' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'}`}>
              Income
            </button>
            <button onClick={() => setTxType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${txType === 'expense' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:border-red-400'}`}>
              Expense
            </button>
          </div>
          <Input label={txType === 'income' ? 'Client Name' : 'Vendor / Payee'} placeholder="Name" required />
          {txType === 'income' && (
            <Select label="Project" options={[
              { label: 'No project', value: '' },
              ...PROJECTS.map(p => ({ label: p.name, value: p.id }))
            ]} />
          )}
          {txType === 'expense' && (
            <Select label="Expense Category" options={[
              { label: 'Materials', value: 'materials' }, { label: 'Utilities', value: 'utilities' },
              { label: 'Transport', value: 'transport' }, { label: 'Rent', value: 'rent' },
              { label: 'Salaries', value: 'salaries' }, { label: 'Other', value: 'other' },
            ]} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (GH₵)" type="number" placeholder="0.00" required />
            <Select label="Payment Method" options={[
              { label: 'Mobile Money', value: 'momo' }, { label: 'Cash', value: 'cash' },
              { label: 'Bank Transfer', value: 'bank' }, { label: 'Cheque', value: 'cheque' },
            ]} />
          </div>
          <Input label="Date" type="date" />
          <Textarea label="Note" placeholder="Additional details..." rows={2} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md">Save Record</Btn>
            <Btn variant="secondary" size="md" onClick={() => setAddOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
