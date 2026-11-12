export interface MenuItem {
  path: string;
  label: string;
  icon: string;
  section: 'main' | 'lab' | 'admin';
  desc: string;
  adminOnly?: boolean;
}

export const MENU: MenuItem[] = [
  { path: 'dashboard', label: 'Dashboard', icon: 'dashboard', section: 'main', desc: 'Today\'s laboratory overview' },

  // LAB OPERATIONS
  { path: 'patients', label: 'Patients', icon: 'groups', section: 'lab', desc: 'Register and search patients and view visit history' },
  { path: 'doctors', label: 'Doctors', icon: 'medical_services', section: 'lab', desc: 'Manage referring doctors and their contact details' },
  { path: 'test-orders', label: 'Test Orders', icon: 'assignment', section: 'lab', desc: 'Create and track test orders and panels' },
  { path: 'sample-collection', label: 'Sample Collection', icon: 'colorize', section: 'lab', desc: 'Collect samples and print barcodes and labels' },
  { path: 'sample-dispatch', label: 'Sample Dispatch', icon: 'local_shipping', section: 'lab', desc: 'Send samples between branches and the central lab' },
  { path: 'lab-processing', label: 'Lab Processing', icon: 'biotech', section: 'lab', desc: 'Receive, process and track samples in the lab' },
  { path: 'analyzer-integration', label: 'Analyzer Integration', icon: 'settings_input_component', section: 'lab', desc: 'Connect analyzers and import results automatically' },
  { path: 'results-approval', label: 'Results & Approval', icon: 'fact_check', section: 'lab', desc: 'Enter, review and approve results' },
  { path: 'reports', label: 'Reports', icon: 'description', section: 'lab', desc: 'Generate, print and share patient reports' },

  // ADMINISTRATION
  { path: 'branch-management', label: 'Branch Management', icon: 'apartment', section: 'admin', adminOnly: true, desc: 'Manage branches, collection centres and the central lab' },
  { path: 'user-management', label: 'User Management', icon: 'manage_accounts', section: 'admin', adminOnly: true, desc: 'Manage users, roles and permissions' },
  { path: 'billing', label: 'Billing & Payments', icon: 'receipt_long', section: 'admin', desc: 'Invoices, payments, discounts and outstanding balance' },
  { path: 'analytics', label: 'Analytics & Reports', icon: 'insights', section: 'admin', desc: 'Branch performance, turnaround time and revenue' },
  { path: 'settings', label: 'Settings', icon: 'settings', section: 'admin', adminOnly: true, desc: 'Laboratory, billing, reports, samples, notifications, users, inventory and branch preferences' },
];