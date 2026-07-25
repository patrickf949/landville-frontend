import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { InboxComponent } from './inbox.component';
import { ChatService } from 'src/app/services/chat/chat.service';

describe('InboxComponent', () => {
  let component: InboxComponent;
  let fixture: ComponentFixture<InboxComponent>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    chatServiceSpy = jasmine.createSpyObj('ChatService', ['getInbox']);
    chatServiceSpy.getInbox.and.returnValue(of([{ id: 1, other_user: { username: 'john' } }]));

    await TestBed.configureTestingModule({
      declarations: [ InboxComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load inbox conversations', () => {
    expect(component).toBeTruthy();
    expect(chatServiceSpy.getInbox).toHaveBeenCalled();
    expect(component.conversations.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when fetching inbox fails', () => {
    chatServiceSpy.getInbox.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.loading).toBeFalse();
  });

  describe('Template rendering and response parsing', () => {
    it('should display loading container when loading is true', () => {
      component.loading = true;
      (component as any).cdr.detectChanges();
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.fa-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should display empty state container when loading is false and conversations is empty', () => {
      component.loading = false;
      component.conversations = [];
      (component as any).cdr.detectChanges();
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No conversations yet');
    });

    it('should display unread-pill span when unread_count > 0', () => {
      component.loading = false;
      component.conversations = [
        { id: 1, unread_count: 5, other_party: { first_name: 'Alice' }, last_message: { body: 'Hello' } },
        { id: 2, unread_count: 0, other_party: { email: 'bob@example.com' } }
      ];
      (component as any).cdr.detectChanges();
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.conversation-row');
      expect(rows.length).toBe(2);

      const pill0 = rows[0].querySelector('.unread-pill');
      expect(pill0).toBeTruthy();
      expect(pill0.textContent.trim()).toBe('5');

      const pill1 = rows[1].querySelector('.unread-pill');
      expect(pill1).toBeFalsy();
    });

    it('should parse response.results when response has results property', () => {
      chatServiceSpy.getInbox.and.returnValue(of({ results: [{ id: 99, unread_count: 1 }] }));
      component.ngOnInit();
      expect(component.conversations).toEqual([{ id: 99, unread_count: 1 }]);
    });

    it('should fallback to empty array when response is null or undefined', () => {
      chatServiceSpy.getInbox.and.returnValue(of(null as any));
      component.ngOnInit();
      expect(component.conversations).toEqual([]);
    });
  });
});
