"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Star, 
  Plus, 
  Edit3, 
  Check, 
  Lock, 
  Folder, 
  FolderOpen, 
  Trash2, 
  AlertCircle,
  X,
  Search
} from 'lucide-react';
import type { DocItem, Member, Project } from '~/types';

interface DocsViewProps {
  docs: DocItem[];
  projects: Project[];
  currentUser: Member;
  onCreateDoc: (doc: DocItem) => void;
  onUpdateDoc: (doc: DocItem) => void;
  onDeleteDoc?: (docId: string) => void;
}

export const DocsView: React.FC<DocsViewProps> = ({
  docs,
  projects,
  currentUser,
  onCreateDoc,
  onUpdateDoc,
  onDeleteDoc,
}) => {
  // Filter state: 'all' | 'personal' | projectId
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Engineering');
  const [newProjectId, setNewProjectId] = useState<string>('');
  const [deletingDoc, setDeletingDoc] = useState<DocItem | null>(null);

  // Active document selection and editing state
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  // Filter docs
  const filteredDocs = docs.filter((d) => {
    // Project / Privacy filter
    if (filterMode === 'personal') {
      if (d.projectId) return false;
    } else if (filterMode !== 'all') {
      if (d.projectId !== filterMode) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchCategory = d.category.toLowerCase().includes(q);
      const matchContent = d.content.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory && !matchContent) return false;
    }

    return true;
  });

  // Keep selectedDoc in sync
  const currentDoc = filteredDocs.find((d) => d.id === selectedDocId) ?? filteredDocs[0];
  const [content, setContent] = useState(currentDoc?.content ?? '');
  const [title, setTitle] = useState(currentDoc?.title ?? '');
  const [editProjectId, setEditProjectId] = useState<string>(currentDoc?.projectId ?? '');

  useEffect(() => {
    if (currentDoc) {
      setTitle(currentDoc.title);
      setContent(currentDoc.content);
      setEditProjectId(currentDoc.projectId ?? '');
    }
  }, [currentDoc]);

  const handleSelectDoc = (d: DocItem) => {
    setSelectedDocId(d.id);
    setTitle(d.title);
    setContent(d.content);
    setEditProjectId(d.projectId ?? '');
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!currentDoc) return;
    const trimmedTitle = title.trim();
    const updated: DocItem = {
      ...currentDoc,
      title: trimmedTitle !== '' ? trimmedTitle : 'Untitled Document',
      content,
      projectId: editProjectId !== '' ? editProjectId : null,
      projectName: projects.find((p) => p.id === editProjectId)?.title ?? null,
      updatedAt: 'Just now',
    };
    onUpdateDoc(updated);
    setIsEditing(false);
  };

  const handleOpenNewDocModal = () => {
    setNewTitle('');
    setNewCategory('Engineering');
    // Pre-select project if currently filtering by one
    setNewProjectId(filterMode !== 'all' && filterMode !== 'personal' ? filterMode : '');
    setIsNewDocModalOpen(true);
  };

  const handleCreateDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const assignedProject = projects.find((p) => p.id === newProjectId);

    const newDoc: DocItem = {
      id: `doc-${Date.now()}`,
      title: trimmedTitle,
      author: currentUser,
      updatedAt: 'Just now',
      category: newCategory,
      projectId: newProjectId !== '' ? newProjectId : null,
      projectName: assignedProject?.title ?? null,
      content: `# ${trimmedTitle}\n\n### 1. Overview\nDescribe the objectives and requirements.\n\n### 2. Specifications\nDetail the architecture, milestones, or team agreements.`,
      starred: false,
    };

    onCreateDoc(newDoc);
    setIsNewDocModalOpen(false);
    setSelectedDocId(newDoc.id);
    setIsEditing(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingDoc || !onDeleteDoc) return;
    onDeleteDoc(deletingDoc.id);
    setDeletingDoc(null);
    if (selectedDocId === deletingDoc.id) {
      setSelectedDocId('');
    }
  };

  return (
    <div id="docs-view" className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Documentation & RFCs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create specifications inside projects to collaborate with teammates, or keep private personal notes.
          </p>
        </div>

        <button
          id="btn-new-doc-modal"
          onClick={handleOpenNewDocModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 self-start sm:self-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Document</span>
        </button>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        {/* Project / Privacy Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>All Documents</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {docs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('personal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterMode === 'personal'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Personal Notes</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {docs.filter((d) => !d.projectId).length}
            </span>
          </button>

          {projects.map((project) => {
            const count = docs.filter((d) => d.projectId === project.id).length;
            const isSelected = filterMode === project.id;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setFilterMode(project.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{project.title}</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left Sidebar List of Docs */}
        <div className="md:col-span-4 space-y-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 max-h-[600px] overflow-y-auto">
            {filteredDocs.map((d) => {
              const isSelected = d.id === currentDoc?.id;
              const isPersonal = !d.projectId;

              return (
                <button
                  key={d.id}
                  onClick={() => handleSelectDoc(d)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-2.5 border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-medium'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">
                        {d.title}
                      </h4>
                      {isPersonal && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[9px] font-medium" title="Personal note">
                          <Lock className="w-2.5 h-2.5" />
                          Personal
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {d.projectName ? `${d.projectName} • ` : ''}{d.category} • {d.updatedAt}
                    </p>
                  </div>
                  {d.starred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                </button>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No documents found</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {filterMode === 'personal'
                    ? 'No personal notes created yet.'
                    : filterMode !== 'all'
                    ? 'No documents in this project yet.'
                    : 'Create your first document to start collaborating.'}
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewDocModal}
                  className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  + Create Document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Editor / Reader Area */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          {currentDoc ? (
            <div className="space-y-5">
              {/* Document Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex-1 mr-4">
                  {/* Project / Privacy Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {currentDoc.projectId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium">
                        <Folder className="w-3 h-3" />
                        <span>Project: {currentDoc.projectName ?? projects.find((p) => p.id === currentDoc.projectId)?.title ?? 'Linked'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Personal Document (Confidential)</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400 dark:text-slate-500">• {currentDoc.category}</span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-bold text-slate-900 dark:text-white w-full border-b border-blue-500 pb-1 focus:outline-none bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Document Title"
                      />

                      {/* Project selector while editing */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-slate-500 dark:text-slate-400">Project:</span>
                        <select
                          value={editProjectId}
                          onChange={(e) => setEditProjectId(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="">🔒 Personal (Private to you)</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>📁 {p.title} (Shared)</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentDoc.title}</h2>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <img
                      src={currentDoc.author.avatar}
                      alt={currentDoc.author.name}
                      className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <span>{currentDoc.author.name}</span>
                    <span>• Updated {currentDoc.updatedAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Edit Document</span>
                    </button>
                  )}

                  {onDeleteDoc && (
                    <button
                      type="button"
                      onClick={() => setDeletingDoc(currentDoc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              {isEditing ? (
                <textarea
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg p-4 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {currentDoc.content}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select a document to read</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Choose a document from the left list or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Create New Doc Modal ─────────────────────────────────── */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Document</h3>
              <button
                onClick={() => setIsNewDocModalOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Database Scaling RFC"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Project Scope
                  </label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="">🔒 Personal (Only You)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>📁 {p.title} (Shared)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Research">Research</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {newProjectId !== '' ? (
                  <span>
                    👥 <strong className="text-slate-700 dark:text-slate-200">Shared Project Doc:</strong> All members of this project can view and collaborate on this specification.
                  </span>
                ) : (
                  <span>
                    🔒 <strong className="text-slate-700 dark:text-slate-200">Personal Note:</strong> Only your account will have access to view or edit this document.
                  </span>
                )}
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Doc Confirmation Modal ───────────────────────── */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-rose-100 dark:border-rose-900/40 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Document?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-900 dark:text-white">&quot;{deletingDoc.title}&quot;</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
