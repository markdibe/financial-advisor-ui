import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // If already authenticated, redirect to chat
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/chat']);
    }
  }

  loginWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getGoogleLoginUrl().subscribe({
      next: (response) => {
        // Store state for verification
        sessionStorage.setItem('oauth_state', response.state);

        // Redirect to Google OAuth
        window.location.href = response.authUrl;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          'Failed to initiate Google login. Please try again.';
        console.error('Google login error:', error);
      },
    });
  }
}
