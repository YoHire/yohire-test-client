import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsTabListAdminComponent } from './jobs-tab-list-admin.component';

describe('JobsTabListAdminComponent', () => {
  let component: JobsTabListAdminComponent;
  let fixture: ComponentFixture<JobsTabListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobsTabListAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsTabListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
