import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMessageComponent } from './manage-message.component';

describe('ManageMessageComponent', () => {
  let component: ManageMessageComponent;
  let fixture: ComponentFixture<ManageMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
