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
  Post,
  Comment,
  Course,
  TaskTemplate,
} from '../models';

export const seedDatabase = async () => {
  try {
    const existingOrg = await Organization.findOne({ where: { slug: 'global-retail-one' } });
    if (existingOrg) {
      // Check if active TODO tasks exist
      const todoCount = await Task.count({ where: { organizationId: existingOrg.id, status: 'TODO' } });
      if (todoCount === 0) {
        console.log('[Seed] Populating active operational tasks and LMS quiz for existing organization...');
        const store = await Store.findOne({ where: { organizationId: existingOrg.id } });
        const managerUser = await User.findOne({ where: { email: 'sarah.manager@globalretail.com' } });
        const empUser = await User.findOne({ where: { email: 'alex.frontline@globalretail.com' } });

        if (store && empUser && managerUser) {
          await Task.create({
            organizationId: existingOrg.id,
            title: 'RDTS - Maintenance & Balisage Linéaire',
            description: 'Vérification complète de la lisibilité des prix et facing des têtes de gondole.',
            instructions: 'Contrôler que chaque produit en rayon a son étiquette prix visible et prendre une photo nette du linéaire complet.',
            priority: 'HIGH',
            status: 'TODO',
            category: 'Maintenance Rayon',
            requiresValidation: true,
            requiresPhotoEvidence: true,
            storeId: store.id,
            createdById: managerUser.id,
            assignedUserId: empUser.id,
            estimatedDurationMinutes: 25,
            checklist: [
              { id: 'c1', title: 'Toutes les étiquettes de prix sont actives et lisibles', isRequired: true, type: 'CHECKBOX' },
              { id: 'c2', title: 'Alignement du facing en tête de gondole', isRequired: true, type: 'CHOICE', options: ['Impeccable (100%)', 'Correct (80%)', 'À réaligner (<70%)'] },
              { id: 'c3', title: 'Relevé de température ambiante rayon (°C)', isRequired: false, type: 'NUMBER', defaultValue: '19' },
              { id: 'c4', title: 'Photo obligatoire du linéaire complet', isRequired: true, type: 'PHOTO' },
            ],
          });

          await Task.create({
            organizationId: existingOrg.id,
            title: 'Contrôle Fraîcheur & DLC Courtes Rayon Traiteur',
            description: 'Audit DLC et mise en place des stickers anti-gaspillage.',
            instructions: 'Identifier les produits à DLC J-1 et apposer les étiquettes de remise avant 09h00.',
            priority: 'MEDIUM',
            status: 'IN_PROGRESS',
            category: 'Qualité & Hygiène',
            requiresValidation: true,
            requiresPhotoEvidence: true,
            storeId: store.id,
            createdById: managerUser.id,
            assignedUserId: empUser.id,
            estimatedDurationMinutes: 15,
            checklist: [
              { id: 'c1', title: 'Retrait des produits arrivés à date de péremption J-0', isRequired: true, type: 'CHECKBOX' },
              { id: 'c2', title: 'Nombre de stickers -30% ou -50% apposés sur produits J-1', isRequired: true, type: 'NUMBER', defaultValue: '8' },
              { id: 'c3', title: 'Photo du bac anti-gaspillage approvisionné', isRequired: true, type: 'PHOTO' },
            ],
          });

          await Task.create({
            organizationId: existingOrg.id,
            title: 'Audit Ouverture Magasin & Sécurité Allées',
            description: 'Dégagement des voies de circulation et issues de secours.',
            instructions: 'Vérifier qu\'aucun transpalette ni palette ne bloque les issues de secours avant l\'ouverture des portes aux clients.',
            priority: 'CRITICAL',
            status: 'TODO',
            category: 'Sécurité Magasin',
            requiresValidation: true,
            requiresPhotoEvidence: true,
            storeId: store.id,
            createdById: managerUser.id,
            assignedUserId: empUser.id,
            estimatedDurationMinutes: 10,
            checklist: [
              { id: 'c1', title: 'Issues de secours et extincteurs totalement dégagés', isRequired: true, type: 'CHECKBOX' },
              { id: 'c2', title: 'Absence de palettes ou cartons gênant les allées principales', isRequired: true, type: 'CHECKBOX' },
              { id: 'c3', title: 'Photo de confirmation de l\'allée centrale', isRequired: true, type: 'PHOTO' },
            ],
          });
        }

        // Update Course quiz if needed
        const course = await Course.findOne({ where: { organizationId: existingOrg.id } });
        if (course) {
          course.modules = [
            {
              id: 'mod-1',
              title: 'Cold Chain Protocols',
              order: 1,
              lessons: [
                {
                  id: 'les-1',
                  title: 'Proper Gauge Calibration & Emergency Action',
                  contentType: 'VIDEO',
                  durationMinutes: 10,
                  quiz: {
                    passingScore: 80,
                    questions: [
                      {
                        id: 'q1',
                        questionText: 'Quelle est la température maximale réglementaire autorisée pour un meuble froid produits laitiers ?',
                        options: ['8°C', '4°C', '12°C', '0°C'],
                        correctOptionIndex: 1,
                        explanation: 'La norme HACCP impose un maintien rigoureux à 4°C maximum pour la sécurité alimentaire.',
                      },
                      {
                        id: 'q2',
                        questionText: 'Que devez-vous faire immédiatement en cas de rupture de la chaîne du froid (> 8°C constaté) ?',
                        options: ['Ignorer et refermer la vitre', 'Alerter le responsable et consigner les denrées', 'Augmenter temporairement le thermostat'],
                        correctOptionIndex: 1,
                        explanation: 'Toute rupture de la chaîne du froid nécessite la consignation immédiate des denrées et un signalement.',
                      },
                      {
                        id: 'q3',
                        questionText: 'À quelle fréquence minimale les relevés de température doivent-ils être réalisés et tracés ?',
                        options: ['2 fois par jour (Matin & Après-midi)', '1 fois par semaine', 'Uniquement lors des livraisons'],
                        correctOptionIndex: 0,
                        explanation: 'Le plan de maîtrise sanitaire impose au moins deux relevés quotidiens.',
                      },
                    ],
                  },
                },
              ],
            },
          ];
          await course.save();
        }
      }

      console.log('[Seed] Database already seeded and up-to-date.');
      
      // Ensure task templates exist for demo recurrence
      const tplCount = await TaskTemplate.count({ where: { organizationId: existingOrg.id } });
      if (tplCount === 0) {
        const managerUser = await User.findOne({ where: { email: 'sarah.manager@globalretail.com' } });
        if (managerUser) {
          await TaskTemplate.create({
            organizationId: existingOrg.id,
            title: 'Checklist Ouverture Magasin',
            description: 'Contrôle standard d\'ouverture avant accueil clients.',
            instructions: 'Parcourir chaque point de la checklist et joindre une photo de l\'entrée principale.',
            priority: 'HIGH',
            category: 'Ouverture',
            requiresValidation: true,
            requiresPhotoEvidence: true,
            estimatedDurationMinutes: 15,
            checklist: [
              { id: 'c1', title: 'Éclairage et musique d\'ambiance OK', isRequired: true, type: 'CHECKBOX' },
              { id: 'c2', title: 'Issues de secours dégagées', isRequired: true, type: 'CHECKBOX' },
              { id: 'c3', title: 'Photo de la façade / entrée', isRequired: true, type: 'PHOTO' },
            ],
            recurrenceEnabled: true,
            recurrenceRule: 'DAILY',
            recurrenceTime: '07:30',
            recurrenceDaysOfWeek: [1, 2, 3, 4, 5, 6],
            isActive: true,
            createdById: managerUser.id,
          });
          await TaskTemplate.create({
            organizationId: existingOrg.id,
            title: 'Relevé température meubles froids',
            description: 'Relevés HACCP matin et après-midi.',
            instructions: 'Noter la température de chaque meuble et photographier le thermomètre.',
            priority: 'CRITICAL',
            category: 'FOOD_SAFETY',
            requiresValidation: true,
            requiresPhotoEvidence: true,
            estimatedDurationMinutes: 20,
            checklist: [
              { id: 'c1', title: 'Tous les meubles ≤ 4°C', isRequired: true, type: 'CHECKBOX' },
              { id: 'c2', title: 'Température relevée (°C)', isRequired: true, type: 'NUMBER' },
              { id: 'c3', title: 'Photo du thermomètre', isRequired: true, type: 'PHOTO' },
            ],
            recurrenceEnabled: true,
            recurrenceRule: 'DAILY',
            recurrenceTime: '10:00',
            recurrenceDaysOfWeek: [1, 2, 3, 4, 5, 6, 0],
            isActive: true,
            createdById: managerUser.id,
          });
          console.log('[Seed] Task templates created for existing organization.');
        }
      }

      return;
    }

    console.log('[Seed] Seeding initial enterprise demonstration data...');

    // 1. Organization
    const org = await Organization.create({
      name: 'Global Retail Canada',
      slug: 'global-retail-one',
      timezone: 'America/Toronto',
      defaultLanguage: 'en',
      currency: 'CAD',
      status: 'ACTIVE',
      subscriptionPlan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
    });

    // 2. Roles & Permissions
    // ORG_MANAGER = responsable organisation (web admin, scoped to their org)
    // EMPLOYEE = opérateur terrain (mobile)
    // Platform Super Admin = user.isSuperAdmin (all orgs)
    const ownerRole = await Role.create({
      organizationId: org.id,
      name: 'Responsable organisation',
      code: 'ORG_MANAGER',
      isSystem: true,
    });

    const employeeRole = await Role.create({
      organizationId: org.id,
      name: 'Opérateur terrain',
      code: 'EMPLOYEE',
      isSystem: true,
    });

    const managerPermCodes = [
      '*',
      'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.validate', 'tasks.view_all', 'tasks.manage',
      'employees.manage', 'stores.manage', 'org.settings.manage',
      'audits.create', 'audits.execute',
      'announcements.publish', 'announcements.read',
      'courses.manage', 'courses.view',
    ];

    const employeePermCodes = [
      'tasks.read', 'tasks.update',
      'announcements.read',
      'courses.view',
    ];

    for (const code of managerPermCodes) {
      const [perm] = await Permission.findOrCreate({
        where: { code },
        defaults: { code, name: code, category: code.split('.')[0] || 'general' },
      });
      await (ownerRole as any).addPermission(perm);
    }

    for (const code of employeePermCodes) {
      const [perm] = await Permission.findOrCreate({
        where: { code },
        defaults: { code, name: code, category: code.split('.')[0] || 'general' },
      });
      await (employeeRole as any).addPermission(perm);
    }

    // 3. Users
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const employeePasswordHash = await bcrypt.hash('Password123!', 10);

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
      name: 'Marché Centre-Ville Montréal',
      code: 'CA-MTL-001',
      address: '1234 Rue Sainte-Catherine Ouest',
      addressLine2: 'Suite 100',
      city: 'Montréal',
      province: 'QC',
      postalCode: 'H3G 1P1',
      country: 'Canada',
      latitude: 45.4987,
      longitude: -73.5795,
      phone: '+1 514-555-0100',
      email: 'montreal@globalretail.ca',
      timezone: 'America/Toronto',
      openingHours: 'Lun-Sam 08:00-21:00; Dim 09:00-18:00',
      notes: 'Magasin phare Québec — accès métro Peel',
      isActive: true,
    });

    const store2 = await Store.create({
      organizationId: org.id,
      name: 'Toronto Queen Street Store',
      code: 'CA-TOR-004',
      address: '500 Queen Street West',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5V 2B3',
      country: 'Canada',
      latitude: 43.6476,
      longitude: -79.4002,
      phone: '+1 416-555-0200',
      email: 'toronto@globalretail.ca',
      timezone: 'America/Toronto',
      openingHours: 'Mon-Sat 08:00-21:00; Sun 10:00-18:00',
      notes: 'Ontario flagship — high foot traffic',
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
      jobTitle: 'Super Admin plateforme',
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

    // 6b. Active Operational Tasks for Frontline Associates
    await Task.create({
      organizationId: org.id,
      title: 'RDTS - Maintenance & Balisage Linéaire',
      description: 'Vérification complète de la lisibilité des prix et facing des têtes de gondole.',
      instructions: 'Contrôler que chaque produit en rayon a son étiquette prix visible et prendre une photo nette du linéaire complet.',
      priority: 'HIGH',
      status: 'TODO',
      category: 'Maintenance Rayon',
      requiresValidation: true,
      requiresPhotoEvidence: true,
      storeId: store1.id,
      teamId: team1.id,
      createdById: manager.id,
      assignedUserId: employee.id,
      estimatedDurationMinutes: 25,
      checklist: [
        { id: 'c1', title: 'Toutes les étiquettes de prix sont actives et lisibles', isRequired: true, type: 'CHECKBOX' },
        { id: 'c2', title: 'Alignement du facing en tête de gondole', isRequired: true, type: 'CHOICE', options: ['Impeccable (100%)', 'Correct (80%)', 'À réaligner (<70%)'] },
        { id: 'c3', title: 'Relevé de température ambiante rayon (°C)', isRequired: false, type: 'NUMBER', defaultValue: '19' },
        { id: 'c4', title: 'Photo obligatoire du linéaire complet', isRequired: true, type: 'PHOTO' },
      ],
    });

    await Task.create({
      organizationId: org.id,
      title: 'Contrôle Fraîcheur & DLC Courtes Rayon Traiteur',
      description: 'Audit DLC et mise en place des stickers anti-gaspillage.',
      instructions: 'Identifier les produits à DLC J-1 et apposer les étiquettes de remise avant 09h00.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      category: 'Qualité & Hygiène',
      requiresValidation: true,
      requiresPhotoEvidence: true,
      storeId: store1.id,
      teamId: team1.id,
      createdById: manager.id,
      assignedUserId: employee.id,
      estimatedDurationMinutes: 15,
      checklist: [
        { id: 'c1', title: 'Retrait des produits arrivés à date de péremption J-0', isRequired: true, type: 'CHECKBOX' },
        { id: 'c2', title: 'Nombre de stickers -30% ou -50% apposés sur produits J-1', isRequired: true, type: 'NUMBER', defaultValue: '8' },
        { id: 'c3', title: 'Photo du bac anti-gaspillage approvisionné', isRequired: true, type: 'PHOTO' },
      ],
    });

    await Task.create({
      organizationId: org.id,
      title: 'Audit Ouverture Magasin & Sécurité Allées',
      description: 'Dégagement des voies de circulation et issues de secours.',
      instructions: 'Vérifier qu\'aucun transpalette ni palette ne bloque les issues de secours avant l\'ouverture des portes aux clients.',
      priority: 'CRITICAL',
      status: 'TODO',
      category: 'Sécurité Magasin',
      requiresValidation: true,
      requiresPhotoEvidence: true,
      storeId: store1.id,
      createdById: manager.id,
      assignedUserId: employee.id,
      estimatedDurationMinutes: 10,
      checklist: [
        { id: 'c1', title: 'Issues de secours et extincteurs totalement dégagés', isRequired: true, type: 'CHECKBOX' },
        { id: 'c2', title: 'Absence de palettes ou cartons gênant les allées principales', isRequired: true, type: 'CHECKBOX' },
        { id: 'c3', title: 'Photo de confirmation de l\'allée centrale', isRequired: true, type: 'PHOTO' },
      ],
    });

    // 7. Announcement
    await Announcement.create({
      organizationId: org.id,
      title: '🌟 National Visual Merchandising Excellence Winners',
      content: 'Congratulations to Store #12 for achieving 100% compliance during the Q2 inspection.',
      authorId: manager.id,
      isPinned: true,
    });

    // 8. Community & Posts
    const community = await Community.create({
      organizationId: org.id,
      name: 'Frontline Best Practices Hub',
      description: 'Collaborative space for store staff to share tips and operational ideas.',
    });

    const post1 = await Post.create({
      communityId: community.id,
      authorId: manager.id,
      content: 'Conseils réassort têtes de gondole : Pensez à préparer les rolls en réserve par ordre de rayon pour gagner 15 minutes lors de l\'ouverture matinale !',
      commentsCount: 1,
    });

    await Comment.create({
      postId: post1.id,
      authorId: employee.id,
      content: 'Super conseil, appliqué ce matin avec l\'équipe du rayon frais et le gain de temps est confirmé !',
    });

    // 9. LMS Course with Interactive Quiz
    await Course.create({
      organizationId: org.id,
      title: 'Frontline Food Safety & Cooler Temperature Controls',
      description: 'Maîtriser les protocoles de la chaîne du froid, les calibrages des capteurs et les actions correctives obligatoires.',
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
              title: 'Proper Gauge Calibration & Emergency Action',
              contentType: 'VIDEO',
              durationMinutes: 10,
              quiz: {
                passingScore: 80,
                questions: [
                  {
                    id: 'q1',
                    questionText: 'Quelle est la température maximale réglementaire autorisée pour un meuble froid produits laitiers ?',
                    options: ['8°C', '4°C', '12°C', '0°C'],
                    correctOptionIndex: 1,
                    explanation: 'La norme HACCP impose un maintien rigoureux à 4°C maximum pour la sécurité alimentaire.',
                  },
                  {
                    id: 'q2',
                    questionText: 'Que devez-vous faire immédiatement en cas de rupture de la chaîne du froid (> 8°C constaté) ?',
                    options: ['Ignorer et refermer la vitre', 'Alerter le responsable et consigner les denrées', 'Augmenter temporairement le thermostat'],
                    correctOptionIndex: 1,
                    explanation: 'Toute rupture de la chaîne du froid nécessite la consignation immédiate des denrées et un signalement.',
                  },
                  {
                    id: 'q3',
                    questionText: 'À quelle fréquence minimale les relevés de température doivent-ils être réalisés et tracés ?',
                    options: ['2 fois par jour (Matin & Après-midi)', '1 fois par semaine', 'Uniquement lors des livraisons'],
                    correctOptionIndex: 0,
                    explanation: 'Le plan de maîtrise sanitaire impose au moins deux relevés quotidiens.',
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    // 10. Task templates with recurrence
    await TaskTemplate.create({
      organizationId: org.id,
      title: 'Checklist Ouverture Magasin',
      description: 'Contrôle standard d\'ouverture avant accueil clients.',
      instructions: 'Parcourir chaque point de la checklist et joindre une photo de l\'entrée principale.',
      priority: 'HIGH',
      category: 'Ouverture',
      requiresValidation: true,
      requiresPhotoEvidence: true,
      estimatedDurationMinutes: 15,
      checklist: [
        { id: 'c1', title: 'Éclairage et musique d\'ambiance OK', isRequired: true, type: 'CHECKBOX' },
        { id: 'c2', title: 'Issues de secours dégagées', isRequired: true, type: 'CHECKBOX' },
        { id: 'c3', title: 'Photo de la façade / entrée', isRequired: true, type: 'PHOTO' },
      ],
      recurrenceEnabled: true,
      recurrenceRule: 'DAILY',
      recurrenceTime: '07:30',
      recurrenceDaysOfWeek: [1, 2, 3, 4, 5, 6],
      isActive: true,
      createdById: manager.id,
    });

    await TaskTemplate.create({
      organizationId: org.id,
      title: 'Relevé température meubles froids',
      description: 'Relevés HACCP matin et après-midi.',
      instructions: 'Noter la température de chaque meuble et photographier le thermomètre.',
      priority: 'CRITICAL',
      category: 'FOOD_SAFETY',
      requiresValidation: true,
      requiresPhotoEvidence: true,
      estimatedDurationMinutes: 20,
      checklist: [
        { id: 'c1', title: 'Tous les meubles ≤ 4°C', isRequired: true, type: 'CHECKBOX' },
        { id: 'c2', title: 'Température relevée (°C)', isRequired: true, type: 'NUMBER' },
        { id: 'c3', title: 'Photo du thermomètre', isRequired: true, type: 'PHOTO' },
      ],
      recurrenceEnabled: true,
      recurrenceRule: 'DAILY',
      recurrenceTime: '10:00',
      recurrenceDaysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      isActive: true,
      createdById: manager.id,
    });

    console.log('[Seed] Demonstration data successfully loaded into database.');
  } catch (error) {
    console.error('[Seed] Seeding error:', error);
  }
};
