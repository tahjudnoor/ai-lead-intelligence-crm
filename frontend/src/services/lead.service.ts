import api from '../lib/api';
import { Lead, Activity, DashboardStats, LeadStatus } from '../types/lead';

export const leadService = {
  getLeads: async (): Promise<Lead[]> => {
    const response = await api.get('/leads');
    return response.data;
  },

  getLeadById: async (id: string): Promise<Lead> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'quality' | 'qualityScore' | 'isRisky' | 'securityFlags' | 'securityAnalysis'>): Promise<Lead> => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  updateLead: async (id: string, leadData: Partial<Lead>): Promise<Lead> => {
    const response = await api.patch(`/leads/${id}`, leadData);
    return response.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  getActivities: async (leadId: string): Promise<Activity[]> => {
    const response = await api.get(`/leads/${leadId}/activities`);
    return response.data;
  },

  performSecurityCheck: async (leadId: string): Promise<{ isRisky: boolean, securityFlags: string[], securityAnalysis: string }> => {
    const response = await api.post('/ai/security-check', { leadId });
    return response.data;
  },

  analyzeLead: async (leadId: string): Promise<{ quality: string, qualityScore: number, analysis: string, suspicious: boolean }> => {
    const response = await api.post('/ai/analyze', { leadId });
    return response.data;
  },

  generateEmail: async (leadId: string, tone: string): Promise<{ email: string }> => {
    const response = await api.post('/ai/generate-email', { leadId, tone });
    return response.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const leads = await leadService.getLeads();
    const leadsByStatus: Record<LeadStatus, number> = {
      'New': 0,
      'Contacted': 0,
      'Interested': 0,
      'Closed': 0
    };

    let totalScore = 0;
    leads.forEach(l => {
      leadsByStatus[l.status]++;
      totalScore += l.qualityScore;
    });

    return {
      totalLeads: leads.length,
      convertedLeads: leadsByStatus['Closed'],
      averageQualityScore: leads.length ? Math.round(totalScore / leads.length) : 0,
      leadsByStatus,
    };
  }
};