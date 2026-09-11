"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { ProjectsView } from "~/components/ProjectsView";

export default function ProjectsDirectoryPage() {
  const router = useRouter();
  const workspace = useWorkspace();

  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  const handleSelectProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = async (projectData: {
    title: string;
    description: string;
    status: 'on-track' | 'at-risk' | 'completed' | 'delayed';
    iconType: string;
    accentColor: string;
    memberIds?: string[];
  }) => {
    const createdId = await workspace.handleCreateProject(projectData);
    if (createdId) {
      router.push(`/projects/${createdId}`);
    }
  };

  return (
    <ProjectsView
      projects={workspace.projects}
      currentUser={workspace.currentUser}
      onSelectProject={handleSelectProject}
      onCreateProject={handleCreateProject}
      onUpdateProject={workspace.handleUpdateProject}
      onDeleteProject={workspace.handleDeleteProject}
      onAddProjectMember={workspace.handleAddProjectMember}
      onRemoveProjectMember={workspace.handleRemoveProjectMember}
      members={workspace.members}
    />
  );
}
