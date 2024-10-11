import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenTimeComponent } from './screen-time.component';

describe('ScreenTimeComponent', () => {
  let component: ScreenTimeComponent;
  let fixture: ComponentFixture<ScreenTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreenTimeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
