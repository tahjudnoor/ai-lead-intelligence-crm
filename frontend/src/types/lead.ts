export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Closed';
export type LeadQuality = 'High' | 'Medium' | 'Low' | 'Unknown';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  phone: string;
  status: LeadStatus;
  quality: LeadQuality;
  qualityScore: number; // 0-100
  analysis?: string;
  suspicious?: boolean;
  isRisky: boolean;
  securityFlags: string[];
  securityAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'status_change' | 'analysis' | 'email_sent' | 'note' | 'security_alert';
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface DashboardStats {
  totalLeads: number;
  convertedLeads: number; // Closed
  averageQualityScore: number;
  leadsByStatus: Record<LeadStatus, number>;
}
