import { Request, Response } from 'express';
import { StoreVisit, Store, User } from '../models';

export const listVisits = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { storeId, status, visitorId } = req.query;
    const where: any = { organizationId: orgId };
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    if (visitorId) where.visitorId = visitorId;

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    const { rows, count } = await StoreVisit.findAndCountAll({
      where,
      include: [
        { model: Store, as: 'store', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'visitor', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['plannedAt', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const visit = await StoreVisit.create({
      organizationId: orgId,
      storeId: req.body.storeId,
      visitorId: req.body.visitorId || req.user!.id,
      visitType: req.body.visitType || 'AD_HOC',
      status: req.body.status || 'PLANNED',
      plannedAt: req.body.plannedAt ? new Date(req.body.plannedAt) : null,
      notes: req.body.notes,
    });
    res.status(201).json({ success: true, data: visit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const visit = await StoreVisit.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!visit) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Visit not found' } });
      return;
    }
    const fields = ['status', 'notes', 'checklistResults', 'score', 'latitude', 'longitude', 'plannedAt'];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        if (f === 'plannedAt' && req.body[f]) (visit as any)[f] = new Date(req.body[f]);
        else (visit as any)[f] = req.body[f];
      }
    }
    if (req.body.status === 'IN_PROGRESS' && !visit.startedAt) visit.startedAt = new Date();
    if (req.body.status === 'COMPLETED' && !visit.completedAt) visit.completedAt = new Date();
    await visit.save();
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
