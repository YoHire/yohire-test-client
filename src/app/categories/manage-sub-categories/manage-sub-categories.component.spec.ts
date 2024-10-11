import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSubCategoriesComponent } from './manage-sub-categories.component';

describe('ManageSubCategoriesComponent', () => {
  let component: ManageSubCategoriesComponent;
  let fixture: ComponentFixture<ManageSubCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageSubCategoriesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSubCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
