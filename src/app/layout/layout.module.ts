import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PrivateLayoutComponent } from './private-layout/private-layout.component';
import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarRecruiterComponent } from './sidebar-recruiter/sidebar-recruiter.component';
import { SidebarSuperAdminComponent } from './sidebar-super-admin/sidebar-super-admin.component';
import { SidebarAdminComponent } from './sidebar-admin/sidebar-admin.component';
import { SidebarSupportComponent } from './sidebar-support/sidebar-support.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PrivateLayoutComponent,
    PublicLayoutComponent,
    SidebarRecruiterComponent,
    SidebarSuperAdminComponent,
    SidebarAdminComponent,
    SidebarSupportComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    ReactiveFormsModule,
    SidebarModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
    StyleClassModule,
    TooltipModule,
  ],
  exports: [PublicLayoutComponent, PrivateLayoutComponent, HeaderComponent],
})
export class LayoutModule {}
