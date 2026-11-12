import request from 'supertest';
import { createApp } from '../app';
import { sequelize } from '../database/sequelize';

const app = createApp();

describe('Multi-Tenant Isolation & Authentication Tests', () => {
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
  let orgA: any;

  let userB: any;
  let tokenB: string;
  let orgB: any;

  let taskInOrgAId: string;

  it('Step 1: Register Organization A and User A', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'alice@retailcorp.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Manager',
        organizationName: 'Retail Corp A',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    userA = res.body.data.user;
    tokenA = res.body.data.tokens.accessToken;
    orgA = res.body.data.activeOrganization;
    expect(orgA.name).toBe('Retail Corp A');
  });

  it('Step 2: Register Organization B and User B', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'bob@competitor.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'Director',
        organizationName: 'Competitor B',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    userB = res.body.data.user;
    tokenB = res.body.data.tokens.accessToken;
    orgB = res.body.data.activeOrganization;
    expect(orgB.name).toBe('Competitor B');
  });

  it('Step 3: User A creates a task in Organization A', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('X-Organization-Id', orgA.id)
      .send({
        title: 'Confidential Audit for Org A',
        description: 'Verify quarterly store merchandising',
        priority: 'HIGH',
        requiresValidation: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    taskInOrgAId = res.body.data.id;
  });

  it('Step 4: User B attempts to access Org A task - MUST BE 403 or 404', async () => {
    // If Bob sets Org B header, Org A task should not be found (404)
    const res1 = await request(app)
      .get(`/api/v1/tasks/${taskInOrgAId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('X-Organization-Id', orgB.id);

    expect(res1.status).toBe(404);

    // If Bob tries to impersonate Org A in X-Organization-Id header, access must be 403 FORBIDDEN
    const res2 = await request(app)
      .get(`/api/v1/tasks/${taskInOrgAId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .set('X-Organization-Id', orgA.id);

    expect(res2.status).toBe(403);
    expect(res2.body.error.code).toBe('MEMBERSHIP_REQUIRED');
  });

  it('Step 5: User B lists tasks - only sees Org B tasks (empty), not Org A tasks', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${tokenB}`)
      .set('X-Organization-Id', orgB.id);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
