import React, { useState } from 'react';
import { USERS } from '../data/mock';
import { Badge, Btn, Card, PageHeader, SearchInput, Table, Td, Modal, Input, Select, StatCard, Avatar } from '../components/ui';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';

export default function Staff() {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<typeof USERS[0] | null>(null);

  const filtered = USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.dept.toLowerCase().includes(search.toLowerCase()) ||
    u.position.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    owner: 'bg-indigo-100 text-indigo-700', manager: 'bg-purple-100 text-purple-700',
    accountant: 'bg-amber-100 text-amber-700', staff: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Staff Management" sub={`${USERS.length} staff members`} breadcrumb={['Home', 'Staff']}
        actions={<Btn onClick={() => setAddOpen(true)} variant="primary" size="sm" icon={<Plus size={14} />}>Add Staff</Btn>} />

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
            onClick={() => setDetail(user)}>
            <div className="flex items-start gap-3 mb-3">
              <Avatar initials={user.avatar} size="lg" />
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
        <Table headers={['Staff', 'Position', 'Department', 'Role', 'Email', 'Phone', 'Joined', 'Status', '']}>
          {filtered.map(user => (
            <tr key={user.id} className="cursor-pointer" onClick={() => setDetail(user)}>
              <Td>
                <div className="flex items-center gap-2">
                  <Avatar initials={user.avatar} size="sm" />
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
                <button className="text-xs text-indigo-600 font-semibold hover:underline">Edit</button>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Staff Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Staff Profile" width="max-w-lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar initials={detail.avatar} size="lg" />
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

            <div className="grid grid-cols-2 gap-3">
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

            <div className="flex gap-2">
              <Btn variant="primary" size="sm">Edit Profile</Btn>
              <Btn variant="outline" size="sm">View Tasks</Btn>
              <Btn variant="outline" size="sm">View Attendance</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Staff Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Staff Member" width="max-w-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="First name" required />
            <Input label="Last Name" placeholder="Last name" required />
          </div>
          <Input label="Email Address" type="email" placeholder="email@printcraft.gh" required />
          <Input label="Phone Number" placeholder="+233 XX XXX XXXX" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Position / Job Title" placeholder="e.g. Graphic Designer" />
            <Select label="Department" options={[
              { label: 'Design', value: 'design' }, { label: 'Production', value: 'production' },
              { label: 'Photography', value: 'photography' }, { label: 'Sales', value: 'sales' },
              { label: 'Finance', value: 'finance' }, { label: 'Management', value: 'management' },
            ]} />
          </div>
          <Select label="Role" options={[
            { label: 'Staff', value: 'staff' }, { label: 'Accountant', value: 'accountant' },
            { label: 'Manager', value: 'manager' }, { label: 'Owner / Admin', value: 'owner' },
          ]} />
          <Input label="Date Joined" type="date" />
          <div className="flex gap-2 pt-2">
            <Btn variant="primary" size="md">Add Staff Member</Btn>
            <Btn variant="secondary" size="md" onClick={() => setAddOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
