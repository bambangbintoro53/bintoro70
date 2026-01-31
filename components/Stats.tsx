
import React from 'react';
import { TardyRecord } from '../types';

interface StatsProps {
    records: TardyRecord[];
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactElement; colorClass?: string }> = ({ title, value, icon, colorClass = "bg-blue-100 text-blue-600" }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
        <div className={`${colorClass} p-3 rounded-2xl`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
            <p className="text-2xl font-black text-slate-800">{value}</p>
        </div>
    </div>
);

const CalendarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const WeekIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const DocumentTextIcon: React.FC<{className?: string}> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const Stats: React.FC<StatsProps> = ({ records }) => {
    const now = new Date();
    
    // Today
    const todayCount = records.filter(r => {
        const recordDate = new Date(r.timestamp);
        return recordDate.toDateString() === now.toDateString();
    }).length;

    // Week (Start from Monday)
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const thisWeekCount = records.filter(r => {
        return r.timestamp >= startOfWeek.getTime();
    }).length;

    // Month
    const thisMonthCount = records.filter(r => {
        const recordDate = new Date(r.timestamp);
        return recordDate.getMonth() === now.getMonth() &&
               recordDate.getFullYear() === now.getFullYear();
    }).length;

    const totalCount = records.length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
                title="Hari Ini" 
                value={todayCount} 
                icon={<CalendarIcon className="h-5 w-5" />} 
                colorClass="bg-blue-100 text-blue-600"
            />
            <StatCard 
                title="Minggu Ini" 
                value={thisWeekCount} 
                icon={<WeekIcon className="h-5 w-5" />} 
                colorClass="bg-indigo-100 text-indigo-600"
            />
            <StatCard 
                title="Bulan Ini" 
                value={thisMonthCount} 
                icon={<CalendarIcon className="h-5 w-5" />} 
                colorClass="bg-emerald-100 text-emerald-600"
            />
            <StatCard 
                title="Total Data" 
                value={totalCount} 
                icon={<DocumentTextIcon className="h-5 w-5" />} 
                colorClass="bg-slate-100 text-slate-600"
            />
        </div>
    );
};

export default Stats;
