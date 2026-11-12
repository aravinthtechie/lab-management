import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getApiErrorMessage, getApiSuccessMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import {
  PendingCollectionOrder,
  SampleCollectionOrderItem,
  RecordSampleCollectionRequest,
  SampleCollectionService,
} from './sample-collection.service';

@Component({
  selector: 'app-sample-collection',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <section class="collection-card">
      <header class="collection-header">
        <span class="material-icons" aria-hidden="true">colorize</span>
        <h1>Sample Collection</h1>
      </header>

      <div class="collection-body">
        <div class="intro">
          <div>
            <h2>Lab orders</h2>
            <p>Select an order to review its tests and record specimen collection.</p>
          </div>
          <button type="button" class="refresh-button" (click)="loadPending()" [disabled]="loading">
            <span class="material-icons" aria-hidden="true">refresh</span>
            Refresh
          </button>
        </div>

        @if (error) { <p class="error-message" role="alert">{{ error }}</p> }

        <div class="collection-layout">
          <aside class="pending-panel" aria-label="Orders awaiting collection">
            <div class="panel-heading">
              <h3>Orders</h3>
              <span class="count">{{ pendingOrders.length }}</span>
            </div>

            @if (loading) {
              <p class="panel-message">Loading pending orders...</p>
            } @else if (!error && pendingOrders.length === 0) {
              <p class="panel-message">No lab orders found.</p>
            } @else {
              <div class="order-list">
                @for (order of pendingOrders; track order.id) {
                  <button type="button" class="order-option"
                          [class.selected]="selectedOrder?.id === order.id"
                          [attr.aria-pressed]="selectedOrder?.id === order.id"
                          (click)="selectOrder(order)">
                    <span class="order-option-top">
                      <strong>{{ order.orderNumber || 'Order #' + order.id }}</strong>
                      <span class="priority">{{ order.priority || 'NORMAL' }}</span>
                    </span>
                    <span class="patient-name">{{ patientName(order) }}</span>
                    <span class="order-meta">
                      {{ order.patient?.patientNumber || 'Patient #' + order.patientId }}
                      <span>{{ order.orderItems?.length || 0 }} tests</span>
                    </span>
                    @if (order.orderDate) {
                      <span class="order-date">{{ order.orderDate | date:'medium' }}</span>
                    }
                  </button>
                }
              </div>
            }
          </aside>

          <section class="detail-panel" aria-label="Order collection details">
            @if (detailLoading) {
              <div class="detail-empty">Loading order details...</div>
            } @else if (detailError) {
              <p class="error-message" role="alert">{{ detailError }}</p>
            } @else if (!selectedOrder) {
              <div class="detail-empty">
                <span class="material-icons" aria-hidden="true">inventory_2</span>
                <strong>Select an order to begin</strong>
                <span>Order tests and collection details will appear here.</span>
              </div>
            } @else {
              <div class="detail-heading">
                <div>
                  <span class="eyebrow">REGISTERED ORDER</span>
                  <h2>{{ selectedOrder.orderNumber || 'Order #' + selectedOrder.id }}</h2>
                </div>
                <span class="status-chip">{{ selectedOrder.orderStatus || 'REGISTERED' }}</span>
              </div>

              <div class="patient-summary">
                <span class="patient-avatar material-icons" aria-hidden="true">person</span>
                <div>
                  <strong>{{ patientName(selectedOrder) }}</strong>
                  <span>{{ selectedOrder.patient?.patientNumber || 'Patient #' + selectedOrder.patientId }}</span>
                </div>
                @if (selectedOrder.patient?.mobileNumber) {
                  <span class="patient-mobile">{{ selectedOrder.patient?.mobileNumber }}</span>
                }
              </div>

              <div class="tests-heading">
                <div>
                  <h3>Tests in this order</h3>
                  <span>Review each test before recording collection.</span>
                </div>
                <span class="count">{{ selectedOrder.orderItems?.length || 0 }} items</span>
              </div>

              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Test</th>
                      <th scope="col">Specimen</th>
                      <th scope="col">Item status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of selectedOrder.orderItems || []; track item.id) {
                      <tr>
                        <td>
                          <strong>{{ item.testName }}</strong>
                          <small>{{ item.testCode }}</small>
                        </td>
                        <td>{{ item.specimenName || 'To be confirmed' }}</td>
                        <td><span class="item-status">{{ item.itemStatus || 'PENDING' }}</span></td>
                        <td>
                          @if (isCollected(item)) {
                            <span class="collected-label">Collected</span>
                          } @else {
                            <button type="button" class="collect-item-button"
                                    (click)="startCollection(item)">
                              Collect sample
                            </button>
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr><td class="empty-tests" colspan="4">No test items are attached to this order.</td></tr>
                    }
                  </tbody>
                </table>
              </div>

              @if (selectedItem) {
                <div class="collection-prep">
                  <div class="prep-icon material-icons" aria-hidden="true">science</div>
                  <div>
                    <h3>Collect {{ selectedItem.testName }}</h3>
                    <p>Enter the specimen collection details for this test item.</p>
                  </div>
                </div>
                <form class="collection-form" [formGroup]="form" (ngSubmit)="recordCollection()">
                  <div class="form-field">
                    <label for="collectedBy">Collected by <span>*</span></label>
                    <input id="collectedBy" class="form-control" formControlName="collectedBy"
                           maxlength="120" autocomplete="name">
                    @if (form.controls.collectedBy.invalid && form.controls.collectedBy.touched) {
                      <small class="field-error">Enter the collector's name or ID.</small>
                    }
                  </div>
                  <div class="form-field">
                    <label for="collectionDateTime">Collection date and time <span>*</span></label>
                    <input id="collectionDateTime" class="form-control" type="datetime-local"
                           formControlName="collectionDateTime">
                    @if (form.controls.collectionDateTime.invalid && form.controls.collectionDateTime.touched) {
                      <small class="field-error">Enter the collection date and time.</small>
                    }
                  </div>
                  <div class="form-field">
                    <label for="specimenCondition">Specimen condition <span>*</span></label>
                    <input id="specimenCondition" class="form-control" formControlName="specimenCondition"
                           maxlength="40" placeholder="ACCEPTABLE">
                    @if (form.controls.specimenCondition.invalid && form.controls.specimenCondition.touched) {
                      <small class="field-error">Enter the specimen condition.</small>
                    }
                  </div>
                  <div class="form-field">
                    <label for="collectionNotes">Collection notes</label>
                    <textarea id="collectionNotes" class="form-control" formControlName="notes"
                              rows="3" maxlength="500" placeholder="Add specimen collection notes"></textarea>
                  </div>
                  @if (submitError) { <p class="error-message" role="alert">{{ submitError }}</p> }
                  <div class="collection-actions">
                    <button type="button" class="cancel-button" (click)="cancelCollection()" [disabled]="saving">
                      Cancel
                    </button>
                    <button type="submit" class="record-button" [disabled]="saving || detailLoading">
                      <span class="material-icons" aria-hidden="true">task_alt</span>
                      {{ saving ? 'Recording collection...' : 'Record sample collection' }}
                    </button>
                  </div>
                </form>
              }
            }
          </section>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./sample-collection.component.scss'],
})
export class SampleCollectionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly service = inject(SampleCollectionService);
  private readonly toast = inject(ToastService);
  protected readonly form = this.fb.nonNullable.group({
    collectedBy: ['Staff001', [Validators.required, Validators.maxLength(120)]],
    collectionDateTime: [this.localDateTimeNow(), Validators.required],
    specimenCondition: ['ACCEPTABLE', [Validators.required, Validators.maxLength(40)]],
    notes: ['', Validators.maxLength(500)],
  });

  protected pendingOrders: PendingCollectionOrder[] = [];
  protected selectedOrder: PendingCollectionOrder | null = null;
  protected selectedItem: SampleCollectionOrderItem | null = null;
  protected loading = false;
  protected detailLoading = false;
  protected saving = false;
  protected error = '';
  protected detailError = '';
  protected submitError = '';

  ngOnInit(): void {
    this.loadPending();
  }

  protected loadPending(): void {
    this.loading = true;
    this.error = '';
    this.service.getOrders().subscribe({
      next: (response) => {
        this.loading = false;
        const orders = this.extractOrders(response);
        if (!orders) {
          this.pendingOrders = [];
          this.error = 'The orders API returned an unsupported response format.';
          this.changeDetector.markForCheck();
          return;
        }
        this.pendingOrders = orders;
        if (this.selectedOrder) {
          const current = this.pendingOrders.find((order) => order.id === this.selectedOrder?.id);
          if (current) this.selectOrder(current);
          else this.selectedOrder = null;
        }
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = getApiErrorMessage(error, 'Unable to load orders awaiting collection.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected selectOrder(order: PendingCollectionOrder): void {
    this.selectedOrder = order;
    this.detailLoading = true;
    this.detailError = '';
    this.submitError = '';
    this.selectedItem = null;
    this.service.getOrderDetails(order.id).subscribe({
      next: (details) => {
        const order = this.toOrder(details);
        if (!order) {
          this.detailError = 'The order details API returned an unsupported response format.';
        } else {
          this.selectedOrder = order;
        }
        this.detailLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.detailLoading = false;
        this.detailError = getApiErrorMessage(error, 'Unable to load order details for collection.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected recordCollection(): void {
    this.submitError = '';
    this.form.markAllAsTouched();
    if (!this.selectedItem || this.form.invalid || this.saving) return;

    const request: RecordSampleCollectionRequest = {
      orderItemId: this.selectedItem.id,
      collectedBy: this.form.controls.collectedBy.value.trim(),
      collectionDateTime: `${this.form.controls.collectionDateTime.value}:00`,
      specimenCondition: this.form.controls.specimenCondition.value.trim(),
      notes: this.form.controls.notes.value.trim(),
    };

    this.saving = true;
    this.service.recordCollection(request).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.showSuccess(getApiSuccessMessage(response, 'Sample collection recorded successfully.'));
        this.selectedItem = null;
        this.resetForm();
        if (this.selectedOrder) this.loadOrderDetails(this.selectedOrder.id);
        this.loadPending();
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.submitError = getApiErrorMessage(error, 'Unable to record sample collection. Please try again.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected startCollection(item: SampleCollectionOrderItem): void {
    if (this.isCollected(item) || this.saving) return;
    this.selectedItem = item;
    this.submitError = '';
    this.resetForm();
  }

  protected cancelCollection(): void {
    this.selectedItem = null;
    this.submitError = '';
    this.resetForm();
  }

  protected isCollected(item: SampleCollectionOrderItem): boolean {
    return item.itemStatus?.toUpperCase() === 'SAMPLE_COLLECTED';
  }

  protected patientName(order: PendingCollectionOrder): string {
    const patient = order.patient;
    const name = [patient?.firstName, patient?.lastName].filter(Boolean).join(' ');
    return name || `Patient #${order.patientId}`;
  }

  private loadOrderDetails(orderId: number): void {
    this.detailLoading = true;
    this.detailError = '';
    this.service.getOrderDetails(orderId).subscribe({
      next: (details) => {
        const order = this.toOrder(details);
        if (!order) {
          this.detailError = 'The order details API returned an unsupported response format.';
        } else {
          this.selectedOrder = order;
        }
        this.detailLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.detailLoading = false;
        this.detailError = getApiErrorMessage(error, 'Unable to refresh order collection details.');
        this.changeDetector.markForCheck();
      },
    });
  }

  private resetForm(): void {
    this.form.reset({
      collectedBy: 'Staff001',
      collectionDateTime: this.localDateTimeNow(),
      specimenCondition: 'ACCEPTABLE',
      notes: '',
    });
  }

  private localDateTimeNow(): string {
    const now = new Date();
    const twoDigits = (value: number): string => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}` +
      `T${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`;
  }

  private extractOrders(response: unknown): PendingCollectionOrder[] | null {
    if (Array.isArray(response)) {
      return response.every(
        (item): item is PendingCollectionOrder => this.isOrder(item),
      ) ? response : null;
    }
    if (!this.isRecord(response)) return null;

    for (const key of ['content', 'orders', 'data', 'results']) {
      if (key in response) {
        const result = this.extractOrders(response[key]);
        if (result) return result;
      }
    }

    return this.isOrder(response) ? [response] : null;
  }

  private toOrder(response: unknown): PendingCollectionOrder | null {
    if (this.isOrder(response)) return response;
    if (!this.isRecord(response)) return null;

    for (const key of ['order', 'data']) {
      if (key in response) {
        const order = this.toOrder(response[key]);
        if (order) return order;
      }
    }
    return null;
  }

  private isOrder(value: unknown): value is PendingCollectionOrder {
    return this.isRecord(value)
      && typeof value['id'] === 'number'
      && typeof value['patientId'] === 'number'
      && Array.isArray(value['orderItems'])
      && value['orderItems'].every((item) =>
        this.isRecord(item) && typeof item['id'] === 'number',
      );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
