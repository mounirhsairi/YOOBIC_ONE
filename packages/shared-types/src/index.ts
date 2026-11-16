export type UUID = string;

// Organization and Tenant Types
export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'INACTIVE';
export type SubscriptionPlanType = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  country?: string | null;
  timezone: string;
  defaultLanguage: string;
  currency: string;
  status: OrganizationStatus;
  subscriptionPlan: SubscriptionPlanType;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

// User & Auth
export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoleType =
  | 'SUPER_ADMIN'
  | 'ORG_OWNER'
  | 'ORG_ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'REGIONAL_MANAGER'
  | 'STORE_MANAGER'
  | 'TEAM_LEADER'
  | 'EMPLOYEE'
  | 'TRAINER';

export interface Role {
  id: UUID;
  organizationId?: UUID | null;
  name: string;
  code: string;
  description?: string | null;
  isSystem: boolean;
  permissions: string[];
}

export interface Membership {
  id: UUID;
  userId: UUID;
  organizationId: UUID;
  roleId: UUID;
  role?: Role;
  user?: User;
  regionId?: UUID | null;
  districtId?: UUID | null;
  storeId?: UUID | null;
  teamId?: UUID | null;
  jobTitle?: string | null;
  employeeNumber?: string | null;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  joinedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSessionResponse {
  user: User;
  activeOrganization?: Organization | null;
  membership?: Membership | null;
  tokens: AuthTokens;
  permissions: string[];
}

// Operations / Tasks
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'OVERDUE';

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  type: 'CHECKBOX' | 'TEXT' | 'NUMBER' | 'PHOTO' | 'SIGNATURE' | 'SELECT';
  options?: string[];
  value?: any;
}

export interface Task {
  id: UUID;
  organizationId: UUID;
  title: string;
  description?: string | null;
  instructions?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  requiresValidation: boolean;
  requiresPhotoEvidence: boolean;
  requiresSignature: boolean;
  estimatedDurationMinutes?: number | null;
  checklist: ChecklistItem[];
  createdById: UUID;
  storeId?: UUID | null;
  teamId?: UUID | null;
  assignedUserId?: UUID | null;
  templateId?: UUID | null;
  formTemplateId?: UUID | null;
  formProgress?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TaskEvidence {
  id: UUID;
  taskId: UUID;
  submissionId: UUID;
  type: 'PHOTO' | 'DOCUMENT' | 'SIGNATURE';
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  capturedAt: string;
}

export interface TaskSubmission {
  id: UUID;
  taskId: UUID;
  submittedById: UUID;
  organizationId: UUID;
  comment?: string | null;
  checklistResponses: Record<string, any>;
  evidence: TaskEvidence[];
  submittedAt: string;
}

export interface TaskValidation {
  id: UUID;
  taskId: UUID;
  submissionId: UUID;
  validatedById: UUID;
  decision: 'APPROVED' | 'REJECTED';
  reason?: string | null;
  validatedAt: string;
}

// Offline Sync
export type SyncOperationType =
  | 'TASK_START'
  | 'TASK_UPDATE_DRAFT'
  | 'TASK_SUBMIT'
  | 'TASK_EVIDENCE_UPLOAD'
  | 'AUDIT_SUBMIT';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';

export interface OfflineSyncQueueItem {
  id: string;
  operationId: string;
  organizationId: string;
  operationType: SyncOperationType;
  entityId: string;
  payload: Record<string, any>;
  retryCount: number;
  status: SyncStatus;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Forms and Audits
export interface FormField {
  id: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'PHOTO' | 'SIGNATURE' | 'RATING';
  required: boolean;
  options?: string[];
  weight?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface FormTemplate {
  id: UUID;
  organizationId: UUID;
  title: string;
  description?: string | null;
  category: string;
  sections: FormSection[];
  passingScorePercentage?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Audit {
  id: UUID;
  organizationId: UUID;
  templateId: UUID;
  storeId: UUID;
  auditorId: UUID;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: string;
  completedAt?: string | null;
  score?: number | null;
  passed?: boolean | null;
  findings?: Record<string, any>;
  correctiveActions?: CorrectiveAction[];
  createdAt: string;
  updatedAt: string;
}

export interface CorrectiveAction {
  id: string;
  auditId: UUID;
  description: string;
  assignedUserId: UUID;
  dueDate: string;
  status: 'PENDING' | 'RESOLVED';
}

// Communication: Announcements & Communities
export interface Announcement {
  id: UUID;
  organizationId: UUID;
  title: string;
  content: string;
  imageUrl?: string | null;
  authorId: UUID;
  targetRole?: string | null;
  targetStoreId?: string | null;
  isPinned: boolean;
  publishedAt: string;
  readCount?: number;
}

export interface Community {
  id: UUID;
  organizationId: UUID;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  createdAt: string;
}

export interface Post {
  id: UUID;
  communityId: UUID;
  authorId: UUID;
  content: string;
  mediaUrls?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Comment {
  id: UUID;
  postId: UUID;
  authorId: UUID;
  content: string;
  createdAt: string;
}

// Learning Management (LMS)
export interface Course {
  id: UUID;
  organizationId: UUID;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  estimatedMinutes: number;
  isMandatory: boolean;
  modules: CourseModule[];
  createdAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  contentType: 'VIDEO' | 'ARTICLE' | 'PDF' | 'QUIZ';
  contentUrl?: string;
  durationMinutes: number;
  quiz?: Quiz;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  passingScorePercentage: number;
  questions: QuizQuestion[];
}

export interface UserLearningProgress {
  id: UUID;
  userId: UUID;
  courseId: UUID;
  completedLessonIds: string[];
  quizScore?: number | null;
  passed: boolean;
  completedAt?: string | null;
}

// Notifications
export interface Notification {
  id: UUID;
  userId: UUID;
  organizationId: UUID;
  type: 'TASK_ASSIGNED' | 'TASK_VALIDATED' | 'AUDIT_SCHEDULED' | 'COURSE_ASSIGNED' | 'ANNOUNCEMENT';
  title: string;
  body: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// SaaS Subscriptions & Billing
export interface SubscriptionPlan {
  id: string;
  name: string;
  maxUsers: number;
  maxStores: number;
  hasAdvancedAudits: boolean;
  hasLms: boolean;
  monthlyPriceUsd: number;
}

// API Standard Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
