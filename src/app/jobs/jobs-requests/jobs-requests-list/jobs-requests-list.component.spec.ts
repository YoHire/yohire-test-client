import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsRequestsListComponent } from './jobs-requests-list.component';

describe('JobsRequestsListComponent', () => {
  let component: JobsRequestsListComponent;
  let fixture: ComponentFixture<JobsRequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobsRequestsListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
