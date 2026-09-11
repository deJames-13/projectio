import { PrismaClient } from '../generated/prisma/index.js';
import { hashPassword } from '../src/server/auth/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding multi-tenant workspace database...');

  // 1. Create Default Primary User (Dej Espinosa)
  const dejPasswordHash = hashPassword('password123');
  const dejUser = await prisma.user.upsert({
    where: { email: 'dej@projectio.app' },
    update: {
      password: dejPasswordHash,
      role: 'Product Lead',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl',
    },
    create: {
      id: 'user-dej',
      name: 'Dej Espinosa',
      role: 'Product Lead',
      email: 'dej@projectio.app',
      password: dejPasswordHash,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPiBHbzlRcYg-VzCqa9abHJPIL9BG3hsGjYrg1YuEcxLAvZq_28HBmgi_vVLY6LXX7ZLaii2TP2mN0ONbeRSEH2c_Ibxi5ywHFNR7lVUkiKau_ETuEQldb9XY_n-cmgh6J8dkSEkOfWl_rc3FR_aARvAIKhgC0Yn2AH8nQGjbcdI-uqCEYXbZcXPFET1BithmzsIN6cfFU0OX4wNbW_8_sJ44MN0imLRt2A1p_RKkP2z0-H1SMUwtl',
    },
  });

  // 2. Create Colleague Users
  const colleagues = [
    {
      id: 'user-sarah-jenkins',
      name: 'Sarah Jenkins',
      role: 'Senior Frontend Engineer',
      email: 'sarah.jenkins@projectio.app',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPRaCZjyTjXGZN-LtF6i2zjJyo-hQurV8V86jZjrUHN4RwX99lEKcgWm-ikVAXt0gdZ3mi-IMADFyW5IrhVTeSAn7iOiN0D2GlhA-8rCRjPMcj4nWuAUreTvBlIlwrx5puRG9lV_LbQqqerNCF1JYYBY5ghI-iNMJJ3cdqfdKtjnVxdGt4tUd0vB3ypV7-djVro8dtUKK2O-6DtmFtRh74aG35viKJ99kn6YsLOaXaYrJUh163mfq-',
    },
    {
      id: 'user-elena-rossi',
      name: 'Elena Rossi',
      role: 'Staff Product Designer',
      email: 'elena.rossi@projectio.app',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOlcPu714ktL5corKfoeN-BlKIJTulowIOefZ6Jb09k_hJ0fNrKtxZVA3c1zZu-fpGR-PCfqWcWeqDme84PDddi89uFlOBsgUkV-OI6KZ0CDjE7DvvFlE5v-H-4LjoKAzrpfXDJR2ikTdrTAUbUBKR3XJ-9njSvZv8LwlGssSHALCh__Y71OPo8kbtdrl7P8pocQkPINzJAARehFRq1zp0vkhuQJ_RWdPLh5hRhMkrXqK780GkbrOm',
    },
    {
      id: 'user-marcus-johnson',
      name: 'Marcus Johnson',
      role: 'Backend Architect',
      email: 'marcus.j@projectio.app',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCs5gf5DjTXC2Vl9cRL_b6rEsBOtEkC1JIM04RafWhxRDxHViyae4usIO7jn6DtdEkFRfaffCnPgHyp0qnVIxOK4h5WOeFVcu-dFC1T194RRgG_d2Vlj-Q-rTOCGqbp-xjq0TBpIAx1WWnqcPfFp4cFwBmmVfeGxx2aYk2ZYQZCILQLP57lpPKORCYK9PWKR1x5IO5VUR-2SEmj5n8zp24OOSR2huiAUzswF0oVFUJy-3qcEtKSB23F',
    },
    {
      id: 'user-sarah-chen',
      name: 'Sarah Chen',
      role: 'Brand & Motion Designer',
      email: 'sarah.chen@projectio.app',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpHhu5Io_1Iuabvwol0RMBl2PXIO3StGbm6b9hAvA_v6HTQdJ1vR-Qete5OAHSUHBKS-Y__rMgkfoLoTKKzdOu8yVWWiokMzEcVsU6_j7f-w2kp845OSCaxOcVcFzc_wiTczBSZ2yC2SzQcIbvtvlf4uitVXWDClP1GxnL4GsfylSwwzqJ_7t6eWSrJejVbyDzoTfqBNDhiru_8oT_6nLknMsNln3ZMACyLcfhyO8D28eLbVoTgzJ4',
    },
  ];

  for (const c of colleagues) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: c,
      create: c,
    });
  }

  // 3. Create Default Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'projectio' },
    update: {
      name: 'Projectio Workspace',
      ownerId: dejUser.id,
    },
    create: {
      id: 'ws-projectio-main',
      name: 'Projectio Workspace',
      slug: 'projectio',
      ownerId: dejUser.id,
    },
  });

  // 4. Link Members to Workspace
  const allUserIds = [dejUser.id, ...colleagues.map((c) => c.id)];
  for (const userId of allUserIds) {
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId,
        },
      },
      update: {
        role: userId === dejUser.id ? 'Owner' : 'Member',
      },
      create: {
        workspaceId: workspace.id,
        userId,
        role: userId === dejUser.id ? 'Owner' : 'Member',
      },
    });
  }

  // 5. Seed Projects for Workspace
  const proj1 = await prisma.project.create({
    data: {
      id: 'proj-1',
      workspaceId: workspace.id,
      title: 'Design System',
      description: 'Unifying visual language across all platforms with a comprehensive component library.',
      status: 'on-track',
      statusLabel: 'On Track',
      progress: 78,
      activeTasksCount: 24,
      iconType: 'palette',
      accentColor: '#4f46e5',
      members: {
        connect: [{ id: dejUser.id }, { id: 'user-sarah-jenkins' }, { id: 'user-marcus-johnson' }],
      },
    },
  });

  const proj2 = await prisma.project.create({
    data: {
      id: 'proj-2',
      workspaceId: workspace.id,
      title: 'Q3 Launch',
      description: 'Major marketing push and feature release for the upcoming quarter.',
      status: 'at-risk',
      statusLabel: 'At Risk',
      progress: 42,
      activeTasksCount: 86,
      iconType: 'rocket',
      accentColor: '#c5221f',
      members: {
        connect: [{ id: dejUser.id }, { id: 'user-elena-rossi' }],
      },
    },
  });

  // 6. Seed Tasks for Workspace
  const tasks = [
    {
      id: 'APP-142',
      workspaceId: workspace.id,
      projectId: proj1.id,
      title: 'Implement Real-time Collaboration Cursor',
      description: 'Provide low-latency multiplayer presence and live cursor positioning across shared canvas views.',
      status: 'in-progress',
      priority: 'High',
      priorityLabel: 'High',
      team: 'Engineering',
      dueTime: 'Today',
      dateRange: 'Oct 12 - Oct 24',
      completed: false,
      assigneeId: 'user-sarah-jenkins',
      gitBranch: 'feat/cursor-sync',
      blocks: 'APP-145',
    },
    {
      id: 'APP-140',
      workspaceId: workspace.id,
      projectId: proj2.id,
      title: 'Finalize Q4 Marketing Assets',
      description: 'Export all high-resolution banners, social graphics, and product mockups for global rollout.',
      status: 'todo',
      priority: 'P0',
      priorityLabel: 'P0',
      team: 'Design Team',
      dueTime: '2:00 PM',
      dateRange: 'Oct 20 - Oct 24',
      completed: false,
      assigneeId: 'user-elena-rossi',
      gitBranch: 'design/q4-assets',
    },
    {
      id: 'APP-141',
      workspaceId: workspace.id,
      projectId: proj1.id,
      title: 'Review Engineering Specs',
      description: 'Cross-functional review of distributed caching layer and JWT revocation schema.',
      status: 'in-progress',
      priority: 'P1',
      priorityLabel: 'P1',
      team: 'Engineering',
      dueTime: '4:30 PM',
      dateRange: 'Oct 22 - Oct 25',
      completed: false,
      assigneeId: 'user-marcus-johnson',
      gitBranch: 'spec/distributed-cache',
    },
    {
      id: 'APP-139',
      workspaceId: workspace.id,
      projectId: proj1.id,
      title: 'Client Update Meeting Prep',
      description: 'Compile monthly deliverables recap, SLA metrics, and roadmap.',
      status: 'todo',
      priority: 'P2',
      priorityLabel: 'P2',
      team: 'Engineering',
      dueTime: 'Tomorrow',
      completed: false,
      assigneeId: dejUser.id,
    },
    {
      id: 'APP-135',
      workspaceId: workspace.id,
      projectId: proj1.id,
      title: 'Brand Guidelines V2 Documentation',
      description: 'Complete color palette accessibility audit, typography step scales, and token exports.',
      status: 'done',
      priority: 'P0',
      priorityLabel: 'P0',
      team: 'Design Team',
      dueTime: 'Completed',
      completed: true,
      assigneeId: 'user-sarah-chen',
    },
  ];

  for (const t of tasks) {
    await prisma.task.create({ data: t });
  }

  // 7. Seed Activities
  await prisma.activity.createMany({
    data: [
      {
        id: 'act-1',
        workspaceId: workspace.id,
        action: 'moved',
        target: 'Brand Guidelines V2',
        targetId: 'APP-135',
        timeAgo: '10 minutes ago',
        board: 'Design Board',
        type: 'move',
        userId: 'user-sarah-chen',
      },
      {
        id: 'act-2',
        workspaceId: workspace.id,
        action: 'commented on',
        target: 'Real-time Collaboration Cursor',
        targetId: 'APP-142',
        timeAgo: '1 hour ago',
        board: 'Engineering Board',
        comment: 'Performance benchmark tests look fantastic.',
        type: 'comment',
        userId: 'user-marcus-johnson',
      },
    ],
  });

  // 8. Seed Milestones
  await prisma.milestone.createMany({
    data: [
      {
        id: 'ms-1',
        workspaceId: workspace.id,
        title: 'Core Engine v2.0 Staging Release',
        date: 'Oct 28',
        team: 'Engineering',
        status: 'current',
      },
      {
        id: 'ms-2',
        workspaceId: workspace.id,
        title: 'Q4 Brand Identity Rollout',
        date: 'Nov 15',
        team: 'Design Team',
        status: 'upcoming',
      },
    ],
  });

  // 9. Seed Docs
  await prisma.doc.createMany({
    data: [
      {
        id: 'doc-1',
        workspaceId: workspace.id,
        title: 'Design System 2.0 Guidelines',
        updatedAt: '2 hours ago',
        category: 'Design',
        content: '# Design System Guidelines\n\nTokens, typography scales, and WCAG AA accessibility specs.',
        starred: true,
        authorId: dejUser.id,
      },
      {
        id: 'doc-2',
        workspaceId: workspace.id,
        title: 'Multi-tenant Workspace Architecture',
        updatedAt: '1 day ago',
        category: 'Architecture',
        content: '# Multi-tenant Workspace Architecture\n\nData partitioning by workspaceId with JWT session verification.',
        starred: false,
        authorId: 'user-marcus-johnson',
      },
    ],
  });

  // 10. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        id: 'notif-1',
        userId: dejUser.id,
        text: 'Sarah Jenkins moved Real-time Collaboration Cursor to In Progress',
        timeAgo: '5 min ago',
        read: false,
        type: 'assignment',
        taskId: 'APP-142',
      },
      {
        id: 'notif-2',
        userId: dejUser.id,
        text: 'Marcus Johnson mentioned you in Engineering Specs review',
        timeAgo: '1 hour ago',
        read: false,
        type: 'mention',
        taskId: 'APP-141',
      },
    ],
  });

  console.log('✅ Seed completed successfully! Default user: dej@projectio.app / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
