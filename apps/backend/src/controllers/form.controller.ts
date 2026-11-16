import { Request, Response } from 'express';
import { FormTemplate, Task } from '../models';

export const listForms = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const forms = await FormTemplate.findAll({
      where: { organizationId: orgId },
      order: [['updatedAt', 'DESC']],
    });
    res.json({ success: true, data: forms });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const form = await FormTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!form) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Form not found' } });
      return;
    }
    res.json({ success: true, data: form });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const body = req.body;
    const form = await FormTemplate.create({
      organizationId: orgId,
      title: body.title,
      description: body.description || null,
      category: body.category || 'OPERATIONS',
      pages: body.pages || [],
      estimatedDurationMinutes: body.estimatedDurationMinutes ?? null,
      isActive: body.isActive ?? true,
    });
    res.status(201).json({ success: true, data: form });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const form = await FormTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!form) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Form not found' } });
      return;
    }
    const { title, description, category, pages, estimatedDurationMinutes, isActive } = req.body;
    if (title !== undefined) form.title = title;
    if (description !== undefined) form.description = description;
    if (category !== undefined) form.category = category;
    if (pages !== undefined) form.pages = pages;
    if (estimatedDurationMinutes !== undefined) form.estimatedDurationMinutes = estimatedDurationMinutes;
    if (isActive !== undefined) form.isActive = isActive;
    await form.save();
    res.json({ success: true, data: form });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const deleteForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const form = await FormTemplate.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!form) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Form not found' } });
      return;
    }
    await form.destroy();
    res.json({ success: true, data: { message: 'Form deleted' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

/** Full mission payload for mobile: task + form + progress */
export const getMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const task = await Task.findOne({
      where: { id: req.params.taskId, organizationId: orgId },
      include: [
        { model: FormTemplate, as: 'formTemplate' },
      ],
    });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mission not found' } });
      return;
    }

    const form = (task as any).formTemplate;
    const pages = form?.pages || [];
    let photoCount = 0;
    let questionCount = 0;
    for (const p of pages) {
      for (const f of p.fields || []) {
        if (f.type === 'photo') photoCount += f.max || 1;
        if (['yes_no', 'select', 'text', 'number', 'textarea'].includes(f.type)) questionCount += 1;
      }
    }

    res.json({
      success: true,
      data: {
        task,
        form: form
          ? {
              id: form.id,
              title: form.title,
              description: form.description,
              category: form.category,
              pages,
              estimatedDurationMinutes: form.estimatedDurationMinutes,
              contentSummary: {
                pages: pages.length,
                photos: photoCount,
                questions: questionCount,
              },
            }
          : null,
        progress: task.formProgress || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const startMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const task = await Task.findOne({ where: { id: req.params.taskId, organizationId: orgId } });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mission not found' } });
      return;
    }
    if (!task.formProgress) {
      task.formProgress = {
        startedAt: new Date().toISOString(),
        currentPageIndex: 0,
        answers: {},
        completedPages: [],
      };
    }
    if (task.status === 'TODO' || task.status === 'SCHEDULED') {
      task.status = 'IN_PROGRESS';
    }
    await task.save();
    res.json({ success: true, data: { progress: task.formProgress, status: task.status } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const abandonMission = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const task = await Task.findOne({ where: { id: req.params.taskId, organizationId: orgId } });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mission not found' } });
      return;
    }
    task.formProgress = null;
    if (task.status === 'IN_PROGRESS') task.status = 'TODO';
    await task.save();
    res.json({ success: true, data: { message: 'Mission abandoned' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const saveMissionProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const task = await Task.findOne({ where: { id: req.params.taskId, organizationId: orgId } });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Mission not found' } });
      return;
    }
    const { answers, currentPageIndex, completedPages } = req.body;
    const prev = task.formProgress || {
      startedAt: new Date().toISOString(),
      currentPageIndex: 0,
      answers: {},
      completedPages: [],
    };
    task.formProgress = {
      ...prev,
      answers: { ...(prev.answers || {}), ...(answers || {}) },
      currentPageIndex: currentPageIndex ?? prev.currentPageIndex,
      completedPages: completedPages ?? prev.completedPages,
      updatedAt: new Date().toISOString(),
    };
    if (task.status === 'TODO') task.status = 'IN_PROGRESS';
    await task.save();
    res.json({ success: true, data: { progress: task.formProgress } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};


export const seedDemoForms = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { ensureDemoFormTemplates } = await import('../database/seed');
    await ensureDemoFormTemplates(orgId);
    const forms = await FormTemplate.findAll({
      where: { organizationId: orgId },
      order: [['updatedAt', 'DESC']],
    });
    res.json({ success: true, data: forms, message: 'Démos RDTS chargées avec succès' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};