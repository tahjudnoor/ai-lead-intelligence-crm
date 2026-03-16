import { Context } from 'hono';
import { leadService } from '../services/leadService.ts';
import catchAsync from '../utils/catchAsync.ts';

export const leadController = {
  getLeads: catchAsync(async (c: Context) => {
    const leads = await leadService.getLeads();
    return c.json(leads);
  }),

  getLeadById: catchAsync(async (c: Context) => {
    const id = c.req.param('id');
    const lead = await leadService.getLeadById(id);
    return c.json(lead);
  }),

  createLead: catchAsync(async (c: Context) => {
    const body = await c.req.json();
    const lead = await leadService.createLead(body);
    return c.json(lead, 201);
  }),

  updateLead: catchAsync(async (c: Context) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const lead = await leadService.updateLead(id, body);
    return c.json(lead);
  }),

  deleteLead: catchAsync(async (c: Context) => {
    const id = c.req.param('id');
    await leadService.deleteLead(id);
    return c.body(null, 204);
  }),

  getActivities: catchAsync(async (c: Context) => {
    const id = c.req.param('id');
    const activities = await leadService.getActivities(id);
    return c.json(activities);
  }),

  performSecurityCheck: catchAsync(async (c: Context) => {
    const body = await c.req.json();
    const result = await leadService.performSecurityCheck(body.leadId);
    return c.json(result);
  }),

  analyzeLead: catchAsync(async (c: Context) => {
    const body = await c.req.json();
    const result = await leadService.analyzeLead(body.leadId);
    return c.json(result);
  }),

  generateEmail: catchAsync(async (c: Context) => {
    const body = await c.req.json();
    const result = await leadService.generateEmail(body.leadId, body.tone);
    return c.json(result);
  })
};
