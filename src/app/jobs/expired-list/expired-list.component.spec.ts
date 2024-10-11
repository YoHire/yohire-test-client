import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredListComponent } from './expired-list.component';

describe('ExpiredListComponent', () => {
  let component: ExpiredListComponent;
  let fixture: ComponentFixture<ExpiredListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpiredListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiredListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
