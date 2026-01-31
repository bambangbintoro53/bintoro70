
import React from 'react';
import { TardyRecord, FilterType } from '../types';

// Declare external libraries from CDN
declare var XLSX: any;
declare var jspdf: any;

interface TardyListProps {
  records: TardyRecord[];
  totalRecordsCount: number;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  onDeleteRecord: (id: string) => void;
  availableClasses: string[];
  selectedClass: string;
  onSelectClass: (cls: string) => void;
}

const FilterButton: React.FC<{
  label: string;
  type: FilterType;
  activeFilter: FilterType;
  onClick: (filter: FilterType) => void;
}> = ({ label, type, activeFilter, onClick }) => {
  const isActive = type === activeFilter;
  const baseClasses = 'px-4 py-2 text-xs font-bold rounded-xl transition-all focus:outline-none';
  const activeClasses = 'bg-blue-600 text-white shadow-lg shadow-blue-200';
  const inactiveClasses = 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200';

  return (
    <button type="button" onClick={() => onClick(type)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} pointer-events-none`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const ExcelIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} pointer-events-none`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const PDFIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} pointer-events-none`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const TardyList: React.FC<TardyListProps> = ({ 
  records, 
  totalRecordsCount,
  filter, 
  setFilter, 
  onDeleteRecord,
  availableClasses,
  selectedClass,
  onSelectClass
}) => {
  
  const getTimeLabel = () => {
    switch (filter) {
      case 'day': return 'Hari Ini';
      case 'week': return 'Minggu Ini';
      case 'month': return 'Bulan Ini';
      case 'all': return 'Seluruh Waktu';
      default: return '';
    }
  };

  const exportToExcel = () => {
    if (records.length === 0) return alert("Tidak ada data untuk diekspor.");
    const formattedData = records.map(r => ({
        'Tanggal': new Date(r.timestamp).toLocaleDateString('id-ID'),
        'Jam': new Date(r.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        'NIS': r.nis,
        'Nama Siswa': r.name,
        'Kelas': r.class
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Keterlambatan");
    XLSX.writeFile(workbook, `Laporan_Terlambat_${new Date().getTime()}.xlsx`);
  };

  const exportToPDF = () => {
    if (records.length === 0) return alert("Tidak ada data untuk diekspor.");
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LAPORAN KETERLAMBATAN SISWA', 105, 15, { align: 'center' });
    const tableColumn = ["No", "Tanggal", "Jam", "NIS", "Nama Siswa", "Kelas"];
    const tableRows = records.map((r, index) => [
      index + 1,
      new Date(r.timestamp).toLocaleDateString('id-ID'),
      new Date(r.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      r.nis,
      r.name,
      r.class
    ]);
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
    doc.save(`Laporan_Terlambat_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 mt-8 relative z-10">
      <div className="p-6 md:p-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-800 tracking-tight">
                        {selectedClass ? `Laporan ${selectedClass}` : 'Semua Laporan'}
                    </span>
                    <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">
                        Periode: {getTimeLabel()}
                    </span>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    <button type="button" onClick={exportToExcel} className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-green-700 hover:bg-green-50 rounded-xl transition-all">
                        <ExcelIcon className="h-4 w-4" />
                        <span>EXCEL</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <button type="button" onClick={exportToPDF} className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-50 rounded-xl transition-all">
                        <PDFIcon className="h-4 w-4" />
                        <span>PDF</span>
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                <div className="relative w-full sm:w-48">
                    <select
                        value={selectedClass}
                        onChange={(e) => onSelectClass(e.target.value)}
                        className="w-full px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                        <option value="">Semua Kelas</option>
                        {availableClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <FilterButton label="Hari" type="day" activeFilter={filter} onClick={setFilter} />
                    <FilterButton label="Minggu" type="week" activeFilter={filter} onClick={setFilter} />
                    <FilterButton label="Bulan" type="month" activeFilter={filter} onClick={setFilter} />
                    <FilterButton label="Semua" type="all" activeFilter={filter} onClick={setFilter} />
                </div>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            {records.length > 0 ? (
            <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-2">Waktu Catat</th>
                    <th className="px-6 py-2">Informasi Siswa</th>
                    <th className="px-6 py-2">Kelas</th>
                    <th className="px-6 py-2 text-right">Aksi</th>
                </tr>
                </thead>
                <tbody>
                {records.map((record) => (
                    <tr key={record.id || `${record.nis}-${record.timestamp}`} className="group bg-slate-50/50 hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 first:rounded-l-2xl">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800">
                                {new Date(record.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                {new Date(record.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{record.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">NIS: {record.nis}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600">
                            {record.class}
                        </span>
                    </td>
                    <td className="px-6 py-4 last:rounded-r-2xl text-right">
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const idToUse = record.id || `${record.nis}-${record.timestamp}`;
                                console.log("Menghapus:", idToUse);
                                onDeleteRecord(idToUse);
                            }}
                            className="relative z-20 text-slate-300 hover:text-red-500 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all focus:outline-none flex items-center justify-center ml-auto"
                            title={`Hapus data ${record.name}`}
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            <div className="text-center py-20 px-6">
                <h3 className="text-slate-900 font-bold">Tidak ada catatan ditemukan</h3>
                <p className="text-slate-400 text-xs mt-1">Belum ada data keterlambatan yang tercatat atau filter tidak sesuai.</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TardyList;
