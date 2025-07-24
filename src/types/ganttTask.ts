export interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    expected_progress: number;
    custom_class: "En-Tiempo" | "Atrasado" | "Finalizado" | "No-Iniciado";
    parentId: string | null;
    _hasChildren: boolean;
    level: number;
    programa: string;
    dependencies: string[];
  }