import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { LoginFormComponent } from 'src/app/modules/authentication/components/login/login-form/login-form.component';
import { LoginComponent } from 'src/app/modules/authentication/components/login/login.component';
import { RegisterFormComponent } from 'src/app/modules/authentication/components/registration/register-form/register-form.component';
import {
  RegisterHeaderComponent
} from 'src/app/modules/authentication/components/registration/register-header/register-header.component';
import { RegistrationComponent } from 'src/app/modules/authentication/components/registration/registration.component';
import { SocialLoginComponentt } from 'src/app/modules/authentication/components/SocialAuth/socialauth.component';
import { AuthLayoutRoutes } from 'src/app/modules/authentication/authentication.routing';
import { PasswordResetComponent } from 'src/app/modules/authentication/components/password-reset/password-reset.component';
import {
  RegistersuccessComponent
} from 'src/app/modules/authentication/components/registration/registersuccess/registersuccess.component';
import { EnterResetPasswordComponent } from './components/enter-reset-password/enter-reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    SharedModule
  ],
  declarations: [
    LoginComponent,
    LoginFormComponent,
    RegistrationComponent,
    RegisterFormComponent,
    RegisterHeaderComponent,
    SocialLoginComponentt,
    PasswordResetComponent,
    RegistersuccessComponent,
    EnterResetPasswordComponent
  ],
  providers: []
})
export class AuthenticationModule {
}
