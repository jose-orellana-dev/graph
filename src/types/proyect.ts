export interface Project {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: "En-Tiempo" | "Atrasado" | "Finalizado" | "No-Iniciado";
    children?: Project[];
    programa: string;
    prioridad: string;
    dependencies: string[];
    statusColor: string;
  }