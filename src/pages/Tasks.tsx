import React, { useState } from 'react';
import { TASKS } from '../data/mock';
import { Badge, Btn, Card, PageHeader, SearchInput, Tabs, Table, Td, Modal, Input, Select, Textarea } from '../components/ui';
import { Plus, MoreHorizontal } from 'lucide-react';

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

export default function Tasks() {
  const [view, setView] = useState('List');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<typeof TASKS[0] | null>(null);

  const filtered = TASKS.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.project.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Tasks" sub={`${TASKS.length} total tasks`} breadcrumb={['Home', 'Tasks']}
        actions={<Btn onClick={() => setAddOpen(true)} variant="primary" size="sm" icon={<Plus size={14} />}>New Task</Btn>} />

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_COLS.map(s => {
          const count = TASKS.filter(t => t.status === s.id).length;
          return (
            <div key={s.id} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${s.color}`}>
              <span className="text-slate-700">{s.label}</span>
              <span className="text-slate-500">({count})</span>
            </div>
          );
        })}
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
          <Table headers={['Task', 'Project', 'Assigned To', 'Priority', 'Deadline', 'Status', '']}>
            {filtered.map(t => (
              <tr key={t.id} className="cursor-pointer" onClick={() => setDetailTask(t)}>
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
                  <button className="text-slate-300 hover:text-slate-500 transition-colors" onClick={e => e.stopPropagation()}>
                    <MoreHorizontal size={16} />
                  </button>
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
                    <div key={t.id} onClick={() => setDetailTask(t)}
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
      <Modal open={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details" width="max-w-xl">
        {detailTask && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_COLOR[detailTask.priority]}`} />
              <div>
                <h3 className="font-bold text-slate-900 font-display">{detailTask.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{detailTask.project}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <Badge status={detailTask.status} />
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700">{detailTask.description}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Btn variant="primary" size="sm">Update Status</Btn>
              <Btn variant="outline" size="sm">Edit Task</Btn>
              <Btn variant="ghost" size="sm">Add Comment</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Task Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create New Task" width="max-w-xl">
        <div className="space-y-4">
          <Input label="Task Name" placeholder="Enter task name" required />
          <Input label="Project" placeholder="Select or type project name" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Assigned To" options={[
              { label: 'Abena Darko', value: 'abena' },
              { label: 'Yaw Ofori', value: 'yaw' },
              { label: 'Efua Tetteh', value: 'efua' },
              { label: 'Nana Frimpong', value: 'nana' },
            ]} />
            <Select label="Priority" options={[
              { label: 'Urgent', value: 'urgent' }, { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' },
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" />
            <Input label="Deadline" type="date" required />
          </div>
          <Textarea label="Description" placeholder="Task details and requirements..." rows={3} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md">Create Task</Btn>
            <Btn variant="secondary" size="md" onClick={() => setAddOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
