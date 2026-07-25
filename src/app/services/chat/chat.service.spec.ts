import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatService, ChatEvent } from './chat.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { APPCONFIG } from 'src/app/config';
import { Subject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  let localStorageSpy: jasmine.SpyObj<LocalStorageService>;
  const base = `${APPCONFIG.base_url}/chat/`;

  beforeEach(() => {
    localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['get']);
    localStorageSpy.get.and.returnValue('test-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChatService,
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.disconnect();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET request for getInbox', () => {
    service.getInbox().subscribe(res => expect(res).toEqual([]));
    const req = httpMock.expectOne(`${base}conversations/`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should send POST request for startConversation', () => {
    service.startConversation('prop-slug').subscribe(res => expect(res).toEqual({ id: 1 }));
    const req = httpMock.expectOne(`${base}conversations/start/prop-slug/`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });
  });

  it('should send GET request for getMessages', () => {
    service.getMessages(123).subscribe(res => expect(res).toEqual([]));
    const req = httpMock.expectOne(`${base}conversations/123/messages/`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should send POST request for sendMessageRest', () => {
    service.sendMessageRest(123, 'hello').subscribe(res => expect(res).toEqual({ status: 'sent' }));
    const req = httpMock.expectOne(`${base}conversations/123/messages/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ body: 'hello' });
    req.flush({ status: 'sent' });
  });

  it('should send POST request for reportConversation', () => {
    service.reportConversation(123).subscribe(res => expect(res).toEqual({ status: 'reported' }));
    const req = httpMock.expectOne(`${base}conversations/123/report/`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'reported' });
  });

  it('should send POST request for blockConversation', () => {
    service.blockConversation(123).subscribe(res => expect(res).toEqual({ status: 'blocked' }));
    const req = httpMock.expectOne(`${base}conversations/123/block/`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'blocked' });
  });

  describe('WebSocket methods (connect, send, markRead, disconnect)', () => {
    let mockSocketSubject: Subject<ChatEvent>;

    beforeEach(() => {
      mockSocketSubject = new Subject<ChatEvent>();
      // Assign mock socket directly to test websocket handling
      (service as any).socket = mockSocketSubject;
    });

    it('should send message via websocket when send() is called', () => {
      spyOn(mockSocketSubject, 'next');
      service.send('Hello over websocket');
      expect(mockSocketSubject.next).toHaveBeenCalledWith({ type: 'message.send', body: 'Hello over websocket' } as any);
    });

    it('should send markRead event via websocket when markRead() is called', () => {
      spyOn(mockSocketSubject, 'next');
      service.markRead();
      expect(mockSocketSubject.next).toHaveBeenCalledWith({ type: 'message.read' } as any);
    });

    it('should complete socket and set it to null when disconnect() is called', () => {
      spyOn(mockSocketSubject, 'complete');
      service.disconnect();
      expect(mockSocketSubject.complete).toHaveBeenCalled();
      expect((service as any).socket).toBeNull();
    });

    it('should handle connect() in browser environment and socket observer callbacks', () => {
      const emittedEvents: ChatEvent[] = [];
      const testSocket = new Subject<ChatEvent>();

      const obs$ = service.connect(456);
      obs$.subscribe(e => emittedEvents.push(e));

      // Test next callback
      (service as any).socket = testSocket;
      testSocket.subscribe({
        next: event => (service as any).events$.next(event),
        error: () => (service as any).events$.next({ type: 'connection.lost' }),
        complete: () => (service as any).events$.next({ type: 'connection.lost' })
      });

      testSocket.next({ type: 'test.msg', detail: 'hello' } as any);
      expect(emittedEvents).toContain(jasmine.objectContaining({ type: 'test.msg', detail: 'hello' }));

      // Test error callback
      const errorSocket = new Subject<ChatEvent>();
      errorSocket.subscribe({
        next: event => (service as any).events$.next(event),
        error: () => (service as any).events$.next({ type: 'connection.lost' }),
        complete: () => (service as any).events$.next({ type: 'connection.lost' })
      });
      errorSocket.error(new Error('connection drop'));
      expect(emittedEvents).toContain(jasmine.objectContaining({ type: 'connection.lost' }));

      // Test complete callback
      const completeSocket = new Subject<ChatEvent>();
      completeSocket.subscribe({
        next: event => (service as any).events$.next(event),
        error: () => (service as any).events$.next({ type: 'connection.lost' }),
        complete: () => (service as any).events$.next({ type: 'connection.lost' })
      });
      completeSocket.complete();
      expect(emittedEvents).toContain(jasmine.objectContaining({ type: 'connection.lost' }));

      service.disconnect();
      expect((service as any).socket).toBeNull();
    });
  });

  describe('Non-browser platform (SSR)', () => {
    let serverService: ChatService;

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          ChatService,
          { provide: LocalStorageService, useValue: localStorageSpy },
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      serverService = TestBed.inject(ChatService);
    });

    it('should return events$ without connecting socket when in server environment', () => {
      const obs = serverService.connect(999);
      expect(obs).toBeDefined();
      expect((serverService as any).socket).toBeNull();
    });
  });
});
