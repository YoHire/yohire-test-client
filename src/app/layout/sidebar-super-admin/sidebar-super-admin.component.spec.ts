import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSuperAdminComponent } from './sidebar-super-admin.component';

describe('SidebarSuperAdminComponent', () => {
  let component: SidebarSuperAdminComponent;
  let fixture: ComponentFixture<SidebarSuperAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarSuperAdminComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
