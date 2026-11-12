import request from 'supertest';
import { createApp } from '../app';
import { sequelize } from '../database/sequelize';

const app = createApp();

describe('Task Lifecycle, Validation, and Permission Rules', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_DIALECT = 'sqlite';
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let managerToken: string;
  let employeeToken: string;
  let employeeId: string;
  let orgId: string;
  let taskId: string;

  it('Setup: Register Manager & Organization', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'store.manager@supermarket.com',
        password: 'Password123!',
        firstName: 'Sarah',
        lastName: 'Manager',
        organizationName: 'Global Supermarket',
      });

    expect(res.status).toBe(201);
    managerToken = res.body.data.tokens.accessToken;
    orgId = res.body.data.activeOrganization.id;
  });

  it('Setup: Invite Employee to Organization and Login', async () => {
    const inviteRes = await request(app)
      .post('/api/v1/employees/invite')
      .set('Authorization', `Bearer ${managerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        email: 'john.frontline@supermarket.com',
        firstName: 'John',
        lastName: 'Worker',
        roleCode: 'EMPLOYEE',
      });

    expect(inviteRes.status).toBe(201);
    employeeId = inviteRes.body.data.userId;

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'john.frontline@supermarket.com',
        password: 'Welcome123!',
      });

    expect(loginRes.status).toBe(200);
    employeeToken = loginRes.body.data.tokens.accessToken;
  });

  it('Phase 4: Manager creates operational task requiring photo evidence', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        title: 'Morning Produce Freshness Check',
        instructions: 'Check temperature gauges and fruit arrangement',
        priority: 'HIGH',
        requiresValidation: true,
        requiresPhotoEvidence: true,
        assignedUserId: employeeId,
        checklist: [
          { id: '1', title: 'Check fridge temp at 4°C', isRequired: true, type: 'CHECKBOX' },
          { id: '2', title: 'Restock organic apples', isRequired: true, type: 'CHECKBOX' },
        ],
      });

    expect(res.status).toBe(201);
    taskId = res.body.data.id;
    expect(res.body.data.status).toBe('TODO');
  });

  it('Phase 4: Employee starts task (TODO -> IN_PROGRESS)', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${taskId}/start`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('X-Organization-Id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('Phase 4: Submitting without required photo evidence must fail', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${taskId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        comment: 'Done without photo',
        checklistResponses: { '1': true, '2': true },
        evidence: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('EVIDENCE_REQUIRED');
  });

  it('Phase 4: Submitting with photo evidence succeeds (IN_PROGRESS -> SUBMITTED)', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${taskId}/submit`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        comment: 'All produce fresh and temps verified',
        checklistResponses: { '1': true, '2': true },
        evidence: [
          {
            type: 'PHOTO',
            fileUrl: 'https://storage.yoobic.local/evidence/fridge_temp.jpg',
            fileName: 'fridge_temp.jpg',
            fileSizeBytes: 204850,
            mimeType: 'image/jpeg',
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('SUBMITTED');
  });

  it('Security check: Employee cannot validate/approve their own task submission', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${taskId}/validate`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        decision: 'APPROVED',
      });

    expect(res.status).toBe(403);
    expect(['FORBIDDEN', 'CANNOT_VALIDATE_OWN_TASK']).toContain(res.body.error.code);
  });

  it('Business check: Rejecting a task requires an explicit explanation/reason', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${taskId}/validate`)
      .set('Authorization', `Bearer ${managerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        decision: 'REJECTED',
        reason: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('Phase 4: Manager successfully approves the task (SUBMITTED -> APPROVED)', async () => {
    const res = await request(app)
      .post(`/api/v1/tasks/${taskId}/validate`)
      .set('Authorization', `Bearer ${managerToken}`)
      .set('X-Organization-Id', orgId)
      .send({
        decision: 'APPROVED',
        reason: 'Excellent compliance, photo is clear.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('APPROVED');
    expect(res.body.data.validation.decision).toBe('APPROVED');
  });

  it('Phase 5: Analytics endpoint updates task counts and calculates completion rate', async () => {
    const res = await request(app)
      .get('/api/v1/tasks/analytics')
      .set('Authorization', `Bearer ${managerToken}`)
      .set('X-Organization-Id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.approved).toBe(1);
    expect(res.body.data.completionRate).toBe(100);
  });
});
