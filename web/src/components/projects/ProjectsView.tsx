"use client";

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Rocket, 
  Globe, 
  Plus, 
  Search, 
  CheckCircle2, 
  Layers, 
  Code,
  X,
  FolderPlus
} from 'lucide-react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit2, 
  Crown, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  UserMinus 
} from 'lucide-react';
import { api } from '~/trpc/react';
import type { Project, Member } from '~/types';

interface ProjectsViewProps {
  projects: Project[];
  currentUser: Member;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (project: {
    title: string;
    description: string;
    status: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType: string;
    accentColor: string;
    memberIds?: string[];
  }) => void;
  onUpdateProject?: (project: {
    id: string;
    title?: string;
    description?: string;
    status?: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType?: string;
    accentColor?: string;
    progress?: number;
  }) => void;
  onDeleteProject?: (projectId: string) => void;
  onAddProjectMember?: (projectId: string, userId: string) => void;
  onRemoveProjectMember?: (projectId: string, userId: string) => void;
  members: Member[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currentUser,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onAddProjectMember,
  onRemoveProjectMember,
  members = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [managingMembersProject, setManagingMembersProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<'on-track' | 'at-risk' | 'completed'>('on-track');
  const [newIcon, setNewIcon] = useState<'palette' | 'rocket' | 'web' | 'layers' | 'code'>('layers');
  const [newColor, setNewColor] = useState('#2563EB');
  const [createMemberIds, setCreateMemberIds] = useState<string[]>([]);
  const [createMemberSearch, setCreateMemberSearch] = useState('');

  // Member search state for Manage Members modal
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberActionFeedback, setMemberActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live user lookup for adding members by username/name/email
  const { 
    data: searchResults = [], 
    isLoading: isSearchingUsers 
  } = api.member.search.useQuery(
    { query: memberSearchQuery },
    { enabled: managingMembersProject !== null }
  );

  // Sync active managingMembersProject with updated project data from props
  useEffect(() => {
    if (managingMembersProject) {
      const refreshed = projects.find(p => p.id === managingMembersProject.id);
      if (refreshed) {
        setManagingMembersProject(refreshed);
      }
    }
  }, [projects, managingMembersProject]);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectIcon = (iconType: string) => {
    switch (iconType) {
      case 'palette':
        return <Palette className="w-5 h-5 text-indigo-600" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-rose-600" />;
      case 'web':
        return <Globe className="w-5 h-5 text-blue-600" />;
      case 'code':
        return <Code className="w-5 h-5 text-emerald-600" />;
      default:
        return <Layers className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    onCreateProject({
      title: trimmedTitle,
      description: newDescription.trim() || 'No description provided.',
      status: newStatus,
      iconType: newIcon,
      accentColor: newColor,
      memberIds: createMemberIds,
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewStatus('on-track');
    setNewIcon('layers');
    setCreateMemberIds([]);
    setCreateMemberSearch('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !onUpdateProject) return;
    const trimmedTitle = editingProject.title.trim();
    if (!trimmedTitle) return;

    onUpdateProject({
      id: editingProject.id,
      title: trimmedTitle,
      description: editingProject.description,
      status: editingProject.status,
      iconType: editingProject.iconType,
      accentColor: editingProject.accentColor,
      progress: editingProject.progress,
    });

    setEditingProject(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProject || !onDeleteProject) return;
    onDeleteProject(deletingProject.id);
    setDeletingProject(null);
  };

  const handleAddMemberToProject = (userId: string) => {
    if (!managingMembersProject || !onAddProjectMember) return;
    setMemberActionFeedback(null);
    try {
      onAddProjectMember(managingMembersProject.id, userId);
      setMemberActionFeedback({ type: 'success', message: 'Member added to project successfully' });
    } catch {
      setMemberActionFeedback({ type: 'error', message: 'Failed to add member' });
    }
  };

  const handleRemoveMemberFromProject = (userId: string) => {
    if (!managingMembersProject || !onRemoveProjectMember) return;
    setMemberActionFeedback(null);
    try {
      onRemoveProjectMember(managingMembersProject.id, userId);
      setMemberActionFeedback({ type: 'success', message: 'Member removed from project' });
    } catch {
      setMemberActionFeedback({ type: 'error', message: 'Failed to remove member' });
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreateModalOpen(false);
        setEditingProject(null);
        setManagingMembersProject(null);
        setDeletingProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="projects-view" className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Projects & Initiatives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, manage roadmaps, assign team members, and track tasks for each project.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              id="search-projects-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs transition-all"
            />
          </div>

          {/* + New Project Button */}
          <button
            id="btn-create-project-modal"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Grid for Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isCreator = project.creatorId === currentUser.id || !project.creatorId;

          return (
            <article
              key={project.id}
              id={`project-card-${project.id}`}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col group relative"
            >
              {/* Top Header Row with Icon & Status Tag */}
              <div className="flex justify-between items-start mb-3.5">
                <div 
                  onClick={() => onSelectProject(project.id)}
                  className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  {getProjectIcon(project.iconType)}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1.5 border ${
                    project.status === 'on-track' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : project.status === 'at-risk'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {project.status === 'completed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        project.status === 'on-track' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                    )}
                    <span>{project.statusLabel}</span>
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div onClick={() => onSelectProject(project.id)} className="cursor-pointer">
                <h2 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                  <span>{project.title}</span>
                  {isCreator && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium" title="You created this project">
                      <Crown className="w-2.5 h-2.5" />
                      <span>Owner</span>
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {project.description}
                </p>
              </div>

              {/* Progress Section */}
              <div className="mt-auto">
                <div className="mb-1.5 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Progress</span>
                  <span className="font-bold text-slate-900">{project.progress}%</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${project.progress}%`,
                      backgroundColor: project.accentColor ?? (
                        project.status === 'at-risk' 
                          ? '#EF4444' 
                          : project.status === 'completed'
                          ? '#10B981'
                          : '#2563EB'
                      )
                    }}
                  />
                </div>

                {/* Footer Info: Avatar Stack + Member Count + Tasks */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  {/* Stacked Member Avatars with Manage Button */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {project.members.slice(0, 3).map((m, idx) => (
                        <img 
                          key={idx}
                          src={m.avatar} 
                          alt={m.name}
                          className="w-6 h-6 rounded-full border-2 border-white object-cover ring-1 ring-slate-200"
                          title={`${m.name} (${m.role})`}
                        />
                      ))}
                      {project.members.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-600 font-mono text-[9px]">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMemberActionFeedback(null);
                        setMemberSearchQuery('');
                        setManagingMembersProject(project);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                      title="Manage project members"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">{project.members.length}</span>
                    </button>
                  </div>

                  {/* Tasks Counter & Action Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-medium">
                      {project.activeTasksCount} Tasks
                    </span>

                    {/* Creator Controls */}
                    {isCreator && (
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <button
                          type="button"
                          onClick={() => setEditingProject(project)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Edit project settings"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProject(project)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No projects found</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              No initiatives matched your search criteria. Create your first project to organize tasks, colleagues, and documentation.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Create New Project
            </button>
          </div>
        )}
      </div>

      {/* ─── 1. Create Project Modal ─────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Project</h3>
                <p className="text-xs text-slate-500 mt-0.5">You will become the owner and can manage members and tasks.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="create-proj-title" className="text-xs font-semibold text-slate-700 block mb-1">
                  Project Title *
                </label>
                <input 
                  id="create-proj-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Core API Infrastructure"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="create-proj-desc" className="text-xs font-semibold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea 
                  id="create-proj-desc"
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="High-level objectives, requirements, and sprint milestones..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg p-3 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="create-proj-status" className="text-xs font-semibold text-slate-700 block mb-1">
                    Status
                  </label>
                  <select 
                    id="create-proj-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'on-track' | 'at-risk' | 'completed')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="on-track">On Track</option>
                    <option value="at-risk">At Risk</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="create-proj-icon" className="text-xs font-semibold text-slate-700 block mb-1">
                    Icon
                  </label>
                  <select 
                    id="create-proj-icon"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value as 'palette' | 'rocket' | 'web' | 'layers' | 'code')}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="layers">Layers (Platform)</option>
                    <option value="palette">Palette (Design)</option>
                    <option value="rocket">Rocket (Launch)</option>
                    <option value="web">Web (Frontend)</option>
                    <option value="code">Code (Backend)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="create-proj-color" className="text-xs font-semibold text-slate-700 block mb-1">
                    Accent Color
                  </label>
                  <input 
                    id="create-proj-color"
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full h-8 bg-slate-50 border border-slate-200 rounded-lg p-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* Add Team Members during Project Creation */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Add Team Members
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {createMemberIds.length} {createMemberIds.length === 1 ? 'member' : 'members'} selected
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={createMemberSearch}
                    onChange={(e) => setCreateMemberSearch(e.target.value)}
                    placeholder="Filter team members by name or @username..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border border-slate-200 p-1.5 bg-slate-50/50">
                  {members
                    .filter((m) => {
                      if (!createMemberSearch.trim()) return true;
                      const q = createMemberSearch.toLowerCase();
                      return (
                        m.name.toLowerCase().includes(q) ||
                        (m.username?.toLowerCase().includes(q) ?? false) ||
                        (m.role?.toLowerCase().includes(q) ?? false)
                      );
                    })
                    .map((member) => {
                      const isSelected = createMemberIds.includes(member.id);
                      const isCreator = member.id === currentUser.id;

                      return (
                        <div
                          key={member.id}
                          onClick={() => {
                            if (isCreator) return; // Creator is always included
                            setCreateMemberIds((prev) =>
                              prev.includes(member.id)
                                ? prev.filter((id) => id !== member.id)
                                : [...prev, member.id]
                            );
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected || isCreator
                              ? 'bg-blue-50 border border-blue-200 text-blue-900'
                              : 'bg-white border border-slate-100 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold block truncate">
                                {member.name}
                                {isCreator && <span className="ml-1 text-[10px] text-blue-600 font-bold">(You / Owner)</span>}
                              </span>
                              {member.username && (
                                <span className="text-[10px] text-slate-400 block truncate">@{member.username}</span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelected || isCreator ? (
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 2. Edit Project Modal ───────────────────────────────── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Project Settings</h3>
              <button 
                onClick={() => setEditingProject(null)}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Project Title *
                </label>
                <input 
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea 
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg p-3 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status
                  </label>
                  <select 
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as Project['status'] })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="on-track">On Track</option>
                    <option value="at-risk">At Risk</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Progress ({editingProject.progress}%)
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={editingProject.progress}
                    onChange={(e) => setEditingProject({ ...editingProject, progress: parseInt(e.target.value, 10) || 0 })}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 3. Manage Members Modal ─────────────────────────────── */}
      {managingMembersProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Manage Project Members
                  </h3>
                  <p className="text-xs text-slate-500">
                    {managingMembersProject.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setManagingMembersProject(null)}
                className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification banner */}
            {memberActionFeedback && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                memberActionFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {memberActionFeedback.type === 'success' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{memberActionFeedback.message}</span>
              </div>
            )}

            <div className="overflow-y-auto flex-1 pr-1 space-y-5 my-4">
              {/* Current Members Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Active Project Members ({managingMembersProject.members.length})
                </h4>

                <div className="space-y-2">
                  {managingMembersProject.members.map((member) => {
                    const isProjectCreator = managingMembersProject.creatorId === member.id;
                    const canManage = managingMembersProject.creatorId === currentUser.id || !managingMembersProject.creatorId;

                    return (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" 
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {member.name}
                              </span>
                              {isProjectCreator && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                                  <Crown className="w-2.5 h-2.5" />
                                  Creator
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {member.email ?? member.role}
                            </span>
                          </div>
                        </div>

                        {/* Removal button: Only creator can remove members, and creator cannot remove self */}
                        {canManage && !isProjectCreator && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberFromProject(member.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={`Remove ${member.name} from this project`}
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Members by Username Search */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Add Team Member
                  </h4>
                  <span className="text-[11px] text-slate-500">Search username or email</span>
                </div>

                <div className="relative mb-3">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search by username (e.g. @sarah), display name, or email..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                  {isSearchingUsers && (
                    <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
                  )}
                </div>

                {/* Search Results List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {searchResults
                    .filter((u) => !managingMembersProject.members.some((m) => m.id === u.id))
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img 
                            src={user.avatar ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl'} 
                            alt={user.name ?? 'User'}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200" 
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {user.name}
                              {user.username && (
                                <span className="text-slate-400 font-normal ml-1">@{user.username}</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddMemberToProject(user.id)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}

                  {memberSearchQuery.trim() !== '' && searchResults.filter((u) => !managingMembersProject.members.some((m) => m.id === u.id)).length === 0 && !isSearchingUsers && (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                      No matching users found for &quot;{memberSearchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setManagingMembersProject(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. Delete Project Confirmation Modal ─────────────────── */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-rose-100 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900">Delete Project?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-900">&quot;{deletingProject.title}&quot;</span>? This will permanently delete the project and all tied documentation and tasks.
            </p>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
