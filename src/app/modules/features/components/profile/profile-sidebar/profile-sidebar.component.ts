import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

import { ProfileService } from 'src/app/services/profile/profile.service';
import { Address } from 'src/app/models/Address';
import { removeSubscription } from 'src/app/helpers/unsubscribe';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  standalone: false,
  selector: 'app-profile-sidebar',
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.scss']
})
export class ProfileSidebarComponent implements OnInit, OnDestroy {
  profileImage: string;
  firstName: string;
  lastName: string;
  userRole: string;
  // check if the user has set the address, defaults to false
  addressSet = false;
  address: Address;
  subscribe: Subscription[] = [];

  constructor(
    private profileService: ProfileService,
    private toastService: ToastrService,
    private spinner: NgxSpinnerService,
    private storage: LocalStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchProfile();
  }
  fetchProfile() {
    this.spinner.show();
    this.subscribe.push(
      this.profileService.userProfile$.subscribe(response => {
        const profileData = response.data.profile;
        this.profileImage = this.setImage(profileData);
        this.firstName = profileData.user.first_name;
        this.lastName = profileData.user.last_name;
        this.userRole = profileData.user.role;
        if (Object.entries(profileData.address).length < 3) {
          this.addressSet = false;
        } else {
          this.address = profileData.address;
          this.addressSet = true;
        }
        this.spinner.hide();
        this.cdr.detectChanges();
      }, error => {
        this.spinner.hide();
        this.cdr.detectChanges();
      })
    );
  }
  setImage(profileData) {
    // always store updated image in localStorage
    const storedImage = this.storage.get('profileImage', '');
    if (profileData.image) {
      this.storage.set('profileImage', profileData.image);
      return profileData.image;
    } else if (storedImage) {
      // before requesting for new random avatar, we check if the user
      // has an image in localStorage ... This is so as to reduce the
      // number of calls sent to the external API
      return storedImage;
    } else {
      // only make request to external API if the user has no profile
      // image set in local storage
      const image = this.generateRandomAvatar();
      this.storage.set('profileImage', image);
      return image;
    }
  }
  generateRandomAvatar() {
    /*
    Generate a random image for users with no profile image. They are reminded
    to update their profile picture every time this method is called.
     */
    const randomString = Math.random().toString(36).substring(7);
    this.toastService.info('Please remember to set your profile image');
    return `https://api.dicebear.com/10.x/identicon/svg?seed=${randomString}`;
  }
  updateImage(event) {
    if (event.target.files.length > 0) {
      const image = event.target.files[0];
      if (image.size > 500 * 1024) {
        this.toastService.error('The profile picture exceeds the 500KB limit.');
        event.target.value = '';
        return;
      }
      this.spinner.show();
      const uploadData = new FormData();
      uploadData.append('image', image);
      this.subscribe.push(
        this.profileService.updateProfile(uploadData).subscribe(
          response => {
            this.profileImage = response.data.profile.image;
            this.storage.set('profileImage', this.profileImage);
            this.spinner.hide();
            this.toastService.success('Your image was successfully updated.');
            this.cdr.detectChanges();
          },
          error => {
            const err = error.error.errors.image;
            this.spinner.hide();
            this.toastService.error(
              `Could not update your profile image. ${err}`
            );
            this.cdr.detectChanges();
          }
        )
      );
    }
  }
  ngOnDestroy(): void {
    removeSubscription(this.subscribe);
  }
}
