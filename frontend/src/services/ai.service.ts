import { Lead, LeadQuality } from '../types/lead';
import { leadService } from './lead.service';

export const aiService = {
  analyzeLead: async (lead: Lead): Promise<{ quality: string; qualityScore: number; analysis: string; suspicious: boolean }> => {
    return await leadService.analyzeLead(lead.id);
  },

  generateOutreachEmail: async (lead: Lead, tone: 'professional' | 'casual' | 'aggressive' = 'professional'): Promise<string> => {
    const result = await leadService.generateEmail(lead.id, tone);
    return result.email;
  },

  performSecurityCheck: async (lead: Lead): Promise<{ isRisky: boolean, securityFlags: string[], securityAnalysis: string }> => {
    return await leadService.performSecurityCheck(lead.id);
  }
};