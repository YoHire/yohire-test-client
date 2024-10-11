import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedCandidatesComponent } from './detailed-candidates.component';

describe('DetailedCandidatesComponent', () => {
  let component: DetailedCandidatesComponent;
  let fixture: ComponentFixture<DetailedCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailedCandidatesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
