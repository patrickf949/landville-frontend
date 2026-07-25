import { ComponentFixture, TestBed , waitForAsync} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from 'src/app/app.component';
import { localStorageSpy } from 'src/app/helpers/tests/spies';
import {NavbarComponent} from 'src/app/modules/shared/components/navbar/navbar.component';
import {FooterComponent} from 'src/app/modules/shared/components/footer/footer.component';
import {TopbarComponent} from 'src/app/modules/shared/components/topbar/topbar.component';
import {LocalStorageService} from 'src/app/services/local-storage.service';
import {HttpClient} from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        AppComponent,
        NavbarComponent,
        FooterComponent,
        TopbarComponent,
      ],
      providers: [
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: HttpClient, },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
