'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  Building2,
  Users,
  Search,
  Plus,
  ShieldCheck,
  Eye,
  EyeOff,
  XCircle,
  FileText,
  Lock,
  Mail,
  Globe,
  ChevronDown,
  ArrowRight,
  LogOut,
  HelpCircle,
  Sparkles,
  BarChart3,
  GraduationCap,
  Megaphone,
  CreditCard,
  Settings,
  Calendar,
  CheckSquare,
  MapPin,
  Award,
  Layers,
  Send,
  Download,
  RefreshCw,
  Trash2,
  Check
} from 'lucide-react';
import { apiClient, getStoredToken, getStoredOrgId, setStoredAuth, clearStoredAuth } from '../lib/api';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black mt-2 text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </div>
);

// High-fidelity YOOBIC Brand Logo Component
const YoobicLogo = ({ showTag = true }: { showTag?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 shadow-md shadow-blue-500/20">
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-black tracking-tight text-slate-900">YOOBIC</span>
      {showTag && (
        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-2xs">
          ONE
        </span>
      )}
    </div>
  </div>
);

export default function AppRoot() {
  type NavTab =
    | 'dashboard'
    | 'tasks'
    | 'forms'
    | 'locations'
    | 'employees'
    | 'organizations';

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'English' | 'Français' | 'Español' | 'Deutsch'>('English');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const [ssoDomain, setSsoDomain] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(false);

  // Global Data State from Backend
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Operations Data
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskAnalytics, setTaskAnalytics] = useState<any>({
    total: 0,
    todo: 0,
    inProgress: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    completionRate: 0,
  });
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [auditTemplates, setAuditTemplates] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [courses, setCourses] = useState<any[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [platformOrgs, setPlatformOrgs] = useState<any[]>([]);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgManagerEmail, setNewOrgManagerEmail] = useState('');
  const [newOrgManagerFirstName, setNewOrgManagerFirstName] = useState('');
  const [newOrgManagerLastName, setNewOrgManagerLastName] = useState('');

  // Modals & Interaction States
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Task creation modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskInstructions, setNewTaskInstructions] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskStoreId, setNewTaskStoreId] = useState('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [newTaskFormId, setNewTaskFormId] = useState('');
  const [forms, setForms] = useState<any[]>([]);
  const [formBuilderOpen, setFormBuilderOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [fbTitle, setFbTitle] = useState('');
  const [fbCategory, setFbCategory] = useState('Regular Maintenance');
  const [fbDescription, setFbDescription] = useState('');
  const [fbDuration, setFbDuration] = useState(60);
  const [fbPages, setFbPages] = useState<any[]>([{ id: 'p1', title: 'Page 1', fields: [] }]);
  const [fbActivePage, setFbActivePage] = useState(0);
  const [fbSaving, setFbSaving] = useState(false);
  const [newTaskCategory, setNewTaskCategory] = useState('Operations');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [newTaskRequiresPhoto, setNewTaskRequiresPhoto] = useState(true);
  const [newTaskRequiresValidation, setNewTaskRequiresValidation] = useState(true);
  const [newTaskRequiresSignature, setNewTaskRequiresSignature] = useState(false);

  // Task template creation modal
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplPriority, setNewTplPriority] = useState('HIGH');
  const [newTplCategory, setNewTplCategory] = useState('Operations');
  const [newTplRequiresPhoto, setNewTplRequiresPhoto] = useState(true);
  const [newTplRecurrence, setNewTplRecurrence] = useState(true);
  const [newTplRecurrenceRule, setNewTplRecurrenceRule] = useState('DAILY');
  const [newTplRecurrenceTime, setNewTplRecurrenceTime] = useState('08:00');

  // Store creation modal
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCode, setNewStoreCode] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreCity, setNewStoreCity] = useState('');
  const [newStoreProvince, setNewStoreProvince] = useState('QC');
  const [newStorePostalCode, setNewStorePostalCode] = useState('');
  const [newStoreCountry, setNewStoreCountry] = useState('Canada');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreTimezone, setNewStoreTimezone] = useState('America/Toronto');
  const [newStoreLat, setNewStoreLat] = useState('');
  const [newStoreLng, setNewStoreLng] = useState('');
  const [newStoreHours, setNewStoreHours] = useState('');
  const [newStoreNotes, setNewStoreNotes] = useState('');

  // Employee invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRoleCode, setInviteRoleCode] = useState('EMPLOYEE');
  const [inviteStoreId, setInviteStoreId] = useState('');
  const [inviteJobTitle, setInviteJobTitle] = useState('Associate');

  // Community post creation
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Announcement modal
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementIsPinned, setAnnouncementIsPinned] = useState(false);

  // Audit Schedule modal
  const [showScheduleAuditModal, setShowScheduleAuditModal] = useState(false);
  const [auditTemplateId, setAuditTemplateId] = useState('');
  const [auditStoreId, setAuditStoreId] = useState('');
  const [auditDate, setAuditDate] = useState('');

  // Course creation modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Compliance');
  const [courseMinutes, setCourseMinutes] = useState(20);

  // Filter states
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [taskSearch, setTaskSearch] = useState('');

  // ─────────────────────────────────────────────────────────────────────────
  // Authentication & Session Bootstrap
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) return;

      try {
        const res = await apiClient.getMe();
        if (res.success && res.data) {
          setIsAuthenticated(true);
          setCurrentUser(res.data.user);
          setCurrentOrg(res.data.activeOrganization || null);
        } else {
          clearStoredAuth();
        }
      } catch {
        clearStoredAuth();
      }
    };
    initAuth();
  }, []);

  // Fetch all module data whenever authenticated or active organization changes
  const loadPlatformData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    setDataError(null);

    try {
      const [formsRes, 
        tasksRes,
        analyticsRes,
        storesRes,
        auditsRes,
        templatesRes,
        announcementsRes,
        communitiesRes,
        coursesRes,
        taskTemplatesRes,
        certificatesRes,
        employeesRes,
        rolesRes,
      ] = await Promise.all([
        apiClient.getForms(),
        apiClient.getTasks(),
        apiClient.getTaskAnalytics(),
        apiClient.getStores(),
        apiClient.listAudits(),
        apiClient.listAuditTemplates(),
        apiClient.listAnnouncements(),
        apiClient.listCommunities(),
        apiClient.listCourses(),
        apiClient.listTaskTemplates(),
        apiClient.listOrgCertificates({ limit: 50 }),
        apiClient.getEmployees(),
        apiClient.listRoles(),
      ]);

      if (formsRes?.success) setForms(formsRes.data || []);
        if (tasksRes.success) setTasks(tasksRes.data || []);
      if (analyticsRes.success) setTaskAnalytics(analyticsRes.data || {});
      if (storesRes.success) setStores(storesRes.data || []);
      if (auditsRes.success) setAudits(auditsRes.data || []);
      if (templatesRes.success) setAuditTemplates(templatesRes.data || []);
      if (announcementsRes.success) setAnnouncements(announcementsRes.data || []);
      if (communitiesRes.success) {
        const commList = communitiesRes.data || [];
        setCommunities(commList);
        if (commList.length > 0 && !selectedCommunityId) {
          setSelectedCommunityId(commList[0].id);
          const postsRes = await apiClient.listPosts(commList[0].id);
          if (postsRes.success) setCommunityPosts(postsRes.data || []);
        }
      }
      if (coursesRes.success) setCourses(coursesRes.data || []);
      if (taskTemplatesRes.success) setTaskTemplates(taskTemplatesRes.data || []);
      if (certificatesRes.success) setCertificates(certificatesRes.data || []);
      if (employeesRes.success) setEmployees(employeesRes.data || []);
      if (rolesRes.success) setRoles(rolesRes.data || []);

      if (currentUser?.isSuperAdmin) {
        const statsRes = await apiClient.getPlatformStats();
        if (statsRes.success) setPlatformStats(statsRes.data);
        const orgsRes = await apiClient.listOrganizations();
        if (orgsRes.success) setPlatformOrgs(orgsRes.data || []);
      }
    } catch (err: any) {
      setDataError(err.message || 'Error loading dashboard telemetry');
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated, currentUser?.isSuperAdmin, selectedCommunityId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPlatformData();
    }
  }, [isAuthenticated, loadPlatformData]);

  // Load community posts when community changes
  useEffect(() => {
    if (selectedCommunityId && isAuthenticated) {
      apiClient.listPosts(selectedCommunityId).then((res) => {
        if (res.success) setCommunityPosts(res.data || []);
      });
    }
  }, [selectedCommunityId, isAuthenticated]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await apiClient.login({ email, password });
      if (res.success && res.data) {
        setStoredAuth(res.data.tokens.accessToken, res.data.activeOrganization?.id, res.data.tokens.refreshToken);
        setIsAuthenticated(true);
        setCurrentUser(res.data.user);
        setCurrentOrg(res.data.activeOrganization || null);
        window.location.hash = '#/app/dashboard';
      } else {
        setLoginError(res.error?.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Unable to connect to authentication service.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickDemoLogin = (userType: 'admin' | 'manager' | 'employee') => {
    if (userType === 'admin') {
      setEmail('admin@yoobic-demo.com');
      setPassword('Password123!');
    } else if (userType === 'manager') {
      setEmail('sarah.manager@globalretail.com');
      setPassword('Password123!');
    } else {
      setEmail('alex.frontline@globalretail.com');
      setPassword('Welcome123!');
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch {}
    clearStoredAuth();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentOrg(null);
    setEmail('');
    setPassword('');
    window.location.hash = '#/noauth/login';
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Operations & Tasks Actions
  // ─────────────────────────────────────────────────────────────────────────
  const handleApprove = async (taskId: string) => {
    setActionLoading(true);
    try {
      const res = await apiClient.validateTask(taskId, { decision: 'APPROVED' });
      if (res.success) {
        await loadPlatformData();
        setSelectedTask(null);
      } else {
        alert(res.error?.message || 'Failed to approve task.');
      }
    } catch (err: any) {
      alert(err.message || 'Error approving task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (taskId: string) => {
    if (!rejectReason.trim()) {
      alert('A rejection reason is strictly required by operational compliance.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiClient.validateTask(taskId, { decision: 'REJECTED', reason: rejectReason });
      if (res.success) {
        await loadPlatformData();
        setSelectedTask(null);
        setIsRejecting(false);
        setRejectReason('');
      } else {
        alert(res.error?.message || 'Failed to reject task.');
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting task.');
    } finally {
      setActionLoading(false);
    }
  };

  
  const openNewFormBuilder = () => {
    setEditingFormId(null);
    setFbTitle('');
    setFbCategory('Regular Maintenance');
    setFbDescription('');
    setFbDuration(60);
    setFbPages([{ id: `p_${Date.now()}`, title: 'Page 1', fields: [] }]);
    setFbActivePage(0);
    setFormBuilderOpen(true);
  };

  const openEditForm = (form: any) => {
    setEditingFormId(form.id);
    setFbTitle(form.title || '');
    setFbCategory(form.category || 'Regular Maintenance');
    setFbDescription(form.description || '');
    setFbDuration(form.estimatedDurationMinutes || 60);
    setFbPages(form.pages?.length ? JSON.parse(JSON.stringify(form.pages)) : [{ id: `p_${Date.now()}`, title: 'Page 1', fields: [] }]);
    setFbActivePage(0);
    setFormBuilderOpen(true);
  };

  const saveFormBuilder = async () => {
    if (!fbTitle.trim()) {
      alert('Titre du formulaire requis');
      return;
    }
    setFbSaving(true);
    try {
      const payload = {
        title: fbTitle.trim(),
        description: fbDescription || null,
        category: fbCategory,
        estimatedDurationMinutes: fbDuration,
        pages: fbPages,
        isActive: true,
      };
      let res;
      if (editingFormId) {
        res = await apiClient.updateForm(editingFormId, payload);
      } else {
        res = await apiClient.createForm(payload);
      }
      if (res.success) {
        const list = await apiClient.getForms();
        if (list.success) setForms(list.data || []);
        setFormBuilderOpen(false);
      } else {
        alert(res.error?.message || 'Erreur enregistrement formulaire');
      }
    } catch (e: any) {
      alert(e.message || 'Erreur réseau');
    } finally {
      setFbSaving(false);
    }
  };

  const deleteFormModel = async (id: string) => {
    if (!confirm('Supprimer ce modèle de formulaire ?')) return;
    const res = await apiClient.deleteForm(id);
    if (res.success) {
      setForms((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const addFbPage = () => {
    const id = `p_${Date.now()}`;
    setFbPages((prev) => [...prev, { id, title: `Page ${prev.length + 1}`, fields: [] }]);
    setFbActivePage(fbPages.length);
  };

  const addFbField = (type: string) => {
    const id = `f_${Date.now()}`;
    const defaults: any = {
      id,
      type,
      label: type === 'yes_no' ? 'Question Oui/Non' : type === 'photo' ? 'Photos' : type === 'info' ? 'Information' : 'Nouveau champ',
      required: false,
    };
    if (type === 'photo') defaults.max = 5;
    if (type === 'yes_no') defaults.options = ['Oui', 'Non'];
    if (type === 'select') defaults.options = ['Option 1', 'Option 2'];
    if (type === 'image') defaults.url = '';
    if (type === 'document') { defaults.fileName = 'document.pdf'; defaults.url = ''; defaults.fileSize = ''; }
    if (type === 'info' || type === 'instruction') defaults.content = '';
    setFbPages((prev) => {
      const pages = [...prev];
      const page = { ...pages[fbActivePage], fields: [...(pages[fbActivePage].fields || []), defaults] };
      pages[fbActivePage] = page;
      return pages;
    });
  };

  const updateFbField = (fieldIdx: number, key: string, value: any) => {
    setFbPages((prev) => {
      const pages = [...prev];
      const fields = [...(pages[fbActivePage].fields || [])];
      fields[fieldIdx] = { ...fields[fieldIdx], [key]: value };
      pages[fbActivePage] = { ...pages[fbActivePage], fields };
      return pages;
    });
  };

  const removeFbField = (fieldIdx: number) => {
    setFbPages((prev) => {
      const pages = [...prev];
      const fields = [...(pages[fbActivePage].fields || [])];
      fields.splice(fieldIdx, 1);
      pages[fbActivePage] = { ...pages[fbActivePage], fields };
      return pages;
    });
  };


  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setActionLoading(true);

    try {
      const checklist: any[] = [
        { id: 'c1', title: 'Point de contrôle réalisé', isRequired: true, type: 'CHECKBOX' },
      ];
      if (newTaskRequiresPhoto) {
        checklist.push({ id: 'c2', title: 'Photo de preuve', isRequired: true, type: 'PHOTO' });
      }
      if (newTaskRequiresSignature) {
        checklist.push({ id: 'c3', title: 'Signature', isRequired: true, type: 'SIGNATURE' });
      }

      const res = await apiClient.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        instructions: newTaskInstructions.trim() || undefined,
        priority: newTaskPriority as any,
        category: newTaskCategory,
        storeId: newTaskStoreId || (stores[0]?.id ?? null),
        assignedUserId: newTaskAssigneeId || null,
        formTemplateId: newTaskFormId || null,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
        estimatedDurationMinutes: newTaskDuration ? parseInt(newTaskDuration, 10) : undefined,
        requiresPhotoEvidence: newTaskRequiresPhoto,
        requiresValidation: newTaskRequiresValidation,
        requiresSignature: newTaskRequiresSignature,
        checklist,
      });

      if (res.success) {
        await loadPlatformData();
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskInstructions('');
        setShowCreateTaskModal(false);
      } else {
        alert(res.error?.message || 'Échec de la création de la mission.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur création mission.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiClient.createTaskTemplate({
        title: newTplTitle.trim(),
        priority: newTplPriority,
        category: newTplCategory,
        requiresPhotoEvidence: newTplRequiresPhoto,
        requiresValidation: true,
        recurrenceEnabled: newTplRecurrence,
        recurrenceRule: newTplRecurrence ? newTplRecurrenceRule : null,
        recurrenceTime: newTplRecurrence ? newTplRecurrenceTime : null,
        recurrenceDaysOfWeek: newTplRecurrence ? [1, 2, 3, 4, 5, 6] : null,
        checklist: [
          { id: 'c1', title: 'Point de contrôle principal', isRequired: true, type: 'CHECKBOX' },
          ...(newTplRequiresPhoto
            ? [{ id: 'c2', title: 'Photo de preuve', isRequired: true, type: 'PHOTO' }]
            : []),
        ],
        isActive: true,
      });
      if (res.success) {
        const list = await apiClient.listTaskTemplates();
        if (list.success) setTaskTemplates(list.data || []);
        setNewTplTitle('');
        setShowCreateTemplateModal(false);
      } else {
        alert(res.error?.message || 'Impossible de créer le modèle.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur création modèle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await apiClient.deleteTask(taskId);
      if (res.success) {
        await loadPlatformData();
        if (selectedTask?.id === taskId) setSelectedTask(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting task.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Store & Team Actions
  // ─────────────────────────────────────────────────────────────────────────

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiClient.createOrganization({
        name: newOrgName.trim(),
        timezone: 'America/Toronto',
        defaultLanguage: 'fr',
        currency: 'CAD',
        ...(newOrgManagerEmail.trim()
          ? {
              managerEmail: newOrgManagerEmail.trim().toLowerCase(),
              managerFirstName: newOrgManagerFirstName.trim() || 'Responsable',
              managerLastName: newOrgManagerLastName.trim() || 'Organisation',
            }
          : {}),
      } as any);
      if (res.success) {
        const orgsRes = await apiClient.listOrganizations();
        if (orgsRes.success) setPlatformOrgs(orgsRes.data || []);
        setNewOrgName('');
        setNewOrgManagerEmail('');
        setNewOrgManagerFirstName('');
        setNewOrgManagerLastName('');
        setShowCreateOrgModal(false);
        alert('Organisation créée. Le responsable peut se connecter (mot de passe Password123! s\'il est nouveau).');
      } else {
        alert(res.error?.message || 'Création impossible');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreCode.trim()) return;
    setActionLoading(true);

    try {
      const res = await apiClient.createStore({
        name: newStoreName.trim(),
        code: newStoreCode.trim().toUpperCase(),
        address: newStoreAddress.trim() || undefined,
        city: newStoreCity.trim() || undefined,
        province: newStoreProvince || undefined,
        postalCode: newStorePostalCode.trim().toUpperCase() || undefined,
        country: newStoreCountry || 'Canada',
        phone: newStorePhone.trim() || undefined,
        timezone: newStoreTimezone || 'America/Toronto',
        latitude: newStoreLat ? parseFloat(newStoreLat) : undefined,
        longitude: newStoreLng ? parseFloat(newStoreLng) : undefined,
        openingHours: newStoreHours.trim() || undefined,
        notes: newStoreNotes.trim() || undefined,
      });

      if (res.success) {
        await loadPlatformData();
        setNewStoreName('');
        setNewStoreCode('');
        setNewStoreAddress('');
        setNewStoreCity('');
        setNewStorePostalCode('');
        setNewStorePhone('');
        setNewStoreLat('');
        setNewStoreLng('');
        setNewStoreHours('');
        setNewStoreNotes('');
        setShowCreateStoreModal(false);
      } else {
        alert(res.error?.message || 'Impossible de créer le magasin.');
      }
    } catch (err: any) {
      alert(err.message || 'Erreur création magasin.');
    } finally {
      setActionLoading(false);
    }
  };


  // ─────────────────────────────────────────────────────────────────────────
  // Employee Invite Action
  // ─────────────────────────────────────────────────────────────────────────
  const handleInviteEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteFirstName.trim()) return;
    setActionLoading(true);

    try {
      const res = await apiClient.inviteEmployee({
        email: inviteEmail,
        firstName: inviteFirstName,
        lastName: inviteLastName || 'Associate',
        roleCode: inviteRoleCode,
        storeId: inviteStoreId || (stores[0]?.id ?? undefined),
        jobTitle: inviteJobTitle,
      });

      if (res.success) {
        await loadPlatformData();
        setInviteEmail('');
        setInviteFirstName('');
        setInviteLastName('');
        setShowInviteModal(false);
        alert(`Invitation sent to ${inviteEmail}!`);
      } else {
        alert(res.error?.message || 'Failed to invite employee.');
      }
    } catch (err: any) {
      alert(err.message || 'Error inviting employee.');
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Communication Actions
  // ─────────────────────────────────────────────────────────────────────────
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    setActionLoading(true);

    try {
      const res = await apiClient.createAnnouncement({
        title: announcementTitle,
        content: announcementContent,
        isPinned: announcementIsPinned,
        priority: announcementIsPinned ? 'HIGH' : 'NORMAL',
      });

      if (res.success) {
        await loadPlatformData();
        setAnnouncementTitle('');
        setAnnouncementContent('');
        setShowAnnouncementModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error publishing announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !selectedCommunityId) return;
    setActionLoading(true);

    try {
      const res = await apiClient.createPost(selectedCommunityId, {
        title: newPostTitle.trim() || 'Store Update',
        content: newPostContent,
      });

      if (res.success) {
        const postsRes = await apiClient.listPosts(selectedCommunityId);
        if (postsRes.success) setCommunityPosts(postsRes.data || []);
        setNewPostTitle('');
        setNewPostContent('');
      }
    } catch (err: any) {
      alert(err.message || 'Error publishing post.');
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LMS Actions
  // ─────────────────────────────────────────────────────────────────────────
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;
    setActionLoading(true);

    try {
      const res = await apiClient.createCourse({
        title: courseTitle,
        category: courseCategory,
        estimatedDurationMinutes: Number(courseMinutes),
        modules: [
          {
            id: `mod-${Date.now()}`,
            title: 'Foundational Knowledge',
            lessons: [
              {
                id: `l-${Date.now()}`,
                title: 'Introduction & Operational Standard',
                quiz: {
                  passingScorePercentage: 80,
                  questions: [
                    { id: 'q1', text: 'What is the required temperature for cold chain?', options: ['4°C', '15°C'], correctOptionIndex: 0 },
                  ],
                },
              },
            ],
          },
        ],
      });

      if (res.success) {
        await loadPlatformData();
        setCourseTitle('');
        setShowCourseModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error creating course.');
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Audits Actions
  // ─────────────────────────────────────────────────────────────────────────
  const handleScheduleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditTemplateId || !auditStoreId || !auditDate) return;
    setActionLoading(true);

    try {
      const res = await apiClient.scheduleAudit({
        templateId: auditTemplateId,
        storeId: auditStoreId,
        scheduledDate: auditDate,
      });

      if (res.success) {
        await loadPlatformData();
        setShowScheduleAuditModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error scheduling audit.');
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // VIEW 1: AUTHENTIC YOOBIC ONE LOGIN (app.yoobic.com/#/noauth/login)
  // -------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
        <header className="w-full px-6 py-5 flex items-center justify-between border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
          <YoobicLogo />
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition border border-slate-200 shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                {(['English', 'Français', 'Español', 'Deutsch'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition cursor-pointer ${
                      language === lang ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[430px] space-y-6">
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Log in to YOOBIC ONE
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your credentials to access your frontline workspace
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{loginError}</p>
                </div>
              )}

              {forgotPasswordMessage && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-blue-700 text-xs">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">
                    Password recovery instructions have been sent to your administrator.
                  </p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Username / Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@yoobic-demo.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                    <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordMessage(true)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer">
                    Remember my username
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loginLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  onClick={() => setShowSsoModal(true)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Log in with Single Sign-On (SSO)
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Panel */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1-Click Test Credentials</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-blue-900">Admin Demo</p>
                  <p className="text-[10px] text-slate-500">Super Owner</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('manager')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-emerald-900">Manager Demo</p>
                  <p className="text-[10px] text-slate-500">Store Lead</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('employee')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-indigo-900">Associate Demo</p>
                  <p className="text-[10px] text-slate-500">Frontline Team</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SSO Modal */}
        {showSsoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">Enterprise Single Sign-On</h3>
                <button onClick={() => setShowSsoModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Enter your company domain or email to be redirected to your identity provider (SAML 2.0 / Okta / Azure AD).
              </p>
              <input
                type="text"
                value={ssoDomain}
                onChange={(e) => setSsoDomain(e.target.value)}
                placeholder="yourcompany.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSsoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`Redirecting to SSO identity provider for ${ssoDomain || 'your organization'}...`);
                    setShowSsoModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Continue to SSO
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/50">
          <p>© 2026 YOOBIC ONE Enterprise SaaS Platform. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW 2: AUTHENTICATED PRODUCTION DASHBOARD (CONNECTED TO LIVE REST API)
  // -------------------------------------------------------------------------
  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = taskFilter === 'ALL' || t.status === taskFilter;
    const matchesSearch = !taskSearch.trim() || t.title.toLowerCase().includes(taskSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <YoobicLogo />
          </div>

          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization</p>
            <p className="text-xs font-bold text-white truncate mt-0.5">{currentOrg?.name || 'Global Retailers Corp'}</p>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400">
              {currentOrg?.subscriptionPlan || 'ENTERPRISE'}
            </span>
          </div>

          <nav className="p-3 space-y-1">
{[
              { id: 'dashboard', label: "Vue d'ensemble", icon: BarChart3 },
              { id: 'tasks', label: 'Missions & Tâches', icon: CheckSquare, badge: tasks.filter(t => ['SUBMITTED', 'TODO', 'IN_PROGRESS'].includes(t.status)).length },
              { id: 'forms', label: 'Modèles de formulaires', icon: FileText, count: forms.length },
              { id: 'locations', label: 'Sites & Magasins', icon: MapPin, count: stores.length },
              { id: 'employees', label: 'Équipe & Utilisateurs', icon: Users, count: employees.length },
              ...(currentUser?.isSuperAdmin
                ? [{ id: 'organizations', label: 'Organisations (plateforme)', icon: Building2, count: platformOrgs.length }]
                : []),
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                      {item.badge}
                    </span>
                  ) : item.count !== undefined ? (
                    <span className="text-[10px] text-slate-400 font-mono">{item.count}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                {currentUser?.firstName?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
            <span>REST API v1 Live</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {activeTab === 'dashboard' && "Vue d'ensemble Opérationnelle"}
              {activeTab === 'tasks' && 'Missions & Tâches Terrain'}
              {activeTab === 'forms' && 'Modèles de formulaires missions'}
              {activeTab === 'templates' && 'Modèles de missions & récurrence'}
              {activeTab === 'locations' && 'Réseau de Magasins & Établissements'}
              {activeTab === 'audits' && 'Audits, Inspections & Visites'}
              {activeTab === 'communication' && 'Communication & Communautés'}
              {activeTab === 'learning' && 'Parcours de Formation Frontline'}
              {activeTab === 'certificates' && 'Certificats délivrés'}
              {activeTab === 'employees' && 'Gestion des Employés & Rôles'}
              {activeTab === 'organizations' && 'Organisations (Super Admin)'}
              {activeTab === 'analytics' && 'Rapports & Conformité'}
              {activeTab === 'subscription' && 'Configuration & Organisation'}
            </h2>
            {loadingData && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synchronisation API...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadPlatformData()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Actualiser les données"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeTab === 'tasks' && (
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Mission</span>
              </button>
            )}

            {activeTab === 'locations' && (
              <button
                onClick={() => setShowCreateStoreModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Magasin</span>
              </button>
            )}

            {activeTab === 'employees' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Inviter un Employé</span>
              </button>
            )}

            {activeTab === 'communication' && (
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Annonce</span>
              </button>
            )}

            {activeTab === 'audits' && (
              <button
                onClick={() => setShowScheduleAuditModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Programmer Audit</span>
              </button>
            )}

            {activeTab === 'learning' && (
              <button
                onClick={() => setShowCourseModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Cours</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {dataError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-red-700 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{dataError}</span>
              </div>
              <button onClick={() => loadPlatformData()} className="font-bold underline cursor-pointer">
                Réessayer
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 1: DASHBOARD OVERVIEW
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Taux de Complétion"
                  value={`${taskAnalytics.completionRate || 0}%`}
                  subtitle={`${taskAnalytics.approved || 0} validées sur ${taskAnalytics.total || 0}`}
                  icon={CheckCircle2}
                  color="bg-emerald-600"
                />
                <MetricCard
                  title="Missions en attente de validation"
                  value={taskAnalytics.submitted || 0}
                  subtitle="Preuves photos à valider"
                  icon={Clock}
                  color="bg-amber-500"
                />
                <MetricCard
                  title="Missions en cours"
                  value={taskAnalytics.inProgress || 0}
                  subtitle="En exécution sur site"
                  icon={ClipboardList}
                  color="bg-blue-600"
                />
                <MetricCard
                  title="Sites Actifs"
                  value={stores.length}
                  subtitle="Sur 3 régions"
                  icon={Building2}
                  color="bg-indigo-600"
                />
              </div>

              {/* Submissions Requiring Attention & Audit Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Preuves Photos Récemment Soumises</h3>
                      <p className="text-xs text-slate-400">Cliquez pour inspecter la photo et approuver ou rejeter</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Voir toutes ({tasks.length})
                    </button>
                  </div>

                  {tasks.filter((t) => t.status === 'SUBMITTED').length === 0 ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                      <p className="text-xs font-medium">Toutes les soumissions ont été traitées !</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {tasks
                        .filter((t) => t.status === 'SUBMITTED')
                        .slice(0, 5)
                        .map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                                <p className="text-[11px] text-slate-400">
                                  {task.store?.name || 'Magasin Paris'} • Assigné à {task.assignee?.firstName || 'Frontline'}
                                </p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              À Valider
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Audit Health Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Derniers Audits de Conformité</h3>
                  <div className="space-y-3">
                    {audits.slice(0, 3).map((audit) => (
                      <div key={audit.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{audit.template?.title || 'Audit Hygiène'}</span>
                          <span className="text-xs font-black text-emerald-600">
                            {audit.score !== null ? `${audit.score}%` : 'Planifié'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {audit.store?.name || 'Downtown #12'} • {new Date(audit.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 2: TASKS & OPERATIONS
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden space-y-4">
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {(['ALL', 'SUBMITTED', 'IN_PROGRESS', 'TODO', 'APPROVED', 'REJECTED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTaskFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        taskFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'ALL' ? 'Toutes' : filter}
                    </button>
                  ))}
                </div>

                <div className="relative w-64">
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Rechercher une mission..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium">Aucune mission ne correspond aux critères.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                        <th className="py-3 px-5">Titre de la mission</th>
                        <th className="py-3 px-5">Magasin</th>
                        <th className="py-3 px-5">Priorité</th>
                        <th className="py-3 px-5">Statut</th>
                        <th className="py-3 px-5">Preuve Photo</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-5 font-bold text-slate-900">{t.title}</td>
                          <td className="py-3.5 px-5 text-slate-600">{t.store?.name || 'Tous sites'}</td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.priority === 'CRITICAL'
                                  ? 'bg-red-100 text-red-700'
                                  : t.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                t.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'SUBMITTED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : t.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            {t.requiresPhotoEvidence ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Requise
                              </span>
                            ) : (
                              <span className="text-slate-400">Non</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right space-x-2">
                            <button
                              onClick={() => setSelectedTask(t)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                            >
                              Inspecter
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                              title="Supprimer la mission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* ─────────────────────────────────────────────────────────────────
              TAB: FORM MODELS (mission formulaires multi-pages)
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'forms' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Modèles de formulaires</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chaque modèle définit les pages et questions que l&apos;opérateur parcourt sur mobile (détail → synthèse → pages).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewFormBuilder}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm"
                >
                  + Nouveau modèle
                </button>
              </div>

              {!formBuilderOpen && (
                <div className="grid md:grid-cols-2 gap-4">
                  {forms.length === 0 && (
                    <div className="col-span-2 bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">
                      Aucun modèle. Créez-en un ou redémarrez le backend pour charger les démos RDTS.
                    </div>
                  )}
                  {forms.map((form: any) => {
                    const pages = form.pages || [];
                    const fieldCount = pages.reduce((n: number, p: any) => n + (p.fields?.length || 0), 0);
                    return (
                      <div key={form.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                        <div className="flex justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{form.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{form.description || '—'}</p>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700">
                            {form.category || 'OPS'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100">{pages.length} pages</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100">{fieldCount} champs</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100">{form.estimatedDurationMinutes || '—'} min</span>
                        </div>
                        <ol className="text-[11px] text-slate-500 space-y-1 list-decimal list-inside">
                          {pages.slice(0, 6).map((pg: any) => (
                            <li key={pg.id}>{pg.title}</li>
                          ))}
                          {pages.length > 6 && <li>… +{pages.length - 6} pages</li>}
                        </ol>
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => openEditForm(form)} className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
                            Modifier
                          </button>
                          <button type="button" onClick={() => deleteFormModel(form.id)} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold">
                            Suppr.
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {formBuilderOpen && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-end bg-slate-50">
                    <div className="flex-1 min-w-[160px]">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Titre</label>
                      <input value={fbTitle} onChange={(e) => setFbTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="Ex: RDTS - Maintenance - Walmart" />
                    </div>
                    <div className="w-40">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Catégorie</label>
                      <input value={fbCategory} onChange={(e) => setFbCategory(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="w-28">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Durée (min)</label>
                      <input type="number" value={fbDuration} onChange={(e) => setFbDuration(Number(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <button type="button" onClick={() => setFormBuilderOpen(false)} className="px-3 py-2 text-xs font-bold text-slate-600">Annuler</button>
                    <button type="button" disabled={fbSaving} onClick={saveFormBuilder} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl disabled:opacity-50">
                      {fbSaving ? '…' : 'Enregistrer'}
                    </button>
                  </div>
                  <div className="p-4 border-b border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                    <textarea value={fbDescription} onChange={(e) => setFbDescription(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm" />
                  </div>

                  <div className="flex min-h-[420px]">
                    {/* Pages list */}
                    <div className="w-48 border-r border-slate-100 p-3 space-y-2 bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Pages / Synthèse</p>
                      {fbPages.map((pg: any, i: number) => (
                        <button
                          key={pg.id}
                          type="button"
                          onClick={() => setFbActivePage(i)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${i === fbActivePage ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                        >
                          {i + 1}. {pg.title || 'Sans titre'}
                        </button>
                      ))}
                      <button type="button" onClick={addFbPage} className="w-full py-2 text-xs font-bold text-blue-600 border border-dashed border-blue-300 rounded-xl">
                        + Page
                      </button>
                    </div>

                    {/* Page editor */}
                    <div className="flex-1 p-4 space-y-4">
                      {fbPages[fbActivePage] && (
                        <>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Titre de la page</label>
                            <input
                              value={fbPages[fbActivePage].title}
                              onChange={(e) => {
                                const v = e.target.value;
                                setFbPages((prev) => {
                                  const pages = [...prev];
                                  pages[fbActivePage] = { ...pages[fbActivePage], title: v };
                                  return pages;
                                });
                              }}
                              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {[
                              ['yes_no', 'Oui/Non'],
                              ['select', 'Choix'],
                              ['text', 'Texte'],
                              ['number', 'Nombre'],
                              ['textarea', 'Commentaire'],
                              ['photo', 'Photo'],
                              ['image', 'Image réf.'],
                              ['document', 'PDF'],
                              ['info', 'Info'],
                              ['instruction', 'Consigne'],
                            ].map(([type, label]) => (
                              <button key={type} type="button" onClick={() => addFbField(type)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700">
                                + {label}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-3">
                            {(fbPages[fbActivePage].fields || []).map((field: any, fi: number) => (
                              <div key={field.id} className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50/40">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{field.type}</span>
                                  <input
                                    value={field.label || ''}
                                    onChange={(e) => updateFbField(fi, 'label', e.target.value)}
                                    className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                    placeholder="Libellé de la question"
                                  />
                                  <label className="flex items-center gap-1 text-[10px] text-slate-600">
                                    <input type="checkbox" checked={!!field.required} onChange={(e) => updateFbField(fi, 'required', e.target.checked)} />
                                    Requis
                                  </label>
                                  <button type="button" onClick={() => removeFbField(fi)} className="text-red-500 text-xs font-bold px-2">✕</button>
                                </div>
                                {(field.type === 'info' || field.type === 'instruction') && (
                                  <textarea
                                    value={field.content || ''}
                                    onChange={(e) => updateFbField(fi, 'content', e.target.value)}
                                    rows={3}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                    placeholder="Texte affiché à l'opérateur"
                                  />
                                )}
                                {field.type === 'photo' && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span>Max photos</span>
                                    <input type="number" value={field.max || 5} onChange={(e) => updateFbField(fi, 'max', Number(e.target.value) || 1)} className="w-16 px-2 py-1 border rounded-lg" />
                                  </div>
                                )}
                                {(field.type === 'image' || field.type === 'document') && (
                                  <input
                                    value={field.url || ''}
                                    onChange={(e) => updateFbField(fi, 'url', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                    placeholder="URL image ou PDF"
                                  />
                                )}
                                {field.type === 'document' && (
                                  <div className="flex gap-2">
                                    <input value={field.fileName || ''} onChange={(e) => updateFbField(fi, 'fileName', e.target.value)} className="flex-1 px-2 py-1.5 border rounded-lg text-xs" placeholder="Nom fichier" />
                                    <input value={field.fileSize || ''} onChange={(e) => updateFbField(fi, 'fileSize', e.target.value)} className="w-24 px-2 py-1.5 border rounded-lg text-xs" placeholder="1.5 MB" />
                                  </div>
                                )}
                                {(field.type === 'select' || field.type === 'yes_no') && (
                                  <input
                                    value={(field.options || []).join(' | ')}
                                    onChange={(e) => updateFbField(fi, 'options', e.target.value.split('|').map((x: string) => x.trim()).filter(Boolean))}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                                    placeholder="Options séparées par |"
                                  />
                                )}
                              </div>
                            ))}
                            {(fbPages[fbActivePage].fields || []).length === 0 && (
                              <p className="text-xs text-slate-400 text-center py-8">Ajoutez des champs avec les boutons ci-dessus.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ─────────────────────────────────────────────────────────────────
              TAB 3: SITES & STORES DIRECTORY
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">{stores.length} site(s) — localisation Canada (adresse, province, GPS)</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {stores.map((store: any) => (
                  <div key={store.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">{store.code}</span>
                        <h3 className="font-bold text-slate-900 text-base mt-2">{store.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {[store.address, store.city, store.province, store.postalCode].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-[11px] text-slate-400">{store.country || 'Canada'} · {store.timezone || 'America/Toronto'}</p>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${store.isActive !== false ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                      <div><span className="text-slate-400">Téléphone</span><br /><span className="font-semibold">{store.phone || '—'}</span></div>
                      <div><span className="text-slate-400">Horaires</span><br /><span className="font-semibold">{store.openingHours || '—'}</span></div>
                      <div><span className="text-slate-400">GPS</span><br /><span className="font-semibold">{store.latitude != null && store.longitude != null ? `${store.latitude}, ${store.longitude}` : '—'}</span></div>
                      <div><span className="text-slate-400">Missions</span><br /><span className="font-bold text-slate-800">{tasks.filter((t: any) => t.storeId === store.id).length}</span></div>
                    </div>
                    {store.latitude != null && store.longitude != null && (
                      <a
                        href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Ouvrir dans Google Maps →
                      </a>
                    )}
                    {store.notes && <p className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-2">{store.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 4: AUDITS & VISITES
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'audits' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Modèles de Checklists d&apos;Audit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auditTemplates.map((template) => (
                    <div key={template.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <h4 className="font-bold text-xs text-slate-900">{template.title}</h4>
                      <p className="text-[11px] text-slate-500">{template.description || 'Inspection de routine'}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                        <span>Score de passage</span>
                        <span className="font-bold text-slate-700">{template.passingScorePercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-sm">
                  Historique des Audits Réalisés
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {audits.map((a) => (
                    <div key={a.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{a.template?.title || 'Audit'}</p>
                        <p className="text-slate-400 text-[11px]">{a.store?.name} • Auditeur: {a.auditor?.firstName || 'Inspecteur'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-600">{a.score !== null ? `${a.score}%` : 'En attente'}</span>
                        <p className="text-[10px] text-slate-400">{new Date(a.scheduledDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 5: COMMUNICATION & NEWSFEED
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'communication' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pinned Announcements */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Annonces Officielles</h3>
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2">
                    {ann.isPinned && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                        ÉPINGLÉE
                      </span>
                    )}
                    <h4 className="font-bold text-xs text-slate-900 mt-1">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      Par {ann.author?.firstName || 'Direction'} • {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Community Feed */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Publier un message d&apos;équipe</h3>
                  <form onSubmit={handleCreatePost} className="space-y-3">
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Sujet / Titre de la publication"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Partagez une réussite, une question ou une information opérationnelle..."
                      rows={3}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={actionLoading || !newPostContent.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Publier
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  {communityPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                          {post.author?.firstName?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{post.author?.firstName} {post.author?.lastName}</p>
                          <p className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800">{post.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 6: LEARNING MANAGEMENT SYSTEM (LMS)
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'learning' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                      {course.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.estimatedDurationMinutes || 20} min
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{course.title}</h3>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                    <span>Modules pédagogiques</span>
                    <span className="font-bold text-slate-800">{course.modules?.length || 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: TASK TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-slate-500">{taskTemplates.length} modèle(s) de mission</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplateModal(true)}
                    className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    + Nouveau modèle
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const res = await apiClient.runTaskRecurrence();
                        if (res.success) {
                          alert(`Récurrence exécutée : ${res.data?.created ?? 0} tâche(s) créée(s) aujourd'hui.`);
                          const tasksRes = await apiClient.getTasks();
                          if (tasksRes.success) setTasks(tasksRes.data || []);
                        } else {
                          alert(res.error?.message || 'Échec de la récurrence');
                        }
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    Lancer la récurrence du jour
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskTemplates.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400 text-sm">
                    Aucun modèle pour le moment. Créez-en via l&apos;API POST /task-templates.
                  </div>
                )}
                {taskTemplates.map((tpl: any) => (
                  <div key={tpl.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{tpl.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tpl.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {tpl.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{tpl.description || 'Pas de description'}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{tpl.priority}</span>
                      {tpl.category && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">{tpl.category}</span>}
                      {tpl.recurrenceEnabled && (
                        <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700">
                          Récurrence: {tpl.recurrenceRule || 'DAILY'} {tpl.recurrenceTime || ''}
                        </span>
                      )}
                      {tpl.requiresPhotoEvidence && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700">Photo requise</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{(tpl.checklist || []).length} étape(s) checklist</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3.5 px-6">Collaborateur</th>
                    <th className="py-3.5 px-6">Formation</th>
                    <th className="py-3.5 px-6">Score</th>
                    <th className="py-3.5 px-6">Code certificat</th>
                    <th className="py-3.5 px-6">Délivré le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        Aucun certificat délivré pour le moment.
                      </td>
                    </tr>
                  )}
                  {certificates.map((cert: any) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {cert.user?.firstName} {cert.user?.lastName}
                        <div className="text-[10px] font-normal text-slate-400">{cert.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700">{cert.course?.title || cert.title}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {cert.scorePercentage != null ? `${cert.scorePercentage}%` : '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-[11px] text-slate-600">{cert.certificateCode}</td>
                      <td className="py-3.5 px-6 text-slate-500">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 7: EMPLOYEES & USERS DIRECTORY
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'employees' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                    <th className="py-3.5 px-6">Collaborateur</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Rôle Opérationnel</th>
                    <th className="py-3.5 px-6">Magasin Affecté</th>
                    <th className="py-3.5 px-6">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {emp.user?.firstName} {emp.user?.lastName}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{emp.user?.email}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {emp.role?.name || emp.role?.code || 'Collaborateur'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{emp.store?.name || 'Siège / Région'}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'organizations' && currentUser?.isSuperAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Gestion plateforme — création d&apos;organisations réservée au Super Admin
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateOrgModal(true)}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  + Nouvelle organisation
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                      <th className="py-3.5 px-6">Organisation</th>
                      <th className="py-3.5 px-6">Slug</th>
                      <th className="py-3.5 px-6">Plan</th>
                      <th className="py-3.5 px-6">Statut</th>
                      <th className="py-3.5 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {platformOrgs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          Aucune organisation
                        </td>
                      </tr>
                    )}
                    {platformOrgs.map((org: any) => (
                      <tr key={org.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-6 font-bold text-slate-900">{org.name}</td>
                        <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">{org.slug}</td>
                        <td className="py-3.5 px-6">{org.subscriptionPlan || '—'}</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${org.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {org.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 space-x-2">
                          {org.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              className="text-amber-700 font-semibold hover:underline"
                              onClick={async () => {
                                const res = await apiClient.suspendOrganization(org.id);
                                if (res.success) {
                                  const orgsRes = await apiClient.listOrganizations();
                                  if (orgsRes.success) setPlatformOrgs(orgsRes.data || []);
                                } else alert(res.error?.message || 'Erreur');
                              }}
                            >
                              Suspendre
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="text-emerald-700 font-semibold hover:underline"
                              onClick={async () => {
                                const res = await apiClient.activateOrganization(org.id);
                                if (res.success) {
                                  const orgsRes = await apiClient.listOrganizations();
                                  if (orgsRes.success) setPlatformOrgs(orgsRes.data || []);
                                } else alert(res.error?.message || 'Erreur');
                              }}
                            >
                              Activer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              TAB 8 & 9: SETTINGS & SAAS MANAGEMENT
          ────────────────────────────────────────────────────────────────── */}
          {(activeTab === 'subscription' || activeTab === 'analytics') && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6 max-w-2xl">
              <h3 className="font-bold text-base text-slate-900">Paramètres de l&apos;Organisation</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Nom de l&apos;entreprise</label>
                  <input
                    type="text"
                    disabled
                    value={currentOrg?.name || 'Global Retailers Corp'}
                    className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Identifiant Unique (Tenant Slug)</label>
                  <input
                    type="text"
                    disabled
                    value={currentOrg?.slug || 'global-retail-one'}
                    className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700">Fuseau Horaire</label>
                    <input
                      type="text"
                      disabled
                      value={currentOrg?.timezone || 'Europe/Paris'}
                      className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Devise</label>
                    <input
                      type="text"
                      disabled
                      value={currentOrg?.currency || 'EUR'}
                      className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: INSPECT TASK & VALIDATE EVIDENCE
      ────────────────────────────────────────────────────────────────────── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mission #{selectedTask.id.slice(0, 8)}
                </span>
                <h3 className="font-bold text-base text-slate-900">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
              <p><strong>Magasin:</strong> {selectedTask.store?.name || 'Downtown Supermarket #12'}</p>
              <p><strong>Assigné à:</strong> {selectedTask.assignee?.firstName || 'Alex'} {selectedTask.assignee?.lastName || 'Frontline'}</p>
              <p><strong>Statut actuel:</strong> <span className="font-bold text-slate-900">{selectedTask.status}</span></p>
            </div>

            {/* Evidence Photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Preuve Photo Téléversée sur le Terrain</label>
              <div className="w-full h-48 rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80"
                  alt="Preuve terrain"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Rejection reason box */}
            {isRejecting && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-red-700">Motif obligatoire du rejet opérationnel :</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Température illisible ou photo floue, veuillez reprendre la photo."
                  className="w-full p-3 bg-red-50 border border-red-200 rounded-xl text-xs"
                  rows={2}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Fermer
              </button>

              {selectedTask.status === 'SUBMITTED' && (
                <>
                  {!isRejecting ? (
                    <button
                      onClick={() => setIsRejecting(true)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Rejeter
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(selectedTask.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Confirmer le rejet
                    </button>
                  )}

                  <button
                    onClick={() => handleApprove(selectedTask.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Approuver la conformité
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: CREATE TASK
      ────────────────────────────────────────────────────────────────────── */}
      
      {/* Create Task Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Nouveau modèle de mission</h3>
              <button type="button" onClick={() => setShowCreateTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Titre</label>
                <input
                  required
                  value={newTplTitle}
                  onChange={(e) => setNewTplTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Checklist ouverture magasin"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Priorité</label>
                  <select value={newTplPriority} onChange={(e) => setNewTplPriority(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Catégorie</label>
                  <input value={newTplCategory} onChange={(e) => setNewTplCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={newTplRequiresPhoto} onChange={(e) => setNewTplRequiresPhoto(e.target.checked)} />
                Photo de preuve obligatoire
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={newTplRecurrence} onChange={(e) => setNewTplRecurrence(e.target.checked)} />
                Récurrence active
              </label>
              {newTplRecurrence && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Règle</label>
                    <select value={newTplRecurrenceRule} onChange={(e) => setNewTplRecurrenceRule(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      <option value="DAILY">DAILY</option>
                      <option value="WEEKLY">WEEKLY</option>
                      <option value="MONTHLY">MONTHLY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Heure (HH:MM)</label>
                    <input value={newTplRecurrenceTime} onChange={(e) => setNewTplRecurrenceTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="08:00" />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateTemplateModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">
                  Annuler
                </button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold disabled:opacity-50">
                  {actionLoading ? 'Création…' : 'Créer le modèle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showCreateOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Nouvelle organisation</h3>
              <button type="button" onClick={() => setShowCreateOrgModal(false)}><XCircle className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-[11px] text-slate-500">Réservé Super Admin. Crée l&apos;org + rôles ORG_MANAGER / EMPLOYEE, et optionnellement le premier responsable.</p>
            <form onSubmit={handleCreateOrganization} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Nom de l&apos;organisation *</label>
                <input required value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50" placeholder="Ex: Retail Québec Inc." />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Email du responsable (optionnel)</label>
                <input type="email" value={newOrgManagerEmail} onChange={(e) => setNewOrgManagerEmail(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50" placeholder="manager@client.ca" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Prénom</label>
                  <input value={newOrgManagerFirstName} onChange={(e) => setNewOrgManagerFirstName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Nom</label>
                  <input value={newOrgManagerLastName} onChange={(e) => setNewOrgManagerLastName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateOrgModal(false)} className="px-4 py-2 text-slate-600 font-semibold">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">{actionLoading ? 'Création…' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Nouvelle mission terrain</h3>
              <button type="button" onClick={() => setShowCreateTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Titre *</label>
                <input required value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ex: Contrôle ouverture magasin" />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Description</label>
                <textarea value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Contexte et objectif de la mission" />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Instructions terrain</label>
                <textarea value={newTaskInstructions} onChange={(e) => setNewTaskInstructions(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Étapes à suivre par l'opérateur" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Priorité</label>
                  <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="LOW">Faible</option>
                    <option value="MEDIUM">Normale</option>
                    <option value="HIGH">Haute</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Catégorie</label>
                  <input value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Magasin</label>
                  <select value={newTaskStoreId} onChange={(e) => setNewTaskStoreId(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">— Sélectionner —</option>
                    {stores.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city || s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Assigné à</label>
                  <select value={newTaskAssigneeId} onChange={(e) => setNewTaskAssigneeId(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">— Non assigné —</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.user?.id || emp.userId}>
                        {emp.user?.firstName} {emp.user?.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Formulaire mission (multi-pages)</label>
                  <select value={newTaskFormId} onChange={(e) => setNewTaskFormId(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="">— Aucun (checklist simple) —</option>
                    {forms.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.title}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Créez des formulaires dans l&apos;API POST /forms ou le seed RDTS.</p>
                </div>

              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Échéance</label>
                  <input type="datetime-local" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Durée estimée (min)</label>
                  <input type="number" min={5} value={newTaskDuration} onChange={(e) => setNewTaskDuration(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-slate-700 font-medium">
                  <input type="checkbox" checked={newTaskRequiresPhoto} onChange={(e) => setNewTaskRequiresPhoto(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                  Preuve photo obligatoire
                </label>
                <label className="flex items-center gap-2 text-slate-700 font-medium">
                  <input type="checkbox" checked={newTaskRequiresValidation} onChange={(e) => setNewTaskRequiresValidation(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                  Validation manager requise
                </label>
                <label className="flex items-center gap-2 text-slate-700 font-medium">
                  <input type="checkbox" checked={newTaskRequiresSignature} onChange={(e) => setNewTaskRequiresSignature(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                  Signature requise
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateTaskModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">{actionLoading ? 'Création…' : 'Déployer la mission'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: CREATE STORE (Canada)
      ────────────────────────────────────────────────────────────────────── */}
      {showCreateStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Nouveau site / magasin (Canada)</h3>
              <button type="button" onClick={() => setShowCreateStoreModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStore} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700">Nom du site *</label>
                  <input required value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ex: Marché Plateau Montréal" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Code site *</label>
                  <input required value={newStoreCode} onChange={(e) => setNewStoreCode(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="CA-MTL-002" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Téléphone</label>
                  <input value={newStorePhone} onChange={(e) => setNewStorePhone(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="+1 514-555-0000" />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700">Adresse</label>
                <input value={newStoreAddress} onChange={(e) => setNewStoreAddress(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="1234 Rue Example" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Ville</label>
                  <input value={newStoreCity} onChange={(e) => setNewStoreCity(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Montréal" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Province</label>
                  <select value={newStoreProvince} onChange={(e) => setNewStoreProvince(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Code postal</label>
                  <input value={newStorePostalCode} onChange={(e) => setNewStorePostalCode(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="H2X 1Y4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Pays</label>
                  <input value={newStoreCountry} onChange={(e) => setNewStoreCountry(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Fuseau horaire</label>
                  <select value={newStoreTimezone} onChange={(e) => setNewStoreTimezone(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="America/Toronto">America/Toronto (Est)</option>
                    <option value="America/Winnipeg">America/Winnipeg (Centre)</option>
                    <option value="America/Edmonton">America/Edmonton (Rocheuses)</option>
                    <option value="America/Vancouver">America/Vancouver (Pacifique)</option>
                    <option value="America/Halifax">America/Halifax (Atlantique)</option>
                    <option value="America/St_Johns">America/St_Johns (Terre-Neuve)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Latitude (GPS)</label>
                  <input value={newStoreLat} onChange={(e) => setNewStoreLat(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="45.5017" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Longitude (GPS)</label>
                  <input value={newStoreLng} onChange={(e) => setNewStoreLng(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="-73.5673" />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700">Horaires</label>
                <input value={newStoreHours} onChange={(e) => setNewStoreHours(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Lun-Sam 08:00-21:00" />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Notes</label>
                <textarea value={newStoreNotes} onChange={(e) => setNewStoreNotes(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateStoreModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Annuler</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">{actionLoading ? 'Création…' : 'Créer le site'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: INVITE EMPLOYEE
      ────────────────────────────────────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Inviter un Collaborateur</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Prénom</label>
                  <input
                    type="text"
                    required
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Nom</label>
                  <input
                    type="text"
                    required
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700">Email professionnel</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jean.dupont@globalretail.com"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Rôle</label>
                  <select
                    value={inviteRoleCode}
                    onChange={(e) => setInviteRoleCode(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ORG_MANAGER">Responsable organisation (web)</option>
                    <option value="EMPLOYEE">Opérateur terrain (mobile)</option>
                    <option value="REGIONAL_MANAGER">Regional Manager</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Magasin</label>
                  <select
                    value={inviteStoreId}
                    onChange={(e) => setInviteStoreId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Envoyer l&apos;invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
