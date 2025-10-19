import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InstructionService } from '../../services/instruction.service';
import { User } from '../../models/user.model';
import {
  AgentActivity,
  OngoingInstruction,
} from '../../models/instruction.model';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css'],
})
export class InstructionsComponent implements OnInit {
  currentUser: User | null = null;
  instructions: OngoingInstruction[] = [];
  activities: AgentActivity[] = [];

  isLoadingInstructions = false;
  isLoadingActivities = false;

  showCreateModal = false;
  showEditModal = false;
  showActivitiesPanel = false;

  newInstruction = {
    instructionText: '',
    triggerType: 'All',
    priority: 0,
  };

  editingInstruction: OngoingInstruction | null = null;
  editForm = {
    instructionText: '',
    triggerType: 'All',
    priority: 0,
    isActive: true,
  };

  unreadActivitiesCount = 0;

  triggerTypes = [
    { value: 'All', label: '🌐 All Sources' },
    { value: 'Email', label: '📧 Email' },
    { value: 'Calendar', label: '📅 Calendar' },
    { value: 'HubSpot', label: '🔶 HubSpot' },
  ];

  constructor(
    private authService: AuthService,
    private instructionService: InstructionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.currentUser = user;
        this.loadInstructions();
        this.loadActivities();
      }
    });
  }

  /**
   * Load all instructions
   */
  loadInstructions() {
    if (!this.currentUser) return;

    this.isLoadingInstructions = true;
    this.instructionService.getInstructions(this.currentUser.id).subscribe({
      next: (response) => {
        this.instructions = response.instructions;
        this.isLoadingInstructions = false;
      },
      error: (error) => {
        console.error('Error loading instructions:', error);
        this.isLoadingInstructions = false;
      },
    });
  }

  /**
   * Load agent activities
   */
  loadActivities() {
    if (!this.currentUser) return;

    this.isLoadingActivities = true;
    this.instructionService.getActivities(this.currentUser.id, 50).subscribe({
      next: (response) => {
        this.activities = response.activities;
        this.unreadActivitiesCount = response.unreadCount;
        this.isLoadingActivities = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.isLoadingActivities = false;
      },
    });
  }

  /**
   * Open create modal
   */
  openCreateModal() {
    this.showCreateModal = true;
    this.newInstruction = {
      instructionText: '',
      triggerType: 'All',
      priority: 0,
    };
  }

  /**
   * Close create modal
   */
  closeCreateModal() {
    this.showCreateModal = false;
  }

  /**
   * Create new instruction
   */
  createInstruction() {
    if (!this.currentUser || !this.newInstruction.instructionText.trim()) {
      return;
    }

    this.instructionService
      .createInstruction({
        userId: this.currentUser.id,
        instructionText: this.newInstruction.instructionText,
        triggerType: this.newInstruction.triggerType,
        priority: this.newInstruction.priority,
      })
      .subscribe({
        next: (response) => {
          console.log('Instruction created:', response);
          this.loadInstructions();
          this.closeCreateModal();
        },
        error: (error) => {
          console.error('Error creating instruction:', error);
          alert('Failed to create instruction. Please try again.');
        },
      });
  }

  /**
   * Open edit modal
   */
  openEditModal(instruction: OngoingInstruction) {
    this.editingInstruction = instruction;
    this.editForm = {
      instructionText: instruction.instructionText,
      triggerType: instruction.triggerType,
      priority: instruction.priority,
      isActive: instruction.isActive,
    };
    this.showEditModal = true;
  }

  /**
   * Close edit modal
   */
  closeEditModal() {
    this.showEditModal = false;
    this.editingInstruction = null;
  }

  /**
   * Update instruction
   */
  updateInstruction() {
    if (!this.editingInstruction) return;

    this.instructionService
      .updateInstruction(this.editingInstruction.id, this.editForm)
      .subscribe({
        next: (response) => {
          console.log('Instruction updated:', response);
          this.loadInstructions();
          this.closeEditModal();
        },
        error: (error) => {
          console.error('Error updating instruction:', error);
          alert('Failed to update instruction. Please try again.');
        },
      });
  }

  /**
   * Toggle instruction active status
   */
  toggleInstruction(instruction: OngoingInstruction) {
    this.instructionService.toggleInstruction(instruction.id).subscribe({
      next: (response) => {
        console.log('Instruction toggled:', response);
        this.loadInstructions();
      },
      error: (error) => {
        console.error('Error toggling instruction:', error);
        alert('Failed to toggle instruction. Please try again.');
      },
    });
  }

  /**
   * Delete instruction
   */
  deleteInstruction(instruction: OngoingInstruction) {
    if (
      !confirm(
        `Are you sure you want to delete this instruction?\n\n"${instruction.instructionText}"`
      )
    ) {
      return;
    }

    this.instructionService.deleteInstruction(instruction.id).subscribe({
      next: (response) => {
        console.log('Instruction deleted:', response);
        this.loadInstructions();
      },
      error: (error) => {
        console.error('Error deleting instruction:', error);
        alert('Failed to delete instruction. Please try again.');
      },
    });
  }

  /**
   * Toggle activities panel
   */
  toggleActivitiesPanel() {
    this.showActivitiesPanel = !this.showActivitiesPanel;
    if (this.showActivitiesPanel && this.unreadActivitiesCount > 0) {
      this.markAllActivitiesRead();
    }
  }

  /**
   * Mark all activities as read
   */
  markAllActivitiesRead() {
    const unreadIds = this.activities.filter((a) => !a.isRead).map((a) => a.id);

    if (unreadIds.length === 0) return;

    this.instructionService.markActivitiesRead(unreadIds).subscribe({
      next: () => {
        this.activities.forEach((a) => (a.isRead = true));
        this.unreadActivitiesCount = 0;
      },
      error: (error) => {
        console.error('Error marking activities as read:', error);
      },
    });
  }

  /**
   * Get trigger type label
   */
  getTriggerTypeLabel(triggerType: string): string {
    const type = this.triggerTypes.find((t) => t.value === triggerType);
    return type ? type.label : triggerType;
  }

  /**
   * Get activity icon
   */
  getActivityIcon(activityType: string): string {
    const iconMap: { [key: string]: string } = {
      EmailSent: '📧',
      CalendarEventCreated: '📅',
      HubSpotContactCreated: '👤',
      HubSpotDealCreated: '💼',
      HubSpotCompanyCreated: '🏢',
      EmailReceived: '📨',
      MeetingScheduled: '🗓️',
      TaskCompleted: '✅',
    };
    return iconMap[activityType] || '🤖';
  }

  /**
   * Navigate back to chat
   */
  goToChat() {
    this.router.navigate(['/chat']);
  }

  /**
   * Logout
   */
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
}
