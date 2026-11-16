import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as orgController from '../controllers/organization.controller';
import * as taskController from '../controllers/task.controller';
import * as auditController from '../controllers/audit.controller';
import * as commController from '../controllers/communication.controller';
import * as learningController from '../controllers/learning.controller';
import * as notifController from '../controllers/notification.controller';
import * as searchController from '../controllers/search.controller';
import * as formController from '../controllers/form.controller';
import * as templateController from '../controllers/template.controller';
import * as visitController from '../controllers/visit.controller';
import * as certificateController from '../controllers/certificate.controller';
import * as uploadController from '../controllers/upload.controller';
import { uploadEvidence } from '../middleware/upload';
import * as roleController from '../controllers/role.controller';
import { authenticateToken, requireTenant, requirePermission, requireSuperAdmin } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshAccessToken);
router.post('/auth/logout', authenticateToken, authController.logout);
router.post('/auth/change-password', authenticateToken, authController.changePassword);
router.get('/auth/me', authenticateToken, authController.getMe);

// ─────────────────────────────────────────────────────────────────────────────
// Organizations & Hierarchy
// ─────────────────────────────────────────────────────────────────────────────
router.get('/organizations', authenticateToken, orgController.listOrganizations);
router.post('/organizations', authenticateToken, requireSuperAdmin, orgController.createOrganization);
router.get('/organizations/:id', authenticateToken, orgController.getOrganization);
router.patch('/organizations/:id', authenticateToken, requireTenant, requirePermission('org.settings.manage'), orgController.updateOrganization);

router.get('/hierarchy', authenticateToken, requireTenant, orgController.getHierarchy);

// Regions
router.get('/regions', authenticateToken, requireTenant, orgController.listRegions);
router.post('/regions', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.createRegion);
router.patch('/regions/:id', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.updateRegion);
router.delete('/regions/:id', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.deleteRegion);

// Stores
router.get('/stores', authenticateToken, requireTenant, orgController.getStores);
router.post('/stores', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.createStore);
router.get('/stores/:id', authenticateToken, requireTenant, orgController.getStore);
router.patch('/stores/:id', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.updateStore);
router.delete('/stores/:id', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.deleteStore);

// Teams
router.get('/teams', authenticateToken, requireTenant, orgController.listTeams);
router.post('/teams', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.createTeam);
router.patch('/teams/:id', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.updateTeam);
router.delete('/teams/:id', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.deleteTeam);

// Employees
router.get('/employees', authenticateToken, requireTenant, requirePermission('employees.manage'), orgController.getEmployees);
router.post('/employees/invite', authenticateToken, requireTenant, requirePermission('employees.manage'), orgController.inviteEmployee);
router.patch('/employees/:membershipId', authenticateToken, requireTenant, requirePermission('employees.manage'), orgController.updateEmployee);
router.delete('/employees/:membershipId', authenticateToken, requireTenant, requirePermission('employees.manage'), orgController.removeEmployee);

// ─────────────────────────────────────────────────────────────────────────────
// Roles & Permissions
// ─────────────────────────────────────────────────────────────────────────────
router.get('/roles', authenticateToken, requireTenant, roleController.listRoles);
router.post('/roles', authenticateToken, requireTenant, requirePermission('org.settings.manage'), roleController.createRole);
router.get('/roles/:id', authenticateToken, requireTenant, roleController.getRole);
router.patch('/roles/:id', authenticateToken, requireTenant, requirePermission('org.settings.manage'), roleController.updateRole);
router.delete('/roles/:id', authenticateToken, requireTenant, requirePermission('org.settings.manage'), roleController.deleteRole);
router.get('/permissions', authenticateToken, requireTenant, roleController.listPermissions);

