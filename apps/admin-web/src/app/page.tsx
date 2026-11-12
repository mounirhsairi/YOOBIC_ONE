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
  XCircle,
  FileText
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

export default function AdminDashboard() {
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
      storeName: 'All Locations',
      assigneeName: 'Team Leads',
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white tracking-wider">
              Y1
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight leading-tight">YOOBIC ONE</h1>
              <p className="text-xs text-slate-400">Enterprise Operations</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-5 h-5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" /> Tasks & Operations
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'stores' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-5 h-5" /> Locations & Stores
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'employees' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
              }`}
            >
              <Users className="w-5 h-5" /> Frontline Teams
            </button>
          </nav>
        </div>

        <div className="p-3 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">Active Tenant</p>
          <p className="text-sm font-semibold text-white truncate">Global Supermarket Corp</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 rounded">
            ENTERPRISE TIER
          </span>
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
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
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
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
