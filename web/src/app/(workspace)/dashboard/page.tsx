"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { HomeDashboard } from "~/components/HomeDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const workspace = useWorkspace();

  // Reset active project context on dashboard
  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  return (
    <HomeDashboard
      tasks={workspace.tasks}
      onToggleTaskComplete={workspace.handleToggleTaskComplete}
      onSelectTask={(task) => workspace.setSelectedTask(task)}
      onViewAllTasks={() => router.push("/tasks")}
      activities={workspace.activities}
      milestones={workspace.milestones}
      currentUser={workspace.currentUser}
      onOpenNewTask={() => workspace.openNewTaskModal()}
    />
  );
}