// ─────────────────────────────────────────────────────────────────────────────
// Tasks & Operations
// ─────────────────────────────────────────────────────────────────────────────
router.get('/tasks', authenticateToken, requireTenant, taskController.listTasks);
router.post('/tasks', authenticateToken, requireTenant, requirePermission('tasks.create'), taskController.createTask);
router.get('/tasks/analytics', authenticateToken, requireTenant, taskController.getTaskAnalytics);
router.get('/tasks/:id', authenticateToken, requireTenant, taskController.getTask);
router.patch('/tasks/:id', authenticateToken, requireTenant, requirePermission('tasks.create'), taskController.updateTask);
router.delete('/tasks/:id', authenticateToken, requireTenant, requirePermission('tasks.delete'), taskController.deleteTask);
router.post('/tasks/:id/start', authenticateToken, requireTenant, taskController.startTask);
router.post('/tasks/:id/submit', authenticateToken, requireTenant, taskController.submitTask);
router.post('/tasks/:id/validate', authenticateToken, requireTenant, requirePermission('tasks.validate'), taskController.validateTask);

// ─────────────────────────────────────────────────────────────────────────────
// Forms, Audits & Inspections
// ─────────────────────────────────────────────────────────────────────────────
router.get('/audit-templates', authenticateToken, requireTenant, auditController.listTemplates);
router.post('/audit-templates', authenticateToken, requireTenant, requirePermission('audits.create'), auditController.createTemplate);
router.patch('/audit-templates/:id', authenticateToken, requireTenant, requirePermission('audits.create'), auditController.updateTemplate);
router.delete('/audit-templates/:id', authenticateToken, requireTenant, requirePermission('audits.create'), auditController.deleteTemplate);
router.get('/audits', authenticateToken, requireTenant, auditController.listAudits);
router.post('/audits', authenticateToken, requireTenant, requirePermission('audits.create'), auditController.scheduleAudit);
router.get('/audits/:id', authenticateToken, requireTenant, auditController.getAudit);
router.post('/audits/:id/submit', authenticateToken, requireTenant, auditController.submitAudit);

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Mission Forms & Missions
// ─────────────────────────────────────────────────────────────────────────────
router.get('/forms', authenticateToken, requireTenant, formController.listForms);
router.get('/forms/:id', authenticateToken, requireTenant, formController.getForm);
router.post('/forms', authenticateToken, requireTenant, requirePermission('tasks.manage'), formController.createForm);
router.patch('/forms/:id', authenticateToken, requireTenant, requirePermission('tasks.manage'), formController.updateForm);
router.delete('/forms/:id', authenticateToken, requireTenant, requirePermission('tasks.manage'), formController.deleteForm);
router.get('/missions/:taskId', authenticateToken, requireTenant, formController.getMission);
router.post('/missions/:taskId/start', authenticateToken, requireTenant, formController.startMission);
router.post('/missions/:taskId/abandon', authenticateToken, requireTenant, formController.abandonMission);
router.patch('/missions/:taskId/progress', authenticateToken, requireTenant, formController.saveMissionProgress);

// ─────────────────────────────────────────────────────────────────────────────
// Internal Communication & Communities
// ─────────────────────────────────────────────────────────────────────────────
router.get('/announcements', authenticateToken, requireTenant, commController.listAnnouncements);
router.post('/announcements', authenticateToken, requireTenant, requirePermission('announcements.publish'), commController.createAnnouncement);
router.patch('/announcements/:id', authenticateToken, requireTenant, requirePermission('announcements.publish'), commController.updateAnnouncement);
router.delete('/announcements/:id', authenticateToken, requireTenant, requirePermission('announcements.publish'), commController.deleteAnnouncement);
router.get('/communities', authenticateToken, requireTenant, commController.listCommunities);
router.post('/communities', authenticateToken, requireTenant, commController.createCommunity);
router.get('/communities/:communityId/posts', authenticateToken, requireTenant, commController.listPosts);
router.post('/communities/:communityId/posts', authenticateToken, requireTenant, commController.createPost);
router.post('/posts/:postId/comments', authenticateToken, requireTenant, commController.createComment);

