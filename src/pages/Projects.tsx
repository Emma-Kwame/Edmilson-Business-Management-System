import React, { useState } from 'react';
import { PROJECTS } from '../data/mock';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, Textarea, StatCard, ProgressBar } from '../components/ui';
import { Plus, FolderKanban, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`;

export default function Projects() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<typeof PROJECTS[0] | null>(null);

  const filtered = PROJECTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Projects" sub={`${PROJECTS.length} total projects`} breadcrumb={['Home', 'Projects']}
        actions={<Btn onClick={() => setAddOpen(true)} variant="primary" size="sm" icon={<Plus size={14} />}>New Project</Btn>} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active" value={PROJECTS.filter(p => p.status === 'in-progress').length} sub="In progress"
          icon={<FolderKanban size={18} />} accent="indigo" />
        <StatCard label="Completed" value={PROJECTS.filter(p => p.status === 'completed').length} sub="This month"
          icon={<CheckCircle size={18} />} accent="green" />
        <StatCard label="Overdue" value={PROJECTS.filter(p => p.status === 'overdue').length} sub="Past deadline"
          icon={<AlertTriangle size={18} />} accent="red" />
        <StatCard label="Total Value" value={fmt(PROJECTS.reduce((s, p) => s + p.budget, 0))} sub="All projects"
          icon={<Clock size={18} />} accent="purple" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search projects or clients..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-base w-auto py-1.5 text-sm">
          <option value="all">All Statuses</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <Table headers={['Project', 'Client', 'Category', 'Budget', 'Paid', 'Balance', 'Deadline', 'Priority', 'Status', '']}>
          {filtered.map(p => (
            <tr key={p.id} className="cursor-pointer" onClick={() => setDetail(p)}>
              <Td>
                <div>
                  <p className="text-xs font-bold text-indigo-600 font-mono">{p.id}</p>
                  <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                </div>
              </Td>
              <Td><span className="text-xs text-slate-600">{p.client}</span></Td>
              <Td><span className="text-xs text-slate-500">{p.category}</span></Td>
              <Td mono><span className="text-xs font-semibold text-slate-700">{fmt(p.budget)}</span></Td>
              <Td mono><span className="text-xs text-green-700 font-semibold">{fmt(p.paid)}</span></Td>
              <Td mono>
                <span className={`text-xs font-bold ${p.balance > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {fmt(p.balance)}
                </span>
              </Td>
              <Td mono><span className="text-xs">{p.deadline}</span></Td>
              <Td><Badge status={p.priority} /></Td>
              <Td><Badge status={p.status} /></Td>
              <Td>
                <button className="text-xs text-indigo-600 font-semibold hover:underline" onClick={e => { e.stopPropagation(); setDetail(p); }}>
                  View
                </button>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Project Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Project Details" width="max-w-2xl">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-indigo-600 font-bold mb-1">{detail.id}</p>
                <h3 className="text-lg font-bold text-slate-900 font-display">{detail.name}</h3>
                <p className="text-sm text-slate-500">{detail.client} · {detail.category}</p>
              </div>
              <div className="flex gap-2">
                <Badge status={detail.priority} />
                <Badge status={detail.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Budget', val: fmt(detail.budget), color: 'text-slate-800' },
                { label: 'Paid', val: fmt(detail.paid), color: 'text-green-700' },
                { label: 'Balance', val: fmt(detail.balance), color: 'text-red-600' },
                { label: 'Deadline', val: detail.deadline, color: 'text-slate-800' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                  <p className={`text-sm font-bold font-mono ${item.color}`}>{item.val}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Payment Progress</p>
              <ProgressBar value={detail.paid} max={detail.budget}
                color={detail.paid === detail.budget ? 'green' : detail.status === 'overdue' ? 'red' : 'indigo'} />
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700">{detail.description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Assigned Staff</p>
              <div className="flex flex-wrap gap-2">
                {detail.staff.map(s => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-600">Start Date:</span> {detail.start}
              </div>
              <div>
                <span className="font-semibold text-slate-600">Deadline:</span> {detail.deadline}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="primary" size="sm">Edit Project</Btn>
              <Btn variant="outline" size="sm">View Tasks</Btn>
              <Btn variant="outline" size="sm">Record Payment</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Project Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create New Project" width="max-w-xl">
        <div className="space-y-4">
          <Input label="Project Name" placeholder="Enter project name" required />
          <Input label="Client Name" placeholder="Client or company name" required />
          <Textarea label="Description" placeholder="Project details, requirements, deliverables..." rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Budget (GH₵)" type="number" placeholder="0.00" />
            <Select label="Priority" options={[
              { label: 'Urgent', value: 'urgent' }, { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' },
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" />
            <Input label="Deadline" type="date" required />
          </div>
          <Select label="Category" options={[
            { label: 'Print', value: 'print' }, { label: 'Photography', value: 'photo' },
            { label: 'Design', value: 'design' }, { label: 'Branding', value: 'branding' },
            { label: 'Print + Photography', value: 'print-photo' }, { label: 'Other', value: 'other' },
          ]} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md">Create Project</Btn>
            <Btn variant="secondary" size="md" onClick={() => setAddOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
