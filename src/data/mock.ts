export type Role = 'staff' | 'accountant' | 'manager' | 'owner';

export const USERS = [
  { id: 1, name: 'Kwame Asante', email: 'kwame@printcraft.gh', role: 'owner' as Role, position: 'Owner & CEO', dept: 'Management', avatar: 'KA', joined: '2019-01-10', phone: '+233 24 123 4567', status: 'active' },
  { id: 2, name: 'Ama Mensah', email: 'ama@printcraft.gh', role: 'manager' as Role, position: 'Operations Manager', dept: 'Operations', avatar: 'AM', joined: '2020-03-15', phone: '+233 27 234 5678', status: 'active' },
  { id: 3, name: 'Kofi Boateng', email: 'kofi@printcraft.gh', role: 'accountant' as Role, position: 'Senior Accountant', dept: 'Finance', avatar: 'KB', joined: '2021-06-01', phone: '+233 20 345 6789', status: 'active' },
  { id: 4, name: 'Abena Darko', email: 'abena@printcraft.gh', role: 'staff' as Role, position: 'Graphic Designer', dept: 'Design', avatar: 'AD', joined: '2022-02-14', phone: '+233 24 456 7890', status: 'active' },
  { id: 5, name: 'Yaw Ofori', email: 'yaw@printcraft.gh', role: 'staff' as Role, position: 'Print Technician', dept: 'Production', avatar: 'YO', joined: '2022-08-20', phone: '+233 26 567 8901', status: 'active' },
  { id: 6, name: 'Efua Tetteh', email: 'efua@printcraft.gh', role: 'staff' as Role, position: 'Photographer', dept: 'Photography', avatar: 'ET', joined: '2023-01-05', phone: '+233 23 678 9012', status: 'active' },
  { id: 7, name: 'Nana Frimpong', email: 'nana@printcraft.gh', role: 'staff' as Role, position: 'Sales Executive', dept: 'Sales', avatar: 'NF', joined: '2023-05-17', phone: '+233 55 789 0123', status: 'active' },
  { id: 8, name: 'Akosua Bediako', email: 'akosua@printcraft.gh', role: 'staff' as Role, position: 'Customer Service', dept: 'Sales', avatar: 'AB', joined: '2024-01-08', phone: '+233 20 890 1234', status: 'inactive' },
];

export const STAFF = USERS.filter(u => u.role === 'staff');

export const ATTENDANCE = [
  { id: 1, staffId: 4, staff: 'Abena Darko', date: '2025-09-18', clockIn: '08:02', clockOut: '17:05', hours: '9h 03m', status: 'present' },
  { id: 2, staffId: 5, staff: 'Yaw Ofori', date: '2025-09-18', clockIn: '08:45', clockOut: '17:00', hours: '8h 15m', status: 'late' },
  { id: 3, staffId: 6, staff: 'Efua Tetteh', date: '2025-09-18', clockIn: null, clockOut: null, hours: '-', status: 'absent' },
  { id: 4, staffId: 7, staff: 'Nana Frimpong', date: '2025-09-18', clockIn: '07:55', clockOut: '17:10', hours: '9h 15m', status: 'present' },
  { id: 5, staffId: 8, staff: 'Akosua Bediako', date: '2025-09-18', clockIn: '08:00', clockOut: '13:00', hours: '5h 00m', status: 'early-departure' },
  { id: 6, staffId: 4, staff: 'Abena Darko', date: '2025-09-17', clockIn: '07:58', clockOut: '17:02', hours: '9h 04m', status: 'present' },
  { id: 7, staffId: 5, staff: 'Yaw Ofori', date: '2025-09-17', clockIn: '09:05', clockOut: '17:00', hours: '7h 55m', status: 'late' },
  { id: 8, staffId: 6, staff: 'Efua Tetteh', date: '2025-09-17', clockIn: '08:00', clockOut: '17:00', hours: '9h 00m', status: 'present' },
];

