import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { InputErrorsComponent } from 'src/app/modules/shared/input-errors/input-errors.component';

describe('InputErrorsComponent', () => {
  let component: InputErrorsComponent;
  let fixture: ComponentFixture<InputErrorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InputErrorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
