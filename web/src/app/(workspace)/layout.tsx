"use client";

import React, { type ReactNode } from "react";
import { WorkspaceProvider } from "~/contexts/WorkspaceContext";
import { WorkspaceShell } from "~/components/layout/WorkspaceShell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
