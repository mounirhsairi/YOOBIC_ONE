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
  Sparkles
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-3xl font-bold mt-2 text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

// High-fidelity YOOBIC Brand Logo Component
const YoobicLogo = ({ className = "h-8", showTag = true }: { className?: string; showTag?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 shadow-md shadow-blue-500/20">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-black tracking-tight text-slate-900">YOOBIC</span>
      {showTag && (
        <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-xs">
          ONE
        </span>
      )}
    </div>
  </div>
);

export default function AppRoot() {
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

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'stores' | 'employees'>('dashboard');
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
  ]);

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
        setLoginError(data.error?.message || 'Invalid username or password. Please verify your credentials.');
      }
    } catch (err: any) {
      // Local fallback in case backend is offline
      if (
        (email === 'sarah.manager@globalretail.com' && password === 'Password123!') ||
        (email === 'alex.frontline@globalretail.com' && password === 'Welcome123!')
      ) {
        setIsAuthenticated(true);
        setCurrentUser({
          firstName: email.includes('sarah') ? 'Sarah' : 'Alex',
          lastName: email.includes('sarah') ? 'Manager' : 'Frontline',
          email,
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

  // -------------------------------------------------------------
  // VIEW 1: IDENTICAL YOOBIC ONE LOGIN VIEW (https://app.yoobic.com/#/noauth/login)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
        {/* Top Header Bar */}
        <header className="w-full px-6 py-5 flex items-center justify-between border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
          <YoobicLogo />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition border border-slate-200 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
                {(['English', 'Français', 'Español', 'Deutsch'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition ${
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

        {/* Center Login Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[430px] space-y-6">
            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
              {/* Header Title inside card */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Log in to YOOBIC ONE
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your credentials to access your frontline workspace
                </p>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{loginError}</p>
                </div>
              )}

              {/* Forgot Password Notification */}
              {forgotPasswordMessage && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-blue-700 text-xs">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">
                    A secure password reset link has been dispatched to your corporate email address.
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username / Email Field */}
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
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password Field */}
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
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Form Actions: Remember me & Forgot Password */}
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
                    className="font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Submit Button */}
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

              {/* SSO Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest absolute">
                  or
                </span>
              </div>

              {/* Single Sign-On Button */}
              <button
                type="button"
                onClick={() => setShowSsoModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Log in with Single Sign-On (SSO)</span>
              </button>

              {/* Quick Fill Demo Credentials */}
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

            {/* Help & Support note */}
            <p className="text-center text-xs text-slate-500">
              Need assistance?{' '}
              <a href="#" className="font-semibold text-blue-600 hover:underline">
                Contact corporate administrator
              </a>
            </p>
          </div>
        </div>

        {/* Global Footer */}
        <footer className="w-full py-4 px-6 border-t border-slate-200/70 bg-white/50 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 YOOBIC Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-800 transition">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-800 transition">Security</a>
            <a href="#" className="hover:text-slate-800 transition">Help Center</a>
          </div>
        </footer>

        {/* SSO Modal */}
        {showSsoModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Enterprise SSO Login</h3>
                <button
                  onClick={() => setShowSsoModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Enter your company's YOOBIC workspace domain to be routed to your identity provider (Okta, Azure AD, Ping).
              </p>
              <div>
                <label className="text-xs font-bold text-slate-700">Company Workspace ID</label>
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
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleQuickDemoLogin('manager');
                    setShowSsoModal(false);
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
  // VIEW 2: LOGGED-IN ENTERPRISE WORKSPACE DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <YoobicLogo showTag={true} />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-5 h-5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'tasks' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" /> Tasks & Operations
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'stores' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-5 h-5" /> Locations & Stores
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'employees' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              <Users className="w-5 h-5" /> Frontline Teams
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 bg-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {currentUser?.firstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-slate-700/60 hover:bg-rose-600 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tasks, stores, checklists..."
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none w-72"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-8">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Daily Tasks"
              value={tasks.length}
              subtitle="All operational checklists"
              icon={ClipboardList}
              color="bg-blue-600"
            />
            <MetricCard
              title="Validation Queue"
              value={tasks.filter((t) => t.status === 'SUBMITTED').length}
              subtitle="Awaiting manager sign-off"
              icon={Clock}
              color="bg-amber-500"
            />
            <MetricCard
              title="Approved & Compliant"
              value={tasks.filter((t) => t.status === 'APPROVED').length}
              subtitle="Verified evidence"
              icon={CheckCircle2}
              color="bg-emerald-600"
            />
            <MetricCard
              title="Compliance Rate"
              value={`${Math.round(
                (tasks.filter((t) => t.status === 'APPROVED').length / (tasks.length || 1)) * 100
              )}%`}
              subtitle="Real-time multi-location average"
              icon={ShieldCheck}
              color="bg-indigo-600"
            />
          </div>

          {/* Operational Tasks Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Operational Checklists & Action Items</h3>
                <p className="text-xs text-slate-500">Live operational execution across all assigned stores</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider">
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
                    <tr key={task.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {task.title}
                        {task.requiresPhoto && (
                          <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-normal">
                            Photo Required
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{task.storeName}</td>
                      <td className="px-6 py-4 text-slate-600">{task.assigneeName}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${
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
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
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
        </div>
      </main>

      {/* Inspection & Validation Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedTask.title}</h3>
                <p className="text-xs text-slate-500">{selectedTask.storeName} • {selectedTask.assigneeName}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Evidence Inspection */}
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
              <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-sm">
                No visual evidence required or submitted.
              </div>
            )}

            {/* Rejection Form */}
            {isRejecting && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-red-700 uppercase">Reason for Rejection (Required)</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this task was rejected and what corrective action is needed..."
                  className="w-full text-sm p-3 border rounded-lg border-red-300 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              {isRejecting ? (
                <button
                  onClick={() => handleReject(selectedTask.id)}
                  className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Confirm Rejection
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Reject Task
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTask.id)}
                    className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
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
            <h3 className="text-lg font-bold text-slate-900">Create Operational Task</h3>
            <div>
              <label className="text-xs font-bold text-slate-700">Task Title</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. End-of-Day Store Cash Drawer Audit"
                className="mt-1 w-full text-sm p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
