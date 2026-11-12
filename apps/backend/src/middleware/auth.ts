import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Membership, Role, Permission, Organization } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_jwt_key_yoobic_2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

export interface TenantContext {
  organizationId: string;
  roleId: string;
  roleCode: string;
  permissions: string[];
  membershipId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenant?: TenantContext;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token is missing or malformed' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; isSuperAdmin: boolean };
    const user = await User.findByPk(decoded.sub);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE_OR_NOT_FOUND', message: 'User account is disabled or does not exist' },
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    };

    // Check optional or required organization header
    const orgIdHeader = req.headers['x-organization-id'] as string | undefined;
    if (orgIdHeader) {
      const org = await Organization.findByPk(orgIdHeader);
      if (!org || org.status === 'SUSPENDED') {
        res.status(403).json({
          success: false,
          error: { code: 'ORGANIZATION_SUSPENDED_OR_NOT_FOUND', message: 'Target organization is not accessible' },
        });
        return;
      }

      // Verify membership
      const membership = await Membership.findOne({
        where: {
          userId: user.id,
          organizationId: orgIdHeader,
          status: 'ACTIVE',
        },
        include: [
          {
            model: Role,
            as: 'role',
            include: [{ model: Permission, as: 'permissions' }],
          },
        ],
      });

      if (!membership && !user.isSuperAdmin) {
        res.status(403).json({
          success: false,
          error: { code: 'MEMBERSHIP_REQUIRED', message: 'You are not an active member of this organization' },
        });
        return;
      }

      if (membership) {
        const role = (membership as any).role;
        const perms: string[] = role?.permissions?.map((p: any) => p.code) || [];
        req.tenant = {
          organizationId: org.id,
          roleId: membership.roleId,
          roleCode: role?.code || '',
          permissions: perms,
          membershipId: membership.id,
        };
      } else if (user.isSuperAdmin) {
        req.tenant = {
          organizationId: org.id,
          roleId: 'super-admin-override',
          roleCode: 'SUPER_ADMIN',
          permissions: ['*'],
          membershipId: 'super-admin-membership',
        };
      }
    }

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' },
    });
  }
};

export const requireTenant = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.tenant || !req.tenant.organizationId) {
    res.status(400).json({
      success: false,
      error: { code: 'TENANT_HEADER_REQUIRED', message: 'X-Organization-Id header is required for this endpoint' },
    });
    return;
  }
  next();
};

export const requirePermission = (permissionCode: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.isSuperAdmin) {
      return next();
    }
    if (!req.tenant) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Tenant context required to verify permissions' },
      });
      return;
    }
    if (req.tenant.permissions.includes('*') || req.tenant.permissions.includes(permissionCode)) {
      return next();
    }
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: `Missing required permission: ${permissionCode}` },
    });
  };
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isSuperAdmin) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN_SUPER_ADMIN', message: 'Platform super administrator access required' },
    });
    return;
  }
  next();
};
