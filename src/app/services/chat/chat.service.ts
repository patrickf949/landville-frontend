import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { APPCONFIG } from 'src/app/config';
import { LocalStorageService } from 'src/app/services/local-storage.service';

export interface ChatEvent {
  type: string;
  message?: any;
  reader_id?: number;
  detail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private base = `${APPCONFIG.base_url}/chat/`;
  private socket: WebSocketSubject<ChatEvent> | null = null;
  private events$ = new Subject<ChatEvent>();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getInbox(): Observable<any> {
    return this.http.get(`${this.base}conversations/`);
  }

  startConversation(propertySlug: string): Observable<any> {
    return this.http.post(
      `${this.base}conversations/start/${propertySlug}/`, {});
  }

  getMessages(conversationId: number): Observable<any> {
    return this.http.get(
      `${this.base}conversations/${conversationId}/messages/`);
  }

  sendMessageRest(conversationId: number, body: string): Observable<any> {
    return this.http.post(
      `${this.base}conversations/${conversationId}/messages/`, { body });
  }

  reportConversation(conversationId: number): Observable<any> {
    return this.http.post(
      `${this.base}conversations/${conversationId}/report/`, {});
  }

  blockConversation(conversationId: number): Observable<any> {
    return this.http.post(
      `${this.base}conversations/${conversationId}/block/`, {});
  }

  /** Open the live websocket for one conversation. */
  connect(conversationId: number): Observable<ChatEvent> {
    if (!this.isBrowser) { return this.events$.asObservable(); }
    this.disconnect();
    const token = this.localStorage.get('token', '');
    const wsBase = APPCONFIG.base_url
      .replace(/^https/, 'wss')
      .replace(/^http/, 'ws')
      .replace(/\/api\/v1\/?$/, '');
    this.socket = webSocket<ChatEvent>(
      `${wsBase}/ws/chat/${conversationId}/?token=${token}`);
    this.socket.subscribe({
      next: event => this.events$.next(event),
      error: () => this.events$.next({ type: 'connection.lost' }),
    });
    return this.events$.asObservable();
  }

  send(body: string): void {
    if (this.socket) {
      this.socket.next({ type: 'message.send', body } as any);
    }
  }

  markRead(): void {
    if (this.socket) {
      this.socket.next({ type: 'message.read' } as any);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.complete();
      this.socket = null;
    }
  }
}
