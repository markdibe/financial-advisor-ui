export interface User {
  id: number;
  email: string;
  hasGoogleAuth: boolean;
  hasHubspotAuth: boolean;
  lastLogin?: string;
}
