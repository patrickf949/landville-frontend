import { TestBed } from '@angular/core/testing';
import { ToastrService, ToastrModule } from './ngx-toastr';
import { HotToastService } from '@ngxpert/hot-toast';

describe('ToastrService (ngx-toastr compat)', () => {
  let service: ToastrService;
  let hotToastSpy: jasmine.SpyObj<HotToastService>;

  beforeEach(() => {
    hotToastSpy = jasmine.createSpyObj('HotToastService', ['success', 'error', 'info', 'warning', 'close']);

    TestBed.configureTestingModule({
      providers: [
        ToastrService,
        { provide: HotToastService, useValue: hotToastSpy }
      ]
    });
    service = TestBed.inject(ToastrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should format message string without title', () => {
      service.success('Operation succeeded');
      expect(hotToastSpy.success).toHaveBeenCalledWith('Operation succeeded');
    });

    it('should format message string with title', () => {
      service.success('Operation succeeded', 'Success Title');
      expect(hotToastSpy.success).toHaveBeenCalledWith('Success Title: Operation succeeded');
    });
  });

  describe('error', () => {
    it('should format Error instance input', () => {
      const err = new Error('Something failed');
      service.error(err);
      expect(hotToastSpy.error).toHaveBeenCalledWith('Something failed');
    });

    it('should format Error instance with title', () => {
      const err = new Error('Something failed');
      service.error(err, 'Error Title');
      expect(hotToastSpy.error).toHaveBeenCalledWith('Error Title: Something failed');
    });
  });

  describe('info', () => {
    it('should format object input using JSON.stringify', () => {
      service.info({ details: 'info data' });
      expect(hotToastSpy.info).toHaveBeenCalledWith('{"details":"info data"}');
    });

    it('should format circular object input using String fallback', () => {
      const circular: any = {};
      circular.self = circular;
      service.info(circular);
      expect(hotToastSpy.info).toHaveBeenCalledWith('[object Object]');
    });
  });

  describe('warning', () => {
    it('should format warning with title', () => {
      service.warning('Watch out', 'Warning Title');
      expect(hotToastSpy.warning).toHaveBeenCalledWith('Warning Title: Watch out');
    });
  });

  describe('clear', () => {
    it('should call close on HotToastService', () => {
      service.clear();
      expect(hotToastSpy.close).toHaveBeenCalled();
    });
  });

  describe('ToastrModule', () => {
    it('should configure module via forRoot()', () => {
      const moduleWithProviders = ToastrModule.forRoot();
      expect(moduleWithProviders.ngModule).toBe(ToastrModule);
      expect(moduleWithProviders.providers).toBeDefined();
    });
  });
});
