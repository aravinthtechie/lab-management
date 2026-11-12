import { HttpErrorResponse } from '@angular/common/http';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function messageFrom(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    const text = value.trim();
    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) return messageFrom(parsed);
    } catch {
      return text;
    }
    return text;
  }
  if (Array.isArray(value)) {
    const messages = value.map(messageFrom).filter((message): message is string => !!message);
    if (messages.length) return messages.join(' ');
  }
  if (!isRecord(value)) return undefined;

  for (const key of ['message', 'detail', 'defaultMessage', 'title', 'error']) {
    const message = messageFrom(value[key]);
    if (message) return message;
  }
  return messageFrom(value['errors']);
}

export function getApiSuccessMessage(response: unknown, fallback: string): string {
  return messageFrom(response) ?? fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  return messageFrom(error.error) ?? fallback;
}
