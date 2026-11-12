import { Request, Response } from 'express';
import { Course, LearningProgress } from '../models';
import { createCourseSchema, submitQuizSchema } from '@yoobic/validation';

export const listCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const courses = await Course.findAll({
      where: { organizationId: orgId, isActive: true },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const parse = createCourseSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    const course = await Course.create({
      ...parse.data,
      organizationId: orgId,
    } as any);

    res.status(201).json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { id } = req.params;

    const course = await Course.findOne({
      where: { id, organizationId: orgId },
      include: [
        {
          model: LearningProgress,
          as: 'progress',
          where: { userId: req.user!.id },
          required: false,
        },
      ],
    });

    if (!course) {
      res.status(404).json({ success: false, error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } });
      return;
    }

    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const { courseId, lessonId } = req.params;

    const course = await Course.findOne({ where: { id: courseId, organizationId: orgId } });
    if (!course) {
      res.status(404).json({ success: false, error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } });
      return;
    }

    const parse = submitQuizSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parse.error.format() } });
      return;
    }

    // Locate the quiz inside course modules
    let quiz: any = null;
    for (const mod of course.modules) {
      const lesson = mod.lessons?.find((l: any) => l.id === lessonId);
      if (lesson && lesson.quiz) {
        quiz = lesson.quiz;
        break;
      }
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      res.status(400).json({ success: false, error: { code: 'QUIZ_NOT_FOUND', message: 'No quiz found for this lesson' } });
      return;
    }

    const { answers } = parse.data;
    let correctCount = 0;
    quiz.questions.forEach((q: any) => {
      if (answers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = scorePercentage >= (quiz.passingScorePercentage || 80);

    const [progress] = await LearningProgress.findOrCreate({
      where: { userId: req.user!.id, courseId: course.id },
      defaults: {
        userId: req.user!.id,
        courseId: course.id,
        organizationId: orgId,
        completedLessonIds: [lessonId],
        quizScore: scorePercentage,
        passed,
        completedAt: passed ? new Date() : null,
      },
    });

    if (!progress.isNewRecord) {
      progress.quizScore = scorePercentage;
      progress.passed = passed;
      if (!progress.completedLessonIds.includes(lessonId)) {
        progress.completedLessonIds = [...progress.completedLessonIds, lessonId];
      }
      if (passed) progress.completedAt = new Date();
      await progress.save();
    }

    res.json({
      success: true,
      data: {
        scorePercentage,
        passingThreshold: quiz.passingScorePercentage || 80,
        passed,
        correctCount,
        totalQuestions: quiz.questions.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const course = await Course.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!course) {
      res.status(404).json({ success: false, error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } });
      return;
    }
    await course.update(req.body);
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const course = await Course.findOne({ where: { id: req.params.id, organizationId: orgId } });
    if (!course) {
      res.status(404).json({ success: false, error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } });
      return;
    }
    course.isActive = false;
    await course.save();
    res.json({ success: true, data: { message: 'Course deactivated successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getMyProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.tenant!.organizationId;
    const progressList = await LearningProgress.findAll({
      where: { userId: req.user!.id, organizationId: orgId },
      include: [{ model: Course, as: 'course' }],
    });
    res.json({ success: true, data: progressList });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
