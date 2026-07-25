import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsService } from 'src/app/services/terms/terms.service';
import { TermsPageComponent } from 'src/app/components/terms/terms.component';
import { of } from 'rxjs';

describe('TermsPageComponent', () => {
  let component: TermsPageComponent;
  let fixture: ComponentFixture<TermsPageComponent>;
  let MockTermService: jasmine.SpyObj<TermsService>;

  const mockTermData: any = {
    details: '<p>These are the terms and conditions</p>',
    last_updated_at: '2026-01-01'
  };

  beforeEach(waitForAsync(() => {
    MockTermService = jasmine.createSpyObj('TermsService', ['getTerms']);
    MockTermService.getTerms.and.returnValue(of(mockTermData));

    TestBed.configureTestingModule({
      declarations: [TermsPageComponent],
      providers: [{ provide: TermsService, useValue: MockTermService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should render terms details and last_updated_at when term data is emitted', () => {
    const detailsEl = fixture.nativeElement.querySelector('.my-5');
    const citeEl = fixture.nativeElement.querySelector('cite');

    expect(detailsEl).toBeTruthy();
    expect(detailsEl.innerHTML).toContain('These are the terms and conditions');
    expect(citeEl).toBeTruthy();
    expect(citeEl.textContent).toContain('2026-01-01');
  });
});
