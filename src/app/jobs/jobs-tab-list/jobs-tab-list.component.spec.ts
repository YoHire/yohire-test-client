import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsTabListComponent } from './jobs-tab-list.component';

describe('JobsTabListComponent', () => {
  let component: JobsTabListComponent;
  let fixture: ComponentFixture<JobsTabListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JobsTabListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JobsTabListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
