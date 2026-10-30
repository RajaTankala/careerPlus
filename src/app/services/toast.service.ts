import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public readonly activeToast = signal<ToastMessage | null>(null);
  private timer: any = null;

  public show(
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    message: string,
    durationMs: number = 3500
  ): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    this.activeToast.set({
      id: 'toast-' + Date.now(),
      type,
      title,
      message,
      timestamp: timeStr,
    });

    this.timer = setTimeout(() => {
      this.activeToast.set(null);
      this.timer = null;
    }, durationMs);
  }

  public showSaveConfirmation(itemDescription: string): void {
    this.show(
      'success',
      '✓ Data Saved to Local Storage!',
      `"${itemDescription}" has been safely persisted to your browser storage.`
    );
  }

  public dismiss(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.activeToast.set(null);
  }
}
