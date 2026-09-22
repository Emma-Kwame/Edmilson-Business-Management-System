import React, { useState } from 'react';
import type { Role } from '../data/mock';
import { useData } from '../store';
import { Badge, Btn, Card, PageHeader, SearchInput, Tabs, Table, Td, Modal, Input, Select, Textarea } from '../components/ui';
import { Plus, MoreHorizontal, Lock, CheckCircle, Eye } from 'lucide-react';

const STATUS_COLS = [
  { id: 'not-started', label: 'Not Started', color: 'bg-slate-100 border-slate-200' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'on-hold', label: 'On Hold', color: 'bg-amber-50 border-amber-200' },
  { id: 'completed', label: 'Completed', color: 'bg-green-50 border-green-200' },
  { id: 'overdue', label: 'Overdue', color: 'bg-red-50 border-red-200' },
];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-amber-400', low: 'bg-slate-300',
};

const emptyForm = {
  name: '', project: '', assigned: '', priority: 'medium',
  start: '', deadline: '', description: '',
};

export default function Tasks({ role, initialProjectFilter }: { role: Role; initialProjectFilter?: string }) {
  const { tasks: TASKS, users: USERS, addTask, updateTask, taskComments, addComment, currentUserName } = useData();
  const staffOptions = USERS.map(u => ({ label: u.name, value: u.name }));
  const [view, setView] = useState('List');
  const [search, setSearch] = useState(initialProjectFilter || '');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const canAssign = role === 'manager' || role === 'owner' || role === 'accountant';

  const detailTask = TASKS.find(t => t.id === detailTaskId) || null;

  const filtered = TASKS.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(q) ||
      t.project.toLowerCase().includes(q) || t.assigned.toLowerCase().includes(q);
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm, assigned: canAssign ? '' : currentUserName }); setAddOpen(true); };
  const openEdit = (t: typeof TASKS[0]) => {
    setEditingId(t.id);
    setForm({ name: t.name, project: t.project, assigned: t.assigned, priority: t.priority, start: '', deadline: t.deadline, description: t.description });
    setDetailTaskId(null);
    setAddOpen(true);
  };
  const closeForm = () => { setAddOpen(false); setEditingId(null); setForm(emptyForm); };

  const submitForm = () => {
    if (!form.name.trim()) return;
    if (editingId != null) {
      updateTask(editingId, {
        name: form.name, project: form.project || 'Unassigned', assigned: form.assigned || currentUserName,
        priority: form.priority, deadline: form.deadline || 'TBD', description: form.description,
      });
    } else {
      addTask({
        name: form.name, project: form.project || 'Unassigned', assigned: canAssign ? (form.assigned || currentUserName) : currentUserName,
        priority: form.priority, deadline: form.deadline || 'TBD', status: 'not-started', description: form.description,
      });
    }
    closeForm();
  };

  const postComment = () => {
    if (!commentDraft.trim() || detailTaskId == null) return;
    addComment(detailTaskId, commentDraft.trim());
    setCommentDraft('');
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Tasks" sub={`${TASKS.length} total tasks`} breadcrumb={['Home', 'Tasks']}
        actions={<Btn onClick={openCreate} variant="primary" size="sm" icon={<Plus size={14} />}>{canAssign ? 'New Task' : 'Log My Task'}</Btn>} />

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_COLS.map(s => {
          const count = TASKS.filter(t => t.status === s.id).length;
          const isActive = filterStatus === s.id;
          return (
            <button key={s.id}
              onClick={() => setFilterStatus(isActive ? 'all' : s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${s.color} ${
                isActive ? 'ring-2 ring-indigo-400 border-indigo-300' : 'hover:shadow-sm'
              }`}>
              <span className="text-slate-700">{s.label}</span>
              <span className="text-slate-500">({count})</span>
            </button>
          );
        })}
        {filterStatus !== 'all' && (
          <button onClick={() => setFilterStatus('all')}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-indigo-600 hover:underline">
            Clear filter
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-xs">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="input-base w-auto py-1.5 text-sm">
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Tabs tabs={['List', 'Board']} active={view} onChange={setView} />
      </div>

      {/* List View */}
      {view === 'List' && (
        <Card>
          <Table headers={['Task', 'Project', 'Assigned To', 'Priority', 'Deadline', 'Status', '']} empty={filtered.length === 0}>
            {filtered.map(t => (
              <tr key={t.id} className="cursor-pointer" onClick={() => setDetailTaskId(t.id)}>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[t.priority]}`} />
                    <p className="text-xs font-semibold text-slate-800 max-w-[220px] truncate">{t.name}</p>
                  </div>
                </Td>
                <Td><span className="text-xs text-slate-500 truncate max-w-[120px] block">{t.project}</span></Td>
                <Td><span className="text-xs text-slate-600">{t.assigned}</span></Td>
                <Td><Badge status={t.priority} /></Td>
                <Td mono><span className="text-xs">{t.deadline}</span></Td>
                <Td><Badge status={t.status} /></Td>
                <Td>
                  <div className="relative">
                    <button className="text-slate-300 hover:text-slate-500 transition-colors"
                      onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id); }}>
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === t.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setOpenMenuId(null); }} />
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-20"
                          onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setDetailTaskId(t.id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">
                            <Eye size={13} /> View Details
                          </button>
                          {t.status !== 'completed' && (
                            <button onClick={() => { updateTask(t.id, { status: 'completed' }); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-700 hover:bg-green-50">
                              <CheckCircle size={13} /> Mark Completed
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Board View */}
      {view === 'Board' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLS.map(col => {
            const colTasks = filtered.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="flex-shrink-0 w-64 kanban-col">
                <div className={`rounded-t-xl px-3 py-2.5 border-t border-x ${col.color}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{col.label}</p>
                    <span className="text-xs font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-full border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>
                </div>
                <div className={`rounded-b-xl border-b border-x ${col.color} p-2 space-y-2 min-h-[60px]`}>
                  {colTasks.map(t => (
                    <div key={t.id} onClick={() => setDetailTaskId(t.id)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all">
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_COLOR[t.priority]}`} />
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{t.name}</p>
                      </div>
                      <p className="text-xs text-slate-400 mb-2 ml-3.5">{t.project}</p>
                      <div className="flex items-center justify-between ml-3.5">
                        <Badge status={t.priority} />
                        <span className="text-xs text-slate-400 font-mono">{t.deadline}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 ml-3.5">{t.assigned}</p>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-xs text-slate-300 text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      <Modal open={!!detailTask} onClose={() => setDetailTaskId(null)} title="Task Details" width="max-w-xl">
        {detailTask && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_COLOR[detailTask.priority]}`} />
              <div>
                <h3 className="font-bold text-slate-900 font-display">{detailTask.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{detailTask.project}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-slate-800">{detailTask.assigned}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Deadline</p>
                <p className="text-sm font-semibold text-slate-800 font-mono">{detailTask.deadline}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Priority</p>
                <Badge status={detailTask.priority} />
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1.5">Status</p>
                <select value={detailTask.status} onChange={e => updateTask(detailTask.id, { status: e.target.value })}
                  className="input-base py-1 text-xs w-auto">
                  {STATUS_COLS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700">{detailTask.description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Comments {taskComments[detailTask.id]?.length ? `(${taskComments[detailTask.id].length})` : ''}
              </p>
              <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                {(taskComments[detailTask.id] || []).map(c => (
                  <div key={c.id} className="bg-slate-50 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-slate-800">{c.author}</span>
                      <span className="text-xs text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-xs text-slate-600">{c.text}</p>
                  </div>
                ))}
                {!(taskComments[detailTask.id] || []).length && (
                  <p className="text-xs text-slate-300">No comments yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input value={commentDraft} onChange={e => setCommentDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && postComment()}
                  placeholder="Add a comment..." className="input-base py-1.5 text-sm flex-1" />
                <Btn variant="secondary" size="sm" onClick={postComment}>Post</Btn>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Btn variant="outline" size="sm" onClick={() => openEdit(detailTask)}>Edit Task</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Task Modal */}
      <Modal open={addOpen} onClose={closeForm}
        title={editingId != null ? 'Edit Task' : canAssign ? 'Create New Task' : 'Log My Task'} width="max-w-xl">
        <div className="space-y-4">
          {!canAssign && editingId == null && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500">
              <Lock size={12} className="flex-shrink-0" />
              Only Managers and the Owner can assign tasks to other staff. This task will be logged under your own name.
            </div>
          )}
          <Input label="Task Name" placeholder="Enter task name" required value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Input label="Project" placeholder="Select or type project name" value={form.project} onChange={v => setForm(f => ({ ...f, project: v }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {canAssign ? (
              <Select label="Assigned To" value={form.assigned} onChange={v => setForm(f => ({ ...f, assigned: v }))} options={staffOptions} />
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Assigned To</label>
                <div className="input-base bg-slate-50 text-slate-500 flex items-center gap-1.5">
                  <Lock size={12} /> {currentUserName} (You)
                </div>
              </div>
            )}
            <Select label="Priority" value={form.priority} onChange={v => setForm(f => ({ ...f, priority: v }))} options={[
              { label: 'Urgent', value: 'urgent' }, { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' },
            ]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.start} onChange={v => setForm(f => ({ ...f, start: v }))} />
            <Input label="Deadline" type="date" required value={form.deadline} onChange={v => setForm(f => ({ ...f, deadline: v }))} />
          </div>
          <Textarea label="Description" placeholder="Task details and requirements..." rows={3}
            value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md" onClick={submitForm}>{editingId != null ? 'Save Changes' : 'Create Task'}</Btn>
            <Btn variant="secondary" size="md" onClick={closeForm}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