export const TASKS = [
  { id: 1, name: 'Design wedding invitation cards for Mensah family', project: 'Mensah Wedding Package', assigned: 'Abena Darko', priority: 'urgent', deadline: '2025-09-20', status: 'in-progress', description: 'Create 3 design concepts for 200 wedding invitation cards. Client wants gold and white color scheme.' },
  { id: 2, name: 'Print 500 company brochures for TechGhana Ltd', project: 'TechGhana Corp Branding', assigned: 'Yaw Ofori', priority: 'high', deadline: '2025-09-22', status: 'not-started', description: 'Print A4 tri-fold brochures using gloss paper. 500 copies needed for conference.' },
  { id: 3, name: 'Photography session — Accra Foods product launch', project: 'Accra Foods Campaign', assigned: 'Efua Tetteh', priority: 'high', deadline: '2025-09-19', status: 'in-progress', description: 'Product photography for 12 new food items. Studio setup required.' },
  { id: 4, name: 'Update website banner graphics', project: 'Internal Marketing', assigned: 'Abena Darko', priority: 'medium', deadline: '2025-09-25', status: 'not-started', description: 'Create 3 banner variants for seasonal promotion.' },
  { id: 5, name: 'Laminate and bind 30 training manuals', project: 'GCB Bank Training', assigned: 'Yaw Ofori', priority: 'medium', deadline: '2025-09-18', status: 'completed', description: 'A4 spiral-bound manuals with glossy cover.' },
  { id: 6, name: 'Edit graduation photos for Legon batch', project: 'UG Graduation 2025', assigned: 'Efua Tetteh', priority: 'high', deadline: '2025-09-21', status: 'in-progress', description: 'Edit and retouch 450 individual graduation portraits.' },
  { id: 7, name: 'Prepare invoice and delivery note for StarLife', project: 'StarLife Insurance Flyers', assigned: 'Nana Frimpong', priority: 'low', deadline: '2025-09-24', status: 'completed', description: 'Final billing and delivery confirmation.' },
  { id: 8, name: 'Source PVC card materials for ID project', project: 'MTN Staff ID Cards', assigned: 'Yaw Ofori', priority: 'urgent', deadline: '2025-09-19', status: 'on-hold', description: 'PVC card stock running low. Need to order 2000 cards.' },
  { id: 9, name: 'Design loyalty card for Shoprite', project: 'Shoprite Loyalty Program', assigned: 'Abena Darko', priority: 'medium', deadline: '2025-09-28', status: 'not-started', description: 'PVC loyalty cards with barcode. 5000 units.' },
  { id: 10, name: 'Frame and deliver canvas prints', project: 'Private Client — Ofori Family', assigned: 'Nana Frimpong', priority: 'low', deadline: '2025-09-26', status: 'overdue', description: '4 large canvas prints (A1) for residential delivery.' },
];

export const PROJECTS = [
  { id: 'PRJ-1024', name: 'Mensah Wedding Package', client: 'Ama & Kofi Mensah', budget: 4500, paid: 2000, balance: 2500, status: 'in-progress', priority: 'urgent', start: '2025-09-10', deadline: '2025-09-20', staff: ['Abena Darko', 'Efua Tetteh'], description: 'Full wedding stationery package including invitations, programs, and photo coverage.', category: 'Print + Photography' },
  { id: 'PRJ-1025', name: 'TechGhana Corp Branding', client: 'TechGhana Ltd', budget: 12000, paid: 6000, balance: 6000, status: 'in-progress', priority: 'high', start: '2025-09-01', deadline: '2025-09-30', staff: ['Abena Darko', 'Yaw Ofori', 'Nana Frimpong'], description: 'Complete brand identity refresh including logo, stationery, and print materials.', category: 'Branding + Print' },
  { id: 'PRJ-1026', name: 'Accra Foods Campaign', client: 'Accra Foods Ghana', budget: 8000, paid: 8000, balance: 0, status: 'completed', priority: 'high', start: '2025-08-15', deadline: '2025-09-15', staff: ['Efua Tetteh', 'Abena Darko'], description: 'Product photography and promotional material design for new product line.', category: 'Photography + Design' },
  { id: 'PRJ-1027', name: 'GCB Bank Training', client: 'GCB Bank Ghana', budget: 3200, paid: 3200, balance: 0, status: 'completed', priority: 'medium', start: '2025-09-05', deadline: '2025-09-18', staff: ['Yaw Ofori'], description: 'Print and bind 30 training manuals for staff development program.', category: 'Print' },
  { id: 'PRJ-1028', name: 'UG Graduation 2025', client: 'University of Ghana', budget: 25000, paid: 12500, balance: 12500, status: 'in-progress', priority: 'high', start: '2025-09-12', deadline: '2025-09-25', staff: ['Efua Tetteh', 'Abena Darko', 'Nana Frimpong'], description: 'Graduation ceremony photography and portrait sessions for entire 2025 batch.', category: 'Photography' },
  { id: 'PRJ-1029', name: 'MTN Staff ID Cards', client: 'MTN Ghana', budget: 9500, paid: 4750, balance: 4750, status: 'on-hold', priority: 'urgent', start: '2025-09-08', deadline: '2025-09-22', staff: ['Yaw Ofori'], description: 'Print 2000 PVC staff ID cards with hologram and barcode.', category: 'Print' },
  { id: 'PRJ-1030', name: 'Shoprite Loyalty Program', client: 'Shoprite Ghana', budget: 18000, paid: 0, balance: 18000, status: 'pending', priority: 'medium', start: '2025-10-01', deadline: '2025-10-20', staff: ['Abena Darko', 'Yaw Ofori'], description: '5000 PVC loyalty cards with custom design and barcode encoding.', category: 'Print' },
  { id: 'PRJ-1031', name: 'StarLife Insurance Flyers', client: 'StarLife Assurance', budget: 2800, paid: 2800, balance: 0, status: 'completed', priority: 'low', start: '2025-09-01', deadline: '2025-09-10', staff: ['Yaw Ofori', 'Nana Frimpong'], description: '10,000 A5 full-color promotional flyers.', category: 'Print' },
  { id: 'PRJ-1032', name: 'Private Client — Ofori Family', client: 'Kwabena Ofori', budget: 1200, paid: 600, balance: 600, status: 'overdue', priority: 'low', start: '2025-09-01', deadline: '2025-09-15', staff: ['Efua Tetteh', 'Nana Frimpong'], description: 'Family portrait session and 4 large canvas prints.', category: 'Photography + Print' },
];

