import { Request, Response } from 'express';
import { Role, Permission, RolePermission } from '../models';

export const listRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const roles = await Role.findAll({
      where: { organizationId: orgId },
      include: [{ model: Permission, as: 'permissions' }],
      order: [['isSystem', 'DESC'], ['name', 'ASC']],
    });
    res.json({ success: true, data: roles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const role = await Role.findOne({
      where: { id: req.params.id, organizationId: orgId },
      include: [{ model: Permission, as: 'permissions' }],
    });
    if (!role) {
      res.status(404).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Role not found' } });
      return;
    }
    res.json({ success: true, data: role });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { name, code, description, permissionCodes } = req.body;

    if (!name || !code) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'name and code are required' } });
      return;
    }

    const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const existing = await Role.findOne({ where: { organizationId: orgId, code: normalizedCode } });
    if (existing) {
      res.status(409).json({ success: false, error: { code: 'ROLE_EXISTS', message: 'A role with this code already exists' } });
      return;
    }

    const role = await Role.create({
      organizationId: orgId,
      name,
      code: normalizedCode,
      description: description || null,
      isSystem: false,
    });

    if (Array.isArray(permissionCodes) && permissionCodes.length > 0) {
      for (const pCode of permissionCodes) {
        const [perm] = await Permission.findOrCreate({
          where: { code: pCode },
          defaults: { code: pCode, name: pCode, category: pCode.split('.')[0] || 'general' },
        });
        await (role as any).addPermission(perm);
      }
    }

    const fullRole = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions' }],
    });

    res.status(201).json({ success: true, data: fullRole });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const role = await Role.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!role) {
      res.status(404).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Role not found' } });
      return;
    }

    const { name, description, permissionCodes } = req.body;
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    await role.save();

    if (Array.isArray(permissionCodes)) {
      await RolePermission.destroy({ where: { roleId: role.id } });
      for (const pCode of permissionCodes) {
        const [perm] = await Permission.findOrCreate({
          where: { code: pCode },
          defaults: { code: pCode, name: pCode, category: pCode.split('.')[0] || 'general' },
        });
        await (role as any).addPermission(perm);
      }
    }

    const updated = await Role.findByPk(role.id, {
      include: [{ model: Permission, as: 'permissions' }],
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const role = await Role.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!role) {
      res.status(404).json({ success: false, error: { code: 'ROLE_NOT_FOUND', message: 'Role not found' } });
      return;
    }

    if (role.isSystem) {
      res.status(400).json({ success: false, error: { code: 'SYSTEM_ROLE_CANNOT_BE_DELETED', message: 'Built-in system roles cannot be deleted' } });
      return;
    }

    await RolePermission.destroy({ where: { roleId: role.id } });
    await role.destroy();
    res.json({ success: true, data: { message: 'Role deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const listPermissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const permissions = await Permission.findAll({ order: [['category', 'ASC'], ['code', 'ASC']] });
    res.json({ success: true, data: permissions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
