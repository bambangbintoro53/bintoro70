import React, { useState, useMemo } from 'react';
import { Student } from '../types';

interface TardyFormProps {
  onAddRecord: (student: Student) => void;
  onOpenImportModal: () => void;
  students: Student[];
}

const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const TardyForm: React.FC<TardyFormProps> = ({ onAddRecord, onOpenImportModal, students }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedNis, setSelectedNis] = useState('');
  const [error, setError] = useState('');

  const uniqueClasses = useMemo(() => {
    return [...new Set(students.map(s => s.class))].sort();
  }, [students]);

  const studentsInSelectedClass = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.class === selectedClass);
  }, [students, selectedClass]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNis) {
      setError('Silakan pilih kelas dan nama siswa.');
      return;
    }
    const selectedStudent = students.find(s => s.nis === selectedNis);
    if (selectedStudent) {
      onAddRecord(selectedStudent);
      setSelectedClass('');
      setSelectedNis('');
      setError('');
    } else {
      setError('Siswa yang dipilih tidak ditemukan. Mohon coba lagi.');
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedNis(''); // Reset student selection when class changes
  };

  if (students.length === 0) {
    return (
       <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mb-8 text-center">
         <h2 className="text-xl font-semibold mb-4 text-slate-700">Daftar Siswa Kosong</h2>
         <p className="text-slate-500 mb-6">Untuk memulai, silakan import daftar siswa Anda dari file spreadsheet.</p>
         <button
            type="button"
            onClick={onOpenImportModal}
            className="bg-slate-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors inline-flex items-center justify-center gap-2"
        >
            <UploadIcon className="h-5 w-5" />
            <span>Import Daftar Siswa</span>
        </button>
       </div>
    )
  }


  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Tambah Data Terlambat Baru</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <label htmlFor="class-select" className="block text-sm font-medium text-slate-600 mb-1">Kelas</label>
          <select
            id="class-select"
            value={selectedClass}
            onChange={handleClassChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">Pilih Kelas</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="md:col-span-1">
          <label htmlFor="student-select" className="block text-sm font-medium text-slate-600 mb-1">Nama Siswa</label>
          <select
            id="student-select"
            value={selectedNis}
            onChange={(e) => setSelectedNis(e.target.value)}
            disabled={!selectedClass}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="">Pilih Siswa</option>
            {studentsInSelectedClass.map(s => <option key={s.nis} value={s.nis}>{s.name}</option>)}
          </select>
        </div>
        
        <button
          type="submit"
          className="md:col-span-1 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah</span>
        </button>
        <button
            type="button"
            onClick={onOpenImportModal}
            className="md:col-span-1 w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors flex items-center justify-center gap-2"
        >
            <UploadIcon className="h-5 w-5" />
            <span>Update Siswa</span>
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default TardyForm;