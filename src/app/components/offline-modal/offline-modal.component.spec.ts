import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfflineModalComponent } from './offline-modal.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('OfflineModalComponent', () => {
  let component: OfflineModalComponent;
  let fixture: ComponentFixture<OfflineModalComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfflineModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OfflineModalComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isOffline as false by default', () => {
    expect(component.isOffline).toBe(false);
  });

  it('should not display modal when isOffline is false', () => {
    component.isOffline = false;
    fixture.detectChanges();
    
    const modal = compiled.querySelector('.offline-modal');
    expect(modal).toBeNull();
  });

  it('should display modal when isOffline is true', () => {
    component.isOffline = true;
    fixture.detectChanges();
    
    const modal = compiled.querySelector('.offline-modal');
    expect(modal).toBeTruthy();
  });

  it('should display correct title', () => {
    component.isOffline = true;
    fixture.detectChanges();
    
    const title = compiled.querySelector('.offline-title');
    expect(title?.textContent).toBe('No Internet Connection');
  });

  it('should display correct message', () => {
    component.isOffline = true;
    fixture.detectChanges();
    
    const message = compiled.querySelector('.offline-message');
    expect(message?.textContent).toBe('Please check your connection and try again.');
  });

  it('should display wifi icon', () => {
    component.isOffline = true;
    fixture.detectChanges();
    
    const icon = compiled.querySelector('.offline-icon i.fa-wifi');
    expect(icon).toBeTruthy();
  });

  it('should display pulse indicator', () => {
    component.isOffline = true;
    fixture.detectChanges();
    
    const pulse = compiled.querySelector('.offline-pulse');
    expect(pulse).toBeTruthy();
  });

  it('should have proper modal structure with all elements', () => {
    component.isOffline = true;
    fixture.detectChanges();
    
    const modal = compiled.querySelector('.offline-modal');
    const content = compiled.querySelector('.offline-content');
    const icon = compiled.querySelector('.offline-icon');
    const title = compiled.querySelector('.offline-title');
    const message = compiled.querySelector('.offline-message');
    const pulse = compiled.querySelector('.offline-pulse');
    
    expect(modal).toBeTruthy();
    expect(content).toBeTruthy();
    expect(icon).toBeTruthy();
    expect(title).toBeTruthy();
    expect(message).toBeTruthy();
    expect(pulse).toBeTruthy();
  });

  it('should toggle modal visibility when isOffline changes', () => {
    component.isOffline = false;
    fixture.detectChanges();
    let modal = compiled.querySelector('.offline-modal');
    expect(modal).toBeNull();
    
    component.isOffline = true;
    fixture.detectChanges();
    modal = compiled.querySelector('.offline-modal');
    expect(modal).toBeTruthy();
    
    component.isOffline = false;
    fixture.detectChanges();
    modal = compiled.querySelector('.offline-modal');
    expect(modal).toBeNull();
  });

  it('should accept isOffline input property', () => {
    const testValue = true;
    component.isOffline = testValue;
    expect(component.isOffline).toBe(testValue);
  });
});