export const INVENTORY = [
  { id: 1, name: 'A4 Paper (80gsm)', category: 'Paper', qty: 47, unit: 'Reams', minStock: 20, status: 'in-stock', lastUpdated: '2025-09-17', updatedBy: 'Yaw Ofori', cost: 45 },
  { id: 2, name: 'A3 Paper (80gsm)', category: 'Paper', qty: 12, unit: 'Reams', minStock: 15, status: 'low-stock', lastUpdated: '2025-09-16', updatedBy: 'Yaw Ofori', cost: 85 },
  { id: 3, name: 'Photo Paper (Glossy A4)', category: 'Paper', qty: 8, unit: 'Packs', minStock: 10, status: 'low-stock', lastUpdated: '2025-09-15', updatedBy: 'Yaw Ofori', cost: 120 },
  { id: 4, name: 'PVC Cards (Blank)', category: 'Print Materials', qty: 340, unit: 'Pieces', minStock: 500, status: 'low-stock', lastUpdated: '2025-09-17', updatedBy: 'Yaw Ofori', cost: 2.5 },
  { id: 5, name: 'Binding Wire (A4)', category: 'Binding', qty: 25, unit: 'Boxes', minStock: 10, status: 'in-stock', lastUpdated: '2025-09-10', updatedBy: 'Kofi Boateng', cost: 35 },
  { id: 6, name: 'Laminating Pouches (A4)', category: 'Lamination', qty: 200, unit: 'Pieces', minStock: 100, status: 'in-stock', lastUpdated: '2025-09-12', updatedBy: 'Yaw Ofori', cost: 1.5 },
  { id: 7, name: 'Black Ink Cartridge (HP 950)', category: 'Ink & Toner', qty: 3, unit: 'Units', minStock: 5, status: 'low-stock', lastUpdated: '2025-09-17', updatedBy: 'Yaw Ofori', cost: 320 },
  { id: 8, name: 'Color Ink Cartridge (HP 951)', category: 'Ink & Toner', qty: 0, unit: 'Units', minStock: 3, status: 'out-of-stock', lastUpdated: '2025-09-14', updatedBy: 'Yaw Ofori', cost: 450 },
  { id: 9, name: 'White Envelopes (A4)', category: 'Stationery', qty: 500, unit: 'Pieces', minStock: 200, status: 'in-stock', lastUpdated: '2025-09-08', updatedBy: 'Kofi Boateng', cost: 0.5 },
  { id: 10, name: 'Clear Bags (A4)', category: 'Packaging', qty: 150, unit: 'Pieces', minStock: 100, status: 'in-stock', lastUpdated: '2025-09-10', updatedBy: 'Nana Frimpong', cost: 0.8 },
  { id: 11, name: 'Sticker Paper (A4)', category: 'Paper', qty: 5, unit: 'Packs', minStock: 8, status: 'low-stock', lastUpdated: '2025-09-16', updatedBy: 'Abena Darko', cost: 95 },
  { id: 12, name: 'Canvas (A1 Stretch)', category: 'Print Materials', qty: 22, unit: 'Pieces', minStock: 10, status: 'in-stock', lastUpdated: '2025-09-13', updatedBy: 'Yaw Ofori', cost: 180 },
  { id: 13, name: 'Staple Pins (No. 10)', category: 'Stationery', qty: 30, unit: 'Boxes', minStock: 5, status: 'in-stock', lastUpdated: '2025-09-05', updatedBy: 'Abena Darko', cost: 8 },
  { id: 14, name: 'Toner Cartridge (Samsung)', category: 'Ink & Toner', qty: 2, unit: 'Units', minStock: 2, status: 'low-stock', lastUpdated: '2025-09-15', updatedBy: 'Yaw Ofori', cost: 680 },
];

