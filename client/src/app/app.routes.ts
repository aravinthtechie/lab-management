import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { MENU } from './core/menu/menu';
import { PatientRegistrationComponent } from './patients/patient-registration/patient-registration';
import { BranchManagementComponent } from './features/admin/branch-management.component';
import { UserManagementComponent } from './features/admin/user-management.component';
import { DoctorManagementComponent } from './features/doctors/doctor-management.component';
import { SampleCollectionComponent } from './features/sample-collection/sample-collection.component';
import { SampleDispatchComponent } from './features/sample-dispatch/sample-dispatch.component';
import { ResultEntryComponent } from './features/results/result-entry.component';
import { LabProcessingComponent } from './features/results/lab-processing.component';
import { AnalyzerIntegrationComponent } from './features/analyzer-integration/analyzer-integration.component';


// One route per module in the menu (placeholder page for now)
const moduleRoutes: Routes = MENU
  .filter(m => !['dashboard', 'patients', 'doctors', 'test-orders', 'sample-collection', 'sample-dispatch', 'lab-processing', 'analyzer-integration', 'results-approval', 'branch-management', 'user-management', 'settings'].includes(m.path))
  .map(m => ({
    path: m.path,
    loadComponent: () => import('./features/modules/module-page/module-page.component')
      .then(c => c.ModulePageComponent),
    data: { title: m.label, icon: m.icon, desc: m.desc }
  }));

export const routes: Routes = [
  { path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'branch-management', component: BranchManagementComponent },
      { path: 'user-management', component: UserManagementComponent },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings.component').then(m => m.SettingsComponent),
      },
      { path: 'doctors', component: DoctorManagementComponent },
      {
        path: 'test-orders',
        loadComponent: () => import('./features/test-orders/test-order.component')
          .then(m => m.TestOrderComponent),
      },
      { path: 'sample-collection', component: SampleCollectionComponent },
      { path: 'sample-dispatch', component: SampleDispatchComponent },
      { path: 'lab-processing', component: LabProcessingComponent },
      { path: 'analyzer-integration', component: AnalyzerIntegrationComponent },
      { path: 'results-approval', component: ResultEntryComponent },
      ...moduleRoutes,
      {
        path: 'patients',
        children: [
          { path: '', component: PatientRegistrationComponent },
          { path: 'register', component: PatientRegistrationComponent },
        ],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ] },
  { path: '**', redirectTo: 'dashboard' }
];