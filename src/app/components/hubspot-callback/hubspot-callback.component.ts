import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HubspotService } from '../../services/hubspot.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hubspot-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hubspot-callback.component.html',
  styleUrl: './hubspot-callback.component.css',
})
export class HubspotCallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hubspotService: HubspotService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      const state = params['state'];

      console.log('HubSpot callback params:', { code, state });

      if (!code) {
        this.error = 'No authorization code received';
        this.loading = false;
        return;
      }

      // Get current user from AuthService
      const currentUser = this.authService.getCurrentUser();

      console.log('Current user:', currentUser);

      if (!currentUser || !currentUser.id) {
        this.error = 'User not logged in. Please log in first.';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        return;
      }

      // Handle HubSpot callback with userId
      this.hubspotService
        .handleCallback(currentUser.id, code, state)
        .subscribe({
          next: (response) => {
            console.log('HubSpot callback response:', response);
            if (response.success) {
              // Small delay to ensure sync starts
              setTimeout(() => {
                this.router.navigate(['/chat']);
              }, 1000);
            } else {
              this.error = 'Failed to connect HubSpot';
              this.loading = false;
            }
          },
          error: (err) => {
            console.error('HubSpot callback error:', err);
            this.error =
              'Error connecting to HubSpot: ' +
              (err.error?.error || err.message);
            this.loading = false;
          },
        });
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
