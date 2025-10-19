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
import { CalendarService } from '../../services/calendar.service';
import { CalendarEvent, CalendarSyncStatus } from '../../models/calendar.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  showEmailList: boolean = false;
  showCalendarList: boolean = false;
  currentUser: User | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isSending: boolean = false;
  private shouldScrollToBottom: boolean = false;
  userId: number = 0;

  // Email properties
  showDataPanel: boolean = false;
  emails: Email[] = [];
  syncStatus: SyncStatus | null = null;
  isSyncing: boolean = false;
  isLoadingEmails: boolean = false;

  // Calendar properties
  calendarEvents: CalendarEvent[] = [];
  calendarSyncStatus: CalendarSyncStatus | null = null;
  isSyncingCalendar: boolean = false;
  isLoadingCalendar: boolean = false;

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

  // Auto-sync settings
  private readonly STALE_THRESHOLD_MINUTES = 10; // Email & Calendar
  private readonly HUBSPOT_STALE_THRESHOLD_MINUTES = 15; // HubSpot (slower)

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private emailService: EmailService,
    private calendarService: CalendarService,
    private hubspotService: HubspotService,
    private router: Router
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

        // Load all cached data immediately (fast)
        this.loadAllCachedData();

        // Then check and auto-sync stale data in background
        this.checkAndAutoSyncAll();
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
  toggleEmailList() {
    this.showEmailList = !this.showEmailList;
  }
  toggleCalendarList() {
    this.showCalendarList = !this.showCalendarList;
  }
  goToInstructions() {
    this.router.navigate(['/instructions']);
  }
  /**
   * Load all cached data immediately for instant UI
   */
  private loadAllCachedData() {
    this.loadSyncStatus();
    this.loadCalendarSyncStatus();
    this.checkHubSpotStatus();
  }

  /**
   * Check sync status and auto-sync stale data in background
   */
  private checkAndAutoSyncAll() {
    // Check all sync statuses in parallel
    forkJoin({
      email: this.emailService.getSyncStatus(this.userId),
      calendar: this.calendarService.getSyncStatus(this.userId),
    }).subscribe({
      next: (statuses) => {
        // Auto-sync emails if stale
        if (
          !statuses.email.hasSynced ||
          this.isStale(statuses.email.lastSync, this.STALE_THRESHOLD_MINUTES)
        ) {
          this.silentSyncEmails();
        } else if (statuses.email.hasSynced) {
          this.loadEmails();
        }

        // Auto-sync calendar if stale
        if (
          !statuses.calendar.hasSynced ||
          this.isStale(statuses.calendar.lastSync, this.STALE_THRESHOLD_MINUTES)
        ) {
          this.silentSyncCalendar();
        } else if (statuses.calendar.hasSynced) {
          this.loadCalendarEvents();
        }
      },
      error: (error) => {
        console.error('Error checking sync status:', error);
      },
    });

    // Check HubSpot separately (if connected)
    if (this.hubspotConnected) {
      // HubSpot doesn't have lastSync in status, so we sync less frequently
      // We'll just load the data for now
      this.loadHubSpotData();
    }
  }

  /**
   * Check if data is stale based on last sync time
   */
  private isStale(
    lastSync: string | undefined,
    thresholdMinutes: number
  ): boolean {
    if (!lastSync) return true;

    const syncTime = new Date(lastSync).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - syncTime) / (1000 * 60);

    return diffMinutes > thresholdMinutes;
  }

  /**
   * Silent sync emails in background (no full loading state)
   */
  private silentSyncEmails() {
    // Use a smaller batch for background sync
    this.emailService.syncEmails(this.userId, 50).subscribe({
      next: () => {
        this.loadSyncStatus();
        this.loadEmails();
      },
      error: (error) => {
        console.error('Background email sync failed:', error);
      },
    });
  }

  /**
   * Silent sync calendar in background
   */
  private silentSyncCalendar() {
    this.calendarService.syncCalendar(this.userId, false).subscribe({
      next: () => {
        this.loadCalendarSyncStatus();
        this.loadCalendarEvents();
      },
      error: (error) => {
        console.error('Background calendar sync failed:', error);
      },
    });
  }

  // ==================== EXISTING METHODS (Keep as is) ====================

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
      },
      error: (error) => {
        console.error('Error loading sync status:', error);
      },
    });
  }

  /**
   * Manual sync emails (user clicks button)
   */
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

  // ==================== NEW CALENDAR METHODS ====================

  /**
   * Load calendar sync status
   */
  loadCalendarSyncStatus() {
    if (!this.currentUser) return;

    this.calendarService.getSyncStatus(this.currentUser.id).subscribe({
      next: (status) => {
        this.calendarSyncStatus = status;
      },
      error: (error) => {
        console.error('Error loading calendar sync status:', error);
      },
    });
  }

  /**
   * Manual sync calendar (user clicks button)
   */
  syncCalendar() {
    if (!this.currentUser || this.isSyncingCalendar) return;

    this.isSyncingCalendar = true;
    this.calendarService.syncCalendar(this.currentUser.id, false).subscribe({
      next: (response) => {
        console.log('Calendar sync response:', response);
        this.isSyncingCalendar = false;
        this.loadCalendarSyncStatus();
        this.loadCalendarEvents();
      },
      error: (error) => {
        console.error('Error syncing calendar:', error);
        this.isSyncingCalendar = false;
        alert('Failed to sync calendar. Please try again.');
      },
    });
  }

  /**
   * Load calendar events
   */
  loadCalendarEvents() {
    if (!this.currentUser) return;

    this.isLoadingCalendar = true;
    this.calendarService.getEvents(this.currentUser.id, 10).subscribe({
      next: (response) => {
        this.calendarEvents = response.events;
        this.isLoadingCalendar = false;
      },
      error: (error) => {
        console.error('Error loading calendar events:', error);
        this.isLoadingCalendar = false;
      },
    });
  }

  // ==================== EXISTING METHODS (Keep as is) ====================

  toggleDataPanel() {
    this.showDataPanel = !this.showDataPanel;
    if (
      this.showDataPanel &&
      this.emails.length === 0 &&
      this.syncStatus?.hasSynced
    ) {
      this.loadEmails();
    }
    if (
      this.showDataPanel &&
      this.calendarEvents.length === 0 &&
      this.calendarSyncStatus?.hasSynced
    ) {
      this.loadCalendarEvents();
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
    this.hubspotService.getSyncStatus(this.userId).subscribe({
      next: (status) => {
        this.contactCount = status.contactCount;
        this.companyCount = status.companyCount;
        this.dealCount = status.dealCount;
      },
      error: (error) => console.error('Error getting sync status:', error),
    });

    this.hubspotService.getContacts(this.userId, 10).subscribe({
      next: (response) => {
        this.contacts = response.contacts;
      },
      error: (error) => console.error('Error loading contacts:', error),
    });

    this.hubspotService.getCompanies(this.userId, 10).subscribe({
      next: (response) => {
        this.companies = response.companies;
      },
      error: (error) => console.error('Error loading companies:', error),
    });

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
