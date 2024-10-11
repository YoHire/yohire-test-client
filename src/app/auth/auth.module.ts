import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { LayoutModule } from '../layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { DirectivesModule } from '../directives/directives.module';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthDialogComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    LayoutModule,
    ReactiveFormsModule,
    FormsModule,
    AutocompleteLibModule,
    DirectivesModule,
    GoogleSigninButtonModule,
    RouterModule,
    MatTabsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SkeletonModule,
    DialogModule,
    ButtonModule,
    DropdownModule
  ],
  exports:[AuthDialogComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AuthModule {}