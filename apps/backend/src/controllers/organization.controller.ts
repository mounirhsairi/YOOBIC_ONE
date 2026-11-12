import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Organization, Membership, User, Role, Region, Store, Team, Permission } from '../models';
import { createOrganizationSchema, createStoreSchema, createTeamSchema, inviteEmployeeSchema } from '@yoobic/validation';

export const listOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.isSuperAdmin) {
      const orgs = await Organization.findAll();
      res.json({ success: true, data: orgs });
      return;
    }

    const memberships = await Membership.findAll({
      where: { userId: req.user!.id, status: 'ACTIVE' },
      include: [{ model: Organization, as: 'organization' }],
    });

    const orgs = memberships.map((m) => (m as any).organization);
    res.json({ success: true, data: orgs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createOrganizationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parseResult.error.format() } });
      return;
    }

    const org = await Organization.create(parseResult.data as any);

    // Create default Admin role for this organization
    const adminRole = await Role.create({
      organizationId: org.id,
      name: 'Organization Admin',
      code: 'ORG_ADMIN',
      isSystem: true,
    });

    // Create membership for creator
    await Membership.create({
      userId: req.user!.id,
      organizationId: org.id,
      roleId: adminRole.id,
      status: 'ACTIVE',
      joinedAt: new Date(),
    });

    res.status(201).json({ success: true, data: org });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.params.id || req.tenant?.organizationId;
    const org = await Organization.findByPk(orgId);
    if (!org) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } });
      return;
    }
    res.json({ success: true, data: org });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

// Hierarchy: Regions, Stores, Teams
export const getHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const regions = await Region.findAll({
      where: { organizationId: orgId },
      include: [
        {
          model: Store,
          as: 'stores',
          include: [{ model: Team, as: 'teams' }],
        },
      ],
    });
    res.json({ success: true, data: regions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createRegion = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { name, code } = req.body;
    if (!name || !code) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name and code are required' } });
      return;
    }
    const region = await Region.create({ organizationId: orgId, name, code });
    res.status(201).json({ success: true, data: region });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = createStoreSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }
    const store = await Store.create({
      ...parse.data,
      organizationId: orgId,
    } as any);
    res.status(201).json({ success: true, data: store });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const stores = await Store.findAll({
      where: { organizationId: orgId },
      include: [{ model: Team, as: 'teams' }],
    });
    res.json({ success: true, data: stores });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = createTeamSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }
    const team = await Team.create({
      ...parse.data,
      organizationId: orgId,
    } as any);
    res.status(201).json({ success: true, data: team });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

// Employee Management
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const memberships = await Membership.findAll({
      where: { organizationId: orgId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName', 'avatarUrl', 'isActive'] },
        { model: Role, as: 'role' },
        { model: Store, as: 'store' },
        { model: Team, as: 'team' },
      ],
    });
    res.json({ success: true, data: memberships });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const inviteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = inviteEmployeeSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const { email, firstName, lastName, roleCode, storeId, teamId, jobTitle, employeeNumber } = parse.data;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      const tempPasswordHash = await bcrypt.hash('Welcome123!', 10);
      user = await User.create({
        email,
        firstName,
        lastName,
        passwordHash: tempPasswordHash,
        isActive: true,
      });
    }

    // Find or create role
    let role = await Role.findOne({ where: { organizationId: orgId, code: roleCode } });
    if (!role) {
      role = await Role.create({
        organizationId: orgId,
        code: roleCode,
        name: roleCode.replace(/_/g, ' '),
      });
    }

    const existingMembership = await Membership.findOne({
      where: { userId: user.id, organizationId: orgId },
    });

    if (existingMembership) {
      res.status(409).json({ success: false, error: { code: 'MEMBERSHIP_EXISTS', message: 'Employee is already a member' } });
      return;
    }

    const membership = await Membership.create({
      userId: user.id,
      organizationId: orgId,
      roleId: role.id,
      storeId: storeId || null,
      teamId: teamId || null,
      jobTitle: jobTitle || null,
      employeeNumber: employeeNumber || null,
      status: 'ACTIVE',
      joinedAt: new Date(),
    });

    res.status(201).json({ success: true, data: membership });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
