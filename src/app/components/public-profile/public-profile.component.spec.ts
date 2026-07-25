import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PublicProfileComponent } from './public-profile.component';
import { ProfileService } from 'src/app/services/profile/profile.service';

describe('PublicProfileComponent', () => {
  let component: PublicProfileComponent;
  let fixture: ComponentFixture<PublicProfileComponent>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let titleSpy: jasmine.SpyObj<Title>;

  const mockPublicProfile = {
    data: {
      profile: {
        user: { first_name: 'Jane', last_name: 'Doe', date_joined: '2025-01-01' },
        active_listings: [{ id: 1, title: 'Jane House' }]
      }
    }
  };

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getPublicProfile']);
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);

    profileServiceSpy.getPublicProfile.and.returnValue(of(mockPublicProfile));

    await TestBed.configureTestingModule({
      declarations: [ PublicProfileComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: Title, useValue: titleSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['id', 'user123']]))
          }
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load public profile', () => {
    expect(component).toBeTruthy();
    expect(profileServiceSpy.getPublicProfile).toHaveBeenCalledWith('user123');
    expect(component.profile).toEqual(mockPublicProfile.data.profile);
    expect(component.listings.length).toBe(1);
    expect(component.fullName).toBe('Jane Doe');
    expect(component.memberSince).toBe('2025-01-01');
    expect(titleSpy.setTitle).toHaveBeenCalledWith("Jane Doe's listings | LandVille");
    expect(component.loading).toBeFalse();
  });

  it('should handle error when public profile is not found', () => {
    profileServiceSpy.getPublicProfile.and.returnValue(throwError(() => new Error('Not found')));
    component.load('invalid');
    expect(component.notFound).toBeTrue();
    expect(component.loading).toBeFalse();
  });
});
