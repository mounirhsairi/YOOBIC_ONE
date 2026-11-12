import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as orgController from '../controllers/organization.controller';
import * as taskController from '../controllers/task.controller';
import * as auditController from '../controllers/audit.controller';
import * as commController from '../controllers/communication.controller';
import * as learningController from '../controllers/learning.controller';
import * as notifController from '../controllers/notification.controller';
import * as searchController from '../controllers/search.controller';
import { authenticateToken, requireTenant, requirePermission } from '../middleware/auth';

const router = Router();

// Authentication
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getMe);

// Organizations & Hierarchy
router.get('/organizations', authenticateToken, orgController.listOrganizations);
router.post('/organizations', authenticateToken, orgController.createOrganization);
router.get('/organizations/:id', authenticateToken, orgController.getOrganization);

router.get('/hierarchy', authenticateToken, requireTenant, orgController.getHierarchy);
router.post('/regions', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.createRegion);
router.get('/stores', authenticateToken, requireTenant, orgController.getStores);
router.post('/stores', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.createStore);
router.post('/teams', authenticateToken, requireTenant, requirePermission('stores.manage'), orgController.createTeam);

router.get('/employees', authenticateToken, requireTenant, requirePermission('employees.manage'), orgController.getEmployees);
router.post('/employees/invite', authenticateToken, requireTenant, requirePermission('employees.manage'), orgController.inviteEmployee);

// Tasks & Operations
router.get('/tasks', authenticateToken, requireTenant, taskController.listTasks);
router.post('/tasks', authenticateToken, requireTenant, requirePermission('tasks.create'), taskController.createTask);
router.get('/tasks/analytics', authenticateToken, requireTenant, taskController.getTaskAnalytics);
router.get('/tasks/:id', authenticateToken, requireTenant, taskController.getTask);
router.post('/tasks/:id/start', authenticateToken, requireTenant, taskController.startTask);
router.post('/tasks/:id/submit', authenticateToken, requireTenant, taskController.submitTask);
router.post('/tasks/:id/validate', authenticateToken, requireTenant, requirePermission('tasks.validate'), taskController.validateTask);

// Forms, Audits & Inspections
router.get('/audit-templates', authenticateToken, requireTenant, auditController.listTemplates);
router.post('/audit-templates', authenticateToken, requireTenant, requirePermission('audits.create'), auditController.createTemplate);
router.get('/audits', authenticateToken, requireTenant, auditController.listAudits);
router.post('/audits', authenticateToken, requireTenant, requirePermission('audits.create'), auditController.scheduleAudit);
router.post('/audits/:id/submit', authenticateToken, requireTenant, auditController.submitAudit);

// Internal Communication & Communities
router.get('/announcements', authenticateToken, requireTenant, commController.listAnnouncements);
router.post('/announcements', authenticateToken, requireTenant, requirePermission('announcements.publish'), commController.createAnnouncement);
router.get('/communities', authenticateToken, requireTenant, commController.listCommunities);
router.post('/communities', authenticateToken, requireTenant, commController.createCommunity);
router.get('/communities/:communityId/posts', authenticateToken, requireTenant, commController.listPosts);
router.post('/communities/:communityId/posts', authenticateToken, requireTenant, commController.createPost);
router.post('/posts/:postId/comments', authenticateToken, requireTenant, commController.createComment);

// LMS & Training
router.get('/courses', authenticateToken, requireTenant, learningController.listCourses);
router.post('/courses', authenticateToken, requireTenant, requirePermission('courses.manage'), learningController.createCourse);
router.get('/courses/:id', authenticateToken, requireTenant, learningController.getCourse);
router.post('/courses/:courseId/lessons/:lessonId/quiz', authenticateToken, requireTenant, learningController.submitQuiz);

// Notifications & Search
router.get('/notifications', authenticateToken, notifController.listNotifications);
router.patch('/notifications/:id/read', authenticateToken, notifController.markAsRead);
router.get('/search', authenticateToken, requireTenant, searchController.globalSearch);

export default router;
