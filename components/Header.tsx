
import React, { useRef } from 'react';

interface HeaderProps {
    isSyncing: boolean;
    isCloudActive: boolean;
    onOpenCloudSettings: () => void;
    onExport: () => void;
    onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CloudIcon: React.FC<{active: boolean, syncing: boolean}> = ({ active, syncing }) => (
    <div className={`relative ${syncing ? 'animate-pulse' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-green-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        {active && <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full border border-white"></div>}
    </div>
);

const Header: React.FC<HeaderProps> = ({ isSyncing, isCloudActive, onOpenCloudSettings, onExport, onImportBackup }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="mb-8 flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">E-Keterlambatan</h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Sistem Monitoring Terpadu</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Cloud Status Button */}
            <button 
                onClick={onOpenCloudSettings}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group w-full sm:w-auto"
            >
                <CloudIcon active={isCloudActive} syncing={isSyncing} />
                <div className="text-left">
                    <p className="text-xs font-bold text-slate-700 leading-none">
                        {isCloudActive ? 'Database Terhubung' : 'Database Offline'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {isSyncing ? 'Menyinkronkan...' : (isCloudActive ? 'Klik untuk Pengaturan' : 'Klik untuk Aktifkan Cloud')}
                    </p>
                </div>
            </button>

            {/* Local Backup/Restore Controls */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full sm:w-auto">
                <button 
                    onClick={onExport}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                    title="Simpan Backup ke File"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span className="hidden md:inline">Cadangkan</span>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Ambil Data dari File Backup"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="hidden md:inline">Pulihkan</span>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={onImportBackup} 
                    accept=".json" 
                    className="hidden" 
                />
            </div>
        </div>
    </header>
  );
};

export default Header;
