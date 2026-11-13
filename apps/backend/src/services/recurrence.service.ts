import { Task, TaskTemplate, Store } from '../models';
import { Op } from 'sequelize';

/**
 * Materialize today's recurring task instances from active templates.
 * Designed to be called on a schedule (cron) or manually via an admin endpoint.
 * Idempotent: skips creation if an instance already exists for the same template + store + day.
 */
export async function materializeRecurringTasks(organizationId?: string): Promise<{ created: number }> {
  const where: any = { isActive: true, recurrenceEnabled: true };
  if (organizationId) where.organizationId = organizationId;

  const templates = await TaskTemplate.findAll({ where });
  let created = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = today.getDay(); // 0=Sun

  for (const tpl of templates) {
    // Filter by days of week if specified
    if (Array.isArray(tpl.recurrenceDaysOfWeek) && tpl.recurrenceDaysOfWeek.length > 0) {
      if (!tpl.recurrenceDaysOfWeek.includes(dayOfWeek)) continue;
    }

    // For DAILY / WEEKLY we create one instance per store of the org
    const stores = await Store.findAll({
      where: { organizationId: tpl.organizationId, isActive: true },
      attributes: ['id'],
    });

    for (const store of stores) {
      // Idempotency check
      const existing = await Task.findOne({
        where: {
          templateId: tpl.id,
          storeId: store.id,
          isRecurringInstance: true,
          createdAt: { [Op.gte]: today, [Op.lt]: tomorrow },
        },
      });
      if (existing) continue;

      let dueDate: Date | null = null;
      if (tpl.recurrenceTime) {
        const [hh, mm] = tpl.recurrenceTime.split(':').map(Number);
        dueDate = new Date(today);
        dueDate.setHours(hh || 18, mm || 0, 0, 0);
      }

      await Task.create({
        organizationId: tpl.organizationId,
        title: tpl.title,
        description: tpl.description,
        instructions: tpl.instructions,
        priority: tpl.priority,
        category: tpl.category,
        status: 'TODO',
        requiresValidation: tpl.requiresValidation,
        requiresPhotoEvidence: tpl.requiresPhotoEvidence,
        requiresSignature: tpl.requiresSignature,
        estimatedDurationMinutes: tpl.estimatedDurationMinutes,
        checklist: tpl.checklist || [],
        createdById: tpl.createdById,
        storeId: store.id,
        templateId: tpl.id,
        recurrenceRule: tpl.recurrenceRule,
        isRecurringInstance: true,
        dueDate,
      });
      created += 1;
    }
  }

  return { created };
}
