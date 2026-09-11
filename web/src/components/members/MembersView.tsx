"use client";

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  FolderOpen, 
  CheckSquare, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import type { Member, Project, Task } from '~/types';
import { UserAvatar } from '~/components/ui/UserAvatar';

interface MembersViewProps {
  members: Member[];
  projects: Project[];
  tasks: Task[];
  currentUser: Member;
  onAddMember?: (member: Member) => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onSelectProject?: (projectId: string) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  projects,
  tasks,
  currentUser,
  onAddMember,
  isLoading = false,
  isError = false,
  onRetry,
  onSelectProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Form state for inviting/adding member
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [avatarIndex, setAvatarIndex] = useState(0);

  const AVATAR_OPTIONS = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPRaCZjyTjXGZN-LtF6i2zjJyo-hQurV8V86jZjrUHN4RwX99lEKcgWm-ikVAXt0gdZ3mi-IMADFyW5IrhVTeSAn7iOiN0D2GlhA-8rCRjPMcj4nWuAUreTvBlIlwrx5puRG9lV_LbQqqerNCF1JYYBY5ghI-iNMJJ3cdqfdKtjnVxdGt4tUd0vB3ypV7-djVro8dtUKK2O-6DtmFtRh74aG35viKJ99kn6YsLOaXaYrJUh163mfq-',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAOlcPu714ktL5corKfoeN-BlKIJTulowIOefZ6Jb09k_hJ0fNrKtxZVA3c1zZu-fpGR-PCfqWcWeqDme84PDddi89uFlOBsgUkV-OI6KZ0CDjE7DvvFlE5v-H-4LjoKAzrpfXDJR2ikTdrTAUbUBKR3XJ-9njSvZv8LwlGssSHALCh__Y71OPo8kbtdrl7P8pocQkPINzJAARehFRq1zp0vkhuQJ_RWdPLh5hRhMkrXqK780GkbrOm',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD9tPjYfB_c6d6K3x2t3S8Z6G0q8o0x7K9u_8q3h6j-L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v_0L2u3v0n-B9v'
  ];

  // Distinct roles for filter tabs
  const roles = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.role) set.add(m.role);
    });
    return Array.from(set);
  }, [members]);

  // Compute live member statistics (task assignments and project memberships)
  const memberStats = useMemo(() => {
    const statsMap: Record<string, { tasksCount: number; projectsList: Project[] }> = {};
    members.forEach((m) => {
      statsMap[m.id] = {
        tasksCount: tasks.filter((t) => t.assignee?.id === m.id || t.coAssignees?.some((c) => c.id === m.id)).length,
        projectsList: projects.filter((p) => p.members?.some((pm) => pm.id === m.id) || p.creatorId === m.id),
      };
    });
    return statsMap;
  }, [members, tasks, projects]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Role filter
      if (roleFilter !== 'all' && m.role !== roleFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(q);
        const matchEmail = m.email?.toLowerCase().includes(q);
        const matchRole = m.role?.toLowerCase().includes(q);
        const matchUsername = m.username?.toLowerCase().includes(q);
        return matchName || matchEmail || matchRole || matchUsername;
      }
      return true;
    });
  }, [members, roleFilter, searchQuery]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (onAddMember) {
      onAddMember({
        id: `user-${Date.now()}`,
        name: name.trim(),
        username: name.trim().toLowerCase().replace(/\s+/g, '_'),
        email: email.trim().toLowerCase(),
        role: role.trim(),
        avatar: AVATAR_OPTIONS[avatarIndex] ?? AVATAR_OPTIONS[0]!,
      });
    }

    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* ─── 1. Header & Controls ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Members</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage team directory, discover colleagues by username, and monitor project assignments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg py-2.5 px-4 shadow-xs transition-all active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Search & Filter Bar ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, @username, email, or role..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-800 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Roles ({members.length})
          </button>
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. State Handling (Loading, Error, Empty, Filled) ─ */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Failed to load workspace members</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We encountered an unexpected error while retrieving member profiles.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      ) : filteredMembers.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No members matched your criteria</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No team members found matching "${searchQuery}". Try a different name or clear the search.`
                : 'No members currently in this role filter.'}
            </p>
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setRoleFilter('all'); }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        /* ─── 4. Members Grid (Success / Filled State) ────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const stats = memberStats[member.id] ?? { tasksCount: 0, projectsList: [] };
            const isSelf = member.id === currentUser.id;

            return (
              <div
                key={member.id}
                className="group relative p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Avatar + Handle + Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <UserAvatar
                          name={member.name}
                          username={member.username}
                          email={member.email}
                          avatar={member.avatar}
                          size="lg"
                          className="w-12 h-12 ring-2 ring-slate-100 dark:ring-slate-800"
                        />
                        {isSelf && (
                          <span
                            className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5"
                            title="You"
                          >
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {member.name}
                          </h3>
                          {isSelf && (
                            <span className="text-[10px] uppercase font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 rounded px-1.5 py-0.2">
                              You
                            </span>
                          )}
                        </div>
                        {member.username && (
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            @{member.username}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {member.role || 'Member'}
                    </span>
                  </div>

                  {/* Email Row */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{member.email || 'No email provided'}</span>
                  </div>

                  {/* Workload & Projects Summary Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Assigned Tasks</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{stats.tasksCount} active</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <FolderOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Projects</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{stats.projectsList.length} total</span>
                      </div>
                    </div>
                  </div>

                  {/* Projects Tag List */}
                  {stats.projectsList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                        Active Projects
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {stats.projectsList.slice(0, 3).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => onSelectProject?.(p.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: p.accentColor || '#3B82F6' }}
                            />
                            <span className="truncate max-w-[120px]">{p.title}</span>
                          </button>
                        ))}
                        {stats.projectsList.length > 3 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium self-center pl-1">
                            +{stats.projectsList.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 5. Invite Team Member Modal ──────────────────────── */}
      {isInviteModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Colleague to Workspace</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah@cyberdyne.io"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Job Title</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Architect">Backend Architect</option>
                  <option value="Product Designer">Product Designer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="QA Specialist">QA Specialist</option>
                  <option value="DevOps Lead">DevOps Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Avatar</label>
                <div className="flex items-center gap-3">
                  {AVATAR_OPTIONS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarIndex(idx)}
                      className={`relative rounded-full p-0.5 transition-all cursor-pointer ${
                        avatarIndex === idx
                          ? 'ring-2 ring-blue-600 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt={`Avatar ${idx}`} className="w-10 h-10 rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
