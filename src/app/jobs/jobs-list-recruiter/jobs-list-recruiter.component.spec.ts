import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsListRecruiterComponent } from './jobs-list-recruiter.component';

describe('JobsListRecruiterComponent', () => {
  let component: JobsListRecruiterComponent;
  let fixture: ComponentFixture<JobsListRecruiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobsListRecruiterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsListRecruiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