// ─────────────────────────────────────────────────────────────────────────────
// LMS & Training
// ─────────────────────────────────────────────────────────────────────────────
router.get('/courses', authenticateToken, requireTenant, learningController.listCourses);
router.post('/courses', authenticateToken, requireTenant, requirePermission('courses.manage'), learningController.createCourse);
router.get('/courses/:id', authenticateToken, requireTenant, learningController.getCourse);
router.patch('/courses/:id', authenticateToken, requireTenant, requirePermission('courses.manage'), learningController.updateCourse);
router.delete('/courses/:id', authenticateToken, requireTenant, requirePermission('courses.manage'), learningController.deleteCourse);
router.post('/courses/:courseId/lessons/:lessonId/quiz', authenticateToken, requireTenant, learningController.submitQuiz);
router.get('/me/learning', authenticateToken, requireTenant, learningController.getMyProgress);

// ─────────────────────────────────────────────────────────────────────────────
// Notifications & Search
// ─────────────────────────────────────────────────────────────────────────────
router.get('/notifications', authenticateToken, notifController.listNotifications);
router.patch('/notifications/:id/read', authenticateToken, notifController.markAsRead);
router.patch('/notifications/read-all', authenticateToken, notifController.markAllAsRead);
router.get('/search', authenticateToken, requireTenant, searchController.globalSearch);


// ─────────────────────────────────────────────────────────────────────────────
// Task Templates & Recurrence
// ─────────────────────────────────────────────────────────────────────────────
router.get('/task-templates', authenticateToken, requireTenant, templateController.listTemplates);
router.post('/task-templates', authenticateToken, requireTenant, requirePermission('tasks.manage'), templateController.createTemplate);
router.patch('/task-templates/:id', authenticateToken, requireTenant, requirePermission('tasks.manage'), templateController.updateTemplate);
router.delete('/task-templates/:id', authenticateToken, requireTenant, requirePermission('tasks.manage'), templateController.deleteTemplate);
router.post('/task-templates/:id/instantiate', authenticateToken, requireTenant, requirePermission('tasks.manage'), templateController.instantiateTemplate);
router.post('/task-templates/run-recurrence', authenticateToken, requireTenant, requirePermission('tasks.manage'), templateController.runRecurrence);

// ─────────────────────────────────────────────────────────────────────────────
// Store Visits
// ─────────────────────────────────────────────────────────────────────────────
router.get('/store-visits', authenticateToken, requireTenant, visitController.listVisits);
router.post('/store-visits', authenticateToken, requireTenant, visitController.createVisit);
router.patch('/store-visits/:id', authenticateToken, requireTenant, visitController.updateVisit);

// ─────────────────────────────────────────────────────────────────────────────
// Certificates
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me/certificates', authenticateToken, certificateController.listMyCertificates);
router.get('/certificates', authenticateToken, requireTenant, certificateController.listOrgCertificates);
router.get('/certificates/:id', authenticateToken, certificateController.getCertificate);

// ─────────────────────────────────────────────────────────────────────────────
// File Upload
// ─────────────────────────────────────────────────────────────────────────────
router.post('/uploads', authenticateToken, uploadEvidence.single('file'), uploadController.uploadFile);

// ─────────────────────────────────────────────────────────────────────────────
// Super Admin (Platform Administration)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/platform/stats', authenticateToken, requireSuperAdmin, orgController.getPlatformStats);
router.get('/admin/organizations', authenticateToken, requireSuperAdmin, orgController.listOrganizations);
router.post('/admin/organizations', authenticateToken, requireSuperAdmin, orgController.createOrganization);
router.patch('/admin/organizations/:id/suspend', authenticateToken, requireSuperAdmin, orgController.suspendOrganization);
router.patch('/admin/organizations/:id/activate', authenticateToken, requireSuperAdmin, orgController.activateOrganization);

export default router;
