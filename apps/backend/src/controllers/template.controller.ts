import { Request, Response } from 'express';
import { TaskTemplate, Task } from '../models';
import { materializeRecurringTasks } from '../services/recurrence.service';

export const listTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const templates = await TaskTemplate.findAll({
      where: { organizationId: orgId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const body = req.body;
    const template = await TaskTemplate.create({
      organizationId: orgId,
      title: body.title,
      description: body.description,
      instructions: body.instructions,
      priority: body.priority || 'MEDIUM',
      category: body.category,
      requiresValidation: body.requiresValidation ?? true,
      requiresPhotoEvidence: body.requiresPhotoEvidence ?? false,
      requiresSignature: body.requiresSignature ?? false,
      estimatedDurationMinutes: body.estimatedDurationMinutes,
      checklist: body.checklist || [],
      recurrenceEnabled: body.recurrenceEnabled ?? false,
      recurrenceRule: body.recurrenceRule,
      recurrenceTime: body.recurrenceTime,
      recurrenceDaysOfWeek: body.recurrenceDaysOfWeek,
      isActive: body.isActive ?? true,
      createdById: req.user!.id,
    });
    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const template = await TaskTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!template) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      return;
    }
    const fields = [
      'title', 'description', 'instructions', 'priority', 'category',
      'requiresValidation', 'requiresPhotoEvidence', 'requiresSignature',
      'estimatedDurationMinutes', 'checklist', 'recurrenceEnabled',
      'recurrenceRule', 'recurrenceTime', 'recurrenceDaysOfWeek', 'isActive',
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) (template as any)[f] = req.body[f];
    }
    await template.save();
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const template = await TaskTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!template) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      return;
    }
    await template.destroy();
    res.json({ success: true, data: { message: 'Template deleted' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

/** Manually trigger materialization of recurring task instances for today */
export const runRecurrence = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant?.organizationId;
    const result = await materializeRecurringTasks(orgId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

/** Instantiate a one-off task from a template for specific stores/users */
export const instantiateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const template = await TaskTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!template) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      return;
    }
    const { storeIds = [], assignedUserId, dueDate } = req.body;
    const created: any[] = [];
    const targets = storeIds.length ? storeIds : [null];
    for (const storeId of targets) {
      const task = await Task.create({
        organizationId: orgId,
        title: template.title,
        description: template.description,
        instructions: template.instructions,
        priority: template.priority,
        category: template.category,
        status: 'TODO',
        requiresValidation: template.requiresValidation,
        requiresPhotoEvidence: template.requiresPhotoEvidence,
        requiresSignature: template.requiresSignature,
        estimatedDurationMinutes: template.estimatedDurationMinutes,
        checklist: template.checklist || [],
        createdById: req.user!.id,
        storeId: storeId || null,
        assignedUserId: assignedUserId || null,
        templateId: template.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        isRecurringInstance: false,
      });
      created.push(task);
    }
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
