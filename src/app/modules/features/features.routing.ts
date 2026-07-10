import { Routes } from '@angular/router';
import { ProfileComponent } from 'src/app/modules/features/components/profile/profile.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ReviewComponent } from 'src/app/modules/features/components/client-review/review.component';
import { ListingFormComponent } from 'src/app/modules/features/components/listing-form/listing-form.component';
import { MyListingsComponent } from 'src/app/modules/features/components/my-listings/my-listings.component';
import { InboxComponent } from 'src/app/modules/features/components/chat/inbox/inbox.component';
import { ThreadComponent } from 'src/app/modules/features/components/chat/thread/thread.component';

export const CommonLayoutRoutes: Routes = [
  {
    path: 'create-listing',
    component: ListingFormComponent,
    data: { title: 'Create a listing' },
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
