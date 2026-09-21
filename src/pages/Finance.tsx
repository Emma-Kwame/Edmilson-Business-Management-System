import React, { useState } from 'react';
import { useData, TODAY, monthlySummary } from '../store';
import type { LineItem } from '../store';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, Textarea, StatCard, Tabs } from '../components/ui';
import { Plus, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CalendarCheck, X, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`;

export interface FinancePrefill {
  projectId: string;
  client: string;
  amount: number;
}

const EXPENSE_CATEGORIES = ['Materials', 'Utilities', 'Transport', 'Rent', 'Salaries', 'Other'];

const emptyLineItem: LineItem = { label: '', amount: 0 };

export default function Finance({ prefill }: { prefill?: FinancePrefill | null }) {
  const { transactions: TRANSACTIONS, projects: PROJECTS, addTransaction, dailyClosings: DAILY_CLOSINGS, addDailyClosing, currentUserName } = useData();
  const [tab, setTab] = useState('Transactions');
  const [addOpen, setAddOpen] = useState(() => !!prefill);
  const [txType, setTxType] = useState<'income'|'expense'>('income');
  const [search, setSearch] = useState('');
  const [formClient, setFormClient] = useState(() => prefill?.client || '');
  const [formProjectId, setFormProjectId] = useState(() => prefill?.projectId || '');
  const [formAmount, setFormAmount] = useState(() => prefill ? String(prefill.amount) : '');
  const [formMethod, setFormMethod] = useState('momo');
  const [formCategory, setFormCategory] = useState('Materials');
  const [formDate, setFormDate] = useState(TODAY);
  const [formNote, setFormNote] = useState('');

  const resetForm = () => {
    setFormClient(''); setFormProjectId(''); setFormAmount('');
    setFormMethod('momo'); setFormCategory('Materials'); setFormDate(TODAY); setFormNote('');
  };
  const openRecordForm = (type: 'income'|'expense', p?: { id: string; client: string; balance?: number }) => {
    setTxType(type);
    setFormClient(p?.client || '');
    setFormProjectId(p?.id || '');
    setFormAmount(p?.balance !== undefined ? String(p.balance) : '');
    setFormMethod('momo'); setFormCategory('Materials'); setFormDate(TODAY); setFormNote('');
    setAddOpen(true);
  };
  const closeModal = () => { setAddOpen(false); resetForm(); };

  // ─── Daily Closing (secretary-work day close) ────────────────────────────
  const emptyCloseDayForm = {
    date: TODAY, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    totalAmount: '', hasContract: false, contractNote: '',
  };
  const [closeDayOpen, setCloseDayOpen] = useState(false);
  const [closeDayForm, setCloseDayForm] = useState(emptyCloseDayForm);
  const [closeDayExpenses, setCloseDayExpenses] = useState<LineItem[]>([{ ...emptyLineItem }]);
  const [closeDayCreditors, setCloseDayCreditors] = useState<LineItem[]>([{ ...emptyLineItem }]);
  const [viewClosingId, setViewClosingId] = useState<number | null>(null);
  const viewClosing = DAILY_CLOSINGS.find(d => d.id === viewClosingId) || null;

  const openCloseDay = () => {
    setCloseDayForm({ ...emptyCloseDayForm, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    setCloseDayExpenses([{ ...emptyLineItem }]);
    setCloseDayCreditors([{ ...emptyLineItem }]);
    setCloseDayOpen(true);
  };
  const closeCloseDay = () => setCloseDayOpen(false);

  const updateLineItem = (list: LineItem[], setList: (v: LineItem[]) => void, i: number, patch: Partial<LineItem>) =>
    setList(list.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  const addLineItem = (setList: (fn: (v: LineItem[]) => LineItem[]) => void) =>
    setList(prev => [...prev, { ...emptyLineItem }]);
  const removeLineItem = (list: LineItem[], setList: (v: LineItem[]) => void, i: number) =>
    setList(list.filter((_, idx) => idx !== i));

  const submitCloseDay = () => {
    const total = Number(closeDayForm.totalAmount) || 0;
    if (total <= 0) return;
    addDailyClosing({
      date: closeDayForm.date || TODAY, time: closeDayForm.time, totalAmount: total,
      expenses: closeDayExpenses.filter(e => e.label.trim() && e.amount > 0),
      creditors: closeDayCreditors.filter(c => c.label.trim() && c.amount > 0),
      hasContract: closeDayForm.hasContract, contractNote: closeDayForm.contractNote,
    });
    closeCloseDay();
  };

  const submitTransaction = () => {
    if (!formClient.trim() || !formAmount) return;
    const projectName = PROJECTS.find(p => p.id === formProjectId)?.name || null;
    addTransaction({
      type: txType, client: formClient, project: txType === 'income' ? projectName : null,
      amount: Number(formAmount), method: formMethod, status: 'paid', date: formDate || TODAY,
      recordedBy: currentUserName, note: txType === 'expense' ? formCategory : formNote,
    });
    closeModal();
  };

  const monthly = monthlySummary(TRANSACTIONS, 6);
  const income = TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const outstanding = PROJECTS.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);

  const filteredTx = TRANSACTIONS.filter(t =>
    t.client.toLowerCase().includes(search.toLowerCase()) ||
    (t.project || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Finance" sub={`${new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} financial overview`} breadcrumb={['Home', 'Finance']}
        actions={
          <div className="flex gap-2">
            <Btn onClick={() => openRecordForm('expense')} variant="outline" size="sm" icon={<TrendingDown size={14} />}>Record Expense</Btn>
            <Btn onClick={() => openRecordForm('income')} variant="primary" size="sm" icon={<Plus size={14} />}>Record Income</Btn>
          </div>
        } />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={fmt(income)} sub="All time" icon={<TrendingUp size={18} />} accent="green" />
        <StatCard label="Total Expenses" value={fmt(expenses)} sub="All time" icon={<TrendingDown size={18} />} accent="red" />
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
          <AreaChart data={monthly}>
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
      <Tabs tabs={['Transactions', 'Outstanding', 'Expenses', 'Daily Closing']} active={tab} onChange={setTab} />

      {/* Search */}
      {tab !== 'Daily Closing' && (
        <div className="max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search transactions..." />
        </div>
      )}

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
          <Table headers={['Project ID', 'Project', 'Client', 'Amount', 'Amount Paid', 'Balance', 'Status', 'Action']}>
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
                  <Btn variant="outline" size="sm" onClick={() => openRecordForm('income', p)}>
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
          <Table headers={['Date', 'Vendor', 'Category', 'Amount', 'Method', 'Recorded By']}>
            {TRANSACTIONS.filter(t => t.type === 'expense').map(t => (
              <tr key={t.id}>
                <Td mono><span className="text-xs">{t.date}</span></Td>
                <Td><span className="text-xs font-semibold text-slate-800">{t.client}</span></Td>
                <Td><span className="text-xs text-slate-500">{t.note || '—'}</span></Td>
                <Td mono><span className="text-sm font-bold text-red-600">-{fmt(t.amount)}</span></Td>
                <Td><span className="text-xs text-slate-500">{t.method}</span></Td>
                <Td><span className="text-xs text-slate-400">{t.recordedBy}</span></Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === 'Daily Closing' && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 font-display mb-1">Close the Day — Secretary Work</h3>
                <p className="text-xs text-slate-500">
                  Record the day's walk-in sales (printing, photocopying, binding, laminating, etc.), the day's expenses,
                  and anyone who bought on credit and still owes. This feeds straight into Transactions above.
                </p>
              </div>
              <Btn onClick={openCloseDay} variant="primary" size="sm" icon={<CalendarCheck size={14} />} className="w-full sm:w-auto justify-center">
                Close the Day
              </Btn>
            </div>
          </Card>

          <Card>
            <Table headers={['Date', 'Time', 'Total Sales', 'Expenses', 'Owed by Creditors', 'Contract?', 'Recorded By', '']}
              empty={DAILY_CLOSINGS.length === 0}>
              {DAILY_CLOSINGS.map(d => {
                const expTotal = d.expenses.reduce((s, e) => s + e.amount, 0);
                const credTotal = d.creditors.reduce((s, c) => s + c.amount, 0);
                return (
                  <tr key={d.id}>
                    <Td mono><span className="text-xs">{d.date}</span></Td>
                    <Td mono><span className="text-xs">{d.time}</span></Td>
                    <Td mono><span className="text-sm font-bold text-green-700">{fmt(d.totalAmount)}</span></Td>
                    <Td mono><span className="text-xs text-red-600 font-semibold">{fmt(expTotal)}</span></Td>
                    <Td mono><span className="text-xs text-amber-700 font-semibold">{fmt(credTotal)}</span></Td>
                    <Td>{d.hasContract ? <Badge status="in-progress" label="Yes" /> : <span className="text-xs text-slate-300">—</span>}</Td>
                    <Td><span className="text-xs text-slate-400">{d.recordedBy}</span></Td>
                    <Td>
                      <button onClick={() => setViewClosingId(d.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <Eye size={14} />
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </Table>
          </Card>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal open={addOpen} onClose={closeModal}
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
          <Input label={txType === 'income' ? 'Client Name' : 'Vendor / Payee'} placeholder="Name" required
            value={formClient} onChange={setFormClient} />
          {txType === 'income' && (
            <Select label="Project" value={formProjectId} onChange={setFormProjectId} options={[
              { label: 'No project', value: '' },
              ...PROJECTS.map(p => ({ label: p.name, value: p.id }))
            ]} />
          )}
          {txType === 'expense' && (
            <Select label="Expense Category" value={formCategory} onChange={setFormCategory}
              options={EXPENSE_CATEGORIES.map(c => ({ label: c, value: c }))} />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Amount (GH₵)" type="number" placeholder="0.00" required
              value={formAmount} onChange={setFormAmount} />
            <Select label="Payment Method" value={formMethod} onChange={setFormMethod} options={[
              { label: 'Mobile Money', value: 'Mobile Money' }, { label: 'Cash', value: 'Cash' },
              { label: 'Bank Transfer', value: 'Bank Transfer' }, { label: 'Cheque', value: 'Cheque' },
            ]} />
          </div>
          <Input label="Date" type="date" value={formDate} onChange={setFormDate} />
          {txType === 'income' && (
            <Textarea label="Note" placeholder="Additional details..." rows={2} value={formNote} onChange={setFormNote} />
          )}
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md" onClick={submitTransaction}>Save Record</Btn>
            <Btn variant="secondary" size="md" onClick={closeModal}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* Close the Day Modal */}
      <Modal open={closeDayOpen} onClose={closeCloseDay} title="Close the Day" width="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Date" type="date" value={closeDayForm.date} onChange={v => setCloseDayForm(f => ({ ...f, date: v }))} />
            <Input label="Time of Record" type="time" value={closeDayForm.time} onChange={v => setCloseDayForm(f => ({ ...f, time: v }))} />
          </div>
          <Input label="Total Amount for the Day (GH₵)" type="number" placeholder="0.00" required
            value={closeDayForm.totalAmount} onChange={v => setCloseDayForm(f => ({ ...f, totalAmount: v }))} />

          {/* Expenses */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">Expenses Today</label>
              <button onClick={() => addLineItem(setCloseDayExpenses)} className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                <Plus size={11} /> Add Expense
              </button>
            </div>
            <div className="space-y-2">
              {closeDayExpenses.map((e, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={e.label} onChange={ev => updateLineItem(closeDayExpenses, setCloseDayExpenses, i, { label: ev.target.value })}
                    placeholder="e.g. Fuel, Ink" className="input-base py-1.5 text-sm flex-1" />
                  <input value={e.amount || ''} onChange={ev => updateLineItem(closeDayExpenses, setCloseDayExpenses, i, { amount: Number(ev.target.value) || 0 })}
                    type="number" placeholder="0.00" className="input-base py-1.5 text-sm w-28" />
                  <button onClick={() => removeLineItem(closeDayExpenses, setCloseDayExpenses, i)} className="text-slate-300 hover:text-red-500 flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Creditors */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">Creditors (bought on credit, still owe)</label>
              <button onClick={() => addLineItem(setCloseDayCreditors)} className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                <Plus size={11} /> Add Creditor
              </button>
            </div>
            <div className="space-y-2">
              {closeDayCreditors.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={c.label} onChange={ev => updateLineItem(closeDayCreditors, setCloseDayCreditors, i, { label: ev.target.value })}
                    placeholder="Creditor name" className="input-base py-1.5 text-sm flex-1" />
                  <input value={c.amount || ''} onChange={ev => updateLineItem(closeDayCreditors, setCloseDayCreditors, i, { amount: Number(ev.target.value) || 0 })}
                    type="number" placeholder="0.00" className="input-base py-1.5 text-sm w-28" />
                  <button onClick={() => removeLineItem(closeDayCreditors, setCloseDayCreditors, i)} className="text-slate-300 hover:text-red-500 flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contract / big project */}
          <div className="bg-slate-50 rounded-lg p-3">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={closeDayForm.hasContract}
                onChange={e => setCloseDayForm(f => ({ ...f, hasContract: e.target.checked }))} className="rounded" />
              <span className="text-sm font-semibold text-slate-700">There was a contract or big project today</span>
            </label>
            {closeDayForm.hasContract && (
              <Textarea label="Contract / Project Note" placeholder="e.g. Signed printing contract with TechGhana Ltd, GH₵ 12,000"
                rows={2} value={closeDayForm.contractNote} onChange={v => setCloseDayForm(f => ({ ...f, contractNote: v }))} />
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md" onClick={submitCloseDay}>Save Day Closing</Btn>
            <Btn variant="secondary" size="md" onClick={closeCloseDay}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* View Closing Detail Modal */}
      <Modal open={!!viewClosing} onClose={() => setViewClosingId(null)} title="Day Closing Details" width="max-w-lg">
        {viewClosing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">Date & Time</p>
                <p className="text-sm font-bold text-slate-800">{viewClosing.date} · {viewClosing.time}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">Recorded By</p>
                <p className="text-sm font-bold text-slate-800">{viewClosing.recordedBy}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">Total Sales</p>
                <p className="text-sm font-bold text-green-700 font-mono">{fmt(viewClosing.totalAmount)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">Total Expenses</p>
                <p className="text-sm font-bold text-red-600 font-mono">{fmt(viewClosing.expenses.reduce((s, e) => s + e.amount, 0))}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Expense Breakdown</p>
              {viewClosing.expenses.length ? (
                <div className="space-y-1">
                  {viewClosing.expenses.map((e, i) => (
                    <div key={i} className="flex justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-slate-600">{e.label}</span>
                      <span className="font-mono font-semibold text-slate-800">{fmt(e.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-300">No expenses recorded.</p>}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Creditors</p>
              {viewClosing.creditors.length ? (
                <div className="space-y-1">
                  {viewClosing.creditors.map((c, i) => (
                    <div key={i} className="flex justify-between text-xs bg-amber-50 rounded-lg px-3 py-2">
                      <span className="text-slate-700 font-medium">{c.label}</span>
                      <span className="font-mono font-semibold text-amber-700">{fmt(c.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-300">No creditors recorded.</p>}
            </div>

            {viewClosing.hasContract && (
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-indigo-700 mb-1">Contract / Big Project</p>
                <p className="text-sm text-slate-700">{viewClosing.contractNote || 'Noted, no details provided.'}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
