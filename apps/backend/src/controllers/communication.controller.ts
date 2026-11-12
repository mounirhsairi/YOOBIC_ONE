import { Request, Response } from 'express';
import { Announcement, Community, Post, Comment, User } from '../models';
import { createAnnouncementSchema, createCommunitySchema, createPostSchema, createCommentSchema } from '@yoobic/validation';

export const listAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const announcements = await Announcement.findAll({
      where: { organizationId: orgId },
      include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['isPinned', 'DESC'], ['publishedAt', 'DESC']],
    });
    res.json({ success: true, data: announcements });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = createAnnouncementSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const announcement = await Announcement.create({
      ...parse.data,
      organizationId: orgId,
      authorId: req.user!.id,
    } as any);

    res.status(201).json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const announcement = await Announcement.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!announcement) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Announcement not found' } });
      return;
    }
    await announcement.update(req.body);
    res.json({ success: true, data: announcement });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const announcement = await Announcement.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!announcement) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Announcement not found' } });
      return;
    }
    await announcement.destroy();
    res.json({ success: true, data: { message: 'Announcement deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const listCommunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const communities = await Community.findAll({
      where: { organizationId: orgId },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: communities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createCommunity = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = createCommunitySchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const community = await Community.create({
      ...parse.data,
      organizationId: orgId,
    } as any);

    res.status(201).json({ success: true, data: community });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const listPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { communityId } = req.params;

    // P0 security fix: verify community belongs to this organization
    const community = await Community.findOne({ where: { id: communityId, organizationId: orgId } });
    if (!community) {
      res.status(404).json({ success: false, error: { code: 'COMMUNITY_NOT_FOUND', message: 'Community not found in this organization' } });
      return;
    }

    const posts = await Post.findAll({
      where: { communityId },
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: posts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const parse = createPostSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const post = await Post.create({
      ...parse.data,
      communityId,
      authorId: req.user!.id,
    } as any);

    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { postId } = req.params;
    const parse = createCommentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    // P0 security fix: verify post belongs to a community in this organization
    const post = await Post.findByPk(postId, {
      include: [{ model: Community, as: 'community', where: { organizationId: orgId }, required: true }],
    });
    if (!post) {
      res.status(404).json({ success: false, error: { code: 'POST_NOT_FOUND', message: 'Post not found in this organization' } });
      return;
    }

    const comment = await Comment.create({
      content: parse.data.content,
      postId,
      authorId: req.user!.id,
    });

    post.commentsCount += 1;
    await post.save();

    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
