import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { CommonLayoutRoutes } from 'src/app/modules/features/features.routing';
import { HomeComponent } from 'src/app/components/home/home.component';
import { ProfileModule } from 'src/app/modules/features/components/profile/profile.module';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { DigitOnlyDirective } from '@uiowa/digit-only';
import { ReviewComponent } from 'src/app/modules/features/components/client-review/review.component';
import { ListingFormComponent } from 'src/app/modules/features/components/listing-form/listing-form.component';
import { MyListingsComponent } from 'src/app/modules/features/components/my-listings/my-listings.component';
import { InboxComponent } from 'src/app/modules/features/components/chat/inbox/inbox.component';
import { ThreadComponent } from 'src/app/modules/features/components/chat/thread/thread.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    NgxSpinnerModule,
    RouterModule.forChild(CommonLayoutRoutes),
    SharedModule,
    ReactiveFormsModule,
    ProfileModule,
    HttpClientModule,
    DigitOnlyDirective
  ],
  declarations: [
    HomeComponent,
    ReviewComponent,
    ListingFormComponent,
    MyListingsComponent,
    InboxComponent,
    ThreadComponent
  ],
  providers: [ProfileService, LocalStorageService, Title]
})
export class FeaturesModule {}
