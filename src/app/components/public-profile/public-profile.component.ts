import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  standalone: false,
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  loading = true;
  notFound = false;
  profile: any = null;
  listings: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private titleService: Title,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.load(id);
      }
    });
  }

  load(id: string): void {
    this.loading = true;
    this.notFound = false;
    this.profileService.getPublicProfile(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: res => {
          this.profile = res?.data?.profile ?? null;
          this.listings = this.profile?.active_listings ?? [];
          const name = this.fullName || 'Member';
          this.titleService.setTitle(`${name}'s listings | LandVille`);
          this.cdr.detectChanges();
        },
        error: () => {
          this.notFound = true;
          this.cdr.detectChanges();
        }
      });
  }

  get fullName(): string {
    const u = this.profile?.user;
    if (!u) { return ''; }
    return `${u.first_name || ''} ${u.last_name || ''}`.trim();
  }

  get memberSince(): string | null {
    return this.profile?.user?.date_joined ?? null;
  }
}
