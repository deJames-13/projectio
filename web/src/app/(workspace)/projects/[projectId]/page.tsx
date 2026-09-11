"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { ProjectDetailView } from "~/components/ProjectDetailView";
import { FolderX, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspace = useWorkspace();

  const projectId = typeof params?.projectId === "string" ? params.projectId : "";
  const rawSubTab = searchParams?.get("tab");
  const activeSubTab =
    rawSubTab === "members" || rawSubTab === "docs" || rawSubTab === "settings"
      ? rawSubTab
      : "tasks";

  // Locate the project from workspace state
  const project = useMemo(() => {
    return workspace.projects.find((p) => p.id === projectId) ?? null;
  }, [workspace.projects, projectId]);

  // Synchronize active project with workspace context for shell breadcrumbs
  useEffect(() => {
    if (project) {
      workspace.setActiveProject(project);
      workspace.setActiveProjectSubTab(activeSubTab);
    }
    return () => {
      // Don't immediately null on unmount if moving to subtab
    };
  }, [project, activeSubTab, workspace]);

  // Loading state
  if (workspace.isLoading && !project) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading project details…</span>
        </div>
      </div>
    );
  }

  // Not found state (Tier 3 Anti-Slop 5-state complete)
  if (!project) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-50/50 dark:ring-amber-900/20">
            <FolderX className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Project Not Found</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              The project you requested does not exist or has been removed from this workspace.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  const handleSubTabChange = (tab: "tasks" | "members" | "docs" | "settings") => {
    router.push(`/projects/${project.id}?tab=${tab}`);
  };

  return (
    <ProjectDetailView
      project={project}
      tasks={workspace.tasks}
      docs={workspace.docs}
      members={workspace.members}
      currentUser={workspace.currentUser}
      activeSubTab={activeSubTab}
      onSubTabChange={handleSubTabChange}
      onBackToProjects={() => router.push("/projects")}
      onSelectTask={(task) => workspace.setSelectedTask(task)}
      onOpenNewTask={(status, pId) => {
        workspace.openNewTaskModal(status ?? "todo", pId ?? project.id);
      }}
      onUpdateTaskStatus={workspace.handleUpdateTaskStatus}
      onToggleTaskComplete={workspace.handleToggleTaskComplete}
      onUpdateProject={workspace.handleUpdateProject}
      onDeleteProject={(id) => workspace.handleDeleteProject(id)}
      onAddProjectMember={workspace.handleAddProjectMember}
      onRemoveProjectMember={workspace.handleRemoveProjectMember}
      onCreateDoc={workspace.handleCreateDoc}
    />
  );
}
