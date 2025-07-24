import React, { useRef, useEffect, useState } from "react";
import Gantt from "frappe-gantt";
import Form from "react-bootstrap/Form";
import "../App.css";
import type { Project } from "../types/proyect";
import type { DrillDownGanttProps } from "../types/drillDownGanttProps";
import type { GanttTask } from "../types/ganttTask";
import { flattenForGantt } from "../utils/flattenForGantt";
import { buildHierarchy } from "../utils/buildherarchy";
import { getProjectsByDependency } from "../utils/db";

const programasUnicos = [
  "SYDT",
  "DEVGOES",
  "IA",
  "TELEMEDICINA",
  "EDUCACION"
];

export function DrillDownGantt({ projects }: DrillDownGanttProps) {
  const [value, setValue] = useState(""); 
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects); // Nuevo estado
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const ganttRef = useRef<Gantt | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);
  
  //setTasks(flattenForGantt(roots, expanded));
  useEffect(() => {
    const roots = buildHierarchy(filteredProjects);
    setTasks(flattenForGantt(roots, expanded));
  }, [filteredProjects]);

  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);


  const minStartDate = React.useMemo(() => (
    tasks.length
      ? tasks.map(t => new Date(t.start)).reduce(
          (min, curr) => (curr < min ? curr : min),
          new Date(tasks[0].start)
        )
      : new Date()
  ), [tasks]);

  useEffect(() => {
    
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ""; // Clean up

    const gantt = new Gantt(containerRef.current, tasks, {
      view_mode: "Month",
      language: "es",
      view_mode_select: true,
      popup_on: "hover",
      scroll_to: minStartDate,
      infinite_padding: true,
      show_expected_progress: true,
      on_click: async (task: GanttTask) => {
        if (task._hasChildren) {
          //traer los hijos de este proyecto
          const children = await getProjectsByDependency(task.id);
          //formatear los hijos
          const childrenFormat = flattenForGantt(children, expanded);
          //traer el indice del padre
          const parentIndex = tasks.findIndex(t => String(t.id) === String(task.id));
          if (parentIndex === -1) return;
          //formatear los ids del children  
          const childrenIds = childrenFormat.map(child => String(child.id));
          // Obtiene la porción del arreglo que serían los hijos visibles después del padre
          const nextTasks = tasks.slice(parentIndex + 1, parentIndex + 1 + childrenIds.length);
          // Verifica si TODOS los hijos ya están visibles justo después del padre
          const allChildrenVisible = childrenIds.every(
            (id, idx) => nextTasks[idx] && String(nextTasks[idx].id) === id
          );
          
          if (allChildrenVisible) {
            // Si los hijos ya están, al hacer click los elimina del array
            setTasks(prev => [
              ...prev.slice(0, parentIndex + 1),
              ...prev.slice(parentIndex + 1 + childrenIds.length),
            ]);
          } else {
            // Si los hijos no están, al hacer click los agrega al array
            const tasksIds = tasks.map(t => String(t.id));
            const newChildren = childrenFormat.filter(child => !tasksIds.includes(String(child.id)));
            setTasks(prev => [
              ...prev.slice(0, parentIndex + 1),
              ...newChildren,
              ...prev.slice(parentIndex + 1),
            ]);
          }
        }
      },
      custom_popup_html: (task: GanttTask) => {
        return `
          <div style="padding: 8px;">
            <strong>${task.name.trim()}</strong><br>
            <span>Status: ${task.custom_class}</span>
          </div>
        `;
      },
    });
    const applyBarClasses = () => {
      gantt.bars.forEach((bar: any) => {
        if (bar.$bar_progress && bar.task.custom_class) {
          bar.$bar_progress.classList.add(bar.task.custom_class + "-bar");
        }
      });
    };

    applyBarClasses();
     // --- MutationObserver para detectar cualquier cambio en el SVG ---
     if (observerRef.current) {
      observerRef.current.disconnect();
    }
    const svg = containerRef.current.querySelector("svg");
    if (svg) {
      observerRef.current = new MutationObserver(() => {
        setTimeout(applyBarClasses, 5); // Pequeño delay para asegurar que el DOM esté listo
      });
      observerRef.current.observe(svg, { childList: true, subtree: true });
    }



    ganttRef.current = gantt;
    // --- Scroll automático al mes de la fecha más temprana
    setTimeout(() => {
      if (!containerRef.current) return;
      const header = containerRef.current.querySelector<SVGGElement>('.grid-header');
      if (!header) return;
      const firstDateText = header.querySelector('text');
      if (!firstDateText) return;
      const firstDateValue = firstDateText.textContent || '';
      let firstDate = new Date(firstDateValue);
      if (isNaN(firstDate.getTime())) {
        const tryMonthYear = /([A-Za-z]+)\s+(\d{4})/.exec(firstDateValue);
        if (tryMonthYear) {
          firstDate = new Date(`${tryMonthYear[1]} 1, ${tryMonthYear[2]}`);
        }
      }
      if (isNaN(firstDate.getTime())) return;

      const diffMonths = (minStartDate.getFullYear() - firstDate.getFullYear()) * 12 +
        (minStartDate.getMonth() - firstDate.getMonth());
      const colWidth = 38; // default
      containerRef.current.scrollLeft = diffMonths * colWidth;
    }, 100);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };


  }, [tasks, minStartDate]);

  const filterDataByProgram = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const program = e.target.value;
    setValue(program);
    if (program === "") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.programa.includes(program)));
    }
  };

  return (
    <div className="frappe-gantt-container" style={{ overflowX: "auto", minHeight: 300 }}>
      <div>
        <Form.Select value={value} onChange={filterDataByProgram}>
          <option value="">Seleccione un programa</option>
          {programasUnicos.map(programa => (
            <option key={programa} value={programa}>
              {programa}
            </option>
          ))}
        </Form.Select>
      </div>
      <div ref={containerRef}></div>
    </div>
  );
}
