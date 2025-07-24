import type { Project } from "../types/proyect";
import type { GanttTask } from "../types/ganttTask";

// Convierte tu estructura jerárquica en una lista plana para Frappe Gantt
export function flattenForGantt( 
    projects: Project[],
    expandedIds: string[],
    parentId: string | null = null,
    level: number = 0
  ): GanttTask[] {
    let tasks: GanttTask[] = [];
    for (const p of projects) {
      tasks.push({
        id: p.id,
        name: `${' '.repeat(level * 2)}${p.name}`,
        start: p.startDate.toISOString().split("T")[0],
        end: p.endDate.toISOString().split("T")[0],
        progress: p.status as unknown as number * 100,
        custom_class: p.statusColor as unknown as "En-Tiempo" | "Atrasado" | "Finalizado" | "No-Iniciado",
        dependencies: p.dependencies,
        parentId,
        _hasChildren: !!(p.children && p.children.length > 0),
        level,
        programa: p.programa,
        expected_progress: 80,
      });
      if (expandedIds.includes(p.id) && p.children && p.children.length) {
        tasks = tasks.concat(flattenForGantt(p.children, expandedIds, p.id, level + 1));
      }
    }
    return tasks;
  }