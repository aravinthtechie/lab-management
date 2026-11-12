import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormRecord, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/api/toast.service';

type SettingValue = string | number | boolean;
type SettingFieldType = 'text' | 'email' | 'url' | 'tel' | 'number' | 'select' | 'textarea' | 'checkbox';

interface SettingField {
  key: string;
  label: string;
  type: SettingFieldType;
  defaultValue: SettingValue;
  placeholder?: string;
  help?: string;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}

interface SettingsCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  fields: SettingField[];
  link?: { label: string; path: string };
}

const STORAGE_KEY = 'labcare.settings.v1';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly categories: SettingsCategory[] = [
    {
      id: 'general',
      label: 'General',
      icon: 'business',
      description: 'Laboratory identity, contact details, and regional preferences.',
      fields: [
        { key: 'labName', label: 'Laboratory name', type: 'text', defaultValue: 'LABCARE Diagnostics', required: true },
        { key: 'labLogo', label: 'Logo URL', type: 'url', defaultValue: '', placeholder: 'https://example.com/logo.png', help: 'Use a publicly accessible image URL.' },
        { key: 'labAddress', label: 'Address', type: 'textarea', defaultValue: '', placeholder: 'Street, city, state and postal code' },
        { key: 'labEmail', label: 'Email', type: 'email', defaultValue: '', placeholder: 'contact@laboratory.example' },
        { key: 'labPhone', label: 'Phone', type: 'tel', defaultValue: '', placeholder: '+91 98765 43210' },
        { key: 'labWebsite', label: 'Website', type: 'url', defaultValue: '', placeholder: 'https://laboratory.example' },
        { key: 'dateFormat', label: 'Date format', type: 'select', defaultValue: 'DD/MM/YYYY', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
        { key: 'timeFormat', label: 'Time format', type: 'select', defaultValue: '12-hour', options: ['12-hour', '24-hour'] },
        { key: 'language', label: 'Default language', type: 'select', defaultValue: 'English', options: ['English', 'Hindi'] },
        { key: 'timeZone', label: 'Time zone', type: 'select', defaultValue: 'Asia/Kolkata', options: ['Asia/Kolkata', 'UTC', 'Asia/Dubai', 'Europe/London', 'America/New_York'] },
      ],
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: 'receipt_long',
      description: 'Default currency, tax, invoice numbering, and payment preferences.',
      fields: [
        { key: 'currency', label: 'Default currency', type: 'select', defaultValue: 'INR', options: ['INR', 'USD', 'EUR', 'GBP'] },
        { key: 'gstEnabled', label: 'Enable GST', type: 'checkbox', defaultValue: true },
        { key: 'gstNumber', label: 'GST registration number', type: 'text', defaultValue: '', placeholder: 'Enter GSTIN' },
        { key: 'taxPercentage', label: 'Tax percentage', type: 'number', defaultValue: 0, min: 0, max: 100 },
        { key: 'discountEnabled', label: 'Allow discounts', type: 'checkbox', defaultValue: true },
        { key: 'maxDiscount', label: 'Maximum discount (%)', type: 'number', defaultValue: 20, min: 0, max: 100 },
        { key: 'paymentModes', label: 'Accepted payment modes', type: 'text', defaultValue: 'Cash, Card, UPI, Bank transfer', help: 'Separate payment modes with commas.' },
        { key: 'invoicePrefix', label: 'Invoice prefix', type: 'text', defaultValue: 'INV-', required: true },
        { key: 'receiptFormat', label: 'Receipt number format', type: 'text', defaultValue: 'REC-{YYYY}-{000001}', required: true },
        { key: 'refundPolicy', label: 'Refund policy', type: 'textarea', defaultValue: '', placeholder: 'Describe the laboratory refund policy.' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'description',
      description: 'Configure report presentation and result display preferences.',
      fields: [
        { key: 'reportHeader', label: 'Report header', type: 'textarea', defaultValue: '', placeholder: 'Text displayed at the top of reports' },
        { key: 'reportFooter', label: 'Report footer', type: 'textarea', defaultValue: '', placeholder: 'Text displayed at the bottom of reports' },
        { key: 'signatory', label: 'Authorized signatory', type: 'text', defaultValue: '', placeholder: 'Name and qualifications' },
        { key: 'reportPrefix', label: 'Report number prefix', type: 'text', defaultValue: 'RPT-', required: true },
        { key: 'reportFormat', label: 'Report format', type: 'select', defaultValue: 'PDF', options: ['PDF'] },
        { key: 'showReferenceRanges', label: 'Show reference ranges', type: 'checkbox', defaultValue: true },
        { key: 'highlightAbnormal', label: 'Highlight abnormal results', type: 'checkbox', defaultValue: true },
        { key: 'digitalSignature', label: 'Show digital signature', type: 'checkbox', defaultValue: false, help: 'Configure a trusted signing provider before enabling in production.' },
      ],
    },
    {
      id: 'samples',
      label: 'Sample Collection',
      icon: 'colorize',
      description: 'Set sample identifiers, barcode labels, and collection guidance.',
      fields: [
        { key: 'samplePrefix', label: 'Sample ID prefix', type: 'text', defaultValue: 'SMP-', required: true },
        { key: 'barcodeFormat', label: 'Barcode format', type: 'select', defaultValue: 'Code 128', options: ['Code 128', 'Code 39', 'QR code'] },
        { key: 'collectionTimeFormat', label: 'Collection time format', type: 'select', defaultValue: '24-hour', options: ['12-hour', '24-hour'] },
        { key: 'rejectionReasons', label: 'Sample rejection reasons', type: 'textarea', defaultValue: 'Insufficient quantity\nIncorrect container\nLeaking or damaged\nUnlabelled sample', help: 'Enter one reason per line.' },
        { key: 'handlingInstructions', label: 'Specimen handling instructions', type: 'textarea', defaultValue: '', placeholder: 'Handling instructions shown to collection staff' },
        { key: 'acceptanceCriteria', label: 'Sample acceptance criteria', type: 'textarea', defaultValue: '', placeholder: 'Criteria for accepting a specimen' },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications',
      description: 'Choose which patient and staff notifications are enabled.',
      fields: [
        { key: 'smsEnabled', label: 'Enable SMS notifications', type: 'checkbox', defaultValue: false },
        { key: 'emailEnabled', label: 'Enable email notifications', type: 'checkbox', defaultValue: true },
        { key: 'whatsappEnabled', label: 'Enable WhatsApp notifications', type: 'checkbox', defaultValue: false },
        { key: 'orderConfirmation', label: 'Order confirmation', type: 'checkbox', defaultValue: true },
        { key: 'sampleCollectionNotice', label: 'Sample collection notification', type: 'checkbox', defaultValue: true },
        { key: 'reportReadyNotice', label: 'Report ready notification', type: 'checkbox', defaultValue: true },
        { key: 'criticalResultNotice', label: 'Critical result notification', type: 'checkbox', defaultValue: true, help: 'Critical results should also follow your laboratory escalation procedure.' },
      ],
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: 'manage_accounts',
      description: 'Set login protections and session policy. Manage accounts and permissions separately.',
      link: { label: 'Open user management', path: '/user-management' },
      fields: [
        { key: 'minPasswordLength', label: 'Minimum password length', type: 'number', defaultValue: 12, min: 8, max: 128 },
        { key: 'requireUppercase', label: 'Require uppercase letter', type: 'checkbox', defaultValue: true },
        { key: 'requireNumber', label: 'Require a number', type: 'checkbox', defaultValue: true },
        { key: 'requireSymbol', label: 'Require a symbol', type: 'checkbox', defaultValue: false },
        { key: 'sessionTimeout', label: 'Session timeout (minutes)', type: 'number', defaultValue: 30, min: 5, max: 1440 },
        { key: 'lockoutAttempts', label: 'Failed login attempts before lockout', type: 'number', defaultValue: 5, min: 3, max: 20 },
        { key: 'lockoutDuration', label: 'Account lockout duration (minutes)', type: 'number', defaultValue: 15, min: 1, max: 1440 },
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: 'inventory_2',
      description: 'Configure reagent stock alerts, expiry warnings, units, and purchasing.',
      fields: [
        { key: 'reagentCategories', label: 'Reagent categories', type: 'textarea', defaultValue: 'Reagents\nConsumables\nControls\nCalibrators', help: 'Enter one category per line.' },
        { key: 'unitsOfMeasure', label: 'Units of measurement', type: 'text', defaultValue: 'Each, Box, Pack, mL, L, mg, g' },
        { key: 'stockAlertLevel', label: 'Low stock alert level', type: 'number', defaultValue: 10, min: 0 },
        { key: 'expiryAlertDays', label: 'Expiry alert (days before expiry)', type: 'number', defaultValue: 30, min: 0, max: 3650 },
        { key: 'purchasePrefix', label: 'Purchase order prefix', type: 'text', defaultValue: 'PO-', required: true },
        { key: 'supplierReference', label: 'Supplier configuration note', type: 'textarea', defaultValue: '', placeholder: 'Supplier onboarding or purchasing notes' },
      ],
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: 'apartment',
      description: 'Set defaults used by branches. Manage branch records separately.',
      link: { label: 'Open branch management', path: '/branch-management' },
      fields: [
        { key: 'branchInvoicePrefix', label: 'Branch invoice prefix', type: 'text', defaultValue: '{BRANCH}-INV-', required: true },
        { key: 'branchReportPrefix', label: 'Branch report prefix', type: 'text', defaultValue: '{BRANCH}-RPT-', required: true },
        { key: 'workingDays', label: 'Working days', type: 'text', defaultValue: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday', help: 'Separate days with commas.' },
        { key: 'workingHours', label: 'Working hours', type: 'text', defaultValue: '09:00-18:00', placeholder: '09:00-18:00' },
      ],
    },
  ];

  protected readonly form: FormRecord<FormControl<SettingValue>> = this.fb.nonNullable.record<SettingValue>({});
  protected activeCategory = this.categories[0];
  protected storageError = '';
  protected saved = false;

  constructor() {
    const stored = this.readStoredSettings();
    for (const category of this.categories) {
      for (const field of category.fields) {
        const value = stored[field.key];
        const initialValue = this.matchesType(field, value) ? value : field.defaultValue;
        const validators = [];
        if (field.required) validators.push(Validators.required);
        if (field.type === 'email') validators.push(Validators.email);
        if (field.type === 'url') validators.push(Validators.pattern(/^https?:\/\/.+/));
        if (field.type === 'number' && field.min !== undefined) validators.push(Validators.min(field.min));
        if (field.type === 'number' && field.max !== undefined) validators.push(Validators.max(field.max));
        this.form.addControl(field.key, new FormControl<SettingValue>(initialValue, { nonNullable: true, validators }));
      }
    }
    this.form.valueChanges.subscribe(() => this.saved = false);
  }

  protected setCategory(category: SettingsCategory): void {
    this.activeCategory = category;
  }

  protected controlInvalid(key: string): boolean {
    const control = this.form.get(key);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected save(): void {
    this.storageError = '';
    this.saved = false;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const invalidField = this.categories
        .flatMap(category => category.fields)
        .find(field => this.form.controls[field.key].invalid);
      if (invalidField) {
        this.activeCategory = this.categories.find(category =>
          category.fields.some(field => field.key === invalidField.key)
        ) ?? this.activeCategory;
      }
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.form.getRawValue()));
      this.saved = true;
      this.toast.showSuccess('Settings saved in this browser.');
    } catch (error) {
      this.storageError = error instanceof Error
        ? `Unable to save settings: ${error.message}`
        : 'Unable to save settings in this browser.';
    }
  }

  protected resetChanges(): void {
    const stored = this.readStoredSettings();
    for (const category of this.categories) {
      for (const field of category.fields) {
        const value = stored[field.key];
        this.form.controls[field.key].setValue(this.matchesType(field, value) ? value : field.defaultValue);
      }
    }
    this.form.markAsPristine();
    this.saved = false;
  }

  private readStoredSettings(): Record<string, unknown> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        this.storageError = 'Saved settings could not be read. Reset browser settings to restore defaults.';
        return {};
      }
      return value as Record<string, unknown>;
    } catch (error) {
      this.storageError = error instanceof Error
        ? `Unable to read saved settings: ${error.message}`
        : 'Unable to read saved settings in this browser.';
      return {};
    }
  }

  private matchesType(field: SettingField, value: unknown): value is SettingValue {
    if (field.type === 'checkbox') return typeof value === 'boolean';
    if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value);
    return typeof value === 'string';
  }
}
