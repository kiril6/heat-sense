import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemperatureService } from '../../services/temperature.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Constants
const OUTDATED_DATA_THRESHOLD_MINUTES = 15;
const GAUGE_REFRESH_SPINNER_DURATION_MS = 1000;
const TEMP_LOW_THRESHOLD = 10;
const TEMP_HIGH_THRESHOLD = 30;

@Component({
  selector: 'app-temperature-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temperature-gauge.component.html',
  styleUrls: ['./temperature-gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemperatureGaugeComponent implements OnInit, OnDestroy {
  @Input() dataSource: 'json' | 'api' | 'none' = 'json';
  @Input() deviceId?: string;
  @Input() minTemp: number = 10;
  @Input() maxTemp: number = 30;
  @Input() currentTemp: number = 22;
  @Input() humidity?: number;
  @Input() label: string = '';
  @Input() status: string = 'active';
  @Input() lastUpdated?: string;
  @Input() gaugeId?: string;
  @Input() selectable: boolean = false;
  @Input() isSelected: boolean = false;
  @Input() showReorder: boolean = false;
  @Input() canMoveLeft: boolean = true;
  @Input() canMoveRight: boolean = true;
  @Input() showActionButtons: boolean = false;
  @Input() isExpanded: boolean = false;
  @Input() unit: 'celsius' | 'fahrenheit' = 'celsius';
  @Input() isDarkMode: boolean = false;
  @Output() selectionChange = new EventEmitter<boolean>();
  @Output() unitChange = new EventEmitter<'celsius' | 'fahrenheit'>();
  @Output() themeChange = new EventEmitter<boolean>();
  @Output() refreshRequest = new EventEmitter<string>();
  @Output() moveLeft = new EventEmitter<void>();
  @Output() moveRight = new EventEmitter<void>();
  @Output() removeFromFavorites = new EventEmitter<void>();
  @Output() toggleExpand = new EventEmitter<void>();

  loading: boolean = false;
  refreshing: boolean = false;
  error: string = '';
  private destroy$ = new Subject<void>();

  constructor(private tempService: TemperatureService) { }

  ngOnInit(): void {
    if (this.dataSource === 'api' && this.deviceId) {
      this.loadFromAPI();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFromAPI(): void {
    this.loading = true;
    this.error = '';

    this.tempService.getTemperatureFromAPI(this.deviceId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.mapDataToComponent(data);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to fetch from API';
          this.loading = false;
          console.error('API Load Error:', err);
        }
      });
  }

  private mapDataToComponent(data: any): void {
    if (!data) {
      this.error = 'No data received';
      return;
    }

    if (data.temperature) {
      this.currentTemp = data.temperature.current || 22;
      this.minTemp = data.temperature.min || 10;
      this.maxTemp = data.temperature.max || 30;
      this.label = data.device?.name || data.label || '';
    } else if (data.currentTemp !== undefined) {
      this.currentTemp = data.currentTemp;
      this.minTemp = data.minTemp || 10;
      this.maxTemp = data.maxTemp || 30;
      this.label = data.label || '';
    } else {
      this.error = 'Invalid data structure';
    }
  }

  get needleAngle(): number {
    if (this.maxTemp <= this.minTemp) {
      console.warn('Invalid temperature range: max must be greater than min');
      return 315;
    }

    const range = this.maxTemp - this.minTemp;
    const clampedTemp = Math.max(this.minTemp, Math.min(this.maxTemp, this.currentTemp));
    const progress = (clampedTemp - this.minTemp) / range;

    const startAngle = 315;
    const angleRange = 90;

    return startAngle + (progress * angleRange);
  }

  get displayTemp(): number {
    return this.unit === 'fahrenheit'
      ? Math.round((this.currentTemp * 9/5) + 32)
      : this.currentTemp;
  }

  get displayMinTemp(): number {
    return this.unit === 'fahrenheit'
      ? Math.round((this.minTemp * 9/5) + 32)
      : this.minTemp;
  }

  get displayMaxTemp(): number {
    return this.unit === 'fahrenheit'
      ? Math.round((this.maxTemp * 9/5) + 32)
      : this.maxTemp;
  }

  get tempUnit(): string {
    return this.unit === 'fahrenheit' ? '°F' : '°C';
  }

  toggleUnit(): void {
    const newUnit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius';
    this.unitChange.emit(newUnit);
  }

  toggleTheme(): void {
    this.themeChange.emit(!this.isDarkMode);
  }

  refresh(): void {
    if (this.dataSource === 'api') {
      this.loadFromAPI();
    }
  }

  refreshOutdatedData(): void {
    if (this.isDataOutdated && !this.refreshing && this.gaugeId) {
      this.refreshing = true;
      this.refreshRequest.emit(this.gaugeId);
      
      // Keep spinner visible for visual feedback
      setTimeout(() => {
        this.refreshing = false;
      }, GAUGE_REFRESH_SPINNER_DURATION_MS);
    }
  }

  onMoveLeft(): void {
    this.moveLeft.emit();
  }

  onMoveRight(): void {
    this.moveRight.emit();
  }

  onSelectionChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isSelected = checkbox.checked;
    this.selectionChange.emit(this.isSelected);
  }

  get isInactive(): boolean {
    return this.status !== 'active';
  }

  get humidityIcon(): string {
    if (this.humidity === undefined || this.isInactive) return 'fa-meh';
    
    if (this.humidity < 30) {
      return 'fa-frown'; // Too dry
    } else if (this.humidity >= 30 && this.humidity <= 60) {
      return 'fa-smile'; // Optimal
    } else {
      return 'fa-meh'; // Too humid
    }
  }

  get humidityLevelClass(): string {
    if (this.humidity === undefined || this.isInactive) return '';
    
    if (this.humidity < 30) {
      return 'humidity-low'; // Too dry
    } else if (this.humidity >= 30 && this.humidity <= 60) {
      return 'humidity-optimal'; // Optimal
    } else {
      return 'humidity-high'; // Too humid
    }
  }

  get relativeTime(): string {
    if (!this.lastUpdated || this.isInactive) return '--';
    
    const now = new Date();
    const updated = new Date(this.lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < OUTDATED_DATA_THRESHOLD_MINUTES) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  get formattedLastUpdated(): string {
    if (!this.lastUpdated || this.isInactive) return 'N/A';
    return new Date(this.lastUpdated).toLocaleString();
  }

  get isDataOutdated(): boolean {
    if (!this.lastUpdated || this.isInactive) return false;
    
    const now = new Date();
    const updated = new Date(this.lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins > OUTDATED_DATA_THRESHOLD_MINUTES;
  }

  get hasTemperatureAlert(): boolean {
    if (this.isInactive) return false;
    return this.currentTemp < TEMP_LOW_THRESHOLD || this.currentTemp > TEMP_HIGH_THRESHOLD;
  }

  onRemoveFromFavorites(): void {
    this.removeFromFavorites.emit();
  }

  onToggleExpand(): void {
    this.toggleExpand.emit();
  }
}
