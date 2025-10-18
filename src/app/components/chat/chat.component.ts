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
import { Email, SyncStatus } from '../../models/email.model';
import { EmailService } from '../../services/email.service';
import {
  HubSpotCompany,
  HubSpotContact,
  HubSpotDeal,
} from '../../models/hubspot.model';
import { HubspotService } from '../../services/hubspot.service';

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
  userId: number = 0;

  // Email properties
  showEmailPanel: boolean = false;
  emails: Email[] = [];
  syncStatus: SyncStatus | null = null;
  isSyncing: boolean = false;
  isLoadingEmails: boolean = false;

  // HubSpot
  hubspotConnected = false;
  contacts: HubSpotContact[] = [];
  companies: HubSpotCompany[] = [];
  deals: HubSpotDeal[] = [];
  contactCount = 0;
  companyCount = 0;
  dealCount = 0;
  showHubSpotDetails = false;
  isSyncingHubSpot: boolean = false;

  // Calendar
  calendarConnected = false;
  eventCount = 0;
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private emailService: EmailService,
    private router: Router,
    private hubspotService: HubspotService
  ) {}

  ngOnInit() {
    // Check if user is authenticated

    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.currentUser = user;
        this.userId = user.id;
        this.loadChatHistory();
        this.loadSyncStatus();
        this.checkHubSpotStatus();
      }
    });

    this.hubspotService.connected$.subscribe((connected) => {
      this.hubspotConnected = connected;
      if (connected) {
        this.loadHubSpotData();
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

  loadSyncStatus() {
    if (!this.currentUser) return;

    this.emailService.getSyncStatus(this.currentUser.id).subscribe({
      next: (status) => {
        this.syncStatus = status;
        if (status.hasSynced) {
          this.loadEmails();
        }
      },
      error: (error) => {
        console.error('Error loading sync status:', error);
      },
    });
  }

  syncEmails() {
    if (!this.currentUser || this.isSyncing) return;

    this.isSyncing = true;
    this.emailService.syncEmails(this.currentUser.id, 50).subscribe({
      next: (response) => {
        console.log('Sync response:', response);
        this.isSyncing = false;
        this.loadSyncStatus();
        this.loadEmails();
      },
      error: (error) => {
        console.error('Error syncing emails:', error);
        this.isSyncing = false;
        alert('Failed to sync emails. Please try again.');
      },
    });
  }

  loadEmails() {
    if (!this.currentUser) return;

    this.isLoadingEmails = true;
    this.emailService.getEmails(this.currentUser.id, 20).subscribe({
      next: (response) => {
        this.emails = response.emails;
        this.isLoadingEmails = false;
      },
      error: (error) => {
        console.error('Error loading emails:', error);
        this.isLoadingEmails = false;
      },
    });
  }

  toggleEmailPanel() {
    this.showEmailPanel = !this.showEmailPanel;
    if (
      this.showEmailPanel &&
      this.emails.length === 0 &&
      this.syncStatus?.hasSynced
    ) {
      this.loadEmails();
    }
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

  checkHubSpotStatus() {
    this.hubspotService.checkConnectionStatus(this.userId).subscribe({
      next: (response) => {
        this.hubspotConnected = response.connected;
        if (response.connected) {
          this.loadHubSpotData();
        }
      },
      error: (error) => console.error('Error checking HubSpot status:', error),
    });
  }

  connectHubSpot() {
    this.hubspotService.initiateConnection(this.userId).subscribe({
      next: (response) => {
        // Redirect to HubSpot OAuth
        window.location.href = response.authUrl;
      },
      error: (error) => {
        console.error('Error initiating HubSpot connection:', error);
        alert('Failed to connect to HubSpot. Please try again.');
      },
    });
  }

  syncHubSpot() {
    if (this.isSyncingHubSpot) return;
    this.isSyncingHubSpot = true;

    this.hubspotService.syncHubSpot(this.userId).subscribe({
      next: () => {
        console.log('HubSpot sync started');
        // Wait a bit then reload data
        setTimeout(() => {
          this.loadHubSpotData();
        }, 3000);
      },
      error: (error) => {
        console.error('Error syncing HubSpot:', error);
        this.isSyncingHubSpot = false;
      },
      complete: () => {
        this.isSyncingHubSpot = false;
      },
    });
  }

  loadHubSpotData() {
    // Get sync status
    this.hubspotService.getSyncStatus(this.userId).subscribe({
      next: (status) => {
        this.contactCount = status.contactCount;
        this.companyCount = status.companyCount;
        this.dealCount = status.dealCount;
      },
      error: (error) => console.error('Error getting sync status:', error),
    });

    // Load contacts
    this.hubspotService.getContacts(this.userId, 10).subscribe({
      next: (response) => {
        this.contacts = response.contacts;
      },
      error: (error) => console.error('Error loading contacts:', error),
    });

    // Load companies
    this.hubspotService.getCompanies(this.userId, 10).subscribe({
      next: (response) => {
        this.companies = response.companies;
      },
      error: (error) => console.error('Error loading companies:', error),
    });

    // Load deals
    this.hubspotService.getDeals(this.userId, 10).subscribe({
      next: (response) => {
        this.deals = response.deals;
      },
      error: (error) => console.error('Error loading deals:', error),
    });
  }

  toggleHubSpotDetails() {
    this.showHubSpotDetails = !this.showHubSpotDetails;
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
