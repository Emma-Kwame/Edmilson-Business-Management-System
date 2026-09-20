Design and build a complete, professional, responsive web application called:

BUSINESS MANAGEMENT SYSTEM

The system is designed for a printing, graphics, photography, and creative-services business.

The application should help the business manage:
- Staff
- Attendance
- Projects
- Tasks
- Inventory/stock
- Sales
- Expenses
- Payments
- Deadlines
- Notifications
- Reports
- Business analytics
- User permissions
- Audit logs

The system must be designed as a real production-ready SaaS-style business application, not a simple mockup.

==================================================
1. DESIGN DIRECTION
==================================================

Create a modern, clean, professional dashboard interface.

Design style:
- Modern SaaS dashboard
- Clean and minimal
- Professional business appearance
- Excellent spacing
- Clear typography
- Responsive layout
- Desktop-first but fully responsive for tablet and mobile
- Accessible color contrast
- Clear visual hierarchy
- Use cards, tables, charts, badges, modals, forms and data visualizations
- Avoid excessive decoration
- Prioritize usability and information density

Use a consistent design system throughout the application.

Create:
- Color system
- Typography system
- Spacing system
- Buttons
- Inputs
- Dropdowns
- Tables
- Cards
- Badges
- Modals
- Toast notifications
- Tabs
- Pagination
- Breadcrumbs
- Navigation components
- Empty states
- Loading states
- Error states
- Confirmation dialogs

==================================================
2. USER ROLES
==================================================

The system has four major user roles:

1. STAFF
2. ACCOUNTANT
3. MANAGER
4. OWNER / ADMIN

Each role must have its own dashboard and permissions.

The interface should dynamically show only features that the logged-in user has permission to access.

==================================================
3. AUTHENTICATION SCREENS
==================================================

Create the following screens:

01. Login
02. Forgot Password
03. Reset Password
04. Email/OTP Verification
05. First-Time Account Setup
06. Profile Setup
07. Unauthorized Access
08. Session Expired

Login should include:
- Company logo
- Email/username
- Password
- Remember me
- Forgot password
- Login button
- Optional Google login
- Error states

==================================================
4. GLOBAL APPLICATION LAYOUT
==================================================

Create a reusable application layout consisting of:

LEFT SIDEBAR:
- Dashboard
- Attendance
- Tasks
- Projects
- Inventory
- Finance
- Reports
- Notifications
- Staff
- Settings

TOP NAVIGATION:
- Search
- Notifications
- Help
- User profile
- Role indicator

MAIN CONTENT:
- Breadcrumbs
- Page title
- Page actions
- Dashboard content

The sidebar must change based on the user's role.

==================================================
5. STAFF DASHBOARD
==================================================

Create a Staff Dashboard.

Dashboard cards:

- Today's Attendance
- Clock-in Time
- Clock-out Time
- Hours Worked
- My Tasks
- Pending Tasks
- Completed Tasks
- Upcoming Deadlines

Dashboard sections:

A. Attendance
Show:
- Clock In button
- Clock Out button
- Current status
- Today's working duration

B. My Tasks
Table:
- Task
- Project
- Priority
- Deadline
- Status

C. Upcoming Deadlines

D. Recent Activity

E. Notifications

==================================================
6. STAFF ATTENDANCE
==================================================

Create:

01. Attendance dashboard
02. Clock-in screen
03. Clock-out confirmation
04. Attendance history
05. Monthly attendance calendar
06. Attendance details

Show:
- Date
- Clock in
- Clock out
- Total hours
- Status
- Late indicator

Statuses:
- Present
- Late
- Absent
- Early departure
- On leave

==================================================
7. TASK MANAGEMENT
==================================================

Create:

01. My Tasks
02. Task details
03. Task creation
04. Task editing
05. Task assignment
06. Task board
07. Task calendar
08. Task activity/history

Task fields:
- Task name
- Description
- Project
- Assigned staff
- Priority
- Start date
- Deadline
- Status
- Attachments
- Comments

Statuses:

NOT STARTED
IN PROGRESS
ON HOLD
COMPLETED
OVERDUE

Priorities:

LOW
MEDIUM
HIGH
URGENT

Create both:
- List view
- Kanban board view

==================================================
8. PROJECT MANAGEMENT
==================================================

Create:

01. Projects dashboard
02. All projects
03. Project details
04. Create project
05. Edit project
06. Project timeline
07. Project tasks
08. Project files
09. Project activity
10. Completed projects
11. Overdue projects

Project information:

- Project name
- Client
- Project description
- Assigned staff
- Start date
- Deadline
- Status
- Priority
- Budget
- Amount paid
- Balance
- Materials required
- Files
- Notes

Project statuses:

