import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TardyRecord } from '../types';

// Declare Chart.js since it's loaded from a script tag
declare var Chart: any;

interface DataVisualizationProps {
    records: TardyRecord[];
}

type ChartView = 'class' | 'month';

const ChartFilterButton: React.FC<{
  label: string;
  type: ChartView;
  activeView: ChartView;
  onClick: (view: ChartView) => void;
}> = ({ label, type, activeView, onClick }) => {
  const isActive = type === activeView;
  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  const activeClasses = 'bg-blue-600 text-white shadow';
  const inactiveClasses = 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300';

  return (
    <button onClick={() => onClick(type)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

const ChartIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);


const DataVisualization: React.FC<DataVisualizationProps> = ({ records }) => {
    const [view, setView] = useState<ChartView>('class');
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    const dataByClass = useMemo(() => {
        const counts: { [key: string]: number } = {};
        records.forEach(record => {
            counts[record.class] = (counts[record.class] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
        return {
            labels: sorted.map(([label]) => label),
            data: sorted.map(([, data]) => data),
        };
    }, [records]);

    const dataByMonth = useMemo(() => {
        const counts: { [key: number]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        records.forEach(record => {
            const month = new Date(record.timestamp).getMonth();
            counts[month] = (counts[month] || 0) + 1;
        });
        const chartData = monthNames.map((name, index) => counts[index] || 0);
        return {
            labels: monthNames,
            data: chartData,
        };
    }, [records]);
    
    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        
        const data = view === 'class' ? dataByClass : dataByMonth;

        if(data.data.length === 0) return;

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: `Jumlah Keterlambatan`,
                    data: data.data,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };

    }, [view, dataByClass, dataByMonth]);


    if (records.length === 0) {
        return null; // Don't render the component if there's no data
    }
    
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <div className="flex items-center gap-3">
                    <ChartIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-slate-700">Visualisasi Data Keterlambatan</h2>
                 </div>
                <div className="flex items-center gap-2">
                    <ChartFilterButton label="Per Kelas" type="class" activeView={view} onClick={setView} />
                    <ChartFilterButton label="Per Bulan" type="month" activeView={view} onClick={setView} />
                </div>
            </div>
            <div className="relative h-72">
                 <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default DataVisualization;