import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, Organization, Membership, Role, Permission } from '../models';
import { registerSchema, loginSchema } from '@yoobic/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_jwt_key_yoobic_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key_yoobic_2026';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, isSuperAdmin: user.isSuperAdmin },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, jti: uuidv4() },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken, expiresIn: 3600 };
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, error: { code: 'REFRESH_TOKEN_MISSING', message: 'Refresh token is required' } });
      return;
    }

    let decoded: { sub: string };
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      res.status(401).json({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' } });
      return;
    }

    const user = await User.findByPk(decoded.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND_OR_INACTIVE', message: 'User not found or is inactive' } });
      return;
    }

    const tokenHash = hashRefreshToken(token);
    const isMatch = (tokenHash === user.refreshTokenHash);
    if (!isMatch) {
      // Token reuse detected — invalidate all tokens (refresh token rotation)
      await User.update({ refreshTokenHash: null }, { where: { id: user.id } });
      res.status(401).json({ success: false, error: { code: 'REFRESH_TOKEN_REUSE', message: 'Token reuse detected. Please log in again.' } });
      return;
    }

    const tokens = generateTokens(user);
    const newHash = hashRefreshToken(tokens.refreshToken);
    await User.update({ refreshTokenHash: newHash }, { where: { id: user.id } });

    res.json({ success: true, data: { tokens } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const user = await User.findByPk(req.user.id);
    if (user) {
      await user.update({ refreshTokenHash: null });
    }
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'currentPassword and newPassword (min 8 chars) are required' } });
      return;
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect' } });
      return;
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await user.update({ passwordHash: newPasswordHash, refreshTokenHash: null });
    res.json({ success: true, data: { message: 'Password changed. Please log in again.' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: parseResult.error.format() },
      });
      return;
    }

    const { email, password, firstName, lastName, organizationName } = parseResult.data;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'A user with this email already exists' },
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      isActive: true,
      isSuperAdmin: false,
    });

    let organization: Organization | null = null;
    let membership: Membership | null = null;
    let permissions: string[] = [];

    if (organizationName) {
      const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      organization = await Organization.create({
        name: organizationName,
        slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'ACTIVE',
        subscriptionPlan: 'STARTER',
        subscriptionStatus: 'ACTIVE',
        timezone: 'UTC',
        defaultLanguage: 'en',
        currency: 'USD',
      });

      const ownerRole = await Role.create({
        organizationId: organization.id,
        name: 'Organization Owner',
        code: 'ORG_OWNER',
        isSystem: true,
      });

      // Grant default permissions to Organization Owner
      const allPerms = [
        '*',
        'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.validate', 'tasks.view_all',
        'employees.manage', 'stores.manage', 'org.settings.manage',
        'audits.create', 'audits.execute',
        'announcements.publish', 'announcements.read',
        'courses.manage', 'courses.view',
      ];

      for (const code of allPerms) {
        const [perm] = await Permission.findOrCreate({
          where: { code },
          defaults: { code, name: code, category: code.split('.')[0] },
        });
        await (ownerRole as any).addPermission(perm);
      }

      membership = await Membership.create({
        userId: user.id,
        organizationId: organization.id,
        roleId: ownerRole.id,
        status: 'ACTIVE',
        joinedAt: new Date(),
      });

      permissions = allPerms;
    }

    const tokens = generateTokens(user);

    // Save hashed refresh token
    const refreshHash = hashRefreshToken(tokens.refreshToken);
    await User.update({ refreshTokenHash: refreshHash }, { where: { id: user.id } });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive,
        },
        activeOrganization: organization,
        membership,
        tokens,
        permissions,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Server error during registration' },
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: parseResult.error.format() },
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
      return;
    }

    // Find memberships
    const memberships = await Membership.findAll({
      where: { userId: user.id, status: 'ACTIVE' },
      include: [
        { model: Organization, as: 'organization' },
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }],
        },
      ],
    });

    const activeMembership = memberships[0] || null;
    let permissions: string[] = [];

    if (activeMembership) {
      const role = (activeMembership as any).role;
      permissions = role?.permissions?.map((p: any) => p.code) || [];
    } else if (user.isSuperAdmin) {
      permissions = ['*'];
    }

    const tokens = generateTokens(user);
    const refreshHash = hashRefreshToken(tokens.refreshToken);
    await User.update({ refreshTokenHash: refreshHash }, { where: { id: user.id } });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive,
        },
        activeOrganization: activeMembership ? (activeMembership as any).organization : null,
        membership: activeMembership,
        tokens,
        permissions,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Server error during login' },
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    const memberships = await Membership.findAll({
      where: { userId: user.id, status: 'ACTIVE' },
      include: [
        { model: Organization, as: 'organization' },
        {
          model: Role,
          as: 'role',
          include: [{ model: Permission, as: 'permissions' }],
        },
      ],
    });

    let activeOrg = null;
    let activeMembership = null;
    let permissions: string[] = [];

    if (req.tenant) {
      activeMembership = memberships.find((m) => m.organizationId === req.tenant?.organizationId) || null;
      if (activeMembership) {
        activeOrg = (activeMembership as any).organization;
        permissions = req.tenant.permissions;
      }
    } else if (memberships.length > 0) {
      activeMembership = memberships[0];
      activeOrg = (activeMembership as any).organization;
      const role = (activeMembership as any).role;
      permissions = role?.permissions?.map((p: any) => p.code) || [];
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive,
        },
        activeOrganization: activeOrg,
        membership: activeMembership,
        availableOrganizations: memberships.map((m) => (m as any).organization),
        permissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
};
