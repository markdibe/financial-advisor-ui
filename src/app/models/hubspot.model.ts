export interface HubSpotContact {
  id: number;
  hubSpotId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  lifecycleStage?: string;
  lastModifiedDate?: string;
}

export interface HubSpotCompany {
  id: number;
  hubSpotId: string;
  name?: string;
  domain?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  lastModifiedDate?: string;
}

export interface HubSpotDeal {
  id: number;
  hubSpotId: string;
  dealName?: string;
  dealStage?: string;
  pipeline?: string;
  amount?: number;
  closeDate?: string;
  priority?: string;
  lastModifiedDate?: string;
}

export interface HubSpotSyncStatus {
  success: boolean;
  contactCount: number;
  companyCount: number;
  dealCount: number;
}
