import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Task, Store, Announcement, Course } from '../models';

export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const query = (req.query.q as string) || '';

    if (!query.trim()) {
      res.json({
        success: true,
        data: { tasks: [], stores: [], announcements: [], courses: [] },
      });
      return;
    }

    const likeQuery = `%${query}%`;

    const [tasks, stores, announcements, courses] = await Promise.all([
      Task.findAll({
        where: {
          organizationId: orgId,
          title: { [Op.like]: likeQuery },
        },
        limit: 10,
      }),
      Store.findAll({
        where: {
          organizationId: orgId,
          name: { [Op.like]: likeQuery },
        },
        limit: 10,
      }),
      Announcement.findAll({
        where: {
          organizationId: orgId,
          title: { [Op.like]: likeQuery },
        },
        limit: 10,
      }),
      Course.findAll({
        where: {
          organizationId: orgId,
          title: { [Op.like]: likeQuery },
        },
        limit: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        stores,
        announcements,
        courses,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
