import { ReviewsComponent } from 'src/app/components/property-details/reviews/reviews.component';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from 'src/app/app.component';
import { AppRoutingModule } from 'src/app/app.routing';

import { RouterModule } from '@angular/router';
import { FeaturesComponent } from 'src/app/modules/features/features.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { JwtInterceptor } from 'src/app/interceptors/jwt/jwt.interceptor';
import { ErrorInterceptor } from 'src/app/interceptors/error/error.interceptor';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { EnterResetPasswordComponent } from 'src/app/modules/authentication/components/enter-reset-password/enter-reset-password.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { NoAuthGuard } from 'src/app/guards/no-auth.guard';
import { TermsService } from 'src/app/services/terms/terms.service';
import { BrowserModule } from '@angular/platform-browser';
import { AuthenticationComponent } from 'src/app/modules/authentication/authentication.component';
import { TermsPageComponent } from 'src/app/components/terms/terms.component';
import { PropertiesComponent } from 'src/app/components/properties/properties.component';
import { NoPropertiesComponent } from 'src/app/components/properties/no-properties/no-properties.component';
import { PropertyDetailsComponent } from 'src/app/components/property-details/property-details.component';
import { PropertyDetailComponent } from 'src/app/components/property-details/property-detail/property-detail.component';
import { ClientAdminComponent } from 'src/app/components/property-details/client-admin/client-admin.component';
import {
  PropertyDescriptionComponent
} from 'src/app/components/property-details/property-description/property-description.component';
import { ClientReviewsComponent } from 'src/app/components/client-reviews/client-reviews.component';
import { PublicProfileComponent } from 'src/app/components/public-profile/public-profile.component';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SOCIAL_AUTH_CONFIG,
  SocialLoginModule
} from '@abacritt/angularx-social-login';
import { APPCONFIG } from 'src/app/config';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    HttpClientModule,
    NgxSpinnerModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    SocialLoginModule
  ],
  declarations: [
    AppComponent,
    AuthenticationComponent,
    FeaturesComponent,
    TermsPageComponent,
    PropertiesComponent,
    NoPropertiesComponent,
    PropertyDetailsComponent,
    PropertyDetailComponent,
    ClientAdminComponent,
    PropertyDescriptionComponent,
    ReviewsComponent,
    ClientReviewsComponent,
    PublicProfileComponent

  ],
  providers: [
    LocalStorageService,
    AuthGuard,
    NoAuthGuard,
    TermsService,
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(APPCONFIG.googleId)
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(APPCONFIG.facebookId)
          }
        ]
      }
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
