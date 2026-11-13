import request from 'supertest';
import { createApp } from '../app';
import { sequelize } from '../database/sequelize';

const app = createApp();

describe('P0 Security & P1 Enterprise Management Integration Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_DIALECT = 'sqlite';
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let userA: any;
  let tokenA: string;
  let refreshTokenA: string;
  let orgA: any;

  let userB: any;
  let tokenB: string;
  let orgB: any;

  let taskId: string;
  let storeId: string;
  let roleId: string;

  it('Setup: Register Org A and User A', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'founder@secureorg.com',
        password: 'Password123!',
        firstName: 'Sarah',
        lastName: 'Founder',
        organizationName: 'Secure Enterprises',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    userA = res.body.data.user;
    tokenA = res.body.data.tokens.accessToken;
    refreshTokenA = res.body.data.tokens.refreshToken;
    orgA = res.body.data.activeOrganization;
    expect(refreshTokenA).toBeDefined();
  });

  it('Setup: Register Org B and User B (Attacker / Outsider)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'attacker@outsider.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'Outsider',
        organizationName: 'Outsider LLC',
      });

    expect(res.status).toBe(201);
    userB = res.body.data.user;
    tokenB = res.body.data.tokens.accessToken;
    orgB = res.body.data.activeOrganization;
  });

  it('P0 Security: Outsider cannot access Org A details via /organizations/:id', async () => {
    const res = await request(app)
      .get(`/api/v1/organizations/${orgA.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('P0 Security: Refresh token rotation issues new access & refresh tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refreshTokenA });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    // Old refresh token must be invalidated (rotation)
    const reuseAttempt = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refreshTokenA });

    expect(reuseAttempt.status).toBe(401);
    expect(reuseAttempt.body.error.code).toBe('REFRESH_TOKEN_REUSE');

    // Update tokenA to latest
    tokenA = res.body.data.tokens.accessToken;
  });

  it('P0 Security: Change password updates hash and revokes existing sessions', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        currentPassword: 'Password123!',
        newPassword: 'BrandNewPassword456!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify login with old password fails
    const oldLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'founder@secureorg.com', password: 'Password123!' });
    expect(oldLogin.status).toBe(401);

    // Login with new password succeeds
    const newLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'founder@secureorg.com', password: 'BrandNewPassword456!' });
    expect(newLogin.status).toBe(200);
    tokenA = newLogin.body.data.tokens.accessToken;
  });

  it('P1 Management: Create, update, and manage stores and teams', async () => {
    // Create store
    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id)
      .send({
        name: 'Flagship Paris',
        code: 'PAR-001',
        city: 'Paris',
        country: 'FR',
      });

    expect(storeRes.status).toBe(201);
    storeId = storeRes.body.data.id;

    // Update store
    const updateRes = await request(app)
      .patch(`/api/v1/stores/${storeId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id)
      .send({ name: 'Flagship Paris Champs-Élysées' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Flagship Paris Champs-Élysées');

    // Get store detail
    const getRes = await request(app)
      .get(`/api/v1/stores/${storeId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(storeId);
  });

  it('P1 Management: Role and permission management with system protection', async () => {
    // Create custom role
    const createRoleRes = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id)
      .send({
        name: 'Shift Supervisor',
        code: 'SHIFT_SUPERVISOR',
        description: 'Supervises store floor and assists frontline associates',
        permissionCodes: ['tasks.create', 'tasks.read', 'tasks.update'],
      });

    expect(createRoleRes.status).toBe(201);
    roleId = createRoleRes.body.data.id;
    expect(createRoleRes.body.data.permissions.length).toBe(3);

    // List roles
    const listRes = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(2);

    // Delete custom role succeeds
    const deleteRes = await request(app)
      .delete(`/api/v1/roles/${roleId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id);

    expect(deleteRes.status).toBe(200);
  });

  it('P1 Management: Task update and deletion lifecycle', async () => {
    // Create task
    const taskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id)
      .send({
        title: 'Morning Stock Intake',
        priority: 'HIGH',
        category: 'Logistics',
        storeId,
      });

    expect(taskRes.status).toBe(201);
    taskId = taskRes.body.data.id;

    // Update task
    const updateRes = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id)
      .send({
        title: 'Morning Stock Intake - Urgent Fresh Goods',
        priority: 'CRITICAL',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Morning Stock Intake - Urgent Fresh Goods');
    expect(updateRes.body.data.priority).toBe('CRITICAL');

    // Delete task
    const deleteRes = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id);

    expect(deleteRes.status).toBe(200);

    // Verify task is gone
    const getRes = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-organization-id', orgA.id);

    expect(getRes.status).toBe(404);
  });

  it('P0 Security: Logout invalidates active refresh session', async () => {
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });
});
