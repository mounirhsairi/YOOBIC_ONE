import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase and hyphens'),
  description: z.string().optional(),
  timezone: z.string().default('UTC'),
  defaultLanguage: z.string().default('en'),
  currency: z.string().default('USD'),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const inviteEmployeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleCode: z.string().min(1),
  regionId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  storeId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  jobTitle: z.string().optional(),
  employeeNumber: z.string().optional(),
});

export const createStoreSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  districtId: z.string().uuid().optional(),
  regionId: z.string().uuid().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().default('UTC'),
});

export const createTeamSchema = z.object({
  name: z.string().min(1),
  storeId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  type: z.enum(['CHECKBOX', 'TEXT', 'NUMBER', 'PHOTO', 'SIGNATURE', 'SELECT']),
  options: z.array(z.string()).optional(),
  value: z.any().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  requiresValidation: z.boolean().default(true),
  requiresPhotoEvidence: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  checklist: z.array(checklistItemSchema).default([]),
  storeId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
});

export const submitTaskSchema = z.object({
  comment: z.string().optional(),
  checklistResponses: z.record(z.any()).default({}),
  evidence: z.array(
    z.object({
      type: z.enum(['PHOTO', 'DOCUMENT', 'SIGNATURE']),
      fileUrl: z.string().url(),
      fileName: z.string(),
      fileSizeBytes: z.number().int().nonnegative(),
      mimeType: z.string(),
    })
  ).default([]),
});

export const validateTaskSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().optional(),
}).refine(data => {
  if (data.decision === 'REJECTED' && (!data.reason || data.reason.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'A rejection reason is strictly required when rejecting a task',
  path: ['reason'],
});

export const syncQueueItemSchema = z.object({
  operationId: z.string().uuid(),
  organizationId: z.string().uuid(),
  operationType: z.enum([
    'TASK_START',
    'TASK_UPDATE_DRAFT',
    'TASK_SUBMIT',
    'TASK_EVIDENCE_UPLOAD',
    'AUDIT_SUBMIT',
  ]),
  entityId: z.string(),
  payload: z.record(z.any()),
  timestamp: z.string().datetime(),
});

// Audits & Forms Validation
export const createFormTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().default('OPERATIONS'),
  passingScorePercentage: z.number().min(0).max(100).default(80),
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      order: z.number().int().nonnegative(),
      fields: z.array(
        z.object({
          id: z.string(),
          label: z.string().min(1),
          type: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'RADIO', 'CHECKBOX', 'PHOTO', 'SIGNATURE', 'RATING']),
          required: z.boolean().default(false),
          options: z.array(z.string()).optional(),
          weight: z.number().optional(),
        })
      ),
    })
  ).min(1, 'Form must contain at least one section'),
});

export const scheduleAuditSchema = z.object({
  templateId: z.string().uuid(),
  storeId: z.string().uuid(),
  auditorId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
});

export const submitAuditSchema = z.object({
  findings: z.record(z.any()),
  score: z.number().min(0).max(100),
  correctiveActions: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1),
      assignedUserId: z.string().uuid(),
      dueDate: z.string().datetime(),
    })
  ).optional().default([]),
});

// Announcements & Communication
export const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
  targetRole: z.string().optional(),
  targetStoreId: z.string().uuid().optional(),
  isPinned: z.boolean().default(false),
});

export const createCommunitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

export const createPostSchema = z.object({
  content: z.string().min(1),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1),
});

// Learning Management (LMS)
export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  category: z.string().default('COMPLIANCE'),
  estimatedMinutes: z.number().int().positive().default(15),
  isMandatory: z.boolean().default(false),
  modules: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1),
      order: z.number().int().nonnegative(),
      lessons: z.array(
        z.object({
          id: z.string(),
          title: z.string().min(1),
          contentType: z.enum(['VIDEO', 'ARTICLE', 'PDF', 'QUIZ']),
          contentUrl: z.string().optional(),
          durationMinutes: z.number().int().positive().default(5),
          quiz: z.object({
            passingScorePercentage: z.number().min(0).max(100).default(80),
            questions: z.array(
              z.object({
                id: z.string(),
                question: z.string().min(1),
                options: z.array(z.string()).min(2),
                correctOptionIndex: z.number().int().nonnegative(),
              })
            ),
          }).optional(),
        })
      ),
    })
  ).min(1, 'Course must have at least one module'),
});

export const submitQuizSchema = z.object({
  answers: z.record(z.number().int()),
});

