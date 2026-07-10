import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AuthenticationModule } from 'src/app/modules/authentication/authentication.module';
import { PersonalInformationComponent } from 'src/app/modules/features/components/profile/personal-information/personal-information.component';
import { ProfileSidebarComponent } from 'src/app/modules/features/components/profile/profile-sidebar/profile-sidebar.component';
import { ProfileComponent } from 'src/app/modules/features/components/profile/profile.component';
import { RoleTransformPipe } from 'src/app/pipes/role.pipe';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { SharedModule } from 'src/app/modules/shared/shared.module';

@NgModule({
  declarations: [
    ProfileSidebarComponent,
    ProfileComponent,
    PersonalInformationComponent,
    RoleTransformPipe
  ],
  exports: [ProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    AuthenticationModule,
    RoundProgressModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [ProfileComponent]
})
export class ProfileModule {}
