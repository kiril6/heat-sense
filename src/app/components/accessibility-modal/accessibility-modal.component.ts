import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accessibility-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility-modal.component.html',
  styleUrls: ['./accessibility-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilityModalComponent {
  @Output() close = new EventEmitter<void>();
  
  highContrastMode = false;
  reducedMotion = false;

  ngOnInit(): void {
    // Load saved preferences
    const savedHighContrast = localStorage.getItem('highContrastMode');
    this.highContrastMode = savedHighContrast === 'true';
    
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    this.reducedMotion = savedReducedMotion === 'true';
    
    // Apply preferences
    this.applyHighContrast();
    this.applyReducedMotion();
  }

  toggleHighContrast(): void {
    this.highContrastMode = !this.highContrastMode;
    localStorage.setItem('highContrastMode', this.highContrastMode.toString());
    this.applyHighContrast();
  }

  toggleReducedMotion(): void {
    this.reducedMotion = !this.reducedMotion;
    localStorage.setItem('reducedMotion', this.reducedMotion.toString());
    this.applyReducedMotion();
  }

  private applyHighContrast(): void {
    if (this.highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }

  private applyReducedMotion(): void {
    if (this.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
