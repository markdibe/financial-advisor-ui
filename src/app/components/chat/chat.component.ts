import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { ChatMessage } from '../../models/chat.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  currentUser: User | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;
  private shouldScrollToBottom: boolean = false;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.currentUser = user;
        this.loadChatHistory();
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadChatHistory() {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.chatService.getChatHistory(this.currentUser.id).subscribe({
      next: (response) => {
        this.messages = response.messages;
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.isLoading = false;
      },
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentUser || this.isSending) return;

    const messageText = this.newMessage.trim();
    this.newMessage = '';
    this.isSending = true;

    this.chatService.sendMessage(this.currentUser.id, messageText).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages.push(response.userMessage);
          this.messages.push(response.assistantMessage);
          this.shouldScrollToBottom = true;
        }
        this.isSending = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isSending = false;
        // Re-add the message to input so user can retry
        this.newMessage = messageText;
      },
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat() {
    if (!this.currentUser) return;

    if (confirm('Are you sure you want to clear all chat history?')) {
      this.chatService.clearChatHistory(this.currentUser.id).subscribe({
        next: () => {
          this.messages = [];
        },
        error: (error) => {
          console.error('Error clearing chat:', error);
        },
      });
    }
  }

  logout() {
    if (this.currentUser) {
      this.authService.logout(this.currentUser.id).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          this.router.navigate(['/login']);
        },
      });
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