DRAFT
PENDING
IN PROGRESS
ON HOLD
COMPLETED
CANCELLED
OVERDUE

==================================================
9. INVENTORY / STOCK MANAGEMENT
==================================================

Create a complete inventory management interface.

Screens:

01. Inventory dashboard
02. All inventory
03. Inventory item details
04. Add inventory item
05. Edit inventory item
06. Add stock
07. Remove stock
08. Stock transaction history
09. Low-stock items
10. Inventory reports

Example inventory:

- A4 paper
- A3 paper
- Photo paper
- Binding materials
- Clear bags
- White envelopes
- Staple pins
- Wedding invitation materials
- Frames
- PVC cards
- Stickers
- Ink
- Toner
- Printing materials

Inventory table columns:

- Item
- Category
- Quantity
- Unit
- Minimum stock
- Status
- Last updated
- Updated by
- Actions

Stock statuses:

IN STOCK
LOW STOCK
OUT OF STOCK

Create a prominent low-stock warning system.

When removing stock, require:

- Item
- Quantity
- Reason
- Related project
- Staff member
- Date/time

==================================================
10. INVENTORY TRANSACTION HISTORY
==================================================

Create a detailed transaction screen.

Example:

A4 Paper

Previous quantity: 20
Used: 3
New quantity: 17

Record:
- User
- Date
- Time
- Reason
- Project
- Transaction type

Transaction types:

STOCK ADDED
STOCK USED
STOCK ADJUSTMENT
RETURNED
DAMAGED

==================================================
11. ACCOUNTANT DASHBOARD
==================================================

Create an Accountant Dashboard.

Cards:

- Today's Sales
- Monthly Sales
- Expenses
- Outstanding Payments
- Total Revenue
- Net Income

Charts:

- Revenue over time
- Expenses over time
- Revenue vs expenses
- Payment status

Tables:

- Recent transactions
- Outstanding invoices
- Recent expenses

==================================================
12. FINANCE MANAGEMENT
==================================================

Create:

01. Finance dashboard
02. Sales
03. Expenses
04. Payments
05. Outstanding payments
06. Transactions
07. Invoices
08. Invoice details
09. Financial reports

Sales fields:

- Client
- Project
- Amount
- Payment method
- Payment status
- Date
- Recorded by

Expenses:

- Expense name
- Category
- Amount
- Date
- Description
- Recorded by

Payment statuses:

PAID
PARTIALLY PAID
PENDING
OVERDUE

==================================================
13. MANAGER DASHBOARD
==================================================

Create a powerful Manager Dashboard.

Show:

- Staff currently present
- Staff absent
- Active projects
- Pending projects
- Overdue projects
- Tasks due today
- Low stock items
- Today's sales
- Outstanding payments

Create charts for:

- Project progress
- Staff attendance
- Task completion
- Inventory status

Add sections:

- Staff activity
- Recent projects
- Upcoming deadlines
- Low-stock alerts
- Recent transactions

==================================================
14. STAFF MANAGEMENT
==================================================

Create:

01. Staff directory
02. Staff profile
03. Add staff
04. Edit staff
05. Staff performance
06. Staff attendance
07. Staff tasks
08. Staff activity

Staff profile:

- Profile photo
- Full name
- Email
- Phone
- Position
- Role
- Department
- Date joined
- Attendance summary
- Assigned projects
- Assigned tasks

==================================================
15. OWNER / ADMIN DASHBOARD
==================================================

Create the most comprehensive dashboard.

Show:

- Total revenue
- Monthly revenue
- Expenses
- Net income
- Active projects
- Completed projects
- Overdue projects
- Total staff
- Staff attendance
- Inventory status
- Outstanding payments

Analytics:

Revenue
Expenses
Profit
Projects
Staff productivity
Inventory consumption
Attendance

Include date filters:

TODAY
THIS WEEK
THIS MONTH
THIS QUARTER
THIS YEAR
CUSTOM RANGE

==================================================
16. USER & ROLE MANAGEMENT
==================================================

Create:

01. Users
02. User details
03. Add user
04. Edit user
05. Roles
06. Permissions
07. Role details

Roles:

STAFF
ACCOUNTANT
MANAGER
OWNER/ADMIN

Permission categories:

- View
- Create
- Edit
- Delete
- Approve
- Export
- Manage users
- Manage finances
- Manage inventory
- Manage projects

Create a permission matrix.

==================================================
17. NOTIFICATIONS
==================================================

Create:

01. Notification center
02. Notification details
03. Notification settings

Notification examples:

"Your task deadline is tomorrow."

"A4 Paper stock is below minimum level."

"Project #1024 is overdue."

"Payment of GH₵500 received."

"Staff member clocked in."