export const TRANSACTIONS = [
  { id: 'TXN-001', type: 'income', client: 'University of Ghana', project: 'UG Graduation 2025', amount: 12500, method: 'Bank Transfer', status: 'paid', date: '2025-09-17', recordedBy: 'Kofi Boateng', note: 'First installment 50%' },
  { id: 'TXN-002', type: 'expense', client: 'Paper Palace Ltd', project: null, amount: 4250, method: 'Cash', status: 'paid', date: '2025-09-16', recordedBy: 'Kofi Boateng', note: 'Paper and stationery restock' },
  { id: 'TXN-003', type: 'income', client: 'TechGhana Ltd', project: 'TechGhana Corp Branding', amount: 6000, method: 'Mobile Money', status: 'paid', date: '2025-09-15', recordedBy: 'Kofi Boateng', note: '50% deposit received' },
  { id: 'TXN-004', type: 'expense', client: 'GOIL Petrol Station', project: null, amount: 350, method: 'Cash', status: 'paid', date: '2025-09-15', recordedBy: 'Kofi Boateng', note: 'Fuel for delivery vehicle' },
  { id: 'TXN-005', type: 'income', client: 'Ama & Kofi Mensah', project: 'Mensah Wedding Package', amount: 2000, method: 'Mobile Money', status: 'paid', date: '2025-09-14', recordedBy: 'Kofi Boateng', note: 'Wedding package deposit' },
  { id: 'TXN-006', type: 'expense', client: 'PowerNet Ghana', project: null, amount: 1200, method: 'Bank Transfer', status: 'paid', date: '2025-09-12', recordedBy: 'Kofi Boateng', note: 'Monthly electricity bill' },
  { id: 'TXN-007', type: 'income', client: 'MTN Ghana', project: 'MTN Staff ID Cards', amount: 4750, method: 'Bank Transfer', status: 'paid', date: '2025-09-10', recordedBy: 'Kofi Boateng', note: '50% upfront payment' },
  { id: 'TXN-008', type: 'income', client: 'StarLife Assurance', project: 'StarLife Insurance Flyers', amount: 2800, method: 'Cheque', status: 'paid', date: '2025-09-08', recordedBy: 'Kofi Boateng', note: 'Full payment on delivery' },
  { id: 'TXN-009', type: 'income', client: 'GCB Bank Ghana', project: 'GCB Bank Training', amount: 3200, method: 'Bank Transfer', status: 'paid', date: '2025-09-06', recordedBy: 'Kofi Boateng', note: 'Training manuals — full payment' },
  { id: 'TXN-010', type: 'expense', client: 'Office Supplies World', project: null, amount: 890, method: 'Cash', status: 'paid', date: '2025-09-05', recordedBy: 'Kofi Boateng', note: 'Office supplies and binding materials' },
];

export const MONTHLY_REVENUE = [
  { month: 'Apr', revenue: 28400, expenses: 14200, profit: 14200 },
  { month: 'May', revenue: 31500, expenses: 16800, profit: 14700 },
  { month: 'Jun', revenue: 26800, expenses: 13400, profit: 13400 },
  { month: 'Jul', revenue: 34200, expenses: 18500, profit: 15700 },
  { month: 'Aug', revenue: 38900, expenses: 19200, profit: 19700 },
  { month: 'Sep', revenue: 41200, expenses: 21400, profit: 19800 },
];

