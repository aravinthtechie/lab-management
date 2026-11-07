import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

type IntegrationTab = 'overview' | 'devices' | 'mappings' | 'activity';

@Component({
  selector: 'app-analyzer-integration',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="integration-card">
      <header class="integration-header">
        <span class="material-icons" aria-hidden="true">settings_input_component</span>
        <h1>{{ 'Analyzer Integration' | translate }}</h1>
      </header>

      <div class="integration-body">
        <div class="page-intro">
          <div>
            <h2>{{ 'Analyzer connectivity' | translate }}</h2>
            <p>{{ 'Manage analyzer connections, map test codes and monitor imported results.' | translate }}</p>
          </div>
          <button type="button" class="primary-button" (click)="openSetup()">
            <span class="material-icons" aria-hidden="true">add</span>
            {{ 'Add analyzer' | translate }}
          </button>
        </div>

        <div class="design-notice" role="note">
          <span class="material-icons" aria-hidden="true">info</span>
          <span><strong>{{ 'Design preview:' | translate }}</strong> {{ 'analyzer APIs are not connected yet. Device settings and mappings shown here are not saved, and no analyzer connection is active.' | translate }}</span>
        </div>

        <nav class="tabs" [attr.aria-label]="'Analyzer integration sections' | translate">
          <button type="button" [class.active]="activeTab === 'overview'"
                  [attr.aria-current]="activeTab === 'overview' ? 'page' : null"
                  (click)="setTab('overview')">
            <span class="material-icons" aria-hidden="true">dashboard</span>{{ 'Overview' | translate }}
          </button>
          <button type="button" [class.active]="activeTab === 'devices'"
                  [attr.aria-current]="activeTab === 'devices' ? 'page' : null"
                  (click)="setTab('devices')">
            <span class="material-icons" aria-hidden="true">devices</span>{{ 'Analyzer devices' | translate }}
          </button>
          <button type="button" [class.active]="activeTab === 'mappings'"
                  [attr.aria-current]="activeTab === 'mappings' ? 'page' : null"
                  (click)="setTab('mappings')">
            <span class="material-icons" aria-hidden="true">device_hub</span>{{ 'Test mappings' | translate }}
          </button>
          <button type="button" [class.active]="activeTab === 'activity'"
                  [attr.aria-current]="activeTab === 'activity' ? 'page' : null"
                  (click)="setTab('activity')">
            <span class="material-icons" aria-hidden="true">receipt_long</span>{{ 'Import activity' | translate }}
          </button>
        </nav>

        @if (activeTab === 'overview') {
          <div class="overview">
            <div class="metrics">
              <article class="metric-card">
                <span class="metric-icon material-icons" aria-hidden="true">devices</span>
                <span class="metric-value">—</span>
                <span class="metric-label">{{ 'Configured analyzers' | translate }}</span>
                <small>{{ 'Available when device APIs are connected' | translate }}</small>
              </article>
              <article class="metric-card">
                <span class="metric-icon disconnected material-icons" aria-hidden="true">link_off</span>
                <span class="metric-value">—</span>
                <span class="metric-label">{{ 'Connection status' | translate }}</span>
                <small>{{ 'No live analyzer status available' | translate }}</small>
              </article>
              <article class="metric-card">
                <span class="metric-icon material-icons" aria-hidden="true">science</span>
                <span class="metric-value">—</span>
                <span class="metric-label">{{ 'Results imported today' | translate }}</span>
                <small>{{ 'Available when import APIs are connected' | translate }}</small>
              </article>
              <article class="metric-card">
                <span class="metric-icon warning material-icons" aria-hidden="true">report_problem</span>
                <span class="metric-value">—</span>
                <span class="metric-label">{{ 'Items needing attention' | translate }}</span>
                <small>{{ 'Mapping and communication errors' | translate }}</small>
              </article>
            </div>

            <div class="overview-grid">
              <section class="panel setup-panel">
                <div class="panel-title">
                  <div>
                    <h3>{{ 'Connection setup' | translate }}</h3>
                    <p>{{ 'Typical information needed to connect a laboratory analyzer.' | translate }}</p>
                  </div>
                  <span class="material-icons" aria-hidden="true">lan</span>
                </div>
                <div class="setup-steps">
                  <div><span>1</span><strong>{{ 'Register device' | translate }}</strong><small>{{ 'Name, manufacturer and analyzer model' | translate }}</small></div>
                  <div><span>2</span><strong>{{ 'Configure protocol' | translate }}</strong><small>{{ 'HL7, ASTM, TCP/IP or serial connection details' | translate }}</small></div>
                  <div><span>3</span><strong>{{ 'Map test codes' | translate }}</strong><small>{{ 'Link analyzer codes to lab tests and parameters' | translate }}</small></div>
                  <div><span>4</span><strong>{{ 'Monitor imports' | translate }}</strong><small>{{ 'Review received messages and unmatched results' | translate }}</small></div>
                </div>
                <button type="button" class="text-button" (click)="setTab('devices')">
                  {{ 'View analyzer devices' | translate }} <span class="material-icons" aria-hidden="true">arrow_forward</span>
                </button>
              </section>

              <section class="panel connection-panel">
                <div class="panel-title">
                  <div>
                    <h3>{{ 'Connection status' | translate }}</h3>
                    <p>{{ 'Live status will appear after the analyzer service is integrated.' | translate }}</p>
                  </div>
                  <span class="status-chip"><span></span>{{ 'Not connected' | translate }}</span>
                </div>
                <div class="empty-state">
                  <span class="material-icons" aria-hidden="true">cable</span>
                  <strong>{{ 'No analyzer connection configured' | translate }}</strong>
                  <span>{{ 'Register an analyzer and configure its connection through the backend integration service.' | translate }}</span>
                </div>
              </section>
            </div>
          </div>
        }

        @if (activeTab === 'devices') {
          <section class="panel tab-panel">
            <div class="panel-title">
              <div>
                <h3>{{ 'Analyzer devices' | translate }}</h3>
                <p>{{ 'Device identity, protocol, connection endpoint and current availability.' | translate }}</p>
              </div>
              <button type="button" class="secondary-button" (click)="openSetup()">
                <span class="material-icons" aria-hidden="true">add</span>{{ 'Add analyzer' | translate }}
              </button>
            </div>
            <div class="empty-state large">
              <span class="material-icons" aria-hidden="true">devices</span>
              <strong>{{ 'No analyzers configured' | translate }}</strong>
              <span>{{ 'Once the device management API is available, registered analyzers and their connection status will be listed here.' | translate }}</span>
            </div>
          </section>
        }

        @if (activeTab === 'mappings') {
          <section class="panel tab-panel">
            <div class="panel-title">
              <div>
                <h3>{{ 'Test code mappings' | translate }}</h3>
                <p>{{ 'Map analyzer-provided test and parameter codes to the lab catalog.' | translate }}</p>
              </div>
              <button type="button" class="secondary-button" (click)="mappingHelp = !mappingHelp">
                <span class="material-icons" aria-hidden="true">{{ mappingHelp ? 'expand_less' : 'help_outline' }}</span>
                {{ mappingHelp ? 'Hide guide' : 'Mapping guide' }}
              </button>
            </div>
            @if (mappingHelp) {
              <div class="mapping-guide">
                <strong>{{ 'How mappings work' | translate }}</strong>
                <p>{{ 'Each analyzer code should resolve to a lab test and, where applicable, a specific test parameter. Unmapped or ambiguous codes should be held for review rather than attached to a patient result.' | translate }}</p>
              </div>
            }
            <div class="mapping-columns">
              <div><span>Analyzer device</span><strong>Source instrument</strong></div>
              <div><span>Analyzer test / parameter code</span><strong>Code received from instrument</strong></div>
              <div><span>Lab test / parameter</span><strong>Destination in lab catalog</strong></div>
              <div><span>Mapping status</span><strong>Active or needs review</strong></div>
            </div>
            <div class="empty-state compact">
              <span class="material-icons" aria-hidden="true">device_hub</span>
              <strong>{{ 'No test mappings configured' | translate }}</strong>
              <span>{{ 'Mappings will appear here after the analyzer and test-catalog APIs are connected.' | translate }}</span>
            </div>
          </section>
        }

        @if (activeTab === 'activity') {
          <section class="panel tab-panel">
            <div class="panel-title">
              <div>
                <h3>{{ 'Import activity' | translate }}</h3>
                <p>{{ 'Monitor analyzer messages, result imports and items that need attention.' | translate }}</p>
              </div>
              <span class="activity-filter">{{ 'All activity' | translate }} <span class="material-icons" aria-hidden="true">expand_more</span></span>
            </div>
            <div class="activity-columns">
              <span>{{ 'Received' | translate }}</span><span>{{ 'Analyzer' | translate }}</span><span>{{ 'Sample / order' | translate }}</span>
              <span>{{ 'Imported results' | translate }}</span><span>{{ 'Status' | translate }}</span><span>{{ 'Message' | translate }}</span>
            </div>
            <div class="empty-state compact">
              <span class="material-icons" aria-hidden="true">inbox</span>
              <strong>{{ 'No analyzer imports yet' | translate }}</strong>
              <span>{{ 'Import events and communication errors will appear here when the integration service is available.' | translate }}</span>
            </div>
          </section>
        }
      </div>
    </section>

    @if (setupOpen) {
      <div class="modal-backdrop" (click)="closeSetup()">
        <section class="setup-modal" role="dialog" aria-modal="true" aria-labelledby="setupTitle"
                 (click)="$event.stopPropagation()">
          <header class="modal-header">
            <div>
              <span class="eyebrow">{{ 'DEVICE CONFIGURATION' | translate }}</span>
              <h2 id="setupTitle">{{ 'Add analyzer' | translate }}</h2>
            </div>
            <button type="button" class="close-button" [attr.aria-label]="'Close' | translate" (click)="closeSetup()">×</button>
          </header>
          <div class="modal-body">
            <p class="modal-note">{{ 'This form previews the configuration fields. It will not connect to or save a device until the backend API is available.' | translate }}</p>
            <form [formGroup]="setupForm">
              <div class="form-grid">
                <label>{{ 'Analyzer name' | translate }} <input class="form-control" formControlName="name" [placeholder]="'e.g. Hematology Analyzer 1' | translate"></label>
                <label>{{ 'Manufacturer' | translate }} <input class="form-control" formControlName="manufacturer" [placeholder]="'Manufacturer' | translate"></label>
                <label>{{ 'Model' | translate }} <input class="form-control" formControlName="model" [placeholder]="'Model' | translate"></label>
                <label>Protocol
                  <select class="form-control" formControlName="protocol">
                    <option value="">{{ 'Select protocol' | translate }}</option>
                    <option value="HL7">HL7</option>
                    <option value="ASTM">ASTM</option>
                    <option value="TCP/IP">TCP/IP</option>
                    <option value="SERIAL">{{ 'Serial' | translate }}</option>
                  </select>
                </label>
                <label>{{ 'Host / IP address' | translate }} <input class="form-control" formControlName="host" [placeholder]="'e.g. 192.168.1.20' | translate"></label>
                <label>{{ 'Port' | translate }} <input class="form-control" type="number" formControlName="port" [placeholder]="'e.g. 5000' | translate"></label>
                <label class="full-width">{{ 'Connection notes' | translate }} <textarea class="form-control" formControlName="notes" rows="2" [placeholder]="'Optional setup notes' | translate"></textarea></label>
              </div>
            </form>
          </div>
          <footer class="modal-actions">
            <button type="button" class="outline-button" (click)="closeSetup()">{{ 'Close' | translate }}</button>
            <button type="button" class="primary-button" disabled
                    title="Connect an analyzer configuration API to enable this action">
              <span class="material-icons" aria-hidden="true">save</span>{{ 'Save analyzer' | translate }}
            </button>
          </footer>
        </section>
      </div>
    }
  `,
  styleUrls: ['./analyzer-integration.component.scss'],
})
export class AnalyzerIntegrationComponent {
  private readonly fb = new FormBuilder();

  protected activeTab: IntegrationTab = 'overview';
  protected setupOpen = false;
  protected mappingHelp = false;
  protected readonly setupForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    manufacturer: [''],
    model: [''],
    protocol: [''],
    host: [''],
    port: [''],
    notes: [''],
  });

  protected setTab(tab: IntegrationTab): void {
    this.activeTab = tab;
  }

  protected openSetup(): void {
    this.setupOpen = true;
  }

  protected closeSetup(): void {
    this.setupOpen = false;
  }
}
