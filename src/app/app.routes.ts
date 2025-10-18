import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { HubspotCallbackComponent } from './components/hubspot-callback/hubspot-callback.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'auth/hubspot/callback', component: HubspotCallbackComponent },
  { path: 'chat', component: ChatComponent },
  { path: '**', redirectTo: '/login' },
];
