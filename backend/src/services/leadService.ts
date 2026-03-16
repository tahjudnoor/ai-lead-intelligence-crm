import prisma from '../client.ts';
import ApiError from '../utils/ApiError.ts';
import { Llm, LlmProvider } from '@uptiqai/integrations-sdk';

export const leadService = {
  getLeads: async () => {
    return await prisma.lead.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  },

  getLeadById: async (id: string) => {
    const lead = await prisma.lead.findUnique({
      where: { id, isDeleted: false },
    });
    if (!lead) throw new ApiError(404, 'Lead not found');
    return lead;
  },

  createLead: async (data: any) => {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        status: data.status || 'New',
        isDeleted: false,
      },
    });
    
    await leadService.addActivity(lead.id, 'status_change', `Lead created with status: ${lead.status}`);
    
    // Automatically trigger security check on creation if website is provided
    if (lead.website) {
      await leadService.performSecurityCheck(lead.id);
    }
    
    return await leadService.getLeadById(lead.id);
  },

  updateLead: async (id: string, data: any) => {
    const oldLead = await leadService.getLeadById(id);
    
    await prisma.lead.update({
      where: { id },
      data,
    });

    if (data.status && data.status !== oldLead.status) {
      await leadService.addActivity(id, 'status_change', `Status changed from ${oldLead.status} to ${data.status}`);
    }

    // Trigger security check if website changed
    if (data.website && data.website !== oldLead.website) {
      await leadService.performSecurityCheck(id);
    }

    return await leadService.getLeadById(id);
  },

  deleteLead: async (id: string) => {
    await prisma.lead.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  getActivities: async (leadId: string) => {
    return await prisma.activity.findMany({
      where: { leadId, isDeleted: false },
      orderBy: { timestamp: 'desc' },
    });
  },

  addActivity: async (leadId: string, type: string, description: string, metadata?: any) => {
    return await prisma.activity.create({
      data: {
        leadId,
        type,
        description,
        metadata,
      },
    });
  },

  performSecurityCheck: async (leadId: string) => {
    const lead = await leadService.getLeadById(leadId);
    if (!lead.website) return;

    let isRisky = false;
    const securityFlags: string[] = [];
    let securityAnalysis = '';

    const url = lead.website.toLowerCase();
    
    try {
      const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
      const parts = domain.split('.');
      if (parts.length > 3) {
        isRisky = true;
        securityFlags.push('UNUSUAL_SUBDOMAIN_STRUCTURE');
      }

      const suspiciousKeywords = ['secure', 'login', 'verify', 'account', 'update', 'banking', 'support-service', 'check-auth'];
      suspiciousKeywords.forEach(keyword => {
        if (domain.includes(keyword) && !domain.endsWith(`${keyword}.com`)) {
          isRisky = true;
          securityFlags.push('SUSPICIOUS_KEYWORDS_IN_DOMAIN');
        }
      });

      if (domain.length > 30) {
        isRisky = true;
        securityFlags.push('LONG_DOMAIN_NAME');
      }

      if (/[0-9]{4,}/.test(domain) || domain.includes('--')) {
        isRisky = true;
        securityFlags.push('SUSPICIOUS_PATTERN');
      }
      
      const suspiciousTLDs = ['.xyz', '.top', '.buzz', '.gq', '.ml', '.cf', '.tk'];
      suspiciousTLDs.forEach(tld => {
        if (domain.endsWith(tld)) {
          isRisky = true;
          securityFlags.push('UNCOMMON_TLD');
        }
      });

    } catch (e) {
      isRisky = true;
      securityFlags.push('INVALID_URL_FORMAT');
    }

    if (isRisky) {
      securityAnalysis = `Security scan detected potential risks: ${securityFlags.join(', ')}. This domain matches patterns often associated with phishing or newly registered malicious sites.`;
    } else {
      securityAnalysis = 'Domain appears to be safe based on structural analysis.';
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        isRisky,
        securityFlags,
        securityAnalysis,
      },
    });

    if (isRisky) {
      await leadService.addActivity(leadId, 'security_alert', 'Lead flagged as Potential Risk during automated security scan');
    }

    return { isRisky, securityFlags, securityAnalysis };
  },

  analyzeLead: async (leadId: string) => {
    const lead = await leadService.getLeadById(leadId);
    const llm = new Llm({ provider: (process.env.LLM_PROVIDER as LlmProvider) || LlmProvider.Google });

    const prompt = `Analyze the following business lead and classify its quality (High, Medium, or Low).
    Provide a quality score from 0 to 100.
    Check for suspicious patterns in their email or website.
    
    Lead Info:
    Name: ${lead.name}
    Email: ${lead.email}
    Company: ${lead.company}
    Website: ${lead.website}
    
    Response format (JSON only):
    {
      "quality": "High" | "Medium" | "Low",
      "qualityScore": number,
      "analysis": "string explanation",
      "suspicious": boolean
    }`;

    const result: any = await llm.generateText({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.LLM_MODEL,
    });

    let analysisResult;
    try {
      const content = (result.text || '').trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      analysisResult = {
        quality: 'Medium',
        qualityScore: 50,
        analysis: 'Failed to parse AI analysis. Manual review recommended.',
        suspicious: false
      };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        quality: analysisResult.quality,
        qualityScore: analysisResult.qualityScore,
        analysis: analysisResult.analysis,
        suspicious: analysisResult.suspicious,
      },
    });

    await leadService.addActivity(leadId, 'analysis', `Lead analysis completed: Quality ${analysisResult.quality}`);

    return analysisResult;
  },

  generateEmail: async (leadId: string, tone: string) => {
    const lead = await leadService.getLeadById(leadId);
    const llm = new Llm({ provider: (process.env.LLM_PROVIDER as LlmProvider) || LlmProvider.Google });

    const prompt = `Generate a personalized outreach email for the following lead.
    Tone: ${tone}
    
    Lead Info:
    Name: ${lead.name}
    Email: ${lead.email}
    Company: ${lead.company}
    Website: ${lead.website}
    
    Provide only the email content.`;

    const result: any = await llm.generateText({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.LLM_MODEL,
    });

    await leadService.addActivity(leadId, 'email_sent', `Generated ${tone} outreach email`);

    return { email: result.text };
  }
};