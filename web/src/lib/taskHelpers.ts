import type { Task, Subtask, SprintTelemetry } from '~/types';

/**
 * Parses subtasks embedded in the task description or markdown checklists.
 */
export function parseTaskSubtasks(description?: string | null): { 
  cleanDescription: string; 
  subtasks: Subtask[];
} {
  if (!description) {
    return { cleanDescription: '', subtasks: [] };
  }

  // 1. Structured subtasks comment marker
  const marker = '<!-- subtasks:';
  const idx = description.indexOf(marker);
  if (idx !== -1) {
    const endIdx = description.indexOf('-->', idx);
    if (endIdx !== -1) {
      const jsonStr = description.substring(idx + marker.length, endIdx).trim();
      try {
        const parsed = JSON.parse(jsonStr) as Subtask[];
        const cleanDescription = (
          description.substring(0, idx) + description.substring(endIdx + 3)
        ).trim();
        return { cleanDescription, subtasks: parsed };
      } catch {
        // Fallback if parsing fails
      }
    }
  }

  // 2. Markdown checkbox parser (- [ ] or - [x])
  const lines = description.split('\n');
  const subtasks: Subtask[] = [];
  const textLines: string[] = [];

  const checkboxRegex = /^[-*]\s*\[([ xX])\]\s*(.+)$/;
  for (const line of lines) {
    const match = checkboxRegex.exec(line);
    if (match) {
      subtasks.push({
        id: `st-${subtasks.length + 1}`,
        title: match[2]?.trim() ?? '',
        completed: match[1]?.toLowerCase() === 'x',
      });
    } else {
      textLines.push(line);
    }
  }

  if (subtasks.length > 0) {
    return { cleanDescription: textLines.join('\n').trim(), subtasks };
  }

  return { cleanDescription: description, subtasks: [] };
}

/**
 * Serializes subtasks into task description without altering user text.
 */
export function serializeTaskDescription(cleanDescription: string, subtasks: Subtask[]): string {
  const base = cleanDescription.trim();
  if (!subtasks || subtasks.length === 0) {
    return base;
  }
  return `${base}\n\n<!-- subtasks:${JSON.stringify(subtasks)} -->`;
}

/**
 * Computes active sprint telemetry from a list of tasks.
 */
export function calculateSprintTelemetry(
  tasks: Task[], 
  sprintName = 'Sprint 24 — Core Platform',
  targetDate = 'Oct 24, 2026'
): SprintTelemetry {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done' || t.completed).length;
  const velocityPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Approximate days remaining (or standard default)
  const daysRemaining = 8;

  return {
    id: 'sprint-active',
    name: sprintName,
    targetDate,
    daysRemaining,
    totalTasks,
    completedTasks,
    velocityPercentage,
  };
}

/**
 * Evaluates whether a task is blocked and what tasks it blocks.
 */
export function getTaskBlockerStatus(
  task: Task, 
  allTasks: Task[]
): {
  isBlocked: boolean;
  blockerTask: Task | null;
  blockingTasks: Task[];
} {
  // A task is blocked if another task has its id in `blocks`
  const blockerTask = allTasks.find((t) => t.blocks === task.id) ?? null;
  const isBlocked = Boolean(blockerTask && blockerTask.status !== 'done' && !blockerTask.completed);

  // Tasks that THIS task blocks
  const blockingTasks = task.blocks 
    ? allTasks.filter((t) => t.id === task.blocks)
    : [];

  return {
    isBlocked,
    blockerTask,
    blockingTasks,
  };
}
