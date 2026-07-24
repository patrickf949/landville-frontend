import { Routes } from '@angular/router';
import { ProfileComponent } from 'src/app/modules/features/components/profile/profile.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ReviewComponent } from 'src/app/modules/features/components/client-review/review.component';
import { ListingFormComponent } from 'src/app/modules/features/components/listing-form/listing-form.component';
import { MyListingsComponent } from 'src/app/modules/features/components/my-listings/my-listings.component';
import { InboxComponent } from 'src/app/modules/features/components/chat/inbox/inbox.component';
import { ThreadComponent } from 'src/app/modules/features/components/chat/thread/thread.component';
import { CheckoutComponent } from 'src/app/modules/features/components/payment/checkout/checkout.component';
import { TransactionHistoryComponent } from 'src/app/modules/features/components/payment/transaction-history/transaction-history.component';
import { SavedPropertiesComponent } from 'src/app/modules/features/components/saved-properties/saved-properties.component';

export const CommonLayoutRoutes: Routes = [
  {
    path: 'create-listing',
    component: ListingFormComponent,
    data: { title: 'Create a listing' },
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-listing/:slug',
    component: ListingFormComponent,
    data: { title: 'Edit a listing' },
    canActivate: [AuthGuard]
  },
  {
    path: 'my-listings',
    component: MyListingsComponent,
    data: { title: 'My listings' },
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    component: InboxComponent,
    data: { title: 'Messages' },
    canActivate: [AuthGuard]
  },
  {
    path: 'messages/:id',
    component: ThreadComponent,
    data: { title: 'Conversation' },
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout/:slug',
    component: CheckoutComponent,
    data: { title: 'Checkout' },
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions',
    component: TransactionHistoryComponent,
    data: { title: 'Transaction History' },
    canActivate: [AuthGuard]
  },
  {
    path: 'saved-properties',
    component: SavedPropertiesComponent,
    data: { title: 'Saved Properties' },
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    data: {
      title: 'User Profile'
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'client/:clientId/review',
    component: ReviewComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Review client',
      tags: []
    }
  }
];
