import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Router } from '@angular/router';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { Property } from 'src/app/models/Property';
import { environment } from 'src/environments/environment';
import { of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate('600ms 100ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query('.feature-card, .card1', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          stagger(120, animate('500ms ease-out',
            style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  trendingPropertiesUrl = `${environment.api_url}/properties/trending/?city=`;
  trendingProperties: Property[] = [];
  searchCity = '';
  searchType = '';

  features = [
    {
      icon: 'fa-search-location',
      title: 'Find it',
      text: 'Search homes, apartments, commercial spaces and land — filter '
        + 'by price, amenities, distance to the road and even how quiet '
        + 'the area is.'
    },
    {
      icon: 'fa-plus-circle',
      title: 'List it',
      text: 'Anyone can list a property in minutes: five photos, a '
        + 'description, a pin on the map. For rent or for sale, house '
        + 'or land.'
    },
    {
      icon: 'fa-map-marked-alt',
      title: 'See it on the map',
      text: 'Every listing is pinned to its exact location so you know '
        + 'precisely what you are looking at, before you ever visit.'
    },
    {
      icon: 'fa-comments',
      title: 'Talk directly',
      text: 'Chat with the owner in real time — no middlemen, no agents, '
        + 'no fees. LandVille simply connects you.'
    }
  ];

  constructor(
    private propertiesService: PropertiesService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.titleService.setTitle(data.title);
      this.metaService.addTags(data.tags, true);
    });

    this.subscription = this.propertiesService
      .getProperties(this.trendingPropertiesUrl)
      .pipe(
        catchError(() => of({ data: { property: [] } }))
      )
      .subscribe(
        ({ data: { property } }) => {
          this.trendingProperties = (property || []).slice(0, 6);
        });
  }

  search(): void {
    const queryParams: any = {};
    if (this.searchCity) { queryParams.city = this.searchCity; }
    if (this.searchType) { queryParams.listing_type = this.searchType; }
    this.router.navigate(['/properties'], { queryParams });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
