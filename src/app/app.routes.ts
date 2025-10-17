import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'chat', component: ChatComponent },
  { path: '**', redirectTo: '/login' },
];
