import { Hono } from 'hono';
import { leadController } from '../controllers/leadController.ts';

const leadRoutes = new Hono();

leadRoutes.get('/', leadController.getLeads);
leadRoutes.get('/:id', leadController.getLeadById);
leadRoutes.post('/', leadController.createLead);
leadRoutes.patch('/:id', leadController.updateLead);
leadRoutes.delete('/:id', leadController.deleteLead);
leadRoutes.get('/:id/activities', leadController.getActivities);
leadRoutes.post('/security-check', leadController.performSecurityCheck);
leadRoutes.post('/analyze', leadController.analyzeLead);
leadRoutes.post('/generate-email', leadController.generateEmail);

export default leadRoutes;
