import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import {
  PropertyDescriptionComponent
} from 'src/app/components/property-details/property-description/property-description.component';

describe('PropertyDescriptionComponent', () => {
  let component: PropertyDescriptionComponent;
  let fixture: ComponentFixture<PropertyDescriptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ CommonModule ],
      declarations: [ PropertyDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render video link when ifVideo is true', () => {
    const freshFixture = TestBed.createComponent(PropertyDescriptionComponent);
    const freshComp = freshFixture.componentInstance;
    freshComp.ifVideo = true;
    freshComp.video = 'https://example.com/video';
    freshFixture.detectChanges();

    const videoLink = freshFixture.debugElement.query(By.css('a'));
    expect(videoLink).toBeTruthy();
    expect(videoLink.nativeElement.getAttribute('href')).toBe('https://example.com/video');
    expect(videoLink.nativeElement.textContent.trim()).toBe('Watch a video');
  });

  it('should not render video link when ifVideo is false', () => {
    component.ifVideo = false;
    component.video = 'https://example.com/video';
    fixture.detectChanges();

    const videoLink = fixture.debugElement.query(By.css('a'));
    expect(videoLink).toBeNull();
  });
});
