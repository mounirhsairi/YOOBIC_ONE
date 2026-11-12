import { User } from './User';
import { Organization } from './Organization';
import { Role } from './Role';
import { Permission } from './Permission';
import { RolePermission } from './RolePermission';
import { Membership } from './Membership';
import { Region } from './Region';
import { District } from './District';
import { Store } from './Store';
import { Team } from './Team';
import { Task } from './Task';
import { TaskSubmission } from './TaskSubmission';
import { TaskEvidence } from './TaskEvidence';
import { TaskValidation } from './TaskValidation';
import { FormTemplate } from './FormTemplate';
import { Audit } from './Audit';
import { Announcement } from './Announcement';
import { Community } from './Community';
import { Post } from './Post';
import { Comment } from './Comment';
import { Course } from './Course';
import { LearningProgress } from './LearningProgress';
import { Notification } from './Notification';
import { MembershipScope } from './MembershipScope';

// User & Organization relationships
User.hasMany(Membership, { foreignKey: 'userId', as: 'memberships' });
Membership.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Membership.hasMany(MembershipScope, { foreignKey: 'membershipId', as: 'scopes' });
MembershipScope.belongsTo(Membership, { foreignKey: 'membershipId', as: 'membership' });

Organization.hasMany(Membership, { foreignKey: 'organizationId', as: 'memberships' });
Membership.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Roles & Permissions
Organization.hasMany(Role, { foreignKey: 'organizationId', as: 'roles' });
Role.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Role.hasMany(Membership, { foreignKey: 'roleId', as: 'memberships' });
Membership.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles',
});

// Organization Hierarchy
Organization.hasMany(Region, { foreignKey: 'organizationId', as: 'regions' });
Region.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Region.hasMany(District, { foreignKey: 'regionId', as: 'districts' });
District.belongsTo(Region, { foreignKey: 'regionId', as: 'region' });

District.hasMany(Store, { foreignKey: 'districtId', as: 'stores' });
Store.belongsTo(District, { foreignKey: 'districtId', as: 'district' });

Region.hasMany(Store, { foreignKey: 'regionId', as: 'stores' });
Store.belongsTo(Region, { foreignKey: 'regionId', as: 'region' });

Store.hasMany(Team, { foreignKey: 'storeId', as: 'teams' });
Team.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Store.hasMany(Membership, { foreignKey: 'storeId', as: 'members' });
Membership.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Team.hasMany(Membership, { foreignKey: 'teamId', as: 'members' });
Membership.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Operations & Tasks
Organization.hasMany(Task, { foreignKey: 'organizationId', as: 'tasks' });
Task.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

User.hasMany(Task, { foreignKey: 'createdById', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

User.hasMany(Task, { foreignKey: 'assignedUserId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedUserId', as: 'assignee' });

Store.hasMany(Task, { foreignKey: 'storeId', as: 'tasks' });
Task.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

Team.hasMany(Task, { foreignKey: 'teamId', as: 'tasks' });
Task.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

Task.hasMany(TaskSubmission, { foreignKey: 'taskId', as: 'submissions' });
TaskSubmission.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

User.hasMany(TaskSubmission, { foreignKey: 'submittedById', as: 'taskSubmissions' });
TaskSubmission.belongsTo(User, { foreignKey: 'submittedById', as: 'submittedBy' });

TaskSubmission.hasMany(TaskEvidence, { foreignKey: 'submissionId', as: 'evidence' });
TaskEvidence.belongsTo(TaskSubmission, { foreignKey: 'submissionId', as: 'submission' });

Task.hasMany(TaskValidation, { foreignKey: 'taskId', as: 'validations' });
TaskValidation.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

TaskSubmission.hasOne(TaskValidation, { foreignKey: 'submissionId', as: 'validation' });
TaskValidation.belongsTo(TaskSubmission, { foreignKey: 'submissionId', as: 'submission' });

User.hasMany(TaskValidation, { foreignKey: 'validatedById', as: 'validatedTasks' });
TaskValidation.belongsTo(User, { foreignKey: 'validatedById', as: 'validator' });

// Forms & Audits
Organization.hasMany(FormTemplate, { foreignKey: 'organizationId', as: 'formTemplates' });
FormTemplate.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Audit, { foreignKey: 'organizationId', as: 'audits' });
Audit.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

FormTemplate.hasMany(Audit, { foreignKey: 'templateId', as: 'audits' });
Audit.belongsTo(FormTemplate, { foreignKey: 'templateId', as: 'template' });

Store.hasMany(Audit, { foreignKey: 'storeId', as: 'audits' });
Audit.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

User.hasMany(Audit, { foreignKey: 'auditorId', as: 'audits' });
Audit.belongsTo(User, { foreignKey: 'auditorId', as: 'auditor' });

// Communication
Organization.hasMany(Announcement, { foreignKey: 'organizationId', as: 'announcements' });
Announcement.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

User.hasMany(Announcement, { foreignKey: 'authorId', as: 'announcements' });
Announcement.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Organization.hasMany(Community, { foreignKey: 'organizationId', as: 'communities' });
Community.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Community.hasMany(Post, { foreignKey: 'communityId', as: 'posts' });
Post.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });

User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// LMS
Organization.hasMany(Course, { foreignKey: 'organizationId', as: 'courses' });
Course.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Course.hasMany(LearningProgress, { foreignKey: 'courseId', as: 'progress' });
LearningProgress.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(LearningProgress, { foreignKey: 'userId', as: 'learningProgress' });
LearningProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Organization,
  Role,
  Permission,
  RolePermission,
  Membership,
  Region,
  District,
  Store,
  Team,
  Task,
  TaskSubmission,
  TaskEvidence,
  TaskValidation,
  FormTemplate,
  Audit,
  Announcement,
  Community,
  Post,
  Comment,
  Course,
  LearningProgress,
  Notification,
  MembershipScope,
};
