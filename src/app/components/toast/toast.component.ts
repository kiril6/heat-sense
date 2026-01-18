import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'success' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({ 
          opacity: 0, 
          transform: 'translateX(-50px) scale(0.8)',
          maxHeight: 0,
          padding: 0,
          marginBottom: 0
        }))
      ])
    ])
  ]
})
export class ToastComponent {
  toasts: ToastMessage[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  addToast(message: string, type: ToastMessage['type'] = 'info', duration: number = 0): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { id, message, type, duration };
    
    this.toasts.push(toast);
    this.cdr.markForCheck();
    return id;
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-times-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-info-circle';
    }
  }
}
