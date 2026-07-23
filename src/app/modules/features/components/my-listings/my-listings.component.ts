import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-my-listings',
  standalone: false,
  templateUrl: './my-listings.component.html',
  styleUrls: ['./my-listings.component.scss']
})
export class MyListingsComponent implements OnInit {
  listings: any[] = [];
  loading = true;
  myEmail = '';

  constructor(
    private propertiesService: PropertiesService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        this.myEmail = profile?.data?.profile?.user?.email
          || profile?.data?.user?.email || '';
        this.fetch();
      },
      error: () => this.fetch()
    });
  }

  fetch(): void {
    this.loading = true;
    this.propertiesService.searchProperties({}).subscribe({
      next: (response: any) => {
        const results =
          response?.data?.properties?.results || response?.results || [];
        this.listings = this.myEmail
          ? results.filter((p: any) => p?.owner?.email === this.myEmail)
          : results;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  markAs(listing: any, status: string): void {
    this.propertiesService.updateStatus(listing.slug, status).subscribe({
      next: () => {
        this.toastr.success('Listing status updated');
        this.fetch();
      },
      error: (err) => this.toastr.error(
        err?.error?.errors?.status?.[0] || 'Could not update status')
    });
  }

  remove(listing: any): void {
    if (!confirm(`Delete "${listing.title}"? This cannot be undone.`)) {
      return;
    }
    this.propertiesService.deleteProperty(listing.slug).subscribe({
      next: () => {
        this.toastr.success('Listing deleted');
        this.fetch();
      },
      error: () => this.toastr.error('Could not delete the listing')
    });
  }
}
