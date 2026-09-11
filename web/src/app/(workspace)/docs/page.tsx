"use client";

import React, { useEffect } from "react";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { DocsView } from "~/components/DocsView";

export default function DocsPage() {
  const workspace = useWorkspace();

  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  return (
    <DocsView
      docs={workspace.docs}
      projects={workspace.projects}
      currentUser={workspace.currentUser}
      onCreateDoc={workspace.handleCreateDoc}
      onUpdateDoc={workspace.handleUpdateDoc}
      onDeleteDoc={workspace.handleDeleteDoc}
    />
  );
}
