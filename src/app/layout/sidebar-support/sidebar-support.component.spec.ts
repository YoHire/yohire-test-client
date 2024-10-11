import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSupportComponent } from './sidebar-support.component';

describe('SidebarSupportComponent', () => {
  let component: SidebarSupportComponent;
  let fixture: ComponentFixture<SidebarSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarSupportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
