'use client';

import React, { useState, useEffect } from 'react';
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
  Download
} from 'lucide-react';

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
  // Navigation tabs conforming to YOOBIC ONE specification
  type NavTab =
    | 'dashboard'
    | 'tasks'
    | 'audits'
    | 'communication'
    | 'learning'
    | 'locations'
    | 'employees'
    | 'analytics'
    | 'subscription';

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
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

  // Operational Tasks State
  const [tasks, setTasks] = useState<any[]>([
    {
      id: 'task-101',
      title: 'Daily Morning Food Safety & Fridge Check',
      storeName: 'Downtown Supermarket #12',
      assigneeName: 'Alex Frontline',
      priority: 'HIGH',
      status: 'SUBMITTED',
      requiresPhoto: true,
      hasEvidence: true,
      evidenceUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
      submittedAt: 'Today, 08:30 AM',
    },
    {
      id: 'task-102',
      title: 'Spring Seasonal Promotional Display Setup',
      storeName: 'North Mall Store #04',
      assigneeName: 'Sarah Miller',
      priority: 'MEDIUM',
      status: 'APPROVED',
      requiresPhoto: true,
      hasEvidence: true,
      evidenceUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=600&q=80',
      submittedAt: 'Yesterday, 04:15 PM',
    },
    {
      id: 'task-103',
      title: 'Fire Safety Equipment Weekly Inspection',
      storeName: 'East Avenue Express #09',
      assigneeName: 'David Lee',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      requiresPhoto: false,
      hasEvidence: false,
      submittedAt: null,
    },
    {
      id: 'task-104',
      title: 'Evening Cash Drawer Reconcile & Safe Lock',
      storeName: 'Downtown Supermarket #12',
      assigneeName: 'Thomas Vance',
      priority: 'HIGH',
      status: 'TODO',
      requiresPhoto: true,
      hasEvidence: false,
      submittedAt: null,
    },
  ]);

  // Audits & Visits State
  const [audits, setAudits] = useState<any[]>([
    {
      id: 'aud-1',
      templateTitle: 'Q2 Comprehensive Store Compliance Audit',
      storeName: 'Downtown Supermarket #12',
      auditorName: 'Marc V. (Regional Auditor)',
      scheduledDate: '2026-11-14',
      score: 92,
      passed: true,
      status: 'COMPLETED',
      correctiveActionsCount: 1,
    },
    {
      id: 'aud-2',
      templateTitle: 'Food Safety & Cold Chain Audit',
      storeName: 'North Mall Store #04',
      auditorName: 'Sarah Manager',
      scheduledDate: '2026-11-16',
      score: null,
      passed: null,
      status: 'SCHEDULED',
      correctiveActionsCount: 0,
    },
  ]);

  // Communication & Communities State
  const [announcements, setAnnouncements] = useState<any[]>([
    {
      id: 'ann-1',
      title: '🌟 Q2 National Visual Merchandising Excellence Winners',
      content: 'Congratulations to Store #12 and Store #04 for achieving 100% compliance during corporate inspection.',
      author: 'Operations Director',
      target: 'All Stores & Managers',
      isPinned: true,
      date: '2 hours ago',
    },
    {
      id: 'ann-2',
      title: 'Important: Updated Refrigerator Calibration Protocols',
      content: 'All store supervisors must review the new standard temperature ranges before Monday morning.',
      author: 'Health & Safety Lead',
      target: 'Store Managers',
      isPinned: false,
      date: 'Yesterday',
    },
  ]);

  const [communityPosts, setCommunityPosts] = useState<any[]>([
    {
      id: 'p-1',
      author: 'Alex Frontline',
      store: 'Downtown Store #12',
      content: 'Our weekend promo display achieved +18% footfall! Here is the completed setup.',
      likes: 14,
      comments: 3,
      time: '3 hours ago',
    },
  ]);
  const [newPostContent, setNewPostContent] = useState('');

  // Learning Management State
  const [courses, setCourses] = useState<any[]>([
    {
      id: 'c-1',
      title: 'Frontline Food Safety & Cooler Temperature Controls',
      category: 'Compliance & Safety',
      estimatedMinutes: 20,
      completionRate: 88,
      isMandatory: true,
      modulesCount: 4,
    },
    {
      id: 'c-2',
      title: 'Customer De-escalation & Frontline Excellence',
      category: 'Customer Service',
      estimatedMinutes: 30,
      completionRate: 94,
      isMandatory: false,
      modulesCount: 5,
    },
    {
      id: 'c-3',
      title: 'OSHA Fire Protocols & Emergency Store Evacuation',
      category: 'Emergency Response',
      estimatedMinutes: 15,
      completionRate: 72,
      isMandatory: true,
      modulesCount: 3,
    },
  ]);

  // Locations / Stores State
  const [stores, setStores] = useState<any[]>([
    { id: 's-1', name: 'Downtown Supermarket #12', code: 'ST-012', region: 'Île-de-France', city: 'Paris', employeesCount: 24, score: '96%' },
    { id: 's-2', name: 'North Mall Store #04', code: 'ST-004', region: 'Auvergne-Rhône-Alpes', city: 'Lyon', employeesCount: 18, score: '91%' },
    { id: 's-3', name: 'East Avenue Express #09', code: 'ST-009', region: 'Provence-Alpes-Côte d\'Azur', city: 'Marseille', employeesCount: 12, score: '88%' },
  ]);

  // Employees State
  const [employees, setEmployees] = useState<any[]>([
    { id: 'e-1', name: 'Sarah Manager', email: 'sarah.manager@globalretail.com', role: 'Store Manager', store: 'Downtown Supermarket #12', status: 'ACTIVE' },
    { id: 'e-2', name: 'Alex Frontline', email: 'alex.frontline@globalretail.com', role: 'Frontline Associate', store: 'Downtown Supermarket #12', status: 'ACTIVE' },
    { id: 'e-3', name: 'David Lee', email: 'david.lee@globalretail.com', role: 'Team Leader', store: 'East Avenue Express #09', status: 'ACTIVE' },
    { id: 'e-4', name: 'Elena Rostova', email: 'elena.rostova@globalretail.com', role: 'Regional Manager', store: 'Multi-store (All Paris)', status: 'ACTIVE' },
  ]);

  // Modals State
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');

  // Handle Hash route matching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('/noauth/login')) {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setCurrentUser(data.data.user);
        if (typeof window !== 'undefined') {
          window.location.hash = '#/app/dashboard';
        }
      } else {
        setLoginError(data.error?.message || 'Invalid username or password.');
      }
    } catch (err: any) {
      if (
        (email === 'sarah.manager@globalretail.com' && password === 'Password123!') ||
        (email === 'alex.frontline@globalretail.com' && password === 'Welcome123!')
      ) {
        setIsAuthenticated(true);
        setCurrentUser({
          firstName: email.includes('sarah') ? 'Sarah' : 'Alex',
          lastName: email.includes('sarah') ? 'Manager' : 'Frontline',
          email,
          role: email.includes('sarah') ? 'Store Manager' : 'Frontline Associate',
        });
      } else {
        setLoginError('Unable to connect to authentication server. Please check your network.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: 'manager' | 'employee') => {
    if (role === 'manager') {
      setEmail('sarah.manager@globalretail.com');
      setPassword('Password123!');
    } else {
      setEmail('alex.frontline@globalretail.com');
      setPassword('Welcome123!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    if (typeof window !== 'undefined') {
      window.location.hash = '#/noauth/login';
    }
  };

  const handleApprove = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'APPROVED' } : t))
    );
    setSelectedTask(null);
  };

  const handleReject = (taskId: string) => {
    if (!rejectReason.trim()) {
      alert('A rejection reason is strictly required by operational standards.');
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'REJECTED' } : t))
    );
    setSelectedTask(null);
    setIsRejecting(false);
    setRejectReason('');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      storeName: 'Downtown Supermarket #12',
      assigneeName: 'Alex Frontline',
      priority: 'MEDIUM',
      status: 'TODO',
      requiresPhoto: true,
      hasEvidence: false,
      submittedAt: null,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowCreateModal(false);
  };

  const handleInviteEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    const newEmp = {
      id: `e-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      store: 'Downtown Supermarket #12',
      status: 'ACTIVE',
    };
    setEmployees([...employees, newEmp]);
    setInviteEmail('');
    setInviteName('');
    setShowInviteModal(false);
    alert(`Invitation sent to ${newEmp.email}`);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    const newPost = {
      id: `p-${Date.now()}`,
      author: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Store Team',
      store: 'Downtown Store #12',
      content: newPostContent,
      likes: 1,
      comments: 0,
      time: 'Just now',
    };
    setCommunityPosts([newPost, ...communityPosts]);
    setNewPostContent('');
  };

  // -------------------------------------------------------------
  // VIEW 1: AUTHENTIC YOOBIC ONE LOGIN (app.yoobic.com/#/noauth/login)
  // -------------------------------------------------------------
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
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">
                    A secure password reset link has been dispatched to your corporate email.
                  </p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Username or Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    Remember username
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordMessage(true)}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loginLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
                  or
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowSsoModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Log in with Single Sign-On (SSO)</span>
              </button>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  1-Click Test Credentials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('manager')}
                    className="p-2 text-left rounded-lg bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 transition group cursor-pointer"
                  >
                    <p className="text-xs font-bold text-blue-900 group-hover:text-blue-700">Store Manager</p>
                    <p className="text-[10px] text-blue-600/80 truncate">sarah.manager@...</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('employee')}
                    className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-slate-700">Frontline Staff</p>
                    <p className="text-[10px] text-slate-500 truncate">alex.frontline@...</p>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500">
              Need assistance?{' '}
              <a href="#" className="font-semibold text-blue-600 hover:underline">
                Contact corporate administrator
              </a>
            </p>
          </div>
        </div>

        <footer className="w-full py-4 px-6 border-t border-slate-200/70 bg-white/50 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 YOOBIC Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-800 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-800 transition">Security</a>
            <a href="#" className="hover:text-slate-800 transition">Help Center</a>
          </div>
        </footer>

        {showSsoModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Enterprise SSO Login</h3>
                <button
                  onClick={() => setShowSsoModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Enter your company's workspace ID to route to Okta or Azure AD.
              </p>
              <div>
                <label className="text-xs font-bold text-slate-700">Company Domain</label>
                <div className="flex items-center mt-1">
                  <input
                    type="text"
                    value={ssoDomain}
                    onChange={(e) => setSsoDomain(e.target.value)}
                    placeholder="company"
                    className="flex-1 text-sm p-2 border rounded-l-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 text-slate-500 text-xs px-3 py-2.5 rounded-r-lg font-medium">
                    .yoobic.com
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSsoModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleQuickDemoLogin('manager');
                    setShowSsoModal(false);
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Continue to SSO →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: FULL ENTERPRISE WORKSPACE (CONFORMING TO FUNCTIONAL SPEC)
  // -------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800">
            <YoobicLogo showTag={true} />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" /> Tasks & Operations
            </button>
            <button
              onClick={() => setActiveTab('audits')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'audits' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Audits & Visits
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'communication' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" /> Communication
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'learning' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Learning Academy
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'locations' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> Locations & Stores
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'employees' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Employees & Teams
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Analytics & Reports
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'subscription' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Subscription & SaaS
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 bg-slate-800/90 rounded-xl space-y-3 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser?.firstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-[10px] text-blue-400 truncate">{currentUser?.role || 'Organization Owner'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-slate-700/60 hover:bg-rose-600 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
              {activeTab === 'dashboard' && 'Operations Dashboard'}
              {activeTab === 'tasks' && 'Operational Checklists & Tasks'}
              {activeTab === 'audits' && 'Audits, Visits & Inspections'}
              {activeTab === 'communication' && 'Corporate Bulletins & Communities'}
              {activeTab === 'learning' && 'Frontline Learning Academy'}
              {activeTab === 'locations' && 'Organizational Hierarchy & Stores'}
              {activeTab === 'employees' && 'Employee Directory & Roles'}
              {activeTab === 'analytics' && 'Operational Compliance Analytics'}
              {activeTab === 'subscription' && 'Enterprise SaaS Subscription'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Global search across stores, tasks, audits..."
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            {activeTab === 'tasks' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Task
              </button>
            )}
            {activeTab === 'employees' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Invite Employee
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-8 space-y-6 flex-1">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <MetricCard title="Tasks Today" value={tasks.length} subtitle="Active operational tasks" icon={ClipboardList} color="bg-blue-600" />
                <MetricCard title="Pending Validation" value={tasks.filter((t) => t.status === 'SUBMITTED').length} subtitle="Requires manager sign-off" icon={Clock} color="bg-amber-500" />
                <MetricCard title="Audit Compliance" value="94.2%" subtitle="Average across 20 locations" icon={ShieldCheck} color="bg-emerald-600" />
                <MetricCard title="Training Completion" value="86%" subtitle="Assigned frontline courses" icon={GraduationCap} color="bg-indigo-600" />
              </div>

              {/* Live Stores Performance Ranking */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Store Performance & Compliance Benchmarking</h3>
                    <p className="text-xs text-slate-500">Live operational execution across all assigned retail locations</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    View detailed analytics →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Store Name</th>
                        <th className="px-6 py-3">Region</th>
                        <th className="px-6 py-3">Store Manager</th>
                        <th className="px-6 py-3">Checklists Completed</th>
                        <th className="px-6 py-3">Compliance Score</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stores.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3.5 font-bold text-slate-900">{s.name}</td>
                          <td className="px-6 py-3.5">{s.region}</td>
                          <td className="px-6 py-3.5">Sarah Manager</td>
                          <td className="px-6 py-3.5">18 / 18 (100%)</td>
                          <td className="px-6 py-3.5 font-bold text-emerald-600">{s.score}</td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              COMPLIANT
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & OPERATIONS */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Operational Checklists & Action Items</h3>
                  <p className="text-xs text-slate-500">Live operational execution across all assigned stores</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Task Details</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Assignee</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          {task.title}
                          {task.requiresPhoto && (
                            <span className="ml-2 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-200">
                              📷 Photo Proof Required
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">{task.storeName}</td>
                        <td className="px-6 py-3.5 font-medium">{task.assigneeName}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              task.priority === 'CRITICAL'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'HIGH'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                              task.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : task.status === 'SUBMITTED'
                                ? 'bg-amber-100 text-amber-700'
                                : task.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                          >
                            Inspect & Validate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AUDITS & VISITS */}
          {activeTab === 'audits' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Store Audits & Field Inspection Visits</h3>
                    <p className="text-xs text-slate-500">Evaluations, scoring criteria, and corrective actions</p>
                  </div>
                </div>
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Audit Template</th>
                      <th className="px-6 py-3">Target Store</th>
                      <th className="px-6 py-3">Assigned Auditor</th>
                      <th className="px-6 py-3">Scheduled Date</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3.5 font-bold text-slate-900">{a.templateTitle}</td>
                        <td className="px-6 py-3.5">{a.storeName}</td>
                        <td className="px-6 py-3.5">{a.auditorName}</td>
                        <td className="px-6 py-3.5">{a.scheduledDate}</td>
                        <td className="px-6 py-3.5 font-bold text-blue-600">{a.score ? `${a.score}%` : 'Pending'}</td>
                        <td className="px-6 py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COMMUNICATION & COMMUNITIES */}
          {activeTab === 'communication' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" /> Corporate Announcements
                </h3>
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {ann.target}
                      </span>
                      <span className="text-[10px] text-slate-400">{ann.date}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> Frontline Community Wall
                </h3>
                <form onSubmit={handleCreatePost} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <textarea
                    rows={2}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share an operational update, merchandising photo, or recognition with frontline teams..."
                    className="w-full text-xs p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish Post
                    </button>
                  </div>
                </form>

                {communityPosts.map((post) => (
                  <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{post.author}</p>
                        <p className="text-[10px] text-slate-400">{post.store} • {post.time}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700">{post.content}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                      <span>👍 {post.likes} Likes</span>
                      <span>💬 {post.comments} Comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LEARNING ACADEMY (LMS) */}
          {activeTab === 'learning' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                    {course.isMandatory && (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        MANDATORY
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{course.title}</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Completion Rate</span>
                      <span className="font-bold text-slate-800">{course.completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${course.completionRate}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{course.modulesCount} Interactive Modules</span>
                    <span>⏱ {course.estimatedMinutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: LOCATIONS & STORES */}
          {activeTab === 'locations' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Store Network Hierarchy</h3>
                  <p className="text-xs text-slate-500">Regions, Districts, Retail Stores, and Department Teams</p>
                </div>
              </div>
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Store Name</th>
                    <th className="px-6 py-3">Store Code</th>
                    <th className="px-6 py-3">Region</th>
                    <th className="px-6 py-3">City</th>
                    <th className="px-6 py-3">Employees</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="px-6 py-3.5 font-mono">{s.code}</td>
                      <td className="px-6 py-3.5">{s.region}</td>
                      <td className="px-6 py-3.5">{s.city}</td>
                      <td className="px-6 py-3.5 font-medium">{s.employeesCount} staff</td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: EMPLOYEES & TEAMS */}
          {activeTab === 'employees' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Employee Directory & Role Scopes</h3>
                  <p className="text-xs text-slate-500">Frontline workers, managers, and administrative roles</p>
                </div>
              </div>
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Employee Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Assigned Location</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{e.name}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-500">{e.email}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                          {e.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">{e.store}</td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 8: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Average Task Completion Time</p>
                  <h3 className="text-2xl font-black text-slate-900">18.4 min</h3>
                  <p className="text-xs text-emerald-600 font-semibold">↓ 3.2 min faster than target SLA</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">First-Time Approval Rate</p>
                  <h3 className="text-2xl font-black text-slate-900">96.8%</h3>
                  <p className="text-xs text-emerald-600 font-semibold">Only 3.2% required corrective resubmission</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Frontline Engagement</p>
                  <h3 className="text-2xl font-black text-slate-900">99.1%</h3>
                  <p className="text-xs text-blue-600 font-semibold">Active mobile syncs within past 24 hours</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Export Comprehensive Operational Report</h4>
                  <p className="text-xs text-slate-500">Download store compliance audits, evidence photos index, and checklist responses.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert('Exporting CSV report for current date range...')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                  <button
                    onClick={() => alert('Generating executive PDF report...')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SUBSCRIPTION & SAAS LIMITS */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                      ENTERPRISE MULTI-STORE TIER
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">Global Retailers Corp Plan</h3>
                    <p className="text-xs text-slate-500">Subscription Status: Active • Renews Annually</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">$1,450</span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500">Stores / Locations</p>
                    <p className="text-sm font-bold text-slate-900">20 / Unlimited</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full">
                      <div className="bg-blue-600 h-full rounded-full w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500">Frontline Users</p>
                    <p className="text-sm font-bold text-slate-900">142 / 500 licensed</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full">
                      <div className="bg-emerald-600 h-full rounded-full w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500">Encrypted Object Storage</p>
                    <p className="text-sm font-bold text-slate-900">42 GB / 1,000 GB</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full">
                      <div className="bg-indigo-600 h-full rounded-full w-[4%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Task Inspection Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedTask.title}</h3>
                <p className="text-xs text-slate-500">{selectedTask.storeName} • {selectedTask.assigneeName}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedTask.evidenceUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Captured Photo Evidence</p>
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={selectedTask.evidenceUrl}
                    alt="Task Evidence"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-xs">
                No visual evidence required for this task.
              </div>
            )}

            {isRejecting && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-red-700 uppercase">Reason for Rejection (Required)</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this task was rejected and what corrective action is needed..."
                  className="w-full text-xs p-3 border rounded-lg border-red-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              {isRejecting ? (
                <button
                  onClick={() => handleReject(selectedTask.id)}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                >
                  Confirm Rejection
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    Reject Task
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTask.id)}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer"
                  >
                    Approve & Sign Off
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-900">Create Operational Task</h3>
            <div>
              <label className="text-xs font-bold text-slate-700">Task Title</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. End-of-Day Store Cash Drawer Audit"
                className="mt-1 w-full text-xs p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Employee Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleInviteEmployee}
            className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-900">Invite Employee to Organization</h3>
            <div>
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Marie Dupont"
                className="mt-1 w-full text-xs p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Corporate Email</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="marie.dupont@globalretail.com"
                className="mt-1 w-full text-xs p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Role & Responsibilities</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-1 w-full text-xs p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Frontline Associate">Frontline Associate (Employee)</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Regional Manager">Regional Manager</option>
                <option value="Trainer">Trainer / Learning Manager</option>
                <option value="Auditor">Field Auditor</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
