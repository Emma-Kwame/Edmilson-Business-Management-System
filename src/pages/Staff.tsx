import React, { useState } from 'react';
import type { Role } from '../data/mock';
import { useData } from '../store';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, StatCard, Avatar } from '../components/ui';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';

interface StaffProps {
  onNav: (page: string) => void;
  onViewTasks: (staffName: string) => void;
}

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', position: '', dept: 'Design', role: 'staff' as Role, joined: '',
};

export default function Staff({ onNav, onViewTasks }: StaffProps) {
  const { users: USERS, addStaff, updateStaff } = useData();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detailId, setDetailId] = useState<string | null>(null);

  const detail = USERS.find(u => u.id === detailId) || null;

  const filtered = USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.dept.toLowerCase().includes(search.toLowerCase()) ||
    u.position.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    owner: 'bg-indigo-100 text-indigo-700', manager: 'bg-purple-100 text-purple-700',
    accountant: 'bg-amber-100 text-amber-700', staff: 'bg-cyan-100 text-cyan-700',
  };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (u: typeof USERS[0]) => {
    const [firstName, ...rest] = u.name.split(' ');
    setEditingId(u.id);
    setForm({ firstName, lastName: rest.join(' '), email: u.email, phone: u.phone, position: u.position, dept: u.dept, role: u.role, joined: u.joined });
    setDetailId(null);
    setAddOpen(true);
  };
  const closeForm = () => { setAddOpen(false); setEditingId(null); setForm(emptyForm); };

  const submitForm = () => {
    if (!form.firstName.trim() || !form.email.trim()) return;
    const name = `${form.firstName} ${form.lastName}`.trim();
    const avatar = (form.firstName[0] || '').toUpperCase() + (form.lastName[0] || '').toUpperCase();
    if (editingId != null) {
      updateStaff(editingId, { name, email: form.email, phone: form.phone, position: form.position, dept: form.dept, role: form.role });
    } else {
      addStaff({
        name, email: form.email, role: form.role, position: form.position, dept: form.dept,
        avatar: avatar || name.slice(0, 2).toUpperCase(), joined: form.joined || new Date().toISOString().slice(0, 10),
        phone: form.phone, status: 'active',
      });
    }
    closeForm();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Staff Management" sub={`${USERS.length} staff members`} breadcrumb={['Home', 'Staff']}
        actions={<Btn onClick={openCreate} variant="primary" size="sm" icon={<Plus size={14} />}>Add Staff</Btn>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Staff" value={USERS.length} sub="All employees" icon={<Users size={18} />} accent="indigo" />
        <StatCard label="Active" value={USERS.filter(u => u.status === 'active').length} sub="Currently working" icon={<UserCheck size={18} />} accent="green" />
        <StatCard label="Inactive" value={USERS.filter(u => u.status === 'inactive').length} sub="Inactive accounts" icon={<UserX size={18} />} accent="red" />
        <StatCard label="Departments" value={new Set(USERS.map(u => u.dept)).size} sub="Active departments" icon={<Users size={18} />} accent="purple" />
      </div>

      <div className="max-w-xs">
        <SearchInput value={search} onChange={setSearch} placeholder="Search staff..." />
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(user => (
          <Card key={user.id} className="p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all"
            onClick={() => setDetailId(user.id)}>
            <div className="flex items-start gap-3 mb-3">
              <Avatar initials={user.avatar} src={user.avatarUrl} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 font-display truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.position}</p>
                <p className="text-xs text-slate-400">{user.dept}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[user.role]}`}>
                {user.role}
              </span>
              <Badge status={user.status} />
            </div>
          </Card>
        ))}
      </div>

      {/* Staff Table */}
      <Card>
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 font-display">Staff Directory</h3>
        </div>
        <Table headers={['Staff', 'Position', 'Department', 'Role', 'Email', 'Phone', 'Joined', 'Status', '']} empty={filtered.length === 0}>
          {filtered.map(user => (
            <tr key={user.id} className="cursor-pointer" onClick={() => setDetailId(user.id)}>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar initials={user.avatar} src={user.avatarUrl} size="sm" />
                  <span className="text-xs font-semibold text-slate-800">{user.name}</span>
                </div>
              </Td>
              <Td><span className="text-xs text-slate-600">{user.position}</span></Td>
              <Td><span className="text-xs text-slate-500">{user.dept}</span></Td>
              <Td>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[user.role]}`}>
                  {user.role}
                </span>
              </Td>
              <Td mono><span className="text-xs text-slate-500">{user.email}</span></Td>
              <Td mono><span className="text-xs text-slate-500">{user.phone}</span></Td>
              <Td mono><span className="text-xs text-slate-400">{user.joined}</span></Td>
              <Td><Badge status={user.status} /></Td>
              <Td>
                <button className="text-xs text-indigo-600 font-semibold hover:underline" onClick={e => { e.stopPropagation(); openEdit(user); }}>
                  Edit
                </button>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Staff Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title="Staff Profile" width="max-w-lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar initials={detail.avatar} src={detail.avatarUrl} size="lg" />
              <div>
                <h3 className="font-bold text-slate-900 font-display text-lg">{detail.name}</h3>
                <p className="text-sm text-slate-500">{detail.position} · {detail.dept}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    detail.role === 'owner' ? 'bg-indigo-100 text-indigo-700' :
                    detail.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                    detail.role === 'accountant' ? 'bg-amber-100 text-amber-700' :
                    'bg-cyan-100 text-cyan-700'
                  }`}>{detail.role}</span>
                  <Badge status={detail.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Email', val: detail.email },
                { label: 'Phone', val: detail.phone },
                { label: 'Date Joined', val: detail.joined },
                { label: 'Department', val: detail.dept },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-800">{item.val}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Btn variant="primary" size="sm" onClick={() => openEdit(detail)}>Edit Profile</Btn>
              <Btn variant="outline" size="sm" onClick={() => { onViewTasks(detail.name); setDetailId(null); }}>View Tasks</Btn>
              <Btn variant="outline" size="sm" onClick={() => { onNav('attendance'); setDetailId(null); }}>View Attendance</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Staff Modal */}
      <Modal open={addOpen} onClose={closeForm} title={editingId != null ? 'Edit Staff Profile' : 'Add New Staff Member'} width="max-w-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="First Name" placeholder="First name" required value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} />
            <Input label="Last Name" placeholder="Last name" required value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} />
          </div>
          <Input label="Email Address" type="email" placeholder="email@edmilsongp.com" required value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Input label="Phone Number" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Position / Job Title" placeholder="e.g. Graphic Designer" value={form.position} onChange={v => setForm(f => ({ ...f, position: v }))} />
            <Select label="Department" value={form.dept} onChange={v => setForm(f => ({ ...f, dept: v }))} options={[
              { label: 'Design', value: 'Design' }, { label: 'Production', value: 'Production' },
              { label: 'Photography', value: 'Photography' }, { label: 'Sales', value: 'Sales' },
              { label: 'Finance', value: 'Finance' }, { label: 'Management', value: 'Management' },
            ]} />
          </div>
          <Select label="Role" value={form.role} onChange={v => setForm(f => ({ ...f, role: v as Role }))} options={[
            { label: 'Staff', value: 'staff' }, { label: 'Accountant', value: 'accountant' },
            { label: 'Manager', value: 'manager' }, { label: 'Owner / Admin', value: 'owner' },
          ]} />
          <Input label="Date Joined" type="date" value={form.joined} onChange={v => setForm(f => ({ ...f, joined: v }))} />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md" onClick={submitForm}>{editingId != null ? 'Save Changes' : 'Add Staff Member'}</Btn>
            <Btn variant="secondary" size="md" onClick={closeForm}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
