"use client";

import React, { useEffect } from "react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { InboxView } from "~/components/InboxView";

export default function InboxPage() {
  const workspace = useWorkspace();

  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  return (
    <InboxView
      notifications={workspace.notifications}
      onMarkNotificationRead={workspace.handleMarkNotificationRead}
      onSelectTask={workspace.selectTaskById}
      onMarkAllRead={workspace.handleMarkAllRead}
    />
  );
}
