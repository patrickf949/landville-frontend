import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Title, By } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SavedPropertiesComponent } from './saved-properties.component';
import { PropertiesService } from 'src/app/services/properties/properties.service';

describe('SavedPropertiesComponent', () => {
  let component: SavedPropertiesComponent;
  let fixture: ComponentFixture<SavedPropertiesComponent>;
  let propertiesServiceSpy: jasmine.SpyObj<PropertiesService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let titleSpy: jasmine.SpyObj<Title>;

  const mockSavedProps = [
    { id: 1, title: 'Saved House', slug: 'saved-house', price: 100000 }
  ];

  beforeEach(async () => {
    propertiesServiceSpy = jasmine.createSpyObj('PropertiesService', ['getSavedProperties']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);

    propertiesServiceSpy.getSavedProperties.and.returnValue(of({ data: { property: mockSavedProps } }));

    await TestBed.configureTestingModule({
      declarations: [ SavedPropertiesComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: PropertiesService, useValue: propertiesServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Title, useValue: titleSpy }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedPropertiesComponent);
    component = fixture.componentInstance;
  });

  it('should display loading container when isLoading is true', () => {
    propertiesServiceSpy.getSavedProperties.and.returnValue(new Subject<any>());
    fixture.detectChanges();

    const loadingEl = fixture.debugElement.query(By.css('.text-center.py-5 p'));
    expect(loadingEl).toBeTruthy();
    expect(loadingEl.nativeElement.textContent).toContain('Loading your saved properties');
  });

  it('should display empty state container when !isLoading and savedProperties is empty', () => {
    propertiesServiceSpy.getSavedProperties.and.returnValue(of({ data: { property: [] } }));
    fixture.detectChanges();

    const emptyEl = fixture.debugElement.query(By.css('.empty-state h4'));
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.nativeElement.textContent).toContain('No saved properties yet');
  });

  it('should render property cards container when !isLoading and savedProperties has items', () => {
    fixture.detectChanges(); // triggers fetchSavedProperties

    expect(component.savedProperties.length).toBe(1);
    expect(component.isLoading).toBeFalse();

    const cardEl = fixture.debugElement.query(By.css('.custom-card'));
    expect(cardEl).toBeTruthy();
  });

  it('should handle error when fetching saved properties fails', () => {
    propertiesServiceSpy.getSavedProperties.and.returnValue(throwError(() => new Error('Error')));
    component.fetchSavedProperties();
    fixture.detectChanges();

    expect(toastrSpy.error).toHaveBeenCalledWith('Failed to load saved properties.');
    expect(component.isLoading).toBeFalse();
  });
});
