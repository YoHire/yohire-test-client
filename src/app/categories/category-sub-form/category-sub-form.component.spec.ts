import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySubFormComponent } from './category-sub-form.component';

describe('CategorySubFormComponent', () => {
  let component: CategorySubFormComponent;
  let fixture: ComponentFixture<CategorySubFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategorySubFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorySubFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
