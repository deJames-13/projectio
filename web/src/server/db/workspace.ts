import { type PrismaClient } from "../../../generated/prisma";

/**
 * Creates and initializes a complete, rich starter workspace for a newly registered user.
 * Ensures each user has their own isolated workspace, projects, and tasks.
 */
export async function initializeUserWorkspace(
  db: PrismaClient,
  user: { id: string; name?: string | null; email?: string | null },
) {
  const workspaceSlug = `${(user.email ?? "user").split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, "-") ?? "workspace"}-${Date.now().toString().slice(-4)}`;
  const workspaceName = `${user.name ?? "Personal"} Workspace`;

  // 1. Create the user's isolated workspace
  const workspace = await db.workspace.create({
    data: {
      name: workspaceName,
      slug: workspaceSlug,
      owner: { connect: { id: user.id } },
      members: {
        create: {
          userId: user.id,
          role: "Owner",
        },
      },
    },
  });

  // 2. Add standard sample team members to this workspace so the user can assign tasks
  const sampleColleagues = [
    {
      id: `user-sarah-${workspace.id.slice(-4)}`,
      name: "Sarah Jenkins",
      role: "Senior Frontend Engineer",
      email: `sarah.${workspace.id.slice(-4)}@projectio.app`,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPRaCZjyTjXGZN-LtF6i2zjJyo-hQurV8V86jZjrUHN4RwX99lEKcgWm-ikVAXt0gdZ3mi-IMADFyW5IrhVTeSAn7iOiN0D2GlhA-8rCRjPMcj4nWuAUreTvBlIlwrx5puRG9lV_LbQqqerNCF1JYYBY5ghI-iNMJJ3cdqfdKtjnVxdGt4tUd0vB3ypV7-djVro8dtUKK2O-6DtmFtRh74aG35viKJ99kn6YsLOaXaYrJUh163mfq-",
    },
    {
      id: `user-marcus-${workspace.id.slice(-4)}`,
      name: "Marcus Johnson",
      role: "Backend Architect",
      email: `marcus.${workspace.id.slice(-4)}@projectio.app`,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCs5gf5DjTXC2Vl9cRL_b6rEsBOtEkC1JIM04RafWhxRDxHViyae4usIO7jn6DtdEkFRfaffCnPgHyp0qnVIxOK4h5WOeFVcu-dFC1T194RRgG_d2Vlj-Q-rTOCGqbp-xjq0TBpIAx1WWnqcPfFp4cFwBmmVfeGxx2aYk2ZYQZCILQLP57lpPKORCYK9PWKR1x5IO5VUR-2SEmj5n8zp24OOSR2huiAUzswF0oVFUJy-3qcEtKSB23F",
    },
    {
      id: `user-elena-${workspace.id.slice(-4)}`,
      name: "Elena Rossi",
      role: "Staff Product Designer",
      email: `elena.${workspace.id.slice(-4)}@projectio.app`,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOlcPu714ktL5corKfoeN-BlKIJTulowIOefZ6Jb09k_hJ0fNrKtxZVA3c1zZu-fpGR-PCfqWcWeqDme84PDddi89uFlOBsgUkV-OI6KZ0CDjE7DvvFlE5v-H-4LjoKAzrpfXDJR2ikTdrTAUbUBKR3XJ-9njSvZv8LwlGssSHALCh__Y71OPo8kbtdrl7P8pocQkPINzJAARehFRq1zp0vkhuQJ_RWdPLh5hRhMkrXqK780GkbrOm",
    },
  ];

  for (const colleague of sampleColleagues) {
    const createdColleague = await db.user.upsert({
      where: { email: colleague.email },
      update: {},
      create: {
        id: colleague.id,
        name: colleague.name,
        email: colleague.email,
        role: colleague.role,
        avatar: colleague.avatar,
      },
    });

    await db.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: createdColleague.id,
        role: "Member",
      },
    });
  }

  // 3. Create starter projects for this workspace
  const proj1 = await db.project.create({
    data: {
      workspaceId: workspace.id,
      creatorId: user.id,
      title: "Design System",
      description: "Unifying visual tokens and accessible components across all web platforms.",
      status: "on-track",
      statusLabel: "On Track",
      progress: 75,
      activeTasksCount: 14,
      iconType: "palette",
      accentColor: "#4f46e5",
      members: {
        connect: [{ id: user.id }, { id: sampleColleagues[0]!.id }],
      },
    },
  });

  const proj2 = await db.project.create({
    data: {
      workspaceId: workspace.id,
      creatorId: user.id,
      title: "Core Platform Launch",
      description: "High-throughput API endpoints, analytics telemetry, and distributed caching.",
      status: "on-track",
      statusLabel: "On Track",
      progress: 40,
      activeTasksCount: 22,
      iconType: "rocket",
      accentColor: "#2563eb",
      members: {
        connect: [{ id: user.id }, { id: sampleColleagues[1]!.id }],
      },
    },
  });

  // 4. Create starter tasks for this workspace
  const starterTasks = [
    {
      id: `APP-${workspace.id.slice(-4)}-1`,
      workspaceId: workspace.id,
      projectId: proj1.id,
      title: "Audit color tokens for WCAG 2.1 AA contrast",
      description: "Ensure all surface-to-text token pairings meet the 4.5:1 minimum contrast ratio.",
      status: "in-progress",
      priority: "High",
      priorityLabel: "P0",
      team: "Design Team",
      dueTime: "Today",
      dateRange: "Oct 12 - Oct 24",
      completed: false,
      assigneeId: user.id,
      gitBranch: "design/color-contrast-audit",
    },
    {
      id: `APP-${workspace.id.slice(-4)}-2`,
      workspaceId: workspace.id,
      projectId: proj2.id,
      title: "Implement workspace isolation and auth guards",
      description: "Ensure multi-tenant data partitioning and session verification across all queries.",
      status: "done",
      priority: "P0",
      priorityLabel: "P0",
      team: "Engineering",
      dueTime: "Completed",
      completed: true,
      assigneeId: user.id,
      gitBranch: "feat/workspace-auth",
    },
    {
      id: `APP-${workspace.id.slice(-4)}-3`,
      workspaceId: workspace.id,
      projectId: proj2.id,
      title: "Setup real-time presence indicators and collaborative drawers",
      description: "Multiplex cursor updates and drawer focus indicators through WebSockets.",
      status: "todo",
      priority: "Medium",
      priorityLabel: "P1",
      team: "Engineering",
      dueTime: "Tomorrow",
      dateRange: "Oct 24 - Oct 30",
      completed: false,
      assigneeId: sampleColleagues[0]!.id,
      gitBranch: "feat/collaborative-presence",
    },
  ];

  for (const t of starterTasks) {
    await db.task.create({ data: t });
  }

  // 5. Create starter activity & milestone
  await db.activity.create({
    data: {
      workspaceId: workspace.id,
      action: "created workspace",
      target: workspace.name,
      timeAgo: "Just now",
      board: "Workspace",
      type: "create",
      userId: user.id,
    },
  });

  await db.milestone.create({
    data: {
      workspaceId: workspace.id,
      title: "Sprint v1.0 Release",
      date: "End of Month",
      team: "Core Engineering",
      status: "current",
    },
  });

  await db.doc.create({
    data: {
      workspaceId: workspace.id,
      projectId: proj1.id,
      title: "Design System Tokens & Specifications",
      category: "Engineering",
      content: `# Design System Tokens & Guidelines\n\nThis specification outlines color tokens, typography scales, and interactive states for the Design System project.\n\nAll members of the Design System project can view and collaborate on this document.`,
      updatedAt: "Just now",
      authorId: user.id,
    },
  });

  await db.doc.create({
    data: {
      workspaceId: workspace.id,
      projectId: null,
      title: "Personal Scratchpad & Private Notes",
      category: "Personal",
      content: `# My Private Scratchpad\n\nThis is a private document visible only to you. Documents without an assigned project remain strictly confidential to your account.`,
      updatedAt: "Just now",
      authorId: user.id,
    },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      text: `Welcome to ${workspace.name}! Your workspace is fully set up.`,
      timeAgo: "Just now",
      read: false,
      type: "assignment",
    },
  });

  return workspace;
}
