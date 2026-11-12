import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { getApiErrorMessage } from '../../core/api/api-error';
import { LabResult, LabResultService } from './lab-result.service';

@Component({
  selector: 'app-lab-processing',
  standalone: true,
  template: `
    <section class="processing-card">
      <header class="processing-header">
        <span class="material-icons" aria-hidden="true">biotech</span>
        <h1>Lab Processing</h1>
      </header>

      <div class="processing-body">
        <div class="intro">
          <div>
            <h2>Entered lab results</h2>
            <p>Review parameter results recorded for lab orders.</p>
          </div>
          <button type="button" class="refresh-button" (click)="loadResults()" [disabled]="loading">
            <span class="material-icons" aria-hidden="true">refresh</span>
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        @if (error) {
          <p class="error-message" role="alert">{{ error }}</p>
        }

        <section class="results-panel" aria-label="Lab results">
          <div class="panel-heading">
            <div>
              <h3>Results</h3>
              <p>Each row represents one test parameter result.</p>
            </div>
            <span class="count">{{ results.length }}</span>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Sample</th>
                  <th scope="col">Test</th>
                  <th scope="col">Parameter</th>
                  <th scope="col">Result</th>
                  <th scope="col">Entered by</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                @if (loading && !results.length) {
                  <tr><td class="empty-state" colspan="7">Loading lab results...</td></tr>
                } @else if (error && !results.length) {
                  <tr><td class="empty-state" colspan="7">Lab results could not be loaded.</td></tr>
                } @else {
                  @for (result of results; track result.id) {
                    <tr>
                      <td>
                        <strong>{{ result.orderNumber || 'Order #' + result.orderId }}</strong>
                        <small>Result #{{ result.id }}</small>
                      </td>
                      <td>{{ result.sampleCode || (result.sampleCollectionId ? 'Sample #' + result.sampleCollectionId : '—') }}</td>
                      <td>{{ result.testName || '—' }}</td>
                      <td>
                        <strong>{{ result.parameterName }}</strong>
                        @if (result.parameterCode) { <small>{{ result.parameterCode }}</small> }
                      </td>
                      <td><strong>{{ result.resultValue }}</strong> {{ result.unit }}</td>
                      <td>{{ result.enteredBy || '—' }}</td>
                      <td>
                        <span class="status-chip">{{ result.resultStatus || '—' }}</span>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td class="empty-state" colspan="7">No lab results have been entered yet.</td></tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `,
  styleUrls: ['./lab-processing.component.scss'],
})
export class LabProcessingComponent implements OnInit {
  private readonly service = inject(LabResultService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  protected results: LabResult[] = [];
  protected loading = false;
  protected error = '';

  ngOnInit(): void {
    this.loadResults();
  }

  protected loadResults(): void {
    this.loading = true;
    this.error = '';
    this.service.getResults().subscribe({
      next: (response) => {
        this.loading = false;
        const results = this.parseResults(response);
        if (!results) {
          this.results = [];
          this.error = 'The lab results API returned an unsupported response format.';
        } else {
          this.results = results;
        }
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = getApiErrorMessage(error, 'Unable to load lab results.');
        this.changeDetector.markForCheck();
      },
    });
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
    return this.isRecord(value) &&
      typeof value['id'] === 'number' &&
      typeof value['orderId'] === 'number' &&
      typeof value['orderItemId'] === 'number' &&
      typeof value['testParameterId'] === 'number' &&
      typeof value['parameterName'] === 'string' &&
      typeof value['resultValue'] === 'string' &&
      typeof value['unit'] === 'string';
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
