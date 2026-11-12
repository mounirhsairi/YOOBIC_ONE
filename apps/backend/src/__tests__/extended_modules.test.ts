import request from 'supertest';
import { createApp } from '../app';
import { sequelize } from '../database/sequelize';

const app = createApp();

describe('Extended Enterprise Modules: Audits, Communication, LMS, & Search', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_DIALECT = 'sqlite';
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let token: string;
  let userId: string;
  let orgId: string;
  let storeId: string;
  let auditTemplateId: string;
  let auditId: string;
  let communityId: string;
  let courseId: string;

  it('Setup: Register enterprise organization and create store', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'director@enterprise.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Director',
        organizationName: 'Hypermarket Enterprise',
      });

    expect(res.status).toBe(201);
    token = res.body.data.tokens.accessToken;
    userId = res.body.data.user.id;
    orgId = res.body.data.activeOrganization.id;

    // Create a store
    const storeRes = await request(app)
      .post('/api/v1/stores')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Store 101 Paris Flagship',
        code: 'PAR-101',
        city: 'Paris',
        country: 'France',
      });

    expect(storeRes.status).toBe(201);
    storeId = storeRes.body.data.id;
  });

  it('Phase 7: Create operational audit template with scoring rules', async () => {
    const res = await request(app)
      .post('/api/v1/audit-templates')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        title: 'Q2 Comprehensive Store Compliance Audit',
        description: 'Covers hygiene, cash desk, and safety',
        category: 'COMPLIANCE',
        passingScorePercentage: 85,
        sections: [
          {
            id: 'sec-1',
            title: 'Store Freshness & Hygiene',
            order: 1,
            fields: [
              { id: 'f-1', label: 'Refrigerator temp <= 4C', type: 'CHECKBOX', required: true, weight: 50 },
              { id: 'f-2', label: 'Floor clean and dry', type: 'CHECKBOX', required: true, weight: 50 },
            ],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.passingScorePercentage).toBe(85);
    auditTemplateId = res.body.data.id;
  });

  it('Phase 7: Schedule store audit and submit inspection with corrective action', async () => {
    // Schedule
    const schedRes = await request(app)
      .post('/api/v1/audits')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        templateId: auditTemplateId,
        storeId,
        auditorId: userId,
        scheduledDate: new Date().toISOString(),
      });

    expect(schedRes.status).toBe(201);
    auditId = schedRes.body.data.id;

    // Submit audit result with 90% score (>= 85% passing threshold)
    const submitRes = await request(app)
      .post(`/api/v1/audits/${auditId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        score: 90,
        findings: { 'f-1': true, 'f-2': true },
        correctiveActions: [
          {
            id: 'ca-1',
            description: 'Replace seal on dairy cooler #3',
            assignedUserId: userId,
            dueDate: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.passed).toBe(true);
    expect(submitRes.body.data.score).toBe(90);
    expect(submitRes.body.data.status).toBe('COMPLETED');
  });

  it('Phase 8: Create Announcement and Community Post with comments', async () => {
    // Announcement
    const annRes = await request(app)
      .post('/api/v1/announcements')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        title: 'Safety Policy Reminder 2026',
        content: 'Please ensure all fire exits are clear of merchandise.',
        isPinned: true,
      });

    expect(annRes.status).toBe(201);

    // Community
    const commRes = await request(app)
      .post('/api/v1/communities')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        name: 'Store Managers Hub',
        description: 'Best practice sharing across European stores',
      });

    expect(commRes.status).toBe(201);
    communityId = commRes.body.data.id;

    // Post
    const postRes = await request(app)
      .post(`/api/v1/communities/${communityId}/posts`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        content: 'Our weekend promo achieved +18% footfall!',
      });

    expect(postRes.status).toBe(201);
    const postId = postRes.body.data.id;

    // Comment
    const commentRes = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        content: 'Great execution, congratulations team!',
      });

    expect(commentRes.status).toBe(201);
  });

  it('Phase 9: Create LMS course, take quiz, and evaluate passing score', async () => {
    const courseRes = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        title: 'Frontline Fire Safety & Evacuation',
        category: 'SAFETY',
        estimatedMinutes: 20,
        isMandatory: true,
        modules: [
          {
            id: 'm1',
            title: 'Module 1: Emergency Exits',
            order: 1,
            lessons: [
              {
                id: 'les-quiz-1',
                title: 'Knowledge Check',
                contentType: 'QUIZ',
                durationMinutes: 5,
                quiz: {
                  passingScorePercentage: 75,
                  questions: [
                    {
                      id: 'q1',
                      question: 'Where is the assembly point?',
                      options: ['Back alley', 'Front parking bay C', 'Store roof'],
                      correctOptionIndex: 1,
                    },
                    {
                      id: 'q2',
                      question: 'What is the maximum response time to sound alarm?',
                      options: ['Immediate', 'Wait 10 minutes'],
                      correctOptionIndex: 0,
                    },
                  ],
                },
              },
            ],
          },
        ],
      });

    expect(courseRes.status).toBe(201);
    courseId = courseRes.body.data.id;

    // Submit quiz answers (100% correct)
    const quizRes = await request(app)
      .post(`/api/v1/courses/${courseId}/lessons/les-quiz-1/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .send({
        answers: {
          q1: 1,
          q2: 0,
        },
      });

    expect(quizRes.status).toBe(200);
    expect(quizRes.body.data.scorePercentage).toBe(100);
    expect(quizRes.body.data.passed).toBe(true);
  });

  it('Phase 10: Global search returns scoped entities across all pillars', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=Safety')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.data.announcements.length).toBeGreaterThan(0);
    expect(res.body.data.courses.length).toBeGreaterThan(0);
  });
});
