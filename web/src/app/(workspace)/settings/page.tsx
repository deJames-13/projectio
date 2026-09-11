"use client";

import React, { useEffect } from "react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { SettingsView } from "~/components/SettingsView";

export default function SettingsPage() {
  const workspace = useWorkspace();

  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  return (
    <SettingsView
      members={workspace.members}
      currentUser={workspace.currentUser}
      onAddMember={workspace.handleAddMember}
    />
  );
}
