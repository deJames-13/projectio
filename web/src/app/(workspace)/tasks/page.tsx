"use client";

import React, { useEffect } from "react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { TasksKanbanView } from "~/components/TasksKanbanView";

export default function TasksPage() {
  const workspace = useWorkspace();

  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  return (
    <TasksKanbanView
      tasks={workspace.myTasks}
      isPersonalView={true}
      currentUser={workspace.currentUser}
      onSelectTask={(task) => workspace.setSelectedTask(task)}
      onUpdateTaskStatus={workspace.handleUpdateTaskStatus}
      onOpenNewTaskWithStatus={(status) => {
        workspace.openNewTaskModal(status, null);
      }}
      projects={workspace.projects}
      members={workspace.members}
    />
  );
}
