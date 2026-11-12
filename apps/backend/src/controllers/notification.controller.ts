import { Request, Response } from 'express';
import { Notification } from '../models';

export const listNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user!.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, userId: req.user!.id },
    });

    if (!notification) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
