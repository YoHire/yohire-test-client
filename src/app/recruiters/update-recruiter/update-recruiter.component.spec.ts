import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRecruiterComponent } from './update-recruiter.component';

describe('UpdateRecruiterComponent', () => {
  let component: UpdateRecruiterComponent;
  let fixture: ComponentFixture<UpdateRecruiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateRecruiterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateRecruiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
