import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemperatureGaugeComponent } from './components/temperature-gauge/temperature-gauge.component';
import { OfflineModalComponent } from './components/offline-modal/offline-modal.component';
import { ToastComponent } from './components/toast/toast.component';
import { AccessibilityModalComponent } from './components/accessibility-modal/accessibility-modal.component';
import { TemperatureService } from './services/temperature.service';
import { trigger, transition, style, animate } from '@angular/animations';

// Constants
const OUTDATED_DATA_THRESHOLD_MINUTES = 15;
const EXPANDED_GAUGE_REFRESH_INTERVAL_MS = 10000;
const REFRESH_ALL_ANIMATION_DURATION_MS = 2000;
const STAR_BLINK_ANIMATION_DURATION_MS = 2000;
const HEADER_ANIMATION_DURATION_MS = 3000;
const INITIAL_TOAST_DELAY_MS = 8000;
const GAUGE_REFRESH_SPINNER_DURATION_MS = 1000;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TemperatureGaugeComponent, OfflineModalComponent, ToastComponent, AccessibilityModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        animate('0.8s ease-out', style({ 
          opacity: 0, 
          height: 0,
          transform: 'scaleY(0)'
        }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Temperature Gauge';
  gauges: any[] = [];
  selectedGauges: any[] = [];
  showArray = false;
  viewMode: 'categorized' | 'all' = 'categorized';
  showActiveGauges = true;
  showOutdatedGauges = true;
  showInactiveGauges = true;
  globalUnit: 'celsius' | 'fahrenheit' = 'celsius';
  globalIsDarkMode = false;
  isScrolled = false;
  showScrollTop = false;
  isOffline = false;
  showAccessibilityModal = false;
  expandedGaugeId: string | null = null;
  isRefreshingAll = false;
  showHeaderAnimation = true;
  blinkStar = false;
  currentDateTime: Date = new Date();
  private expandedRefreshInterval: any = null;
  private refreshDebounceTimeout: any = null;
  private readonly REFRESH_DEBOUNCE_MS = 500;
  private shownToasts = new Set<string>(); // Track which gauges have shown temperature alerts
  private gaugeToastIds = new Map<string, string>(); // Track toast IDs for each gauge
  private shouldCheckInitialTemperatures = false; // Flag to check temperatures after view init

  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(
    private tempService: TemperatureService,
    private cdr: ChangeDetectorRef
  ) {
    // Update time every second
    setInterval(() => {
      this.currentDateTime = new Date();
      this.cdr.markForCheck();
    }, 1000);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
    this.showScrollTop = window.scrollY > 300;
  }

  @HostListener('window:online', [])
  onOnline(): void {
    this.isOffline = false;
  }

  @HostListener('window:offline', [])
  onOffline(): void {
    this.isOffline = true;
  }

  @HostListener('window:keydown.escape', [])
  onEscapeKey(): void {
    this.expandedGaugeId = null;
  }

  ngOnInit(): void {
    // Check initial online/offline state
    this.isOffline = !navigator.onLine;
    
    // Hide header animation after duration
    setTimeout(() => {
      this.showHeaderAnimation = false;
    }, HEADER_ANIMATION_DURATION_MS);
    
    // Load accessibility preferences
    this.loadAccessibilityPreferences();
    
    // Load saved preferences from localStorage
    const savedUnit = localStorage.getItem('temperatureUnit');
    if (savedUnit === 'celsius' || savedUnit === 'fahrenheit') {
      this.globalUnit = savedUnit;
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.globalIsDarkMode = savedTheme === 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode === 'categorized' || savedViewMode === 'all') {
      this.viewMode = savedViewMode;
    }

    // Load accordion states
    const savedActiveState = localStorage.getItem('showActiveGauges');
    if (savedActiveState !== null) {
      this.showActiveGauges = savedActiveState === 'true';
    }
    const savedOutdatedState = localStorage.getItem('showOutdatedGauges');
    if (savedOutdatedState !== null) {
      this.showOutdatedGauges = savedOutdatedState === 'true';
    }
    const savedInactiveState = localStorage.getItem('showInactiveGauges');
    if (savedInactiveState !== null) {
      this.showInactiveGauges = savedInactiveState === 'true';
    }

    this.loadGaugeArray();
  }

  ngAfterViewInit(): void {
    // Check temperatures after view is initialized (when toastComponent is available)
    if (this.shouldCheckInitialTemperatures && this.gauges.length > 0) {
      this.gauges.forEach(gauge => {
        this.checkTemperatureThreshold(gauge);
      });
      this.shouldCheckInitialTemperatures = false;
    }
  }

  loadGaugeArray(): void {
    // Load saved selections from localStorage
    const savedSelections = localStorage.getItem('selectedGaugeIds');
    const selectedIds = savedSelections ? JSON.parse(savedSelections) : null;

    this.tempService.getTemperatureArray().subscribe({
      next: (data) => {
        this.gauges = data
          .map((gauge, index) => ({
            ...gauge,
            isSelected: selectedIds ? selectedIds.includes(gauge.id) : index === 0
          }))
          .sort((a, b) => {
            // Determine status priority: 1 = active, 2 = outdated, 3 = inactive
            const getPriority = (gauge: any) => {
              if (gauge.status !== 'active') return 3; // Inactive
              if (this.isGaugeOutdated(gauge)) return 2; // Outdated
              return 1; // Active
            };
            
            return getPriority(a) - getPriority(b);
          });
        
        // Check temperatures after initial delay
        setTimeout(() => {
          this.gauges.forEach(gauge => {
            this.checkTemperatureThreshold(gauge);
          });
        }, INITIAL_TOAST_DELAY_MS);
        
        this.updateSelectedGauges();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load gauge array:', err);
      }
    });
  }

  // TrackBy functions for performance optimization
  trackByGaugeId(index: number, gauge: any): string {
    return gauge.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  toggleView(): void {
    this.showArray = !this.showArray;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'categorized' ? 'all' : 'categorized';
    localStorage.setItem('viewMode', this.viewMode);
  }

  toggleActiveGauges(): void {
    this.showActiveGauges = !this.showActiveGauges;
    localStorage.setItem('showActiveGauges', String(this.showActiveGauges));
  }

  toggleOutdatedGauges(): void {
    this.showOutdatedGauges = !this.showOutdatedGauges;
    localStorage.setItem('showOutdatedGauges', String(this.showOutdatedGauges));
  }

  toggleInactiveGauges(): void {
    this.showInactiveGauges = !this.showInactiveGauges;
    localStorage.setItem('showInactiveGauges', String(this.showInactiveGauges));
  }

  toggleExpand(gaugeId: string): void {
    // Clear existing interval
    if (this.expandedRefreshInterval) {
      clearInterval(this.expandedRefreshInterval);
      this.expandedRefreshInterval = null;
    }
    
    if (this.expandedGaugeId === gaugeId) {
      this.expandedGaugeId = null;
    } else {
      this.expandedGaugeId = gaugeId;
      
      // Set up auto-refresh at regular interval (no immediate refresh)
      this.expandedRefreshInterval = setInterval(() => {
        if (this.expandedGaugeId === gaugeId) {
          this.refreshExpandedGauge(gaugeId);
        }
      }, EXPANDED_GAUGE_REFRESH_INTERVAL_MS);
    }
  }

  private refreshExpandedGauge(gaugeId: string): void {
    const gauge = this.gauges.find(g => g.id === gaugeId);
    if (gauge && gauge.status === 'active') {
      // Update timestamp and temperature
      gauge.lastUpdated = new Date().toISOString();
      gauge.currentTemp = Math.floor(Math.random() * (gauge.maxTemp - gauge.minTemp + 1)) + gauge.minTemp;
      
      // Update humidity if present
      if (gauge.humidity !== undefined) {
        gauge.humidity = Math.floor(Math.random() * 71) + 30;
      }
      
      // Check temperature threshold and show toast
      this.checkTemperatureThreshold(gauge);
      
      // Sync to selectedGauges
      const selectedGauge = this.selectedGauges.find(g => g.id === gaugeId);
      if (selectedGauge) {
        selectedGauge.lastUpdated = gauge.lastUpdated;
        selectedGauge.currentTemp = gauge.currentTemp;
        if (selectedGauge.humidity !== undefined) {
          selectedGauge.humidity = gauge.humidity;
        }
      }
    }
  }

  isExpanded(gaugeId: string): boolean {
    return this.expandedGaugeId === gaugeId;
  }

  onGaugeSelectionChange(gauge: any, isSelected: boolean): void {
    gauge.isSelected = isSelected;
    this.updateSelectedGauges();
  }

  private updateSelectedGauges(): void {
    const selectedIds = localStorage.getItem('selectedGaugeIds');
    const orderedIds = selectedIds ? JSON.parse(selectedIds) : [];
    
    // Get newly selected gauges
    const newlySelected = this.gauges.filter(g => g.isSelected);
    const previousCount = this.selectedGauges.length;
    
    // Preserve order from localStorage
    this.selectedGauges = [];
    orderedIds.forEach((id: string) => {
      const gauge = newlySelected.find(g => g.id === id);
      if (gauge) {
        this.selectedGauges.push(gauge);
      }
    });
    
    // Add any newly selected gauges that weren't in the saved order
    newlySelected.forEach(gauge => {
      if (!this.selectedGauges.find(g => g.id === gauge.id)) {
        this.selectedGauges.push(gauge);
      }
    });
    
    // Trigger blink animation if a new gauge was added
    if (this.selectedGauges.length > previousCount) {
      this.blinkStar = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.blinkStar = false;
        this.cdr.markForCheck();
      }, STAR_BLINK_ANIMATION_DURATION_MS);
    }
    
    // Save updated selected gauge IDs to localStorage
    const selectedIdsList = this.selectedGauges.map(g => g.id);
    localStorage.setItem('selectedGaugeIds', JSON.stringify(selectedIdsList));
  }

  onUnitChange(unit: 'celsius' | 'fahrenheit'): void {
    this.globalUnit = unit;
    localStorage.setItem('temperatureUnit', unit);
  }

  onThemeChange(isDark: boolean): void {
    this.globalIsDarkMode = isDark;
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  clearAllSelections(): void {
    this.gauges.forEach(gauge => gauge.isSelected = false);
    this.updateSelectedGauges();
  }

  removeFromFavorites(gaugeId: string): void {
    const gauge = this.gauges.find(g => g.id === gaugeId);
    if (gauge) {
      gauge.isSelected = false;
      this.updateSelectedGauges();
    }
  }

  moveGaugeLeft(index: number): void {
    if (index > 0) {
      const temp = this.selectedGauges[index];
      this.selectedGauges[index] = this.selectedGauges[index - 1];
      this.selectedGauges[index - 1] = temp;
      this.saveSelectedGaugesOrder();
    }
  }

  moveGaugeRight(index: number): void {
    if (index < this.selectedGauges.length - 1) {
      const temp = this.selectedGauges[index];
      this.selectedGauges[index] = this.selectedGauges[index + 1];
      this.selectedGauges[index + 1] = temp;
      this.saveSelectedGaugesOrder();
    }
  }

  private saveSelectedGaugesOrder(): void {
    const selectedIds = this.selectedGauges.map(g => g.id);
    localStorage.setItem('selectedGaugeIds', JSON.stringify(selectedIds));
  }

  onRefreshRequest(gaugeId: string): void {
    // Fetch new data for specific gauge
    const gauge = this.gauges.find(g => g.id === gaugeId);
    if (gauge) {
      // Update timestamp to current time
      gauge.lastUpdated = new Date().toISOString();
      
      // Update temperature
      gauge.currentTemp = Math.floor(Math.random() * (gauge.maxTemp - gauge.minTemp + 1)) + gauge.minTemp;
      
      // Check temperature threshold and show toast
      this.checkTemperatureThreshold(gauge);
      
      // Update selected gauges if this gauge is selected
      const selectedGauge = this.selectedGauges.find(g => g.id === gaugeId);
      if (selectedGauge) {
        selectedGauge.lastUpdated = gauge.lastUpdated;
        selectedGauge.currentTemp = gauge.currentTemp;
      }
      
      this.cdr.markForCheck();
    }
  }

  refreshAllSensors(): void {
    if (this.isRefreshingAll) return;
    
    this.isRefreshingAll = true;
    this.showHeaderAnimation = true;
    
    // Fetch new data for all active gauges
    this.gauges.forEach(gauge => {
      if (gauge.status === 'active') {
        // Update timestamp to current time
        gauge.lastUpdated = new Date().toISOString();
        
        // Update temperature with random value in range
        gauge.currentTemp = Math.floor(Math.random() * (gauge.maxTemp - gauge.minTemp + 1)) + gauge.minTemp;
        
        // Update humidity if exists
        if (gauge.humidity !== undefined) {
          gauge.humidity = Math.floor(Math.random() * 71) + 30; // 30-100%
        }
        
        // Check temperature threshold and show toast
        this.checkTemperatureThreshold(gauge);
        
        // Update selected gauges if this gauge is selected
        const selectedGauge = this.selectedGauges.find(g => g.id === gauge.id);
        if (selectedGauge) {
          selectedGauge.lastUpdated = gauge.lastUpdated;
          selectedGauge.currentTemp = gauge.currentTemp;
          if (gauge.humidity !== undefined) {
            selectedGauge.humidity = gauge.humidity;
          }
        }
      }
    });
    
    // Keep animation visible before hiding
    setTimeout(() => {
      this.isRefreshingAll = false;
      this.showHeaderAnimation = false;
      this.cdr.markForCheck();
    }, REFRESH_ALL_ANIMATION_DURATION_MS);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleAccessibilityModal(): void {
    this.showAccessibilityModal = !this.showAccessibilityModal;
    this.cdr.markForCheck();
  }

  closeAccessibilityModal(): void {
    this.showAccessibilityModal = false;
    this.cdr.markForCheck();
  }

  private loadAccessibilityPreferences(): void {
    const savedHighContrast = localStorage.getItem('highContrastMode');
    if (savedHighContrast === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
    
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    if (savedReducedMotion === 'true') {
      document.documentElement.classList.add('reduced-motion');
    }
  }

  private isGaugeOutdated(gauge: any): boolean {
    if (!gauge.lastUpdated || gauge.status !== 'active') return false;
    
    const now = new Date();
    const updated = new Date(gauge.lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    return diffMins > OUTDATED_DATA_THRESHOLD_MINUTES;
  }

  private checkTemperatureThreshold(gauge: any): void {
    if (!this.toastComponent || !gauge || gauge.currentTemp === undefined) {
      return;
    }
    
    const temp = gauge.currentTemp;
    const gaugeLabel = gauge.label || gauge.id;
    const key = `${gauge.id}-${temp < 10 ? 'low' : temp > 30 ? 'high' : 'normal'}`;
    
    // Check if temperature exceeds thresholds
    if (temp < 10) {
      if (!this.shownToasts.has(key)) {
        const toastId = this.toastComponent.addToast(
          `${gaugeLabel} temperature is too low: ${temp}°${this.globalUnit === 'celsius' ? 'C' : 'F'}`,
          'warning'
        );
        this.shownToasts.add(key);
        this.gaugeToastIds.set(gauge.id, toastId);
      }
    } else if (temp > 30) {
      if (!this.shownToasts.has(key)) {
        const toastId = this.toastComponent.addToast(
          `${gaugeLabel} temperature is too high: ${temp}°${this.globalUnit === 'celsius' ? 'C' : 'F'}`,
          'warning'
        );
        this.shownToasts.add(key);
        this.gaugeToastIds.set(gauge.id, toastId);
      }
    } else {
      // Temperature is normal, clear any existing toast keys for this gauge
      this.shownToasts.delete(`${gauge.id}-low`);
      this.shownToasts.delete(`${gauge.id}-high`);
      
      // Auto-close the toast if temperature returned to normal
      const toastId = this.gaugeToastIds.get(gauge.id);
      if (toastId) {
        this.toastComponent.removeToast(toastId);
        this.gaugeToastIds.delete(gauge.id);
      }
    }
  }

  get activeGauges(): any[] {
    return this.gauges.filter(g => g.status === 'active' && !this.isGaugeOutdated(g));
  }

  get outdatedGauges(): any[] {
    return this.gauges.filter(g => g.status === 'active' && this.isGaugeOutdated(g));
  }

  get inactiveGauges(): any[] {
    return this.gauges.filter(g => g.status !== 'active');
  }
}
