import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check if user is authenticated
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.currentUser = user;
      }
    });
  }

  logout() {
    if (this.currentUser) {
      this.authService.logout(this.currentUser.id).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Still navigate to login even if API call fails
          this.router.navigate(['/login']);
        },
      });
    }
  }
}
