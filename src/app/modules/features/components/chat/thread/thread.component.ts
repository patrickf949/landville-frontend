import {
  AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ChatEvent, ChatService } from 'src/app/services/chat/chat.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-chat-thread',
  standalone: false,
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollArea') scrollArea: ElementRef;

  conversationId: number;
  messages: any[] = [];
  draft = '';
  loading = true;
  live = false;
  myId: number | null = null;
  private sub: Subscription | null = null;
  private shouldScroll = false;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.conversationId = +this.route.snapshot.paramMap.get('id');
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        this.myId = profile?.data?.profile?.user?.id
          || profile?.data?.user?.id || null;
        this.cdr.detectChanges();
      },
      error: () => undefined
    });
    this.chatService.getMessages(this.conversationId).subscribe({
      next: (response: any) => {
        this.messages = response?.results || response || [];
        this.loading = false;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    this.sub = this.chatService.connect(this.conversationId)
      .subscribe((event: ChatEvent) => this.onEvent(event));
    this.live = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollArea) {
      const el = this.scrollArea.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    if (this.sub) { this.sub.unsubscribe(); }
    this.chatService.disconnect();
  }

  private onEvent(event: ChatEvent): void {
    if (event.type === 'message.new' && event.message) {
      this.messages.push(event.message);
      this.shouldScroll = true;
      if (event.message?.sender?.id !== this.myId) {
        this.chatService.markRead();
      }
    } else if (event.type === 'message.read') {
      this.messages.forEach(m => {
        if (!m.read_at) { m.read_at = new Date().toISOString(); }
      });
    } else if (event.type === 'connection.lost') {
      this.live = false;
    } else if (event.type === 'error') {
      this.toastr.error(event.detail || 'Message could not be sent');
    }
    this.cdr.detectChanges();
  }

  send(): void {
    const body = this.draft.trim();
    if (!body) { return; }
    if (this.live) {
      this.chatService.send(body);
    } else {
      // graceful fallback when the socket is down
      this.chatService.sendMessageRest(this.conversationId, body).subscribe({
        next: (response: any) => {
          const message = response?.data?.message;
          if (message) { this.messages.push(message); }
          this.shouldScroll = true;
          this.cdr.detectChanges();
        },
        error: () => this.toastr.error('Message could not be sent')
      });
    }
    this.draft = '';
    this.cdr.detectChanges();
  }

  isMine(message: any): boolean {
    return this.myId != null && message?.sender?.id === this.myId;
  }

  report(): void {
    this.chatService.reportConversation(this.conversationId).subscribe({
      next: (r: any) => this.toastr.success(r?.message || 'Reported'),
      error: () => this.toastr.error('Could not report the conversation')
    });
  }

  block(): void {
    if (!confirm('Block this conversation? The other party will no longer '
      + 'be able to message you in this thread.')) { return; }
    this.chatService.blockConversation(this.conversationId).subscribe({
      next: (r: any) => this.toastr.success(r?.message || 'Blocked'),
      error: () => this.toastr.error('Could not block the conversation')
    });
  }
}
