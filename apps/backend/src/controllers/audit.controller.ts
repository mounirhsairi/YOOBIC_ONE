import { Request, Response } from 'express';
import { FormTemplate, Audit, Store, User } from '../models';
import { createFormTemplateSchema, scheduleAuditSchema, submitAuditSchema } from '@yoobic/validation';

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = createFormTemplateSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const template = await FormTemplate.create({
      ...parse.data,
      organizationId: orgId,
    } as any);

    res.status(201).json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const listTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const templates = await FormTemplate.findAll({
      where: { organizationId: orgId, isActive: true },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const scheduleAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = scheduleAuditSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const audit = await Audit.create({
      ...parse.data,
      organizationId: orgId,
      status: 'SCHEDULED',
      scheduledDate: new Date(parse.data.scheduledDate),
    } as any);

    res.status(201).json({ success: true, data: audit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const listAudits = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const audits = await Audit.findAll({
      where: { organizationId: orgId },
      include: [
        { model: FormTemplate, as: 'template', attributes: ['id', 'title', 'passingScorePercentage'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'auditor', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
      order: [['scheduledDate', 'DESC']],
    });
    res.json({ success: true, data: audits });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const submitAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const audit = await Audit.findOne({
      where: { id, organizationId: orgId },
      include: [{ model: FormTemplate, as: 'template' }],
    });

    if (!audit) {
      res.status(404).json({ success: false, error: { code: 'AUDIT_NOT_FOUND', message: 'Audit not found' } });
      return;
    }

    const parse = submitAuditSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const { score, findings, correctiveActions } = parse.data;
    const passingThreshold = (audit as any).template?.passingScorePercentage ?? 80;
    const passed = score >= passingThreshold;

    audit.score = score;
    audit.passed = passed;
    audit.findings = findings;
    audit.correctiveActions = correctiveActions;
    audit.status = 'COMPLETED';
    audit.completedAt = new Date();
    await audit.save();

    res.json({ success: true, data: audit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const template = await FormTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!template) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      return;
    }
    await template.update(req.body);
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const template = await FormTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!template) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      return;
    }
    template.isActive = false;
    await template.save();
    res.json({ success: true, data: { message: 'Template deactivated successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const audit = await Audit.findOne({
      where: { id: req.params.id, organizationId: orgId },
      include: [
        { model: FormTemplate, as: 'template' },
        { model: Store, as: 'store' },
        { model: User, as: 'auditor', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
    });
    if (!audit) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
      return;
    }
    res.json({ success: true, data: audit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
