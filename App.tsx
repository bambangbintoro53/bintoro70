
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { TardyRecord, FilterType, Student, AppBackupData, CloudConfig } from './types';
import Header from './components/Header';
import TardyForm from './components/TardyForm';
import TardyList from './components/TardyList';
import Stats from './components/Stats';
import ImportModal from './components/ImportModal';
import DataVisualization from './components/DataVisualization';
import CloudSettingsModal from './components/CloudSettingsModal';
import TopTardyStudents from './components/TopTardyStudents';

// Declare Supabase from CDN
declare var supabase: any;

const App: React.FC = () => {
  const isLoadedRef = useRef(false);

  const [tardyRecords, setTardyRecords] = useState<TardyRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tardyRecords');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [masterStudentList, setMasterStudentList] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('masterStudentList');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [classFilter, setClassFilter] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [cloudConfig, setCloudConfig] = useState<CloudConfig | null>(() => {
    try {
      const saved = localStorage.getItem('cloudConfig');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    isLoadedRef.current = true;
  }, []);

  const syncWithCloud = useCallback(async (config: CloudConfig) => {
    if (!config || !config.url || !config.key) return;
    setIsSyncing(true);
    try {
      const client = supabase.createClient(config.url, config.key);
      const { data: students } = await client.from('students').select('*');
      if (students) setMasterStudentList(students);
      const { data: records } = await client.from('tardy_records').select('*').order('timestamp', { ascending: false });
      if (records) setTardyRecords(records);
    } catch (err) {
      console.error("Cloud sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (cloudConfig) syncWithCloud(cloudConfig);
  }, [cloudConfig, syncWithCloud]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    localStorage.setItem('tardyRecords', JSON.stringify(tardyRecords));
    localStorage.setItem('masterStudentList', JSON.stringify(masterStudentList));
  }, [tardyRecords, masterStudentList]);

  const handleAddRecord = useCallback((student: Student) => {
    const newRecord: TardyRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: student.name,
      nis: student.nis,
      class: student.class,
      timestamp: Date.now(),
    };
    setTardyRecords(prev => [newRecord, ...prev]);
    
    // Auto sync to cloud if active
    if (cloudConfig) {
      const client = supabase.createClient(cloudConfig.url, cloudConfig.key);
      client.from('tardy_records').upsert([newRecord]).then();
    }
  }, [cloudConfig]);

  const handleDeleteRecord = useCallback(async (id: string) => {
      if (!confirm("Hapus catatan ini secara permanen?")) return;
      
      // Update Lokal
      setTardyRecords(prev => prev.filter(r => {
          const currentId = r.id || `${r.nis}-${r.timestamp}`;
          return currentId !== id;
      }));
      
      // Update Cloud
      if (cloudConfig) {
          try {
              const client = supabase.createClient(cloudConfig.url, cloudConfig.key);
              // Coba hapus berdasarkan ID atau berdasarkan kombinasi unik (NIS & Timestamp) jika ID tidak ada
              const query = id.includes('-') && id.split('-').length > 1 && !isNaN(Number(id.split('-')[1]))
                  ? client.from('tardy_records').delete().eq('nis', id.split('-')[0]).eq('timestamp', id.split('-')[1])
                  : client.from('tardy_records').delete().eq('id', id);
              
              await query;
          } catch (err) {
              console.error("Cloud delete failed", err);
          }
      }
  }, [cloudConfig]);

  const handleUpdateMasterList = useCallback((importedStudents: Student[]) => {
    setMasterStudentList(prev => {
      const studentMap = new Map<string, Student>();
      [...prev, ...importedStudents].forEach(s => studentMap.set(s.nis, s));
      return Array.from(studentMap.values());
    });
    setIsImportModalOpen(false);
  }, []);

  const handleSetCloudConfig = (config: CloudConfig | null) => {
    setCloudConfig(config);
    if (config) {
      localStorage.setItem('cloudConfig', JSON.stringify(config));
    } else {
      localStorage.removeItem('cloudConfig');
    }
  };

  const filteredRecords = useMemo(() => {
    const now = new Date();
    return tardyRecords.filter(record => {
      if (classFilter && record.class !== classFilter) return false;
      const recordDate = new Date(record.timestamp);
      if (filter === 'day') return recordDate.toDateString() === now.toDateString();
      if (filter === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0,0,0,0);
        return record.timestamp >= startOfWeek.getTime();
      }
      if (filter === 'month') return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [tardyRecords, filter, classFilter]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <div className="container mx-auto p-4 md:p-8">
        <Header 
          isSyncing={isSyncing}
          isCloudActive={!!cloudConfig}
          onOpenCloudSettings={() => setIsCloudModalOpen(true)}
          onExport={() => {}} // Implemented in list
          onImportBackup={() => {}} 
        />
        <main>
          <TardyForm 
            onAddRecord={handleAddRecord} 
            onOpenImportModal={() => setIsImportModalOpen(true)}
            students={masterStudentList}
          />
          <Stats records={tardyRecords} />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <TopTardyStudents records={tardyRecords} />
            <DataVisualization records={tardyRecords} />
          </div>

          <TardyList 
            records={filteredRecords} 
            totalRecordsCount={tardyRecords.length}
            filter={filter} 
            setFilter={setFilter}
            onDeleteRecord={handleDeleteRecord}
            availableClasses={Array.from(new Set(masterStudentList.map(s => s.class))).sort()}
            selectedClass={classFilter}
            onSelectClass={setClassFilter}
          />
        </main>

        <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleUpdateMasterList} />
        <CloudSettingsModal isOpen={isCloudModalOpen} onClose={() => setIsCloudModalOpen(false)} currentConfig={cloudConfig} onSave={handleSetCloudConfig} />
      </div>
    </div>
  );
};

export default App;
