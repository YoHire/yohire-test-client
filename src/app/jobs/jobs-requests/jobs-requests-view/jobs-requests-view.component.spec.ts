import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsRequestsViewComponent } from './jobs-requests-view.component';

describe('JobsRequestsViewComponent', () => {
  let component: JobsRequestsViewComponent;
  let fixture: ComponentFixture<JobsRequestsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobsRequestsViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsRequestsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
