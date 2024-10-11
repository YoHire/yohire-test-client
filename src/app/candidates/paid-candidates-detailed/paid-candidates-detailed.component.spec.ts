import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaidCandidatesDetailedComponent } from './paid-candidates-detailed.component';

describe('PaidCandidatesDetailedComponent', () => {
  let component: PaidCandidatesDetailedComponent;
  let fixture: ComponentFixture<PaidCandidatesDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaidCandidatesDetailedComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaidCandidatesDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
