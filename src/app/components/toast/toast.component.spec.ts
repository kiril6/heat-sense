import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent, BrowserAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a toast message', () => {
    const toastId = component.addToast('Test message', 'info');
    
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].message).toBe('Test message');
    expect(component.toasts[0].type).toBe('info');
    expect(toastId).toBeDefined();
    expect(typeof toastId).toBe('string');
  });

  it('should add toast with default type', () => {
    component.addToast('Default toast');
    
    expect(component.toasts[0].type).toBe('info');
  });

  it('should remove toast by id', () => {
    const firstToastId = component.addToast('Toast 1', 'info');
    component.addToast('Toast 2', 'warning');
    
    component.removeToast(firstToastId);
    
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].message).toBe('Toast 2');
  });

  it('should not auto-remove toast with default duration', () => {
    component.addToast('Toast with default duration', 'info');
    
    expect(component.toasts.length).toBe(1);
    
    // Toast should remain since default duration is 0 (no auto-dismiss)
    expect(component.toasts.length).toBe(1);
  });

  it('should not auto-remove toast when duration is 0', (done) => {
    component.addToast('Persistent toast', 'info', 0);
    
    expect(component.toasts.length).toBe(1);
    
    setTimeout(() => {
      expect(component.toasts.length).toBe(1);
      done();
    }, 100);
  });

  it('should return correct icon class for success', () => {
    expect(component.getIconClass('success')).toBe('fa-check-circle');
  });

  it('should return correct icon class for error', () => {
    expect(component.getIconClass('error')).toBe('fa-times-circle');
  });

  it('should return correct icon class for warning', () => {
    expect(component.getIconClass('warning')).toBe('fa-exclamation-triangle');
  });

  it('should return correct icon class for info', () => {
    expect(component.getIconClass('info')).toBe('fa-info-circle');
  });

  it('should return default icon class for unknown type', () => {
    expect(component.getIconClass('unknown')).toBe('fa-info-circle');
  });

  it('should generate unique ids for toasts', () => {
    component.addToast('Toast 1', 'info');
    component.addToast('Toast 2', 'info');
    
    expect(component.toasts[0].id).not.toBe(component.toasts[1].id);
  });

  it('should handle multiple toasts', () => {
    component.addToast('Toast 1', 'success');
    component.addToast('Toast 2', 'warning');
    component.addToast('Toast 3', 'error');
    
    expect(component.toasts.length).toBe(3);
    expect(component.toasts[0].type).toBe('success');
    expect(component.toasts[1].type).toBe('warning');
    expect(component.toasts[2].type).toBe('error');
  });
});
