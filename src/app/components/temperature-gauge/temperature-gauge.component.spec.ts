import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TemperatureGaugeComponent } from './temperature-gauge.component';
import { TemperatureService } from '../../services/temperature.service';
import { of, throwError } from 'rxjs';

describe('TemperatureGaugeComponent', () => {
  let component: TemperatureGaugeComponent;
  let fixture: ComponentFixture<TemperatureGaugeComponent>;
  let service: TemperatureService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemperatureGaugeComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TemperatureGaugeComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TemperatureService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.minTemp).toBe(10);
    expect(component.maxTemp).toBe(30);
    expect(component.currentTemp).toBe(22);
    expect(component.dataSource).toBe('json');
  });

  it('should not load data on init when dataSource is none', () => {
    component.dataSource = 'none';
    component.ngOnInit();
    
    expect(component.loading).toBe(false);
  });

  it('should calculate needle angle correctly', () => {
    component.minTemp = 10;
    component.maxTemp = 30;
    component.currentTemp = 20;
    
    const angle = component.needleAngle;
    
    expect(angle).toBe(360);
  });

  it('should calculate needle angle at minimum temperature', () => {
    component.minTemp = 10;
    component.maxTemp = 30;
    component.currentTemp = 10;
    
    expect(component.needleAngle).toBe(315);
  });

  it('should calculate needle angle at maximum temperature', () => {
    component.minTemp = 10;
    component.maxTemp = 30;
    component.currentTemp = 30;
    
    expect(component.needleAngle).toBe(405);
  });

  it('should clamp temperature values outside range', () => {
    component.minTemp = 10;
    component.maxTemp = 30;
    component.currentTemp = 50;
    
    const angle = component.needleAngle;
    
    expect(angle).toBe(405);
  });

  it('should toggle temperature unit and emit event', () => {
    spyOn(component.unitChange, 'emit');
    component.unit = 'celsius';
    
    component.toggleUnit();
    
    expect(component.unitChange.emit).toHaveBeenCalledWith('fahrenheit');
  });

  it('should emit celsius when toggling from fahrenheit', () => {
    spyOn(component.unitChange, 'emit');
    component.unit = 'fahrenheit';
    
    component.toggleUnit();
    
    expect(component.unitChange.emit).toHaveBeenCalledWith('celsius');
  });

  it('should convert celsius to fahrenheit correctly', () => {
    component.unit = 'fahrenheit';
    component.currentTemp = 0;
    
    expect(component.displayTemp).toBe(32);
  });

  it('should display celsius when unit is celsius', () => {
    component.unit = 'celsius';
    component.currentTemp = 25;
    
    expect(component.displayTemp).toBe(25);
    expect(component.tempUnit).toBe('°C');
  });

  it('should toggle theme and emit event', () => {
    spyOn(component.themeChange, 'emit');
    component.isDarkMode = false;
    
    component.toggleTheme();
    
    expect(component.themeChange.emit).toHaveBeenCalledWith(true);
  });

  it('should emit false when toggling from dark to light', () => {
    spyOn(component.themeChange, 'emit');
    component.isDarkMode = true;
    
    component.toggleTheme();
    
    expect(component.themeChange.emit).toHaveBeenCalledWith(false);
  });

  it('should not load data when dataSource is none', () => {
    component.dataSource = 'none';
    
    component.ngOnInit();
    
    expect(component.loading).toBe(false);
  });

  it('should handle API data load', () => {
    const mockData = {
      device: { name: 'Kitchen Heater' },
      temperature: { current: 24, min: 15, max: 28 }
    };
    spyOn(service, 'getTemperatureFromAPI').and.returnValue(of(mockData));
    component.dataSource = 'api';
    component.deviceId = 'device-123';
    
    component.ngOnInit();
    
    expect(component.currentTemp).toBe(24);
    expect(component.minTemp).toBe(15);
    expect(component.maxTemp).toBe(28);
    expect(component.label).toBe('Kitchen Heater');
  });

  it('should handle flat data structure correctly', () => {
    component.minTemp = 10;
    component.maxTemp = 30;
    component.currentTemp = 22;
    component.label = 'Bedroom';
    
    expect(component.currentTemp).toBe(22);
    expect(component.minTemp).toBe(10);
    expect(component.maxTemp).toBe(30);
    expect(component.label).toBe('Bedroom');
  });

  it('should handle selection change event', () => {
    spyOn(component.selectionChange, 'emit');
    const event = { target: { checked: true } } as any;
    
    component.onSelectionChange(event);
    
    expect(component.isSelected).toBe(true);
    expect(component.selectionChange.emit).toHaveBeenCalledWith(true);
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    component.ngOnDestroy();
    
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should return 315 for needle angle when max temp equals min temp', () => {
    spyOn(console, 'warn');
    component.minTemp = 20;
    component.maxTemp = 20;
    component.currentTemp = 20;
    
    const angle = component.needleAngle;
    
    expect(angle).toBe(315);
    expect(console.warn).toHaveBeenCalledWith('Invalid temperature range: max must be greater than min');
  });

  it('should display humidity when provided', () => {
    component.humidity = 65;
    fixture.detectChanges();
    
    expect(component.humidity).toBe(65);
  });

  describe('relativeTime', () => {
    it('should return "Just now" for updates less than 15 minutes ago', () => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      component.lastUpdated = tenMinutesAgo.toISOString();
      component.status = 'active';
      
      expect(component.relativeTime).toBe('Just now');
    });

    it('should return "Just now" for updates exactly 14 minutes ago', () => {
      const now = new Date();
      const fourteenMinutesAgo = new Date(now.getTime() - 14 * 60 * 1000);
      component.lastUpdated = fourteenMinutesAgo.toISOString();
      component.status = 'active';
      
      expect(component.relativeTime).toBe('Just now');
    });

    it('should return minutes ago for updates 15 minutes or older', () => {
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
      component.lastUpdated = twentyMinutesAgo.toISOString();
      component.status = 'active';
      
      expect(component.relativeTime).toBe('20 minutes ago');
    });

    it('should return hours ago for updates over 60 minutes', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      component.lastUpdated = twoHoursAgo.toISOString();
      component.status = 'active';
      
      expect(component.relativeTime).toBe('2 hours ago');
    });

    it('should return "--" for inactive gauges', () => {
      component.lastUpdated = new Date().toISOString();
      component.status = 'inactive';
      
      expect(component.relativeTime).toBe('--');
    });
  });

  describe('isDataOutdated', () => {
    it('should return true when data is older than 15 minutes', () => {
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
      component.lastUpdated = twentyMinutesAgo.toISOString();
      component.status = 'active';
      
      expect(component.isDataOutdated).toBe(true);
    });

    it('should return false when data is less than 15 minutes old', () => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      component.lastUpdated = tenMinutesAgo.toISOString();
      component.status = 'active';
      
      expect(component.isDataOutdated).toBe(false);
    });

    it('should return false for inactive gauges', () => {
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
      component.lastUpdated = twentyMinutesAgo.toISOString();
      component.status = 'inactive';
      
      expect(component.isDataOutdated).toBe(false);
    });
  });

  describe('refreshOutdatedData', () => {
    it('should emit refreshRequest when data is outdated', () => {
      spyOn(component.refreshRequest, 'emit');
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
      component.lastUpdated = twentyMinutesAgo.toISOString();
      component.status = 'active';
      component.gaugeId = 'test-gauge';
      
      component.refreshOutdatedData();
      
      expect(component.refreshRequest.emit).toHaveBeenCalledWith('test-gauge');
      expect(component.refreshing).toBe(true);
    });

    it('should not emit refreshRequest when data is not outdated', () => {
      spyOn(component.refreshRequest, 'emit');
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      component.lastUpdated = tenMinutesAgo.toISOString();
      component.status = 'active';
      
      component.refreshOutdatedData();
      
      expect(component.refreshRequest.emit).not.toHaveBeenCalled();
      expect(component.refreshing).toBe(false);
    });

    it('should not emit refreshRequest when already refreshing', () => {
      spyOn(component.refreshRequest, 'emit');
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
      component.lastUpdated = twentyMinutesAgo.toISOString();
      component.status = 'active';
      component.gaugeId = 'test-gauge';
      component.refreshing = true;
      
      component.refreshOutdatedData();
      
      expect(component.refreshRequest.emit).not.toHaveBeenCalled();
    });
  });

  describe('reorder functionality', () => {
    it('should emit moveLeft event', () => {
      spyOn(component.moveLeft, 'emit');
      
      component.onMoveLeft();
      
      expect(component.moveLeft.emit).toHaveBeenCalled();
    });

    it('should emit moveRight event', () => {
      spyOn(component.moveRight, 'emit');
      
      component.onMoveRight();
      
      expect(component.moveRight.emit).toHaveBeenCalled();
    });
  });

  describe('temperature alert', () => {
    it('should return true for hasTemperatureAlert when temp is below 10', () => {
      component.currentTemp = 5;
      component.status = 'active';
      
      expect(component.hasTemperatureAlert).toBe(true);
    });

    it('should return true for hasTemperatureAlert when temp is above 30', () => {
      component.currentTemp = 35;
      component.status = 'active';
      
      expect(component.hasTemperatureAlert).toBe(true);
    });

    it('should return false for hasTemperatureAlert when temp is between 10 and 30', () => {
      component.currentTemp = 20;
      component.status = 'active';
      
      expect(component.hasTemperatureAlert).toBe(false);
    });

    it('should return false for hasTemperatureAlert when gauge is inactive', () => {
      component.currentTemp = 5;
      component.status = 'inactive';
      
      expect(component.hasTemperatureAlert).toBe(false);
    });

    it('should apply temp-alert-blink class when temperature is critical', () => {
      const compiled = fixture.nativeElement;
      component.currentTemp = 35;
      component.status = 'active';
      fixture.detectChanges();
      
      const temperatureDisplay = compiled.querySelector('.temperature-display strong');
      expect(temperatureDisplay.classList.contains('temp-alert-blink')).toBe(true);
    });

    it('should not apply temp-alert-blink class when temperature is normal', () => {
      const compiled = fixture.nativeElement;
      component.currentTemp = 20;
      component.status = 'active';
      fixture.detectChanges();
      
      const temperatureDisplay = compiled.querySelector('.temperature-display strong');
      expect(temperatureDisplay.classList.contains('temp-alert-blink')).toBe(false);
    });
  });

  describe('humidity icons', () => {
    it('should return frown icon for low humidity', () => {
      component.humidity = 25;
      component.status = 'active';
      
      expect(component.humidityIcon).toBe('fa-frown');
    });

    it('should return smile icon for optimal humidity', () => {
      component.humidity = 50;
      component.status = 'active';
      
      expect(component.humidityIcon).toBe('fa-smile');
    });

    it('should return meh icon for high humidity', () => {
      component.humidity = 70;
      component.status = 'active';
      
      expect(component.humidityIcon).toBe('fa-meh');
    });

    it('should return meh icon for inactive gauge', () => {
      component.humidity = 50;
      component.status = 'inactive';
      
      expect(component.humidityIcon).toBe('fa-meh');
    });
  });

  describe('action buttons', () => {
    it('should emit removeFromFavorites event', () => {
      spyOn(component.removeFromFavorites, 'emit');
      
      component.onRemoveFromFavorites();
      
      expect(component.removeFromFavorites.emit).toHaveBeenCalled();
    });

    it('should emit toggleExpand event', () => {
      spyOn(component.toggleExpand, 'emit');
      
      component.onToggleExpand();
      
      expect(component.toggleExpand.emit).toHaveBeenCalled();
    });

    it('should have showActionButtons input property', () => {
      component.showActionButtons = true;
      expect(component.showActionButtons).toBe(true);
      
      component.showActionButtons = false;
      expect(component.showActionButtons).toBe(false);
    });

    it('should have isExpanded input property', () => {
      component.isExpanded = true;
      expect(component.isExpanded).toBe(true);
      
      component.isExpanded = false;
      expect(component.isExpanded).toBe(false);
    });
  });
});
