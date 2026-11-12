import bcrypt from 'bcryptjs';
import {
  User,
  Organization,
  Role,
  Permission,
  Membership,
  Store,
  Team,
  Task,
  TaskSubmission,
  TaskEvidence,
  TaskValidation,
  Announcement,
  Community,
  Course,
} from '../models';

export const seedDatabase = async () => {
  try {
    const existingOrg = await Organization.findOne({ where: { slug: 'global-retail-one' } });
    if (existingOrg) {
      console.log('[Seed] Database already seeded.');
      return;
    }

    console.log('[Seed] Seeding initial enterprise demonstration data...');

    // 1. Organization
    const org = await Organization.create({
      name: 'Global Retailers Corp',
      slug: 'global-retail-one',
      timezone: 'Europe/Paris',
      defaultLanguage: 'en',
      currency: 'USD',
      status: 'ACTIVE',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
    });

    // 2. Roles & Permissions
    const ownerRole = await Role.create({
      organizationId: org.id,
      name: 'Organization Owner',
      code: 'ORG_OWNER',
      isSystem: true,
    });

    const employeeRole = await Role.create({
      organizationId: org.id,
      name: 'Frontline Associate',
      code: 'EMPLOYEE',
      isSystem: true,
    });

    const allPermCodes = [
      '*', 'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.validate', 'tasks.view_all',
      'employees.manage', 'stores.manage', 'org.settings.manage', 'audits.create', 'audits.execute',
      'announcements.publish', 'announcements.read', 'courses.manage', 'courses.view',
    ];

    for (const code of allPermCodes) {
      const [perm] = await Permission.findOrCreate({
        where: { code },
        defaults: { code, name: code, category: code.split('.')[0] || 'general' },
      });
      await (ownerRole as any).addPermission(perm);
    }

    // 3. Users
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const employeePasswordHash = await bcrypt.hash('Welcome123!', 10);

    const manager = await User.create({
      email: 'sarah.manager@globalretail.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Manager',
      isActive: true,
    });

    const adminUser = await User.create({
      email: 'admin@yoobic-demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      isActive: true,
      isSuperAdmin: true,
    });

    const employee = await User.create({
      email: 'alex.frontline@globalretail.com',
      passwordHash: employeePasswordHash,
      firstName: 'Alex',
      lastName: 'Frontline',
      isActive: true,
    });

    // 4. Stores & Teams
    const store1 = await Store.create({
      organizationId: org.id,
      name: 'Downtown Supermarket #12',
      code: 'ST-012',
      address: '100 Main Street',
      city: 'Paris',
      country: 'France',
      timezone: 'Europe/Paris',
      isActive: true,
    });

    const store2 = await Store.create({
      organizationId: org.id,
      name: 'North Mall Store #04',
      code: 'ST-004',
      city: 'Lyon',
      country: 'France',
      timezone: 'Europe/Paris',
      isActive: true,
    });

    const team1 = await Team.create({
      organizationId: org.id,
      storeId: store1.id,
      name: 'Morning Shift Produce & Dairy',
    });

    // 5. Memberships
    await Membership.create({
      userId: adminUser.id,
      organizationId: org.id,
      roleId: ownerRole.id,
      status: 'ACTIVE',
      storeId: store1.id,
      jobTitle: 'Enterprise Administrator',
    });

    await Membership.create({
      userId: manager.id,
      organizationId: org.id,
      roleId: ownerRole.id,
      status: 'ACTIVE',
      storeId: store1.id,
      jobTitle: 'Store General Manager',
    });

    await Membership.create({
      userId: employee.id,
      organizationId: org.id,
      roleId: employeeRole.id,
      status: 'ACTIVE',
      storeId: store1.id,
      teamId: team1.id,
      jobTitle: 'Department Specialist',
    });

    // 6. Operational Tasks
    const task1 = await Task.create({
      organizationId: org.id,
      title: 'Daily Morning Food Safety & Fridge Check',
      instructions: 'Check cooler temperature gauge and attach clear photograph.',
      priority: 'HIGH',
      status: 'SUBMITTED',
      requiresValidation: true,
      requiresPhotoEvidence: true,
      storeId: store1.id,
      teamId: team1.id,
      createdById: manager.id,
      assignedUserId: employee.id,
      checklist: [
        { id: '1', title: 'Verify cooler gauge is <= 4°C', isRequired: true, type: 'CHECKBOX' },
        { id: '2', title: 'Check dairy expiration dates', isRequired: true, type: 'CHECKBOX' },
      ],
    });

    const submission1 = await TaskSubmission.create({
      taskId: task1.id,
      organizationId: org.id,
      submittedById: employee.id,
      comment: 'All fridge readings verified at 3.5°C. Display is fully restocked.',
      checklistResponses: { '1': true, '2': true },
      submittedAt: new Date(),
    });

    await TaskEvidence.create({
      submissionId: submission1.id,
      taskId: task1.id,
      type: 'PHOTO',
      fileUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
      fileName: 'fridge_gauge.jpg',
      fileSizeBytes: 245000,
      mimeType: 'image/jpeg',
    });

    const task2 = await Task.create({
      organizationId: org.id,
      title: 'Spring Seasonal Promotional Display Setup',
      priority: 'MEDIUM',
      status: 'APPROVED',
      requiresValidation: true,
      requiresPhotoEvidence: true,
      storeId: store2.id,
      createdById: manager.id,
      assignedUserId: employee.id,
      checklist: [{ id: '1', title: 'Display banners setup', isRequired: true, type: 'CHECKBOX' }],
    });

    const sub2 = await TaskSubmission.create({
      taskId: task2.id,
      organizationId: org.id,
      submittedById: employee.id,
      checklistResponses: { '1': true },
      submittedAt: new Date(Date.now() - 86400000),
    });

    await TaskValidation.create({
      taskId: task2.id,
      submissionId: sub2.id,
      organizationId: org.id,
      validatedById: manager.id,
      decision: 'APPROVED',
      reason: 'Perfect compliance with corporate visual guidelines.',
    });

    // 7. Announcement
    await Announcement.create({
      organizationId: org.id,
      title: '🌟 National Visual Merchandising Excellence Winners',
      content: 'Congratulations to Store #12 for achieving 100% compliance during the Q2 inspection.',
      authorId: manager.id,
      isPinned: true,
    });

    // 8. Community
    await Community.create({
      organizationId: org.id,
      name: 'Frontline Best Practices Hub',
      description: 'Collaborative space for store staff to share tips and operational ideas.',
    });

    // 9. LMS Course
    await Course.create({
      organizationId: org.id,
      title: 'Frontline Food Safety & Cooler Temperature Controls',
      category: 'FOOD_SAFETY',
      estimatedMinutes: 20,
      isMandatory: true,
      modules: [
        {
          id: 'mod-1',
          title: 'Cold Chain Protocols',
          order: 1,
          lessons: [
            {
              id: 'les-1',
              title: 'Proper Gauge Calibration',
              contentType: 'VIDEO',
              durationMinutes: 10,
            },
          ],
        },
      ],
    });

    console.log('[Seed] Demonstration data successfully loaded into database.');
  } catch (error) {
    console.error('[Seed] Seeding error:', error);
  }
};