export const NOTIFICATIONS = [
  { id: 1, title: 'Task Deadline Tomorrow', message: 'Photography session for Accra Foods Campaign is due tomorrow at 9:00 AM.', type: 'task', read: false, time: '2 min ago', icon: '📋' },
  { id: 2, title: 'Low Stock Alert', message: 'A4 Photo Paper (Glossy) is below minimum stock level. Current: 8 packs, Minimum: 10 packs.', type: 'inventory', read: false, time: '15 min ago', icon: '📦' },
  { id: 3, title: 'Payment Received', message: 'Payment of GH₵ 12,500 received from University of Ghana for UG Graduation 2025.', type: 'finance', read: false, time: '2 hours ago', icon: '💰' },
  { id: 4, title: 'Project Overdue', message: 'Project PRJ-1032 (Private Client — Ofori Family) is overdue by 3 days.', type: 'project', read: true, time: '5 hours ago', icon: '🚨' },
  { id: 5, title: 'Staff Clocked In', message: 'Yaw Ofori clocked in at 08:45 AM — marked as Late.', type: 'attendance', read: true, time: '8 hours ago', icon: '🕐' },
  { id: 6, title: 'Color Ink Out of Stock', message: 'HP 951 Color Ink Cartridge is now out of stock. Reorder immediately.', type: 'inventory', read: true, time: '1 day ago', icon: '📦' },
  { id: 7, title: 'New Task Assigned', message: 'Manager Ama Mensah assigned you to "Design loyalty card for Shoprite".', type: 'task', read: true, time: '1 day ago', icon: '📋' },
  { id: 8, title: 'System Maintenance', message: 'Scheduled system maintenance on Sunday 21 Sep at 2:00 AM. Downtime: ~30 minutes.', type: 'system', read: true, time: '2 days ago', icon: '⚙️' },
];

export const AUDIT_LOGS = [
  { id: 1, user: 'Kofi Boateng', action: 'Recorded payment of GH₵ 12,500 from University of Ghana', module: 'Finance', date: '2025-09-17', time: '14:32', ip: '192.168.1.45' },
  { id: 2, user: 'Yaw Ofori', action: 'Updated A4 Paper stock: 50 → 47 reams (used for TechGhana brochures)', module: 'Inventory', date: '2025-09-17', time: '11:15', ip: '192.168.1.32' },
  { id: 3, user: 'Ama Mensah', action: 'Assigned task "Source PVC card materials" to Yaw Ofori', module: 'Tasks', date: '2025-09-17', time: '09:45', ip: '192.168.1.28' },
  { id: 4, user: 'Abena Darko', action: 'Updated task status: "Design wedding invitation cards" → In Progress', module: 'Tasks', date: '2025-09-17', time: '08:58', ip: '192.168.1.51' },
  { id: 5, user: 'Kwame Asante', action: 'Created project PRJ-1030: Shoprite Loyalty Program', module: 'Projects', date: '2025-09-16', time: '16:20', ip: '192.168.1.10' },
  { id: 6, user: 'Kofi Boateng', action: 'Recorded expense of GH₵ 4,250 for paper and stationery restock', module: 'Finance', date: '2025-09-16', time: '15:05', ip: '192.168.1.45' },
  { id: 7, user: 'Ama Mensah', action: 'Changed project status: MTN Staff ID Cards → On Hold', module: 'Projects', date: '2025-09-16', time: '11:30', ip: '192.168.1.28' },
  { id: 8, user: 'Efua Tetteh', action: 'Clocked in at 08:00 AM', module: 'Attendance', date: '2025-09-16', time: '08:00', ip: '192.168.1.62' },
];

export const ATTENDANCE_CHART = [
  { day: 'Mon', present: 5, late: 1, absent: 1 },
  { day: 'Tue', present: 6, late: 0, absent: 1 },
  { day: 'Wed', present: 4, late: 2, absent: 1 },
  { day: 'Thu', present: 6, late: 1, absent: 0 },
  { day: 'Fri', present: 5, late: 1, absent: 1 },
];

export const PROJECT_STATUS_DATA = [
  { name: 'In Progress', value: 3, color: '#4F46E5' },
  { name: 'Completed', value: 3, color: '#10B981' },
  { name: 'On Hold', value: 1, color: '#F59E0B' },
  { name: 'Overdue', value: 1, color: '#EF4444' },
  { name: 'Pending', value: 1, color: '#64748B' },
];

export const EXPENSES_DATA = [
  { category: 'Materials', amount: 5140 },
  { category: 'Utilities', amount: 1200 },
  { category: 'Transport', amount: 350 },
  { category: 'Office', amount: 890 },
  { category: 'Other', amount: 420 },
];
