import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarRecruiterComponent } from './sidebar-recruiter.component';

describe('SidebarRecruiterComponent', () => {
  let component: SidebarRecruiterComponent;
  let fixture: ComponentFixture<SidebarRecruiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarRecruiterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarRecruiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
