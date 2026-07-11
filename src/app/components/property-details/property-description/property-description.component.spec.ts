import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PropertyDescriptionComponent
} from 'src/app/components/property-details/property-description/property-description.component';

describe('PropertyDescriptionComponent', () => {
  let component: PropertyDescriptionComponent;
  let fixture: ComponentFixture<PropertyDescriptionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
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
});
