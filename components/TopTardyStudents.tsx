
import React, { useMemo } from 'react';
import { TardyRecord } from '../types';

interface TopTardyStudentsProps {
  records: TardyRecord[];
}

const TrophyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
);

const TopTardyStudents: React.FC<TopTardyStudentsProps> = ({ records }) => {
  const topStudents = useMemo(() => {
    const counts = new Map<string, { name: string; class: string; count: number }>();
    
    records.forEach(r => {
      const existing = counts.get(r.nis);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(r.nis, { name: r.name, class: r.class, count: 1 });
      }
    });

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [records]);

  if (topStudents.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
                <TrophyIcon className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">10 Siswa Terbanyak Terlambat</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">Peringkat Kumulatif</span>
      </div>
      
      <div className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {topStudents.map((student, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs ${
                  index === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 
                  index === 1 ? 'bg-slate-400 text-white shadow-lg shadow-slate-200' :
                  index === 2 ? 'bg-orange-400 text-white shadow-lg shadow-orange-200' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors capitalize">{student.name.toLowerCase()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{student.class}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                    <p className="text-lg font-black text-slate-800 leading-none">{student.count}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Kali</p>
                </div>
                <div className="h-8 w-1 bg-slate-100 rounded-full group-hover:bg-blue-200 transition-colors"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopTardyStudents;