Use:
- In-app notifications
- Email notification indicators

Notification categories:

TASK
PROJECT
INVENTORY
ATTENDANCE
FINANCE
SYSTEM

==================================================
18. REPORTS & ANALYTICS
==================================================

Create a dedicated Reports section.

Reports:

- Staff attendance report
- Inventory report
- Stock usage report
- Project report
- Task report
- Sales report
- Expense report
- Payment report
- Financial report

Every report should have:

- Date filter
- Search
- Filter
- Sort
- Export
- Print

Provide export buttons:

PDF
CSV
EXCEL

==================================================
19. AUDIT TRAIL
==================================================

Create an Audit Log screen.

Every important system action should be recorded.

Example:

"Emmanuel updated A4 Paper stock."

"Manager assigned Project #1024 to Staff A."

"Accountant recorded payment of GH₵500."

Display:

- User
- Action
- Module
- Date
- Time
- IP/device if available
- Details

Provide filters.

==================================================
20. SETTINGS
==================================================

Create:

01. Company settings
02. Profile settings
03. Security settings
04. Notification settings
05. Role & permission settings
06. System preferences

Company settings:

- Company name
- Logo
- Address
- Phone
- Email
- Currency
- Time zone

Use Ghanaian business context.

Currency:
GH₵ / GHS

==================================================
21. SEARCH
==================================================

Create global search.

Search across:

- Staff
- Projects
- Tasks
- Inventory
- Transactions
- Clients

Show grouped search results.

==================================================
22. RESPONSIVE DESIGN
==================================================

Create responsive versions for:

Desktop
Tablet
Mobile

Desktop:
- Sidebar
- Full dashboard
- Tables
- Charts

Tablet:
- Collapsible sidebar
- Responsive cards

Mobile:
- Bottom navigation or collapsible menu
- Stacked cards
- Mobile-friendly tables
- Mobile forms

==================================================
23. UI STATES
==================================================

For every major screen create:

- Normal state
- Loading state
- Empty state
- Error state
- Success state
- Permission denied state
- Confirmation modal

Examples:

"No projects found."

"No inventory transactions yet."

"Unable to load attendance."

"Stock successfully updated."

==================================================
24. DESIGN SYSTEM
==================================================

Create a complete reusable component library.

Components:

Buttons
Inputs
Dropdowns
Date pickers
Search bars
Tables
Cards
Charts
Badges
Avatars
Modals
Drawers
Tabs
Pagination
Breadcrumbs
Sidebars
Navigation
Alerts
Toasts
Tooltips
Progress bars
Calendars
Kanban cards

Use Auto Layout and reusable components.

Use variants for:

- Button states
- Input states
- Status badges
- Priority badges
- Table states
- Navigation states

==================================================
25. PROTOTYPE INTERACTIONS
==================================================

Create clickable prototype flows for:

LOGIN
→ DASHBOARD

STAFF
→ CLOCK IN
→ TASK
→ UPDATE TASK
→ COMPLETE TASK

STAFF
→ INVENTORY
→ REMOVE STOCK
→ CONFIRM
→ STOCK UPDATED

MANAGER
→ PROJECTS
→ CREATE PROJECT
→ ASSIGN STAFF
→ SET DEADLINE

ACCOUNTANT
→ SALES
→ RECORD PAYMENT
→ PAYMENT CONFIRMED

OWNER
→ ANALYTICS
→ REPORTS
→ EXPORT REPORT

==================================================
26. DESIGN FILE ORGANIZATION
==================================================

Organize the Figma file into pages:

01 — Cover
02 — Design System
03 — Authentication
04 — Staff Dashboard
05 — Attendance
06 — Tasks
07 — Projects
08 — Inventory
09 — Accountant
10 — Finance
11 — Manager
12 — Staff Management
13 — Owner/Admin
14 — Notifications
15 — Reports
16 — Audit Logs
17 — Settings
18 — Mobile Screens
19 — Prototype Flows

Use consistent naming.

Example:

Staff / Dashboard / Desktop
Staff / Dashboard / Mobile
Inventory / List / Desktop
Inventory / Add Stock / Desktop
Inventory / Add Stock / Mobile

==================================================
27. IMPORTANT PRODUCT REQUIREMENT
==================================================

The screens must feel like ONE integrated application.

Do not design each dashboard as a separate unrelated application.

All roles should share:
- Same design system
- Same navigation principles
- Same typography
- Same components
- Same spacing
- Same interaction patterns

However, each role should see features appropriate to their permissions.

The final result should look like a professional business management SaaS platform that could realistically be implemented as a React/Next.js frontend connected to a backend API and PostgreSQL database.

Prioritize usability, scalability, accessibility, responsive design, and real-world business workflows.