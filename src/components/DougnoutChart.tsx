import { Doughnut } from "react-chartjs-2";

export function DougnoutChart({data, title}: {data: Array<number>, title: string}) {
    return (
        <div className="flex flex-col items-center justify-center mb-4">
            <p className="text-md font-bold text-center">{title}</p>
        <div className="w-full md:w-1/4 flex">
        <Doughnut
          key="pie-chart-placeholder" // <-- Agrega esta línea
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
          data={{
            labels: ["En Tiempo", "No Iniciado", "Atrasado", "Finalizado"],
            datasets: [{
              label: "# of Votes",
              data: data,
              borderWidth: 1,
              backgroundColor: [
                '#00FF00',   // Red
                '#d1d5db',  // Blue
                '#E69500',  // Yellow
                '#3b82f6',  // Green
                
              ],
              borderColor: [
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 1)',
                'rgba(255, 255, 255, 1)',
              ],
            }]
          }}
        />
        </div>
        </div>
    )
}