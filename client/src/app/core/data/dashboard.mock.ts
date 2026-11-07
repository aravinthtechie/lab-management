export interface Stat {
  label: string; value: number; icon: string; color: string;
  note?: string; up?: boolean; chip?: string;
}
export interface BranchBar { name: string; value: number; color: string; }
export interface PendingItem { title: string; sub: string; count: number; icon: string; color: string; }
export interface OrderRow { no: string; patient: string; branch: string; test: string; status: string; }
export interface QuickAction { label: string; icon: string; link: string; }

export const STATS: Stat[] = [
  { label: 'Patients Today', value: 128, icon: 'groups', color: 'var(--mat-sys-primary)', note: '12% vs yesterday', up: true },
  { label: 'Test Orders', value: 186, icon: 'assignment', color: 'var(--mat-sys-tertiary)', note: 'Across all branches' },
  { label: 'Samples Processing', value: 42, icon: 'science', color: 'var(--lab-warning)', chip: 'In Progress' },
  { label: 'Reports Completed', value: 119, icon: 'check_circle', color: 'var(--lab-success)', chip: 'Approved' },
];

export const BRANCHES: BranchBar[] = [
  { name: 'Chennai Branch', value: 86, color: 'var(--mat-sys-primary)' },
  { name: 'Tambaram Branch', value: 72, color: 'var(--mat-sys-tertiary)' },
  { name: 'Chengalpattu Branch', value: 56, color: 'var(--lab-purple)' },
  { name: 'Other Branches', value: 48, color: 'var(--lab-warning)' },
];

export const PENDING: PendingItem[] = [
  { title: 'Samples awaiting receipt', sub: 'Branch dispatches', count: 12, icon: 'inventory_2', color: 'var(--lab-warning)' },
  { title: 'Results awaiting approval', sub: 'Pathologist review', count: 18, icon: 'science', color: 'var(--lab-purple)' },
  { title: 'Rejected specimens', sub: 'Requires follow-up', count: 3, icon: 'warning', color: 'var(--lab-danger)' },
];

export const ORDERS: OrderRow[] = [
  { no: 'ORD-10024', patient: 'R. Kumar', branch: 'Chennai', test: 'CBC', status: 'In Progress' },
  { no: 'ORD-10023', patient: 'S. Meena', branch: 'Tambaram', test: 'LFT', status: 'Completed' },
  { no: 'ORD-10022', patient: 'K. Ravi', branch: 'Chennai', test: 'RFT', status: 'Pending' },
  { no: 'ORD-10021', patient: 'M. Devi', branch: 'Chengalpattu', test: 'HbA1c', status: 'Completed' },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'New Patient', icon: 'person_add', link: '/patients' },
  { label: 'New Order', icon: 'post_add', link: '/test-orders' },
  { label: 'Print Barcode', icon: 'qr_code_2', link: '/sample-collection' },
  { label: 'View Reports', icon: 'summarize', link: '/reports' },
];