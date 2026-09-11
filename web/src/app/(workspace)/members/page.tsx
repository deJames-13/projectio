"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { MembersView } from "~/components/MembersView";

export default function MembersDirectoryPage() {
  const router = useRouter();
  const workspace = useWorkspace();

  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  return (
    <MembersView
      members={workspace.members}
      projects={workspace.projects}
      tasks={workspace.tasks}
      currentUser={workspace.currentUser}
      onAddMember={workspace.handleAddMember}
      onSelectProject={(projectId) => router.push(`/projects/${projectId}`)}
      isLoading={workspace.isLoading && workspace.members.length === 0}
      isError={workspace.hasError && workspace.members.length === 0}
      onRetry={() => void workspace.refetchAll()}
    />
  );
}
