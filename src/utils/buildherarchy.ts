import type { Project } from "../types/proyect";

export function buildHierarchy(flatProjects: Project[]): Project[] {
    const projectMap: Record<string, Project & { children: Project[]; _hasChildren?: boolean }> = {};
    const roots: Project[] = [];
  
    // Inicializa todos con children vacíos
    for (const p of flatProjects) {
      projectMap[p.id] = { ...p, children: [] };
    }
  
    for (const p of flatProjects) {
      const idStr = String(p.id);
      const lastDot = idStr.lastIndexOf(".");
      if (lastDot === -1) {
        // Es raíz (no tiene punto)
        roots.push(projectMap[p.id]);
      } else {
        // Tiene padre
        const parentId = idStr.substring(0, lastDot);
        if (projectMap[parentId]) {
          projectMap[parentId].children.push(projectMap[p.id]);
          projectMap[parentId]._hasChildren = true; // Marca al padre
        }
      }
    }
  
    // Asegura que los nodos sin hijos tengan _hasChildren: false
    Object.values(projectMap).forEach((node) => {
      if (node._hasChildren !== true) node._hasChildren = false;
    });
  
    return roots;
  }