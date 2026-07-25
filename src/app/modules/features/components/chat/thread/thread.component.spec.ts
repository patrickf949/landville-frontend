import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ThreadComponent } from './thread.component';
import { ChatService, ChatEvent } from 'src/app/services/chat/chat.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

describe('ThreadComponent', () => {
  let component: ThreadComponent;
  let fixture: ComponentFixture<ThreadComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let chatEventSubject: Subject<ChatEvent>;

  const mockProfile = {
    data: {
      profile: {
        user: { id: 10, username: 'me' }
      }
    }
  };

  const mockMessages = [
    { id: 1, body: 'Hello', sender: { id: 2 } },
    { id: 2, body: 'Hi', sender: { id: 10 } }
  ];

  beforeEach(async () => {
    chatEventSubject = new Subject<ChatEvent>();
    chatServiceSpy = jasmine.createSpyObj('ChatService', [
      'getMessages',
      'connect',
      'disconnect',
      'send',
      'sendMessageRest',
      'markRead',
      'reportConversation',
      'blockConversation'
    ]);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    profileServiceSpy.getProfile.and.returnValue(of(mockProfile as any));
    chatServiceSpy.getMessages.and.callFake(() => of([
      { id: 1, body: 'Hello', sender: { id: 2 } },
      { id: 2, body: 'Hi', sender: { id: 10 } }
    ]));
    chatServiceSpy.connect.and.returnValue(chatEventSubject.asObservable());

    await TestBed.configureTestingModule({
      declarations: [ ThreadComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: new Map([['id', '123']]) }
          }
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load profile and messages on init', () => {
    expect(component).toBeTruthy();
    expect(component.conversationId).toBe(123);
    expect(component.myId).toBe(10);
    expect(component.messages.length).toBe(2);
    expect(component.live).toBeTrue();
  });

  it('should identify own messages correctly', () => {
    expect(component.isMine(mockMessages[0])).toBeFalse();
    expect(component.isMine(mockMessages[1])).toBeTrue();
  });

  it('should handle incoming websocket events', () => {
    // New message event from someone else
    const newMsg = { id: 3, body: 'New msg', sender: { id: 2 } };
    chatEventSubject.next({ type: 'message.new', message: newMsg });
    expect(component.messages.length).toBe(3);
    expect(chatServiceSpy.markRead).toHaveBeenCalled();

    // Read event
    chatEventSubject.next({ type: 'message.read' });
    expect(component.messages[0].read_at).toBeDefined();

    // Connection lost
    chatEventSubject.next({ type: 'connection.lost' });
    expect(component.live).toBeFalse();

    // Error event
    chatEventSubject.next({ type: 'error', detail: 'Failed' });
    expect(toastrSpy.error).toHaveBeenCalledWith('Failed');
  });

  it('should send message via live websocket', () => {
    component.live = true;
    component.draft = 'Hello world';
    component.send();

    expect(chatServiceSpy.send).toHaveBeenCalledWith('Hello world');
    expect(component.draft).toBe('');
  });

  it('should send message via REST API when offline (live = false)', fakeAsync(() => {
    component.live = false;
    component.draft = 'Fallback message';
    chatServiceSpy.sendMessageRest.and.returnValue(of({ data: { message: { id: 99, body: 'Fallback message' } } }));

    component.send();
    tick();

    expect(chatServiceSpy.sendMessageRest).toHaveBeenCalledWith(123, 'Fallback message');
    expect(component.messages.some(m => m.id === 99)).toBeTrue();
  }));

  it('should report conversation', fakeAsync(() => {
    chatServiceSpy.reportConversation.and.returnValue(of({ message: 'Reported successfully' }));
    component.report();
    tick();

    expect(chatServiceSpy.reportConversation).toHaveBeenCalledWith(123);
    expect(toastrSpy.success).toHaveBeenCalledWith('Reported successfully');
  }));

  it('should block conversation if confirmed', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    chatServiceSpy.blockConversation.and.returnValue(of({ message: 'Blocked successfully' }));

    component.block();
    tick();

    expect(chatServiceSpy.blockConversation).toHaveBeenCalledWith(123);
    expect(toastrSpy.success).toHaveBeenCalledWith('Blocked successfully');
  }));
});
