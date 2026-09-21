import React, { useState } from 'react';
import type { Role } from '../data/mock';
import { useData } from '../store';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, Textarea, StatCard, ProgressBar } from '../components/ui';
import { Plus, FolderKanban, CheckCircle, AlertTriangle, Clock, Briefcase } from 'lucide-react';

const fmt = (n: number) => `GH₵ ${n.toLocaleString()}`;

interface ProjectsProps {
  role: Role;
  onViewTasks: (projectName: string) => void;
  onRecordPayment: (payload: { projectId: string; client: string; amount: number }) => void;
}

const emptyForm = {
  name: '', client: '', description: '', amount: '', priority: 'medium',
  start: '', deadline: '', category: 'print',
};

export default function Projects({ role, onViewTasks, onRecordPayment }: ProjectsProps) {
  const { projects: PROJECTS, addProject, updateProject, currentUserName } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detailId, setDetailId] = useState<string | null>(null);
  const isStaff = role === 'staff';

  const detail = PROJECTS.find(p => p.id === detailId) || null;

  const filtered = PROJECTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (p: typeof PROJECTS[0]) => {
    setEditingId(p.id);
    setForm({
      name: p.name, client: p.client, description: p.description, amount: String(p.budget),
      priority: p.priority, start: p.start, deadline: p.deadline, category: p.category,
    });
    setDetailId(null);
    setAddOpen(true);
  };
  const closeForm = () => { setAddOpen(false); setEditingId(null); setForm(emptyForm); };

  const submitForm = () => {
    if (!form.name.trim() || !form.client.trim()) return;
    const budget = Number(form.amount) || 0;
    if (editingId != null) {
      const existing = PROJECTS.find(p => p.id === editingId);
      const balance = existing ? Math.max(0, budget - existing.paid) : budget;
      updateProject(editingId, {
        name: form.name, client: form.client, description: form.description, budget,
        balance, priority: form.priority, start: form.start, deadline: form.deadline, category: form.category,
      });
    } else {
      addProject({
        name: form.name, client: form.client, description: form.description, budget,
        status: 'pending', priority: form.priority, start: form.start || 'TBD', deadline: form.deadline || 'TBD',
        staff: [], category: form.category,
      });
    }
    closeForm();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Projects" sub={`${PROJECTS.length} total projects`} breadcrumb={['Home', 'Projects']}
        actions={<Btn onClick={openCreate} variant="primary" size="sm" icon={<Plus size={14} />}>New Project</Btn>} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active" value={PROJECTS.filter(p => p.status === 'in-progress').length} sub="In progress"
          icon={<FolderKanban size={18} />} accent="indigo" />
        <StatCard label="Completed" value={PROJECTS.filter(p => p.status === 'completed').length} sub="This month"
          icon={<CheckCircle size={18} />} accent="green" />
        <StatCard label="Overdue" value={PROJECTS.filter(p => p.status === 'overdue').length} sub="Past deadline"
          icon={<AlertTriangle size={18} />} accent="red" />
        {isStaff ? (
          <StatCard label="My Projects" value={PROJECTS.filter(p => p.staff.includes(currentUserName)).length} sub="Assigned to you"
            icon={<Briefcase size={18} />} accent="purple" />
        ) : (
          <StatCard label="Total Value" value={fmt(PROJECTS.reduce((s, p) => s + p.budget, 0))} sub="All projects"
            icon={<Clock size={18} />} accent="purple" />
        )}
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
        <Table headers={['Project', 'Client', 'Category', 'Amount', 'Paid', 'Balance', 'Deadline', 'Priority', 'Status', '']} empty={filtered.length === 0}>
          {filtered.map(p => (
            <tr key={p.id} className="cursor-pointer" onClick={() => setDetailId(p.id)}>
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
                <button className="text-xs text-indigo-600 font-semibold hover:underline" onClick={e => { e.stopPropagation(); setDetailId(p.id); }}>
                  View
                </button>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Project Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title="Project Details" width="max-w-2xl">
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
                { label: 'Amount', val: fmt(detail.budget), color: 'text-slate-800' },
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
              <ProgressBar value={detail.paid} max={detail.budget || 1}
                color={detail.paid >= detail.budget ? 'green' : detail.status === 'overdue' ? 'red' : 'indigo'} />
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700">{detail.description || 'No description provided.'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Assigned Staff</p>
              <div className="flex flex-wrap gap-2">
                {detail.staff.length ? detail.staff.map(s => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
                    {s}
                  </span>
                )) : <span className="text-xs text-slate-400">No staff assigned yet.</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-600">Start Date:</span> {detail.start}
              </div>
              <div>
                <span className="font-semibold text-slate-600">Deadline:</span> {detail.deadline}
              </div>
            </div>

            <div className="flex gap-2 pt-2 flex-wrap">
              <Btn variant="primary" size="sm" onClick={() => openEdit(detail)}>Edit Project</Btn>
              <Btn variant="outline" size="sm" onClick={() => { onViewTasks(detail.name); setDetailId(null); }}>View Tasks</Btn>
              {!isStaff && (
                <Btn variant="outline" size="sm" onClick={() => {
                  onRecordPayment({ projectId: detail.id, client: detail.client, amount: detail.balance });
                  setDetailId(null);
                }}>Record Payment</Btn>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Project Modal */}
      <Modal open={addOpen} onClose={closeForm} title={editingId != null ? 'Edit Project' : 'Create New Project'} width="max-w-xl">
        <div className="space-y-4">
          <Input label="Project Name" placeholder="Enter project name" required value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Input label="Client Name" placeholder="Client or company name" required value={form.client} onChange={v => setForm(f => ({ ...f, client: v }))} />
          <Textarea label="Description" placeholder="Project details, requirements, deliverables..." rows={3}
            value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Amount (GH₵)" type="number" placeholder="0.00" value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} />
            <Select label="Priority" value={form.priority} onChange={v => setForm(f => ({ ...f, priority: v }))} options={[
              { label: 'Urgent', value: 'urgent' }, { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' },
            ]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.start} onChange={v => setForm(f => ({ ...f, start: v }))} />
            <Input label="Deadline" type="date" required value={form.deadline} onChange={v => setForm(f => ({ ...f, deadline: v }))} />
          </div>
          <Select label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} options={[
            { label: 'Print', value: 'print' }, { label: 'Photography', value: 'photo' },
            { label: 'Design', value: 'design' }, { label: 'Branding', value: 'branding' },
            { label: 'Print + Photography', value: 'print-photo' }, { label: 'Other', value: 'other' },
          ]} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md" onClick={submitForm}>{editingId != null ? 'Save Changes' : 'Create Project'}</Btn>
            <Btn variant="secondary" size="md" onClick={closeForm}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
