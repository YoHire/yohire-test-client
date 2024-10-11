import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedRecruiterComponent } from './detailed-recruiter.component';

describe('DetailedRecruiterComponent', () => {
  let component: DetailedRecruiterComponent;
  let fixture: ComponentFixture<DetailedRecruiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailedRecruiterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedRecruiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
