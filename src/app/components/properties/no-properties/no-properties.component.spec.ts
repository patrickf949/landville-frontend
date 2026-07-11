import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoPropertiesComponent } from 'src/app/components/properties/no-properties/no-properties.component';

describe('NoPropertiesComponent', () => {
  let component: NoPropertiesComponent;
  let fixture: ComponentFixture<NoPropertiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NoPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
