"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWorkspace } from "~/contexts/WorkspaceContext";
import { SettingsView } from "~/components/SettingsView";

function SettingsPageInner() {
  const workspace = useWorkspace();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "profile" | "workspace" | "members" | "security" | null;

  useEffect(() => {
    workspace.setActiveProject(null);
    workspace.setActiveProjectSubTab("tasks");
  }, [workspace]);

  return (
    <SettingsView
      members={workspace.members}
      currentUser={workspace.currentUser}
      onAddMember={workspace.handleAddMember}
      onUpdateProfile={workspace.handleUpdateProfile}
      initialTab={tabParam ?? "profile"}
    />
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-5xl mx-auto animate-pulse text-xs text-slate-400">Loading settings...</div>}>
      <SettingsPageInner />
    </Suspense>
  );
}
