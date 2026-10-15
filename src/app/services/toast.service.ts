import { Injectable, signal } from '@angular/core';

import { Toast } from '../models/toast';

// Errors stay until dismissed so they can't vanish before they're read (WCAG 2.2.1).
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  error(message: string): void {
    const id = this.nextId++;
    this._toasts.update((toasts) => [...toasts, { id, message }]);
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
