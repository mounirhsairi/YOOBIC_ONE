import { Request, Response } from 'express';
import { Certificate, Course, User } from '../models';

export const listMyCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const certs = await Certificate.findAll({
      where: { userId: req.user!.id },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'category'] }],
      order: [['issuedAt', 'DESC']],
    });
    res.json({ success: true, data: certs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const listOrgCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    const { rows, count } = await Certificate.findAndCountAll({
      where: { organizationId: orgId },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'category'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['issuedAt', 'DESC']],
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

export const getCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const cert = await Certificate.findOne({
      where: { id: req.params.id },
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'category'] },
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
    });
    if (!cert) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certificate not found' } });
      return;
    }
    // Tenant isolation
    if (req.tenant && cert.organizationId !== req.tenant.organizationId && !req.user?.isSuperAdmin) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      return;
    }
    res.json({ success: true, data: cert });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
