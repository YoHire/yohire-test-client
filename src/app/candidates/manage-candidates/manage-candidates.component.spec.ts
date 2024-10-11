import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCandidatesComponent } from './manage-candidates.component';

describe('ManageCandidatesComponent', () => {
  let component: ManageCandidatesComponent;
  let fixture: ComponentFixture<ManageCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageCandidatesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
