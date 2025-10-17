import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
  styleUrl: './auth-callback.component.css',
})
export class AuthCallbackComponent implements OnInit {
  message = 'Completing authentication...';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      const state = params['state'];
      const storedState = sessionStorage.getItem('oauth_state');

      if (!code) {
        this.error = 'No authorization code received';
        setTimeout(() => this.router.navigate(['/login']), 3000);
        return;
      }

      if (state !== storedState) {
        this.error = 'Invalid state parameter';
        setTimeout(() => this.router.navigate(['/login']), 3000);
        return;
      }

      // Exchange code for tokens
      this.authService.handleGoogleCallback(code, state).subscribe({
        next: (response) => {
          if (response.success) {
            sessionStorage.removeItem('oauth_state');
            this.message = 'Success! Redirecting...';
            setTimeout(() => this.router.navigate(['/chat']), 1000);
          } else {
            this.error = response.error || 'Authentication failed';
            setTimeout(() => this.router.navigate(['/login']), 3000);
          }
        },
        error: (error) => {
          this.error = 'Authentication failed. Please try again.';
          console.error('Callback error:', error);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
      });
    });
  }
}
