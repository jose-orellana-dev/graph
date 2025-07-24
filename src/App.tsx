import { Doughnut } from "react-chartjs-2"
import { DrillDownGantt } from "./components/FrappeGantt"
import Button from "@mui/material/Button";
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { useEffect, useState } from "react";
import { DougnoutChart } from "./components/DougnoutChart";
import { addProjects, getAllProjects } from "./utils/db";
import type { Project } from "./types/proyect";
import { formateDate } from "./utils/formateDate";
ChartJS.register(ArcElement, Tooltip, Legend);

interface ExcelData {
  [key: string]: string | number;
}

export default function App() {
  const [dataSelected, setDataSelected] = useState<Array<number>>([]);
  const [ArrayProjects, setArrayProjects] = useState<Project[]>([]);
  useEffect(() => {
    const getProjects = async () => {
      const Projects = await getAllProjects();
      setArrayProjects(Projects);
      
      const EnTiempo = Projects.filter(project => project.statusColor === "En-Tiempo");
      const NoIniciado = Projects.filter(project => project.statusColor === "No-Iniciado");
      const Atrasado = Projects.filter(project => project.statusColor === "Atrasado");
      const Finalizado = Projects.filter(project => project.statusColor === "Finalizado");
      const data = [
        EnTiempo.length,
        NoIniciado.length,
        Atrasado.length,
        Finalizado.length
      ]
     
      setDataSelected(data);
    }
    getProjects();
   
  }, []);


  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    
    try {
        const data = await readExcelFile(file); 
        
         const projects = data.slice(1).map(row => ({
          id: row.Orden as string,
          name: row.Proyecto as string,
          status: row.Real as string,
          dependencies: row.Padre ? String(row.Padre).split(',').map(s => s.trim()) : [],
          startDate: formateDate(row.Fecha_planificada_inicio as string),
          endDate: formateDate(row.Fecha_planificacion_fin as string),
          statusColor: row.Status as string,
          prioridad: row.Prioridad as string,
          programa: row.Programa as string,
         }))
        
         await addProjects(projects as Project[]); // Ajusta tipado si lo necesitas
         alert('Datos guardados!');
         window.location.reload();
        

    } catch (error) {
        console.error("Error al importar el archivo:", error);
    } finally {
        //setIsLoading(false);
    }
}
const readExcelFile = (file: File): Promise<ExcelData[]> => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
          try {
              const data = e.target?.result as ArrayBuffer;
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet);
              resolve(jsonData as ExcelData[]);
          } catch (error) {
              reject(error);
          }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
  });
};
    if(dataSelected.length === 0){
      return (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center">No hay datos para mostrar</h1>
        </div>
      )
    }
  return (
<div className="min-h-screen bg-[#f8fafc] p-8 flex flex-col">
  <div className="mb-8">
    <h1 className="text-3xl font-extrabold text-gray-900 text-center">Status Portafolio GOES</h1>
  </div>
  
  <div className="flex min-h-screen justify-center items-center bg-[#f8fafc]">
    <Button variant="contained" component="label" className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded">
      Seleccionar archivo Excel
      <input
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={onFileChange}
      />
    </Button>
  </div>

  <div className="flex flex-col md:flex-row gap-6">
    {/* Gantt: 3/4 en md+ */}
    {/* Pie chart: 1/4 en md+ */}
    <DougnoutChart data={dataSelected} title="Etapas de Proyectos"/>
    <div className="w-full md:w-3/4">
      <DrillDownGantt projects={ArrayProjects} />
    </div>
  </div>
</div>
  )
}