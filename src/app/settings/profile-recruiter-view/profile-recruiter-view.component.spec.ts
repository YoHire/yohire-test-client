import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRecruiterViewComponent } from './profile-recruiter-view.component';

describe('ProfileRecruiterViewComponent', () => {
  let component: ProfileRecruiterViewComponent;
  let fixture: ComponentFixture<ProfileRecruiterViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileRecruiterViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileRecruiterViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
