import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessibilityModalComponent } from './accessibility-modal.component';

describe('AccessibilityModalComponent', () => {
  let component: AccessibilityModalComponent;
  let fixture: ComponentFixture<AccessibilityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessibilityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessibilityModalComponent);
    component = fixture.componentInstance;
    
    // Clear localStorage before each test
    localStorage.clear();
    
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up localStorage and document classes
    localStorage.clear();
    document.documentElement.classList.remove('high-contrast', 'reduced-motion');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load saved high contrast preference on init', () => {
    localStorage.setItem('highContrastMode', 'true');
    
    component.ngOnInit();
    
    expect(component.highContrastMode).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('should load saved reduced motion preference on init', () => {
    localStorage.setItem('reducedMotion', 'true');
    
    component.ngOnInit();
    
    expect(component.reducedMotion).toBe(true);
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
  });

  it('should toggle high contrast mode', () => {
    expect(component.highContrastMode).toBe(false);
    
    component.toggleHighContrast();
    
    expect(component.highContrastMode).toBe(true);
    expect(localStorage.getItem('highContrastMode')).toBe('true');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    
    component.toggleHighContrast();
    
    expect(component.highContrastMode).toBe(false);
    expect(localStorage.getItem('highContrastMode')).toBe('false');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
  });

  it('should toggle reduced motion', () => {
    expect(component.reducedMotion).toBe(false);
    
    component.toggleReducedMotion();
    
    expect(component.reducedMotion).toBe(true);
    expect(localStorage.getItem('reducedMotion')).toBe('true');
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
    
    component.toggleReducedMotion();
    
    expect(component.reducedMotion).toBe(false);
    expect(localStorage.getItem('reducedMotion')).toBe('false');
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(false);
  });

  it('should emit close event when onClose is called', () => {
    spyOn(component.close, 'emit');
    
    component.onClose();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should close modal when backdrop is clicked', () => {
    spyOn(component.close, 'emit');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    } as any;
    
    // Set target to be the same as currentTarget (backdrop click)
    mockEvent.target = mockEvent.currentTarget;
    
    component.onBackdropClick(mockEvent);
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not close modal when modal content is clicked', () => {
    spyOn(component.close, 'emit');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    } as any;
    
    // target is different from currentTarget (content click)
    
    component.onBackdropClick(mockEvent);
    
    expect(component.close.emit).not.toHaveBeenCalled();
  });
});
