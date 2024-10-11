import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsListAdminComponent } from './jobs-list-admin.component';

describe('JobsListAdminComponent', () => {
  let component: JobsListAdminComponent;
  let fixture: ComponentFixture<JobsListAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobsListAdminComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsListAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
