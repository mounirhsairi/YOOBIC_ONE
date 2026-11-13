import { Request, Response } from 'express';
import { Task, TaskSubmission, TaskEvidence, TaskValidation, User, Store, Team } from '../models';
import { createTaskSchema, submitTaskSchema, validateTaskSchema } from '@yoobic/validation';
import { notifyTaskAssigned, notifyTaskSubmitted, notifyTaskValidated } from '../services/notification.service';

export const listTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { status, storeId, assignedUserId } = req.query;

    const whereClause: any = { organizationId: orgId };
    if (status) whereClause.status = status;
    if (storeId) whereClause.storeId = storeId;
    if (assignedUserId) whereClause.assignedUserId = assignedUserId;

    // Frontline employees without view_all permission only see tasks assigned to them or their store/team
    if (!req.tenant?.permissions.includes('tasks.view_all') && !req.user?.isSuperAdmin) {
      if (req.tenant?.roleCode === 'EMPLOYEE') {
        whereClause.assignedUserId = req.user!.id;
      }
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    const { rows: tasks, count } = await Task.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        {
          model: TaskSubmission,
          as: 'submissions',
          include: [{ model: TaskEvidence, as: 'evidence' }, { model: TaskValidation, as: 'validation' }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: tasks,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, organizationId: orgId },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: User, as: 'assignee', attributes: ['id', 'email', 'firstName', 'lastName'] },
        { model: Store, as: 'store' },
        { model: Team, as: 'team' },
        {
          model: TaskSubmission,
          as: 'submissions',
          include: [
            { model: User, as: 'submittedBy', attributes: ['id', 'firstName', 'lastName', 'email'] },
            { model: TaskEvidence, as: 'evidence' },
            { model: TaskValidation, as: 'validation' },
          ],
        },
      ],
    });

    if (!task) {
      res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found in this organization' } });
      return;
    }

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = createTaskSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const task = await Task.create({
      ...parse.data,
      organizationId: orgId,
      createdById: req.user!.id,
      status: 'TODO',
    } as any);

    if (task.assignedUserId) {
      const assignerName = [req.user!.firstName, req.user!.lastName].filter(Boolean).join(' ') || req.user!.email;
      await notifyTaskAssigned({
        assigneeId: task.assignedUserId,
        organizationId: orgId,
        taskId: task.id,
        taskTitle: task.title,
        assignerName,
      });
    }

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const startTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, organizationId: orgId } });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });
      return;
    }

    if (task.status !== 'TODO' && task.status !== 'REJECTED') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: `Cannot start task from status ${task.status}` },
      });
      return;
    }

    task.status = 'IN_PROGRESS';
    await task.save();

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const submitTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, organizationId: orgId } });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });
      return;
    }

    if (task.status !== 'IN_PROGRESS') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: `Cannot submit task from status ${task.status}. Must be IN_PROGRESS.` },
      });
      return;
    }

    const parse = submitTaskSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const { comment, checklistResponses, evidence } = parse.data;

    if (task.requiresPhotoEvidence && (!evidence || evidence.length === 0)) {
      res.status(400).json({
        success: false,
        error: { code: 'EVIDENCE_REQUIRED', message: 'This task requires photo evidence before submission' },
      });
      return;
    }

    const submission = await TaskSubmission.create({
      taskId: task.id,
      organizationId: orgId,
      submittedById: req.user!.id,
      comment: comment || null,
      checklistResponses: checklistResponses || {},
      submittedAt: new Date(),
    });

    if (evidence && evidence.length > 0) {
      for (const item of evidence) {
        await TaskEvidence.create({
          submissionId: submission.id,
          taskId: task.id,
          type: item.type,
          fileUrl: item.fileUrl,
          fileName: item.fileName,
          fileSizeBytes: item.fileSizeBytes,
          mimeType: item.mimeType,
          capturedAt: new Date(),
        });
      }
    }

    task.status = task.requiresValidation ? 'SUBMITTED' : 'APPROVED';
    await task.save();

    // Notify task creator / manager that a submission needs review
    if (task.requiresValidation && task.createdById && task.createdById !== req.user!.id) {
      const submitterName = [req.user!.firstName, req.user!.lastName].filter(Boolean).join(' ') || req.user!.email;
      await notifyTaskSubmitted({
        managerId: task.createdById,
        organizationId: orgId,
        taskId: task.id,
        taskTitle: task.title,
        submitterName,
      });
    }

    res.json({
      success: true,
      data: {
        task,
        submission,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const validateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, organizationId: orgId },
      include: [{ model: TaskSubmission, as: 'submissions', order: [['createdAt', 'DESC']], limit: 1 }],
    });

    if (!task) {
      res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });
      return;
    }

    if (task.status !== 'SUBMITTED') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: `Cannot validate task in status ${task.status}. Must be SUBMITTED.` },
      });
      return;
    }

    const latestSubmission = (task as any).submissions?.[0];
    if (!latestSubmission) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_SUBMISSION_FOUND', message: 'No submission found for this task' },
      });
      return;
    }

    // Business rule: employee cannot approve their own task unless explicitly a super-admin
    if (latestSubmission.submittedById === req.user!.id && !req.user!.isSuperAdmin) {
      res.status(403).json({
        success: false,
        error: { code: 'CANNOT_VALIDATE_OWN_TASK', message: 'You cannot validate your own task submission' },
      });
      return;
    }

    const parse = validateTaskSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const { decision, reason } = parse.data;

    const validation = await TaskValidation.create({
      taskId: task.id,
      submissionId: latestSubmission.id,
      organizationId: orgId,
      validatedById: req.user!.id,
      decision,
      reason: reason || null,
      validatedAt: new Date(),
    });

    task.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    await task.save();

    if (task.assignedUserId) {
      await notifyTaskValidated({
        assigneeId: task.assignedUserId,
        organizationId: orgId,
        taskId: task.id,
        taskTitle: task.title,
        approved: decision === 'APPROVED',
        note: reason,
      });
    }

    res.json({
      success: true,
      data: {
        task,
        validation,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getTaskAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;

    const total = await Task.count({ where: { organizationId: orgId } });
    const todo = await Task.count({ where: { organizationId: orgId, status: 'TODO' } });
    const inProgress = await Task.count({ where: { organizationId: orgId, status: 'IN_PROGRESS' } });
    const submitted = await Task.count({ where: { organizationId: orgId, status: 'SUBMITTED' } });
    const approved = await Task.count({ where: { organizationId: orgId, status: 'APPROVED' } });
    const rejected = await Task.count({ where: { organizationId: orgId, status: 'REJECTED' } });

    const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        todo,
        inProgress,
        submitted,
        approved,
        rejected,
        completionRate,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, organizationId: orgId } });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });
      return;
    }

    const {
      title,
      description,
      instructions,
      priority,
      status,
      category,
      startDate,
      dueDate,
      requiresValidation,
      requiresPhotoEvidence,
      requiresSignature,
      estimatedDurationMinutes,
      checklist,
      storeId,
      teamId,
      assignedUserId,
    } = req.body;

    await task.update({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(instructions !== undefined && { instructions }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(category !== undefined && { category }),
      ...(startDate !== undefined && { startDate }),
      ...(dueDate !== undefined && { dueDate }),
      ...(requiresValidation !== undefined && { requiresValidation }),
      ...(requiresPhotoEvidence !== undefined && { requiresPhotoEvidence }),
      ...(requiresSignature !== undefined && { requiresSignature }),
      ...(estimatedDurationMinutes !== undefined && { estimatedDurationMinutes }),
      ...(checklist !== undefined && { checklist }),
      ...(storeId !== undefined && { storeId }),
      ...(teamId !== undefined && { teamId }),
      ...(assignedUserId !== undefined && { assignedUserId }),
    });

    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const task = await Task.findOne({ where: { id, organizationId: orgId } });
    if (!task) {
      res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });
      return;
    }

    await task.destroy();
    res.json({ success: true, data: { message: 'Task deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
