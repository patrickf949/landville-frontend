import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-saved-properties',
  templateUrl: './saved-properties.component.html',
  styleUrls: ['./saved-properties.component.scss']
})
export class SavedPropertiesComponent implements OnInit {
  savedProperties: any[] = [];
  isLoading: boolean = true;

  constructor(
    private propertiesService: PropertiesService,
    private toastr: ToastrService,
    private titleService: Title,
    private cdr: ChangeDetectorRef
  ) {
    this.titleService.setTitle('Saved Properties | LandVille');
  }

  ngOnInit(): void {
    this.fetchSavedProperties();
  }

  fetchSavedProperties(): void {
    this.isLoading = true;
    this.propertiesService.getSavedProperties().subscribe({
      next: (res: any) => {
        console.log('SAVED PROPERTIES RES:', res);
        this.savedProperties = res?.data?.property || res?.results || (Array.isArray(res) ? res : []);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Failed to load saved properties.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
