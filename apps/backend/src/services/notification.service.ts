import { Notification } from '../models';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_SUBMITTED'
  | 'TASK_APPROVED'
  | 'TASK_REJECTED'
  | 'TASK_OVERDUE'
  | 'COURSE_ASSIGNED'
  | 'CERTIFICATE_ISSUED'
  | 'ANNOUNCEMENT'
  | 'VISIT_SCHEDULED'
  | 'SYSTEM';

interface CreateNotificationInput {
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create an in-app notification. Failures are logged but never throw
 * so they do not break the primary business flow.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await Notification.create({
      userId: input.userId,
      organizationId: input.organizationId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: {
        ...(input.metadata || {}),
        entityType: input.entityType || null,
        entityId: input.entityId || null,
      },
      isRead: false,
    });
  } catch (err: any) {
    console.error('[NotificationService] Failed to create notification:', err?.message || err);
  }
}

export async function notifyTaskAssigned(params: {
  assigneeId: string;
  organizationId: string;
  taskId: string;
  taskTitle: string;
  assignerName?: string;
}): Promise<void> {
  await createNotification({
    userId: params.assigneeId,
    organizationId: params.organizationId,
    type: 'TASK_ASSIGNED',
    title: 'New task assigned',
    body: params.assignerName
      ? `${params.assignerName} assigned you: ${params.taskTitle}`
      : `You have been assigned: ${params.taskTitle}`,
    entityType: 'task',
    entityId: params.taskId,
  });
}

export async function notifyTaskSubmitted(params: {
  managerId: string;
  organizationId: string;
  taskId: string;
  taskTitle: string;
  submitterName: string;
}): Promise<void> {
  await createNotification({
    userId: params.managerId,
    organizationId: params.organizationId,
    type: 'TASK_SUBMITTED',
    title: 'Task submitted for review',
    body: `${params.submitterName} submitted: ${params.taskTitle}`,
    entityType: 'task',
    entityId: params.taskId,
  });
}

export async function notifyTaskValidated(params: {
  assigneeId: string;
  organizationId: string;
  taskId: string;
  taskTitle: string;
  approved: boolean;
  note?: string;
}): Promise<void> {
  await createNotification({
    userId: params.assigneeId,
    organizationId: params.organizationId,
    type: params.approved ? 'TASK_APPROVED' : 'TASK_REJECTED',
    title: params.approved ? 'Task approved' : 'Task rejected',
    body: params.approved
      ? `Your task "${params.taskTitle}" was approved.`
      : `Your task "${params.taskTitle}" was rejected.${params.note ? ` Note: ${params.note}` : ''}`,
    entityType: 'task',
    entityId: params.taskId,
  });
}

export async function notifyCertificateIssued(params: {
  userId: string;
  organizationId: string;
  certificateId: string;
  courseTitle: string;
  score?: number;
}): Promise<void> {
  await createNotification({
    userId: params.userId,
    organizationId: params.organizationId,
    type: 'CERTIFICATE_ISSUED',
    title: 'Certificate earned',
    body: `You earned a certificate for "${params.courseTitle}"${
      params.score != null ? ` (score: ${params.score}%)` : ''
    }.`,
    entityType: 'certificate',
    entityId: params.certificateId,
  });
}
