import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getApiErrorMessage, getApiSuccessMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import {
  CreateSampleDispatchRequest,
  SampleCollectionInfo,
  SampleDispatch,
  SampleDispatchService,
} from './sample-dispatch.service';

type DispatchAction = 'receive' | 'reject' | null;

@Component({
  selector: 'app-sample-dispatch',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <section class="dispatch-card">
      <header class="dispatch-header">
        <span class="material-icons" aria-hidden="true">local_shipping</span>
        <h1>Sample Dispatch</h1>
      </header>

      <div class="dispatch-body">
        <div class="intro">
          <div>
            <h2>Dispatch samples to the laboratory</h2>
            <p>Create dispatches from collected samples and track receipt or rejection.</p>
          </div>
          <button type="button" class="refresh-button" (click)="loadDispatches()" [disabled]="loading">
            <span class="material-icons" aria-hidden="true">refresh</span>Refresh
          </button>
        </div>

        @if (listError) { <p class="error-message" role="alert">{{ listError }}</p> }

        <section class="create-panel" aria-labelledby="createDispatchHeading">
          <div class="section-heading">
            <div>
              <h3 id="createDispatchHeading">Create a dispatch</h3>
              <p>Enter a collected sample ID to load its details before dispatch.</p>
            </div>
            <span class="section-icon material-icons" aria-hidden="true">add_box</span>
          </div>

          <form class="create-form" [formGroup]="createForm" (ngSubmit)="loadCollection()">
            <div class="form-field sample-id-field">
              <label for="sampleCollectionId">Sample collection ID <span>*</span></label>
              <div class="input-action">
                <input id="sampleCollectionId" class="form-control" type="number" min="1"
                       formControlName="sampleCollectionId" placeholder="Enter sample collection ID">
                <button class="secondary-button" type="submit"
                        [disabled]="loadingCollection || createForm.controls.sampleCollectionId.invalid">
                  {{ loadingCollection ? 'Loading...' : 'Load sample' }}
                </button>
              </div>
            </div>
          </form>

          @if (collectionError) { <p class="error-message" role="alert">{{ collectionError }}</p> }

          @if (collection) {
            <div class="sample-summary">
              <div class="sample-icon material-icons" aria-hidden="true">science</div>
              <div class="sample-info">
                <strong>{{ collection.testName || 'Collected sample' }}</strong>
                <span>{{ collection.sampleCode || ('Collection #' + collection.id) }}
                  @if (collection.orderNumber) { · {{ collection.orderNumber }} }
                </span>
                <small>
                  {{ collection.specimenName || 'Specimen not specified' }}
                  @if (collection.collectionStatus) { · {{ collection.collectionStatus }} }
                </small>
              </div>
              <span class="status-chip">{{ collection.collectionStatus || 'COLLECTED' }}</span>
            </div>

            <form class="dispatch-form" [formGroup]="createForm" (ngSubmit)="createDispatch()">
              <div class="form-field">
                <label for="dispatchedBy">Dispatched by <span>*</span></label>
                <input id="dispatchedBy" class="form-control" formControlName="dispatchedBy" maxlength="120">
              </div>
              <div class="form-field">
                <label for="destination">Destination <span>*</span></label>
                <input id="destination" class="form-control" formControlName="destination"
                       maxlength="150" placeholder="e.g. Biochemistry Department">
              </div>
              <div class="form-field">
                <label for="dispatchDateTime">Dispatch date and time <span>*</span></label>
                <input id="dispatchDateTime" class="form-control" type="datetime-local"
                       formControlName="dispatchDateTime">
              </div>
              <div class="form-field">
                <label for="transportCondition">Transport condition <span>*</span></label>
                <input id="transportCondition" class="form-control" formControlName="transportCondition"
                       maxlength="50" placeholder="e.g. REFRIGERATED">
              </div>
              <div class="form-field notes-field">
                <label for="dispatchNotes">Notes</label>
                <textarea id="dispatchNotes" class="form-control" rows="2" maxlength="500"
                          formControlName="notes" placeholder="Optional dispatch notes"></textarea>
              </div>
              @if (createError) { <p class="error-message notes-field" role="alert">{{ createError }}</p> }
              <div class="create-actions notes-field">
                <button type="button" class="cancel-button" (click)="clearCollection()" [disabled]="saving">
                  Clear
                </button>
                <button type="submit" class="primary-button" [disabled]="saving || createForm.invalid">
                  <span class="material-icons" aria-hidden="true">send</span>
                  {{ saving ? 'Creating dispatch...' : 'Create dispatch' }}
                </button>
              </div>
            </form>
          }
        </section>

        <div class="history-heading">
          <div>
            <h3>Dispatch history</h3>
            <p>View dispatch status and record receipt or rejection.</p>
          </div>
          <span class="count">{{ dispatches.length }}</span>
        </div>

        <div class="dispatch-layout">
          <section class="history-panel" aria-label="Sample dispatch history">
            @if (loading) {
              <p class="panel-message">Loading dispatches...</p>
            } @else if (!listError && dispatches.length === 0) {
              <p class="panel-message">No sample dispatches found.</p>
            } @else {
              <div class="dispatch-list">
                @for (dispatch of dispatches; track dispatch.id) {
                  <button type="button" class="dispatch-option"
                          [class.selected]="selectedDispatch?.id === dispatch.id"
                          [attr.aria-pressed]="selectedDispatch?.id === dispatch.id"
                          (click)="selectDispatch(dispatch)">
                    <span class="dispatch-option-top">
                      <strong>{{ dispatch.dispatchNumber || 'Dispatch #' + dispatch.id }}</strong>
                      <span class="status-chip" [class]="statusClass(dispatch.dispatchStatus)">
                        {{ dispatch.dispatchStatus || 'DISPATCHED' }}
                      </span>
                    </span>
                    <span class="dispatch-test">{{ dispatch.testName || dispatch.sampleCode || 'Sample' }}</span>
                    <span class="dispatch-meta">
                      {{ dispatch.destination || 'Destination not set' }}
                      @if (dispatch.dispatchDateTime) { · {{ dispatch.dispatchDateTime | date:'short' }} }
                    </span>
                  </button>
                }
              </div>
            }
          </section>

          <section class="detail-panel" aria-label="Dispatch details">
            @if (detailLoading) {
              <div class="detail-empty">Loading dispatch details...</div>
            } @else if (detailError) {
              <p class="error-message" role="alert">{{ detailError }}</p>
            } @else if (!selectedDispatch) {
              <div class="detail-empty">
                <span class="material-icons" aria-hidden="true">inventory_2</span>
                <strong>Select a dispatch</strong>
                <span>Dispatch, sample, and receipt details will appear here.</span>
              </div>
            } @else {
              <div class="detail-heading">
                <div>
                  <span class="eyebrow">SAMPLE DISPATCH</span>
                  <h2>{{ selectedDispatch.dispatchNumber || 'Dispatch #' + selectedDispatch.id }}</h2>
                </div>
                <span class="status-chip" [class]="statusClass(selectedDispatch.dispatchStatus)">
                  {{ selectedDispatch.dispatchStatus || 'DISPATCHED' }}
                </span>
              </div>

              <dl class="details-grid">
                <div><dt>Sample</dt><dd>{{ selectedDispatch.sampleCode || ('Collection #' + selectedDispatch.sampleCollectionId) }}</dd></div>
                <div><dt>Test</dt><dd>{{ selectedDispatch.testName || '—' }}</dd></div>
                <div><dt>Destination</dt><dd>{{ selectedDispatch.destination || '—' }}</dd></div>
                <div><dt>Transport</dt><dd>{{ selectedDispatch.transportCondition || '—' }}</dd></div>
                <div><dt>Dispatched by</dt><dd>{{ selectedDispatch.dispatchedBy || '—' }}</dd></div>
                <div><dt>Dispatch time</dt><dd>{{ selectedDispatch.dispatchDateTime | date:'medium' }}</dd></div>
                @if (selectedDispatch.receivedBy) {
                  <div><dt>Received by</dt><dd>{{ selectedDispatch.receivedBy }}</dd></div>
                  <div><dt>Received time</dt><dd>{{ selectedDispatch.receivedDateTime | date:'medium' }}</dd></div>
                }
                @if (selectedDispatch.rejectedBy) {
                  <div><dt>Rejected by</dt><dd>{{ selectedDispatch.rejectedBy }}</dd></div>
                  <div><dt>Rejection reason</dt><dd>{{ selectedDispatch.rejectionReason }}</dd></div>
                }
                @if (selectedDispatch.notes) {
                  <div class="full-width"><dt>Notes</dt><dd>{{ selectedDispatch.notes }}</dd></div>
                }
              </dl>

              @if (canUpdateDispatch) {
                <div class="detail-actions">
                  <button type="button" class="receive-button" (click)="openAction('receive')">
                    <span class="material-icons" aria-hidden="true">move_to_inbox</span>Receive sample
                  </button>
                  <button type="button" class="reject-button" (click)="openAction('reject')">
                    <span class="material-icons" aria-hidden="true">block</span>Reject sample
                  </button>
                </div>
              }

              @if (action) {
                <form class="action-form" [formGroup]="actionForm" (ngSubmit)="submitAction()">
                  @if (action === 'receive') {
                    <h3>Confirm sample receipt</h3>
                    <div class="form-field">
                      <label for="receivedBy">Received by <span>*</span></label>
                      <input id="receivedBy" class="form-control" formControlName="receivedBy">
                    </div>
                    <div class="form-field">
                      <label for="receiveNotes">Notes</label>
                      <textarea id="receiveNotes" class="form-control" rows="2"
                                formControlName="receiveNotes" placeholder="Condition on arrival"></textarea>
                    </div>
                  } @else {
                    <h3>Reject sample</h3>
                    <div class="form-field">
                      <label for="rejectedBy">Rejected by <span>*</span></label>
                      <input id="rejectedBy" class="form-control" formControlName="rejectedBy">
                    </div>
                    <div class="form-field">
                      <label for="rejectionReason">Rejection reason <span>*</span></label>
                      <textarea id="rejectionReason" class="form-control" rows="2"
                                formControlName="rejectionReason" placeholder="Explain why this sample is rejected"></textarea>
                    </div>
                  }
                  @if (actionError) { <p class="error-message" role="alert">{{ actionError }}</p> }
                  <div class="detail-actions">
                    <button type="button" class="cancel-button" (click)="action = null" [disabled]="saving">Cancel</button>
                    <button type="submit" class="primary-button" [disabled]="saving || actionInvalid">
                      {{ saving ? 'Saving...' : (action === 'receive' ? 'Confirm receipt' : 'Confirm rejection') }}
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
  styleUrls: ['./sample-dispatch.component.scss'],
})
export class SampleDispatchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly service = inject(SampleDispatchService);
  private readonly toast = inject(ToastService);

  protected readonly createForm = this.fb.nonNullable.group({
    sampleCollectionId: [0, [Validators.required, Validators.min(1)]],
    dispatchedBy: ['Staff001', [Validators.required, Validators.maxLength(120)]],
    destination: ['Biochemistry Department', [Validators.required, Validators.maxLength(150)]],
    dispatchDateTime: [this.localDateTimeNow(), Validators.required],
    transportCondition: ['REFRIGERATED', [Validators.required, Validators.maxLength(50)]],
    notes: ['Sample sent for processing', Validators.maxLength(500)],
  });
  protected readonly actionForm = this.fb.nonNullable.group({
    receivedBy: ['LabTechnician001', Validators.required],
    receiveNotes: [''],
    rejectedBy: ['LabTechnician001', Validators.required],
    rejectionReason: ['', Validators.required],
  });

  protected dispatches: SampleDispatch[] = [];
  protected selectedDispatch: SampleDispatch | null = null;
  protected collection: SampleCollectionInfo | null = null;
  protected action: DispatchAction = null;
  protected loading = false;
  protected detailLoading = false;
  protected loadingCollection = false;
  protected saving = false;
  protected listError = '';
  protected collectionError = '';
  protected createError = '';
  protected detailError = '';
  protected actionError = '';

  ngOnInit(): void {
    this.loadDispatches();
  }

  protected loadDispatches(): void {
    this.loading = true;
    this.listError = '';
    this.service.getDispatches().subscribe({
      next: (response) => {
        const dispatches = this.extractDispatches(response);
        this.loading = false;
        if (!dispatches) {
          this.dispatches = [];
          this.listError = 'The dispatch API returned an unsupported response format.';
          this.changeDetector.markForCheck();
          return;
        }
        this.dispatches = dispatches;
        if (this.selectedDispatch) {
          const current = this.dispatches.find((item) => item.id === this.selectedDispatch?.id);
          if (current) this.selectDispatch(current);
          else this.selectedDispatch = null;
        }
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.listError = getApiErrorMessage(error, 'Unable to load sample dispatches.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected loadCollection(): void {
    this.collectionError = '';
    this.createError = '';
    if (this.createForm.controls.sampleCollectionId.invalid || this.loadingCollection) {
      this.createForm.controls.sampleCollectionId.markAsTouched();
      return;
    }

    this.collection = null;
    this.loadingCollection = true;
    this.service.getCollection(this.createForm.controls.sampleCollectionId.value).subscribe({
      next: (collection) => {
        if (collection.collectionStatus?.toUpperCase() !== 'COLLECTED') {
          this.loadingCollection = false;
          this.collectionError = 'This sample is not marked as collected and cannot be dispatched.';
          this.collection = null;
          this.changeDetector.markForCheck();
          return;
        }
        this.checkExistingDispatch(collection);
      },
      error: (error: HttpErrorResponse) => {
        this.loadingCollection = false;
        this.collectionError = getApiErrorMessage(error, 'Unable to load this sample collection.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected createDispatch(): void {
    this.createError = '';
    this.createForm.markAllAsTouched();
    if (!this.collection || this.createForm.invalid || this.saving) return;

    const request: CreateSampleDispatchRequest = {
      sampleCollectionId: this.collection.id,
      dispatchedBy: this.createForm.controls.dispatchedBy.value.trim(),
      destination: this.createForm.controls.destination.value.trim(),
      dispatchDateTime: `${this.createForm.controls.dispatchDateTime.value}:00`,
      transportCondition: this.createForm.controls.transportCondition.value.trim(),
      notes: this.createForm.controls.notes.value.trim(),
    };

    this.saving = true;
    this.service.createDispatch(request).subscribe({
      next: (response) => {
        this.saving = false;
        this.collection = null;
        this.createForm.patchValue({
          sampleCollectionId: 0,
          destination: 'Biochemistry Department',
          dispatchDateTime: this.localDateTimeNow(),
          notes: 'Sample sent for processing',
        });
        this.toast.showSuccess(getApiSuccessMessage(response, 'Sample dispatch created successfully.'));
        this.loadDispatches();
        const dispatch = this.toDispatch(response);
        if (dispatch) this.selectDispatch(dispatch);
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.createError = getApiErrorMessage(error, 'Unable to create the sample dispatch.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected selectDispatch(dispatch: SampleDispatch): void {
    this.selectedDispatch = dispatch;
    this.action = null;
    this.detailLoading = true;
    this.detailError = '';
    this.service.getDispatch(dispatch.id).subscribe({
      next: (response) => {
        const details = this.toDispatch(response);
        if (details) this.selectedDispatch = details;
        else this.detailError = 'The dispatch details API returned an unsupported response format.';
        this.detailLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.detailLoading = false;
        this.detailError = getApiErrorMessage(error, 'Unable to load dispatch details.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected openAction(action: Exclude<DispatchAction, null>): void {
    this.action = action;
    this.actionError = '';
    this.actionForm.reset({
      receivedBy: 'LabTechnician001',
      receiveNotes: '',
      rejectedBy: 'LabTechnician001',
      rejectionReason: '',
    });
  }

  protected submitAction(): void {
    if (!this.selectedDispatch || !this.action || this.actionInvalid || this.saving) return;
    this.actionError = '';
    const id = this.selectedDispatch.id;
    const request$ = this.action === 'receive'
      ? this.service.receiveSample(id, {
        receivedBy: this.actionForm.controls.receivedBy.value.trim(),
        notes: this.actionForm.controls.receiveNotes.value.trim(),
      })
      : this.service.rejectSample(id, {
        rejectedBy: this.actionForm.controls.rejectedBy.value.trim(),
        rejectionReason: this.actionForm.controls.rejectionReason.value.trim(),
      });

    this.saving = true;
    request$.subscribe({
      next: (response) => {
        this.saving = false;
        this.action = null;
        this.toast.showSuccess(getApiSuccessMessage(response, 'Dispatch status updated successfully.'));
        this.loadDispatches();
        this.selectDispatch(this.selectedDispatch!);
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.actionError = getApiErrorMessage(error, 'Unable to update the dispatch status.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected clearCollection(): void {
    this.collection = null;
    this.collectionError = '';
    this.createError = '';
    this.createForm.patchValue({ sampleCollectionId: 0 });
  }

  protected get canUpdateDispatch(): boolean {
    return this.selectedDispatch?.dispatchStatus?.toUpperCase() === 'DISPATCHED';
  }

  protected get actionInvalid(): boolean {
    if (this.action === 'receive') return this.actionForm.controls.receivedBy.invalid;
    if (this.action === 'reject') {
      return this.actionForm.controls.rejectedBy.invalid || this.actionForm.controls.rejectionReason.invalid;
    }
    return true;
  }

  protected statusClass(status?: string): string {
    return status?.toUpperCase() === 'RECEIVED'
      ? 'received'
      : status?.toUpperCase() === 'REJECTED' ? 'rejected' : 'dispatched';
  }

  private extractDispatches(response: unknown): SampleDispatch[] | null {
    if (Array.isArray(response)) {
      return response.every((item): item is SampleDispatch => this.isDispatch(item))
        ? response
        : null;
    }
    if (!this.isRecord(response)) return null;
    for (const key of ['content', 'dispatches', 'data', 'results']) {
      if (key in response) {
        const result = this.extractDispatches(response[key]);
        if (result) return result;
      }
    }
    const dispatch = this.toDispatch(response);
    return dispatch ? [dispatch] : null;
  }

  private toDispatch(response: unknown): SampleDispatch | null {
    if (this.isDispatch(response)) return response;
    if (!this.isRecord(response)) return null;
    for (const key of ['dispatch', 'data']) {
      if (key in response) {
        const dispatch = this.toDispatch(response[key]);
        if (dispatch) return dispatch;
      }
    }
    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isDispatch(value: unknown): value is SampleDispatch {
    return this.isRecord(value)
      && typeof value['id'] === 'number'
      && typeof value['sampleCollectionId'] === 'number';
  }

  private checkExistingDispatch(collection: SampleCollectionInfo): void {
    this.service.getDispatchBySample(collection.id).subscribe({
      next: () => {
        this.loadingCollection = false;
        this.collection = null;
        this.collectionError = 'This sample already has a dispatch record.';
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loadingCollection = false;
        if (error.status === 404) {
          this.collection = collection;
        } else {
          this.collection = null;
          this.collectionError = getApiErrorMessage(error, 'Unable to verify whether this sample was dispatched.');
        }
        this.changeDetector.markForCheck();
      },
    });
  }

  private localDateTimeNow(): string {
    const now = new Date();
    const twoDigits = (value: number): string => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${twoDigits(now.getMonth() + 1)}-${twoDigits(now.getDate())}` +
      `T${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`;
  }
}
