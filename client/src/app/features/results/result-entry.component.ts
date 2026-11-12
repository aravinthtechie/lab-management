import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getApiErrorMessage } from '../../core/api/api-error';
import { API_BASE_URL } from '../../core/api/api.config';
import { HttpClient } from '@angular/common/http';
import { CreateLabResultRequest, LabResult, LabResultService } from './lab-result.service';

interface ResultOrderItem {
  id: number;
  labTestId?: number;
  testCode: string;
  testName: string;
  itemStatus?: string;
  specimenName?: string | null;
}

interface ResultOrder {
  id: number;
  orderNumber: string;
  patientId: number;
  patient?: {
    patientNumber?: string;
    firstName?: string;
    lastName?: string;
  };
  orderDate?: string;
  orderStatus?: string;
  orderItems: ResultOrderItem[];
}

interface ParameterDraft {
  name: string;
  parameterId: number | null;
  unit: string;
  value: string;
  remarks: string;
  resultId?: number;
}

interface PendingResultFormValue {
  name: string;
  testParameterId: string;
  unit: string;
  value: string;
  remarks: string;
  resultId: number | null;
}

@Component({
  selector: 'app-result-entry',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <section class="result-card">
      <header class="result-header">
        <span class="material-icons" aria-hidden="true">fact_check</span>
        <h1>Lab Result Entry</h1>
      </header>

      <div class="result-body">
        <div class="intro">
          <div>
            <h2>Enter test results</h2>
            <p>Record an individual result for each parameter in the selected test.</p>
          </div>
          <button type="button" class="refresh-button" (click)="loadOrders()" [disabled]="loading || saving">
            <span class="material-icons" aria-hidden="true">refresh</span>
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <p class="draft-notice" role="note">
          <span class="material-icons" aria-hidden="true">info</span>
          Test parameter IDs must match the IDs configured in your lab database.
        </p>

        @if (error) { <p class="error-message" role="alert">{{ error }}</p> }

        <div class="result-layout">
          <aside class="orders-panel" aria-label="Lab orders">
            <div class="panel-heading">
              <h3>Lab orders</h3>
              <span class="count">{{ orders.length }}</span>
            </div>

            @if (loading) {
              <p class="panel-message">Loading orders...</p>
            } @else if (!error && orders.length === 0) {
              <p class="panel-message">No lab orders found.</p>
            } @else {
              <div class="order-list">
                @for (order of orders; track order.id) {
                  <button type="button" class="order-option"
                          [disabled]="saving"
                          [class.selected]="selectedOrder?.id === order.id"
                          [attr.aria-pressed]="selectedOrder?.id === order.id"
                          (click)="selectOrder(order)">
                    <span class="order-top">
                      <strong>{{ order.orderNumber || 'Order #' + order.id }}</strong>
                      <span class="status-chip">{{ order.orderStatus || 'REGISTERED' }}</span>
                    </span>
                    <span class="patient-name">{{ patientName(order) }}</span>
                    <span class="order-meta">
                      {{ order.patient?.patientNumber || 'Patient #' + order.patientId }}
                      · {{ order.orderItems.length }} tests
                    </span>
                    @if (order.orderDate) {
                      <span class="order-date">{{ order.orderDate | date:'medium' }}</span>
                    }
                  </button>
                }
              </div>
            }
          </aside>

          <section class="entry-panel" aria-label="Test result entry">
            @if (!selectedOrder) {
              <div class="empty-state">
                <span class="material-icons" aria-hidden="true">science</span>
                <strong>Select an order to begin</strong>
                <span>Choose an order, then select a test to enter its parameter results.</span>
              </div>
            } @else {
              <div class="order-summary">
                <div>
                  <span class="eyebrow">SELECTED ORDER</span>
                  <h3>{{ selectedOrder.orderNumber || 'Order #' + selectedOrder.id }}</h3>
                  <p>{{ patientName(selectedOrder) }} · {{ selectedOrder.patient?.patientNumber || 'Patient #' + selectedOrder.patientId }}</p>
                </div>
                <span class="status-chip">{{ selectedOrder.orderStatus || 'REGISTERED' }}</span>
              </div>

              <div class="tests-section">
                <div class="section-title">
                  <h3>Tests in this order</h3>
                  <span>{{ selectedOrder.orderItems.length }} tests</span>
                </div>
                <div class="test-list">
                  @for (item of selectedOrder.orderItems; track item.id) {
                    <button type="button" class="test-option"
                            [disabled]="saving || resultsLoading"
                            [class.selected]="selectedItem?.id === item.id"
                            (click)="selectTest(item)">
                      <span>
                        <strong>{{ item.testName }}</strong>
                        <small>{{ item.testCode }} · {{ item.specimenName || 'Specimen not specified' }}</small>
                      </span>
                      <span class="item-status">{{ draftStatus(item) }}</span>
                    </button>
                  } @empty {
                    <p class="panel-message">No tests are attached to this order.</p>
                  }
                </div>
              </div>

              @if (selectedItem) {
                <form class="parameter-form" [formGroup]="form" (ngSubmit)="submitResults()">
                  <div class="section-title">
                    <div>
                      <h3>{{ selectedItem.testName }} results</h3>
                      <span>Each parameter is submitted as a separate result record.</span>
                    </div>
                    <button type="button" class="secondary-button" (click)="addParameter()"
                            [disabled]="saving || resultsLoading || !!resultsError">
                      <span class="material-icons" aria-hidden="true">add</span>Add parameter
                    </button>
                  </div>

                  @if (resultsLoading) {
                    <p class="panel-message">Loading saved results...</p>
                  }
                  @if (resultsError) {
                    <p class="error-message" role="alert">{{ resultsError }}</p>
                  }
                  @if (submitError) {
                    <p class="error-message" role="alert">{{ submitError }}</p>
                  }
                  @if (submissionMessage) {
                    <p class="saved-message" role="status">{{ submissionMessage }}</p>
                  }
                  @if (!resultsLoading && !resultsError && resultsByItem.has(selectedItem.id)) {
                    <p class="saved-message" role="status">
                      {{ resultsByItem.get(selectedItem.id)?.length || 0 }} result(s) loaded from the lab system.
                    </p>
                  }

                  <div class="parameter-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">Parameter</th>
                          <th scope="col">Parameter ID</th>
                          <th scope="col">Unit</th>
                          <th scope="col">Result</th>
                          <th scope="col">Remarks</th>
                          <th scope="col">Status</th>
                          <th scope="col"><span class="visually-hidden">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody formArrayName="parameters">
                        @for (parameter of parameters.controls; track $index; let i = $index) {
                          <tr [formGroupName]="i">
                            <td>
                              <input class="form-control" formControlName="name" aria-label="Parameter name"
                                     placeholder="e.g. Hemoglobin"
                                     [readonly]="!!parameter.controls.resultId.value || saving">
                              @if (parameter.controls.name.invalid && parameter.controls.name.touched) {
                                <small class="field-error">Enter a parameter name.</small>
                              }
                            </td>
                            <td>
                              <input class="form-control" type="number" min="1" step="1"
                                     formControlName="testParameterId" aria-label="Test parameter ID"
                                     placeholder="Database ID"
                                     [readonly]="!!parameter.controls.resultId.value || saving">
                              @if (parameter.controls.testParameterId.invalid && parameter.controls.testParameterId.touched) {
                                <small class="field-error">Enter the database parameter ID.</small>
                              }
                            </td>
                            <td>
                              <input class="form-control" formControlName="unit" aria-label="Unit"
                                     placeholder="e.g. g/dL"
                                     [readonly]="!!parameter.controls.resultId.value || saving">
                              @if (parameter.controls.unit.invalid && parameter.controls.unit.touched) {
                                <small class="field-error">Enter a unit.</small>
                              }
                            </td>
                            <td>
                              <input class="form-control" type="number" step="any" formControlName="value"
                                     [attr.aria-label]="parameter.controls.name.value + ' result'"
                                     placeholder="Enter result"
                                     [readonly]="!!parameter.controls.resultId.value || saving">
                              @if (parameter.controls.value.invalid && parameter.controls.value.touched) {
                                <small class="field-error">Enter a numeric result.</small>
                              }
                            </td>
                            <td>
                              <input class="form-control" formControlName="remarks" aria-label="Result remarks"
                                     placeholder="Optional"
                                     [readonly]="!!parameter.controls.resultId.value || saving">
                            </td>
                            <td>
                              {{ resultStatus(parameter) }}
                            </td>
                            <td>
                              <button type="button" class="remove-button" (click)="removeParameter(i)"
                                      [disabled]="parameters.length <= 1 || !!parameter.controls.resultId.value || saving"
                                      [attr.aria-label]="'Remove parameter ' + (i + 1)">Remove</button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <div class="form-actions">
                    <label class="entered-by-field">
                      <span>Entered by</span>
                      <input class="form-control" formControlName="enteredBy" maxlength="120" [readonly]="saving">
                      @if (form.controls.enteredBy.invalid && form.controls.enteredBy.touched) {
                        <small class="field-error">Enter the staff member who entered these results.</small>
                      }
                    </label>
                    <button type="submit" class="primary-button"
                            [disabled]="saving || resultsLoading || !!resultsError || !hasUnsubmittedResults">
                      {{ saving ? 'Submitting...' : 'Submit results' }}
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
  styleUrls: ['./result-entry.component.scss'],
})
export class ResultEntryComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly resultService = inject(LabResultService);
  private readonly ordersEndpoint = `${API_BASE_URL}/api/orders`;

  protected orders: ResultOrder[] = [];
  protected selectedOrder: ResultOrder | null = null;
  protected selectedItem: ResultOrderItem | null = null;
  protected readonly resultsByItem = new Map<number, LabResult[]>();
  protected readonly unsavedParameters = new Map<number, ParameterDraft[]>();
  protected loading = false;
  protected resultsLoading = false;
  protected saving = false;
  protected error = '';
  protected resultsError = '';
  protected submitError = '';
  protected submissionMessage = '';
  protected readonly form = this.fb.nonNullable.group({
    enteredBy: ['LabTechnician001', [Validators.required, Validators.maxLength(120)]],
    parameters: this.fb.nonNullable.array([this.createParameter('', null, '', '', null)]),
  });

  protected get parameters(): FormArray<ReturnType<ResultEntryComponent['createParameter']>> {
    return this.form.controls.parameters;
  }

  protected get hasUnsubmittedResults(): boolean {
    return this.parameters.controls.some((parameter) => !parameter.controls.resultId.value);
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.storeCurrentParameters();
    this.loading = true;
    this.error = '';
    this.http.get<unknown>(this.ordersEndpoint).subscribe({
      next: (response) => {
        this.loading = false;
        const orders = this.parseOrders(response);
        if (!orders) {
          this.orders = [];
          this.selectedOrder = null;
          this.selectedItem = null;
          this.error = 'The orders API returned an unsupported response format.';
          this.changeDetector.markForCheck();
          return;
        }
        this.orders = orders;
        if (this.selectedOrder) {
          this.selectedOrder = this.orders.find((order) => order.id === this.selectedOrder?.id) ?? null;
          if (this.selectedOrder && this.selectedItem) {
            this.selectedItem = this.selectedOrder.orderItems.find((item) => item.id === this.selectedItem?.id) ?? null;
            if (this.selectedItem) this.loadOrderResults(this.selectedOrder.id, this.selectedItem);
          } else if (!this.selectedOrder) {
            this.selectedItem = null;
            this.resultsLoading = false;
            this.resultsByItem.clear();
            this.form.controls.parameters.clear();
          }
        }
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = getApiErrorMessage(error, 'Unable to load lab orders.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected selectOrder(order: ResultOrder): void {
    this.storeCurrentParameters();
    this.selectedOrder = order;
    this.selectedItem = null;
    this.resultsByItem.clear();
    this.resultsError = '';
    this.submitError = '';
    this.submissionMessage = '';
    this.resultsLoading = true;
    this.form.controls.parameters.clear();
    this.resultService.getResultsForOrder(order.id).subscribe({
      next: (response) => {
        if (this.selectedOrder?.id !== order.id) return;
        const results = this.parseResults(response);
        if (!results) {
          this.resultsError = 'The lab results API returned an unsupported response format.';
        } else {
          this.storeOrderResults(results);
        }
        this.resultsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        if (this.selectedOrder?.id !== order.id) return;
        this.resultsLoading = false;
        this.resultsError = getApiErrorMessage(error, 'Unable to load saved results for this order.');
        this.changeDetector.markForCheck();
      },
    });
  }

  protected selectTest(item: ResultOrderItem): void {
    if (this.saving) return;
    this.storeCurrentParameters();
    this.selectedItem = item;
    this.submitError = '';
    this.submissionMessage = '';
    this.loadParameters(item);
  }

  protected addParameter(): void {
    this.parameters.push(this.createParameter('', null, '', '', null));
  }

  protected removeParameter(index: number): void {
    if (this.parameters.length > 1 && !this.parameters.at(index).controls.resultId.value && !this.saving) {
      this.parameters.removeAt(index);
    }
  }

  protected submitResults(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.selectedOrder || !this.selectedItem ||
        this.resultsLoading || this.resultsError || this.saving) return;

    const pending = this.parameters.controls
      .map((parameter) => parameter.getRawValue() as PendingResultFormValue)
      .filter((parameter) => !parameter.resultId);
    if (!pending.length) return;
    if (pending.some((parameter) =>
      !parameter.name.trim() || !parameter.unit.trim() ||
      !/^[1-9]\d*$/.test(parameter.testParameterId) ||
      !/^-?(?:\d+\.?\d*|\.\d+)$/.test(parameter.value))) {
      this.form.markAllAsTouched();
      return;
    }
    if (new Set(pending.map((parameter) => parameter.testParameterId)).size !== pending.length) {
      this.submitError = 'Each parameter must have a unique test parameter ID.';
      return;
    }
    const parameterIds = this.parameters.controls
      .map((parameter) => parameter.controls.testParameterId.value)
      .filter((id) => /^[1-9]\d*$/.test(id));
    if (new Set(parameterIds).size !== parameterIds.length) {
      this.submitError = 'Each parameter must have a unique test parameter ID.';
      return;
    }

    this.storeCurrentParameters();
    this.saving = true;
    this.submitError = '';
    this.submissionMessage = '';
    this.submitNextResult(pending, 0, 0, this.selectedItem.id);
  }

  protected draftStatus(item: ResultOrderItem): string {
    const results = this.resultsByItem.get(item.id);
    return results?.length ? `${results.length} result(s)` : item.itemStatus || 'Pending';
  }

  protected resultStatus(parameter: ReturnType<ResultEntryComponent['createParameter']>): string {
    if (!parameter.controls.resultId.value || !this.selectedItem) return 'Not submitted';
    const parameterId = Number(parameter.controls.testParameterId.value);
    const result = this.resultsByItem.get(this.selectedItem.id)
      ?.find((entry) => entry.testParameterId === parameterId);
    return result?.resultStatus || 'Saved';
  }

  protected patientName(order: ResultOrder): string {
    const name = [order.patient?.firstName, order.patient?.lastName].filter(Boolean).join(' ');
    return name || `Patient #${order.patientId}`;
  }

  private loadParameters(item: ResultOrderItem): void {
    const results = this.resultsByItem.get(item.id) ?? [];
    const unsaved = this.unsavedParameters.get(item.id) ?? [];
    const defaults = unsaved.length ? unsaved : this.defaultParameters(item);
    const matchedResultIds = new Set<number>();
    const configuredParameters = defaults.length
      ? defaults.map((parameter) => {
        const result = results.find((entry) =>
          entry.parameterName.toLowerCase() === parameter.name.toLowerCase() ||
          entry.parameterCode?.toLowerCase() === this.parameterCode(parameter.name));
        if (result) matchedResultIds.add(result.id);
        return result
          ? {
            ...parameter,
            parameterId: result.testParameterId,
            unit: result.unit || parameter.unit,
            value: result.resultValue,
            remarks: result.remarks || '',
            resultId: result.id,
          }
          : parameter;
      })
      : [];
    const parameters = [
      ...configuredParameters,
      ...results.filter((result) => !matchedResultIds.has(result.id)).map((result) => ({
        name: result.parameterName,
        parameterId: result.testParameterId,
        unit: result.unit,
        value: result.resultValue,
        remarks: result.remarks || '',
        resultId: result.id,
      })),
    ];
    this.parameters.clear();
    parameters.forEach((parameter) => {
      this.parameters.push(this.createParameter(
        parameter.name,
        parameter.parameterId,
        parameter.unit,
        parameter.value,
        parameter.resultId ?? null,
        parameter.remarks,
      ));
    });
    if (parameters.length === 0) this.addParameter();
  }

  private defaultParameters(item: ResultOrderItem): ParameterDraft[] {
    const test = `${item.testCode} ${item.testName}`.toLowerCase();
    if (!test.includes('cbc') && !test.includes('complete blood count')) return [];
    return [
      { name: 'Hemoglobin', parameterId: null, unit: 'g/dL', value: '', remarks: '' },
      { name: 'WBC', parameterId: null, unit: 'cells/µL', value: '', remarks: '' },
      { name: 'RBC', parameterId: null, unit: 'million/µL', value: '', remarks: '' },
      { name: 'Platelets', parameterId: null, unit: 'cells/µL', value: '', remarks: '' },
    ];
  }

  private createParameter(
    name: string,
    testParameterId: number | null,
    unit: string,
    value: string,
    resultId: number | null,
    remarks = '',
  ) {
    return this.fb.nonNullable.group({
      name: [name, Validators.required],
      testParameterId: [testParameterId?.toString() ?? '', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
      unit: [unit, Validators.required],
      value: [value, [Validators.required, Validators.pattern(/^-?(?:\d+\.?\d*|\.\d+)$/)]],
      remarks: [remarks],
      resultId: [resultId],
    });
  }

  private loadOrderResults(orderId: number, item: ResultOrderItem): void {
    this.resultsLoading = true;
    this.resultsError = '';
    this.resultService.getResultsForOrder(orderId).subscribe({
      next: (response) => {
        if (this.selectedOrder?.id !== orderId) return;
        const results = this.parseResults(response);
        if (!results) {
          this.resultsError = 'The lab results API returned an unsupported response format.';
        } else {
          this.resultsByItem.clear();
          this.storeOrderResults(results);
          if (this.selectedItem?.id === item.id) this.loadParameters(item);
        }
        this.resultsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        if (this.selectedOrder?.id !== orderId) return;
        this.resultsLoading = false;
        this.resultsError = getApiErrorMessage(error, 'Unable to load saved results for this order.');
        this.changeDetector.markForCheck();
      },
    });
  }

  private submitNextResult(
    pending: PendingResultFormValue[],
    index: number,
    submittedCount: number,
    orderItemId: number,
  ): void {
    if (index >= pending.length) {
      this.saving = false;
      if (this.selectedOrder && this.selectedItem?.id === orderItemId) {
        this.loadOrderResults(this.selectedOrder.id, this.selectedItem);
      }
      this.submissionMessage = `${submittedCount} result(s) submitted successfully.`;
      this.unsavedParameters.delete(orderItemId);
      this.changeDetector.markForCheck();
      return;
    }

    const parameter = pending[index];
    const request: CreateLabResultRequest = {
      orderItemId,
      testParameterId: Number(parameter.testParameterId),
      resultValue: parameter.value.trim(),
      unit: parameter.unit.trim(),
      remarks: parameter.remarks.trim(),
      enteredBy: this.form.controls.enteredBy.value.trim(),
    };

    this.resultService.createResult(request).subscribe({
      next: (result) => {
        const currentResults = this.resultsByItem.get(orderItemId) ?? [];
        this.resultsByItem.set(orderItemId, [...currentResults, result]);
        const control = this.parameters.controls.find(
          (entry) => Number(entry.controls.testParameterId.value) === request.testParameterId,
        );
        if (control) control.controls.resultId.setValue(result.id);
        this.submitNextResult(pending, index + 1, submittedCount + 1, orderItemId);
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        const message = getApiErrorMessage(error, 'Unable to submit this result.');
        this.submitError = submittedCount
          ? `${submittedCount} result(s) were submitted. The next result failed: ${message} Refresh saved results before retrying.`
          : message;
        if (this.selectedOrder && this.selectedItem) {
          this.loadOrderResults(this.selectedOrder.id, this.selectedItem);
        }
        this.changeDetector.markForCheck();
      },
    });
  }

  private storeCurrentParameters(): void {
    if (!this.selectedItem || !this.parameters.length) return;
    const unsaved = this.parameters.controls
      .map((parameter) => parameter.getRawValue() as PendingResultFormValue)
      .filter((parameter) => !parameter.resultId)
      .map((parameter) => ({
        name: parameter.name,
        parameterId: /^[1-9]\d*$/.test(parameter.testParameterId) ? Number(parameter.testParameterId) : null,
        unit: parameter.unit,
        value: parameter.value,
        remarks: parameter.remarks,
      }));
    this.unsavedParameters.set(this.selectedItem.id, unsaved);
  }

  private storeOrderResults(results: LabResult[]): void {
    for (const result of results) {
      const current = this.resultsByItem.get(result.orderItemId) ?? [];
      this.resultsByItem.set(result.orderItemId, [...current, result]);
    }
  }

  private parseResults(response: unknown): LabResult[] | null {
    const rows = Array.isArray(response)
      ? response
      : this.isRecord(response) && Array.isArray(response['content'])
        ? response['content']
        : null;
    if (!rows || !rows.every((row) => this.isLabResult(row))) return null;
    return rows;
  }

  private isLabResult(value: unknown): value is LabResult {
    return this.isRecord(value) && typeof value['id'] === 'number' &&
      typeof value['orderItemId'] === 'number' && typeof value['testParameterId'] === 'number' &&
      typeof value['parameterName'] === 'string' && typeof value['resultValue'] === 'string' &&
      typeof value['unit'] === 'string';
  }

  private parameterCode(name: string): string {
    return ({ Hemoglobin: 'hb', WBC: 'wbc', RBC: 'rbc', Platelets: 'plt' } as Record<string, string>)[name] ?? '';
  }

  private parseOrders(response: unknown): ResultOrder[] | null {
    const rows = Array.isArray(response)
      ? response
      : this.isRecord(response) && Array.isArray(response['content'])
        ? response['content']
        : null;
    if (!rows || !rows.every((row) => this.isOrder(row))) return null;
    return rows;
  }

  private isOrder(value: unknown): value is ResultOrder {
    return this.isRecord(value) && typeof value['id'] === 'number' &&
      typeof value['patientId'] === 'number' && Array.isArray(value['orderItems']) &&
      value['orderItems'].every((item: unknown) =>
        this.isRecord(item) && typeof item['id'] === 'number' &&
        typeof item['testName'] === 'string' && typeof item['testCode'] === 'string');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
