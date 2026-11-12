import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BRANCHES, ORDERS, PENDING, QUICK_ACTIONS, STATS } from '../../core/data/dashboard.mock';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected stats = STATS;
  protected branches = BRANCHES;
  protected pending = PENDING;
  protected orders = ORDERS;
  protected quick = QUICK_ACTIONS;
  protected today = new Date();
  protected branchOptions = ['Central Lab', 'Chennai Branch', 'Tambaram Branch', 'Chengalpattu Branch'];

  protected statusClass(status: string): string {
    const map: Record<string, string> = { 'In Progress': 'warning', Completed: 'success', Pending: 'info' };
    return map[status] ?? 'info';
  }
}