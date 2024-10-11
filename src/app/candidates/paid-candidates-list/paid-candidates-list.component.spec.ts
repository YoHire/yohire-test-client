import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaidCandidatesListComponent } from './paid-candidates-list.component';

describe('PaidCandidatesListComponent', () => {
  let component: PaidCandidatesListComponent;
  let fixture: ComponentFixture<PaidCandidatesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaidCandidatesListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaidCandidatesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
