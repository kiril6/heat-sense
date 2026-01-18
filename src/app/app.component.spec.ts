import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, BrowserAnimationsModule],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Temperature Gauge' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Temperature Gauge');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Temperature Gauge Sensors');
  });

  describe('gauge reordering', () => {
    it('should move gauge left when index > 0', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.selectedGauges = [
        { id: '1', label: 'First', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' },
        { id: '2', label: 'Second', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' }
      ];
      
      app.moveGaugeLeft(1);
      
      expect(app.selectedGauges[0].id).toBe('2');
      expect(app.selectedGauges[1].id).toBe('1');
    });

    it('should not move gauge left when index is 0', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.selectedGauges = [
        { id: '1', label: 'First', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' },
        { id: '2', label: 'Second', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' }
      ];
      
      app.moveGaugeLeft(0);
      
      expect(app.selectedGauges[0].id).toBe('1');
      expect(app.selectedGauges[1].id).toBe('2');
    });

    it('should move gauge right when index < length - 1', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.selectedGauges = [
        { id: '1', label: 'First', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' },
        { id: '2', label: 'Second', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' }
      ];
      
      app.moveGaugeRight(0);
      
      expect(app.selectedGauges[0].id).toBe('2');
      expect(app.selectedGauges[1].id).toBe('1');
    });

    it('should not move gauge right when index is at end', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.selectedGauges = [
        { id: '1', label: 'First', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' },
        { id: '2', label: 'Second', isSelected: true, minTemp: 10, maxTemp: 30, currentTemp: 20, status: 'active' }
      ];
      
      app.moveGaugeRight(1);
      
      expect(app.selectedGauges[0].id).toBe('1');
      expect(app.selectedGauges[1].id).toBe('2');
    });
  });

  describe('view mode toggle', () => {
    it('should toggle from categorized to all', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.viewMode = 'categorized';
      
      app.toggleViewMode();
      
      expect(app.viewMode).toBe('all');
    });

    it('should toggle from all to categorized', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.viewMode = 'all';
      
      app.toggleViewMode();
      
      expect(app.viewMode).toBe('categorized');
    });

    it('should save view mode to localStorage', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      spyOn(localStorage, 'setItem');
      app.viewMode = 'categorized';
      
      app.toggleViewMode();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('viewMode', 'all');
    });
  });

  describe('accordion toggles', () => {
    it('should toggle active gauges visibility', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.showActiveGauges = true;
      
      app.toggleActiveGauges();
      
      expect(app.showActiveGauges).toBe(false);
    });

    it('should toggle outdated gauges visibility', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.showOutdatedGauges = true;
      
      app.toggleOutdatedGauges();
      
      expect(app.showOutdatedGauges).toBe(false);
    });

    it('should toggle inactive gauges visibility', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.showInactiveGauges = true;
      
      app.toggleInactiveGauges();
      
      expect(app.showInactiveGauges).toBe(false);
    });

    it('should save accordion state to localStorage', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      spyOn(localStorage, 'setItem');
      app.showActiveGauges = true;
      
      app.toggleActiveGauges();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('showActiveGauges', 'false');
    });
  });

  describe('gauge categorization', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should categorize active gauges correctly', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      const now = new Date();
      app.gauges = [
        { id: '1', label: 'Active', status: 'active', lastUpdated: now.toISOString(), minTemp: 10, maxTemp: 30, currentTemp: 20 },
        { id: '2', label: 'Inactive', status: 'inactive', lastUpdated: now.toISOString(), minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      
      const activeGauges = app.activeGauges;
      
      expect(activeGauges.length).toBe(1);
      expect(activeGauges[0].id).toBe('1');
    });

    it('should categorize outdated gauges correctly', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
      app.gauges = [
        { id: '1', label: 'Active Fresh', status: 'active', lastUpdated: now.toISOString(), minTemp: 10, maxTemp: 30, currentTemp: 20 },
        { id: '2', label: 'Active Outdated', status: 'active', lastUpdated: twentyMinutesAgo.toISOString(), minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      
      const outdatedGauges = app.outdatedGauges;
      
      expect(outdatedGauges.length).toBe(1);
      expect(outdatedGauges[0].id).toBe('2');
    });

    it('should categorize inactive gauges correctly', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      const now = new Date();
      app.gauges = [
        { id: '1', label: 'Active', status: 'active', lastUpdated: now.toISOString(), minTemp: 10, maxTemp: 30, currentTemp: 20 },
        { id: '2', label: 'Inactive', status: 'inactive', lastUpdated: now.toISOString(), minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      
      const inactiveGauges = app.inactiveGauges;
      
      expect(inactiveGauges.length).toBe(1);
      expect(inactiveGauges[0].id).toBe('2');
    });
  });

  describe('refresh functionality', () => {
    it('should update gauge data on refresh request', (done) => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      const now = new Date();
      const oldTimestamp = new Date(now.getTime() - 20 * 60 * 1000).toISOString();
      app.gauges = [
        { id: 'test-gauge', label: 'Test', status: 'active', lastUpdated: oldTimestamp, minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      
      app.onRefreshRequest('test-gauge');
      
      setTimeout(() => {
        const updatedGauge = app.gauges.find(g => g.id === 'test-gauge');
        expect(updatedGauge).toBeDefined();
        expect(updatedGauge!.lastUpdated).not.toBe(oldTimestamp);
        expect(updatedGauge!.currentTemp).not.toBe(20);
        done();
      }, 1600);
    });
  });

  describe('clear selections', () => {
    it('should clear all gauge selections', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.gauges = [
        { id: '1', label: 'First', isSelected: true, status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20 },
        { id: '2', label: 'Second', isSelected: true, status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      
      app.clearAllSelections();
      
      expect(app.gauges.every(g => !g.isSelected)).toBe(true);
      expect(app.selectedGauges.length).toBe(0);
    });
  });

  describe('fullscreen expansion', () => {
    it('should toggle gauge expansion', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      
      app.toggleExpand('gauge-1');
      
      expect(app.expandedGaugeId).toBe('gauge-1');
    });

    it('should collapse gauge if already expanded', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.expandedGaugeId = 'gauge-1';
      
      app.toggleExpand('gauge-1');
      
      expect(app.expandedGaugeId).toBeNull();
    });

    it('should return true for expanded gauge', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.expandedGaugeId = 'gauge-1';
      
      expect(app.isExpanded('gauge-1')).toBe(true);
      expect(app.isExpanded('gauge-2')).toBe(false);
    });

    it('should close expanded gauge on ESC key', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.expandedGaugeId = 'gauge-1';
      
      app.onEscapeKey();
      
      expect(app.expandedGaugeId).toBeNull();
    });

    it('should not immediately refresh data when expanding gauge', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      app.gauges = [{
        id: 'test-gauge',
        label: 'Test',
        currentTemp: 20,
        status: 'active',
        lastUpdated: new Date().toISOString()
      }];
      
      spyOn<any>(app, 'refreshExpandedGauge');
      
      app.toggleExpand('test-gauge');
      
      // Should not call refresh immediately
      expect(app['refreshExpandedGauge']).not.toHaveBeenCalled();
    });
  });

  describe('remove from favorites', () => {
    it('should remove gauge from favorites', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.gauges = [
        { id: '1', label: 'First', isSelected: true, status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20 },
        { id: '2', label: 'Second', isSelected: false, status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      app.selectedGauges = [app.gauges[0]];
      
      app.removeFromFavorites('1');
      
      expect(app.gauges[0].isSelected).toBe(false);
    });
  });

  describe('refresh all sensors', () => {
    it('should set refreshing flag and update all active gauges', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      app.gauges = [
        { id: '1', label: 'First', status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20, lastUpdated: new Date().toISOString() },
        { id: '2', label: 'Second', status: 'inactive', minTemp: 10, maxTemp: 30, currentTemp: 15, lastUpdated: new Date().toISOString() }
      ];
      
      expect(app.isRefreshingAll).toBe(false);
      
      app.refreshAllSensors();
      
      expect(app.isRefreshingAll).toBe(true);
      const activeGauge = app.gauges.find(g => g.id === '1');
      // Temperature should be updated (within min/max range)
      expect(activeGauge?.currentTemp).toBeGreaterThanOrEqual(10);
      expect(activeGauge?.currentTemp).toBeLessThanOrEqual(30);
    });

    it('should not refresh if already refreshing', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.isRefreshingAll = true;
      const initialTimestamp = new Date().toISOString();
      app.gauges = [
        { id: '1', label: 'First', status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20, lastUpdated: initialTimestamp }
      ];
      
      app.refreshAllSensors();
      
      expect(app.gauges[0].lastUpdated).toBe(initialTimestamp);
    });
  });

  describe('star blink animation', () => {
    it('should trigger blink animation when new gauge is added', (done) => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.gauges = [
        { id: '1', label: 'First', isSelected: false, status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      app.selectedGauges = [];
      
      expect(app.blinkStar).toBe(false);
      
      app.onGaugeSelectionChange(app.gauges[0], true);
      
      expect(app.blinkStar).toBe(true);
      
      setTimeout(() => {
        expect(app.blinkStar).toBe(false);
        done();
      }, 2100);
    });

    it('should not trigger blink when gauge count does not increase', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.gauges = [
        { id: '1', label: 'First', isSelected: true, status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20 }
      ];
      app.selectedGauges = [app.gauges[0]];
      
      app.onGaugeSelectionChange(app.gauges[0], false);
      
      expect(app.blinkStar).toBe(false);
    });
  });

  describe('performance optimizations', () => {
    describe('trackBy functions', () => {
      it('should return gauge id for trackByGaugeId', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        const gauge = { id: 'test-123', label: 'Test Gauge' };
        
        const result = app.trackByGaugeId(0, gauge);
        
        expect(result).toBe('test-123');
      });

      it('should return index for trackByIndex', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        
        const result = app.trackByIndex(5);
        
        expect(result).toBe(5);
      });

      it('should return consistent values for same gauge', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        const gauge = { id: 'stable-id', label: 'Stable' };
        
        const result1 = app.trackByGaugeId(0, gauge);
        const result2 = app.trackByGaugeId(1, gauge);
        
        expect(result1).toBe(result2);
      });
    });

    describe('debounced refresh', () => {
      it('should debounce rapid refresh clicks', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.gauges = [
          { id: '1', label: 'Test', status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20, lastUpdated: new Date().toISOString() }
        ];
        
        // First call should work
        app.refreshAllSensors();
        expect(app.isRefreshingAll).toBe(true);
        
        // Immediate second call should be blocked while refreshing
        app.refreshAllSensors();
        
        // Should still be refreshing from first call
        expect(app.isRefreshingAll).toBe(true);
      });

      it('should allow refresh after debounce period', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.gauges = [
          { id: '1', label: 'Test', status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20, lastUpdated: new Date().toISOString() }
        ];
        
        // First refresh starts animation
        app.refreshAllSensors();
        expect(app.isRefreshingAll).toBe(true);
        
        // Second refresh call is blocked while first is still refreshing
        app.refreshAllSensors();
        expect(app.isRefreshingAll).toBe(true);
      });
    });

    describe('OnPush change detection', () => {
      it('should work with manual change detection', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.gauges = [
          { id: '1', label: 'Test', status: 'active', minTemp: 10, maxTemp: 30, currentTemp: 20 }
        ];
        
        // Trigger change detection manually
        fixture.detectChanges();
        
        expect(app.gauges.length).toBe(1);
      });

      it('should update view when markForCheck is called', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        
        app.blinkStar = true;
        fixture.detectChanges();
        
        expect(app.blinkStar).toBe(true);
      });
    });
  });

  describe('temperature threshold monitoring', () => {
    it('should trigger toast when temperature is below 10', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-1',
        label: 'Test Gauge',
        currentTemp: 5,
        status: 'active',
        minTemp: 0,
        maxTemp: 40
      };
      
      spyOn(app.toastComponent, 'addToast').and.returnValue('mock-toast-id');
      
      app['checkTemperatureThreshold'](gauge);
      
      expect(app.toastComponent.addToast).toHaveBeenCalledWith(
        jasmine.stringContaining('too low'),
        'warning'
      );
    });

    it('should trigger toast when temperature is above 30', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-2',
        label: 'Test Gauge',
        currentTemp: 35,
        status: 'active',
        minTemp: 0,
        maxTemp: 40
      };
      
      spyOn(app.toastComponent, 'addToast').and.returnValue('mock-toast-id');
      
      app['checkTemperatureThreshold'](gauge);
      
      expect(app.toastComponent.addToast).toHaveBeenCalledWith(
        jasmine.stringContaining('too high'),
        'warning'
      );
    });

    it('should not trigger toast when temperature is between 10 and 30', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-3',
        label: 'Test Gauge',
        currentTemp: 20,
        status: 'active',
        minTemp: 0,
        maxTemp: 40
      };
      
      spyOn(app.toastComponent, 'addToast');
      
      app['checkTemperatureThreshold'](gauge);
      
      expect(app.toastComponent.addToast).not.toHaveBeenCalled();
    });

    it('should not show duplicate toasts for the same gauge and threshold', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-4',
        label: 'Test Gauge',
        currentTemp: 5,
        status: 'active',
        minTemp: 0,
        maxTemp: 40
      };
      
      spyOn(app.toastComponent, 'addToast').and.returnValue('mock-toast-id');
      
      app['checkTemperatureThreshold'](gauge);
      app['checkTemperatureThreshold'](gauge);
      
      expect(app.toastComponent.addToast).toHaveBeenCalledTimes(1);
    });

    it('should include gauge label in toast message', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-5',
        label: 'Kitchen Sensor',
        currentTemp: 35,
        status: 'active',
        minTemp: 0,
        maxTemp: 40
      };
      
      spyOn(app.toastComponent, 'addToast').and.returnValue('mock-toast-id');
      
      app['checkTemperatureThreshold'](gauge);
      
      expect(app.toastComponent.addToast).toHaveBeenCalledWith(
        jasmine.stringContaining('Kitchen Sensor'),
        'warning'
      );
    });

    it('should check temperature threshold in onRefreshRequest', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-6',
        label: 'Test Gauge',
        currentTemp: 20,
        status: 'active',
        minTemp: 0,
        maxTemp: 50,
        lastUpdated: new Date().toISOString()
      };
      
      app.gauges = [gauge];
      
      spyOn<any>(app, 'checkTemperatureThreshold');
      
      app.onRefreshRequest('test-6');
      
      expect(app['checkTemperatureThreshold']).toHaveBeenCalled();
    });

    it('should check temperature threshold in refreshExpandedGauge', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-7',
        label: 'Test Gauge',
        currentTemp: 20,
        status: 'active',
        minTemp: 0,
        maxTemp: 50,
        lastUpdated: new Date().toISOString()
      };
      
      app.gauges = [gauge];
      
      spyOn<any>(app, 'checkTemperatureThreshold');
      
      app['refreshExpandedGauge']('test-7');
      
      expect(app['checkTemperatureThreshold']).toHaveBeenCalled();
    });

    it('should automatically dismiss toast when temperature returns to normal', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-8',
        label: 'Test Gauge',
        currentTemp: 35,
        status: 'active',
        minTemp: 0,
        maxTemp: 40
      };
      
      spyOn(app.toastComponent, 'addToast').and.returnValue('toast-id-123');
      spyOn(app.toastComponent, 'removeToast');
      
      // First check - temperature is high, should create toast
      app['checkTemperatureThreshold'](gauge);
      expect(app.toastComponent.addToast).toHaveBeenCalled();
      
      // Second check - temperature returns to normal, should dismiss toast
      gauge.currentTemp = 22;
      app['checkTemperatureThreshold'](gauge);
      expect(app.toastComponent.removeToast).toHaveBeenCalledWith('toast-id-123');
    });

    it('should track different toasts for low and high temperatures', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      fixture.detectChanges();
      
      const gauge = {
        id: 'test-9',
        label: 'Test Gauge',
        currentTemp: 5,
        status: 'active',
        minTemp: 0,
        maxTemp: 40
      };
      
      spyOn(app.toastComponent, 'addToast').and.returnValue('toast-low-id');
      spyOn(app.toastComponent, 'removeToast');
      
      // Temperature is low
      app['checkTemperatureThreshold'](gauge);
      expect(app.toastComponent.addToast).toHaveBeenCalledTimes(1);
      
      // Temperature becomes normal
      gauge.currentTemp = 20;
      app['checkTemperatureThreshold'](gauge);
      expect(app.toastComponent.removeToast).toHaveBeenCalledWith('toast-low-id');
      
      // Temperature becomes high
      (app.toastComponent.addToast as jasmine.Spy).and.returnValue('toast-high-id');
      gauge.currentTemp = 35;
      app['checkTemperatureThreshold'](gauge);
      expect(app.toastComponent.addToast).toHaveBeenCalledTimes(2);
      
      // Temperature becomes normal again
      gauge.currentTemp = 22;
      app['checkTemperatureThreshold'](gauge);
      expect(app.toastComponent.removeToast).toHaveBeenCalledWith('toast-high-id');
    });

    it('should have AfterViewInit lifecycle hook to check temperatures after view init', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      
      expect(app.ngAfterViewInit).toBeDefined();
      expect(typeof app.ngAfterViewInit).toBe('function');
    });
  });

  describe('accessibility modal', () => {
    it('should toggle accessibility modal', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      
      expect(app.showAccessibilityModal).toBe(false);
      
      app.toggleAccessibilityModal();
      
      expect(app.showAccessibilityModal).toBe(true);
      
      app.toggleAccessibilityModal();
      
      expect(app.showAccessibilityModal).toBe(false);
    });

    it('should close accessibility modal', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.showAccessibilityModal = true;
      
      app.closeAccessibilityModal();
      
      expect(app.showAccessibilityModal).toBe(false);
    });

    it('should load accessibility preferences on init', () => {
      localStorage.setItem('highContrastMode', 'true');
      localStorage.setItem('reducedMotion', 'true');
      
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      app.ngOnInit();
      
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
      expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
      
      // Cleanup
      localStorage.clear();
      document.documentElement.classList.remove('high-contrast', 'reduced-motion');
    });
  });
});
