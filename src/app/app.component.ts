import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ApiService],
})
export class AppComponent implements OnInit {
  title = 'Financial Advisor AI';
  apiStatus: string = 'Checking...';
  apiMessage: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.checkApiHealth();
  }

  checkApiHealth() {
    this.apiService.getHealth().subscribe({
      next: (response) => {
        this.apiStatus = response.status;
        this.apiMessage = response.message;
      },
      error: (error) => {
        this.apiStatus = 'error';
        this.apiMessage = 'Could not connect to API';
        console.error('API Health Check Failed:', error);
      },
    });
  }
}
