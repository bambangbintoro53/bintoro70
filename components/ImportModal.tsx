import React, { useState, useCallback } from 'react';
import { Student } from '../types';

// Make sure to declare XLSX since it's loaded from a script tag in index.html
declare var XLSX: any;

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (students: Student[]) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const resetState = () => {
        setFile(null);
        setIsProcessing(false);
        setFeedback(null);
        setIsDragOver(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setFeedback(null);
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setFeedback(null);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragOver(true);
        } else if (e.type === 'dragleave') {
            setIsDragOver(false);
        }
    };

    const processFile = useCallback(() => {
        if (!file) {
            setFeedback({ type: 'error', message: 'Silakan pilih file terlebih dahulu.' });
            return;
        }
        setIsProcessing(true);
        setFeedback(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (json.length < 2) {
                    throw new Error("File tidak memiliki data atau hanya berisi header.");
                }

                const headers = json[0].map(h => String(h).toLowerCase().trim());
                const nameIndex = headers.findIndex(h => h.includes('nama'));
                const nisIndex = headers.findIndex(h => h.includes('nis'));
                const classIndex = headers.findIndex(h => h.includes('kelas'));

                if (nameIndex === -1 || nisIndex === -1 || classIndex === -1) {
                    throw new Error("File harus memiliki kolom 'Nama', 'NIS', dan 'Kelas'.");
                }

                const students: Student[] = [];
                let errorCount = 0;

                for (let i = 1; i < json.length; i++) {
                    const row = json[i];
                    const name = row[nameIndex] ? String(row[nameIndex]).trim() : '';
                    const nis = row[nisIndex] ? String(row[nisIndex]).trim() : '';
                    const studentClass = row[classIndex] ? String(row[classIndex]).trim() : '';
                    
                    if (name && nis && studentClass) {
                        students.push({ name, nis, class: studentClass });
                    } else {
                        errorCount++;
                    }
                }
                
                if (students.length > 0) {
                    onImport(students);
                }

                let successMessage = `Berhasil memproses ${students.length} data siswa. Daftar siswa telah diperbarui.`;
                if(errorCount > 0) {
                    successMessage += ` Gagal memproses ${errorCount} baris karena data tidak lengkap.`;
                }
                setFeedback({ type: 'success', message: successMessage });
                setFile(null); // Clear file after successful import
            } catch (error: any) {
                setFeedback({ type: 'error', message: error.message || 'Gagal memproses file. Pastikan formatnya benar.' });
            } finally {
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
            setIsProcessing(false);
            setFeedback({ type: 'error', message: 'Gagal membaca file.' });
        };

        reader.readAsArrayBuffer(file);

    }, [file, onImport]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-slate-800">Import Daftar Siswa</h2>
                </div>
                <div className="p-6">
                    {feedback && (
                        <div className={`p-3 rounded-md mb-4 text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                        </div>
                    )}
                    <p className="text-sm text-slate-600 mb-4">
                        Pilih file <code className="bg-slate-100 p-1 rounded text-xs">.xlsx</code> atau <code className="bg-slate-100 p-1 rounded text-xs">.csv</code> untuk mengisi atau memperbarui daftar induk siswa. Pastikan file Anda memiliki kolom header untuk <strong>Nama</strong>, <strong>NIS</strong>, dan <strong>Kelas</strong>.
                    </p>
                    
                    <div 
                        onDrop={handleDrop} 
                        onDragOver={handleDragEvents}
                        onDragEnter={handleDragEvents}
                        onDragLeave={handleDragEvents}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
                    >
                         <input type="file" id="file-upload" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                         <label htmlFor="file-upload" className="cursor-pointer">
                             <p className="text-slate-500">
                                {file ? `File dipilih: ${file.name}` : 'Seret & lepas file di sini, atau klik untuk memilih file.'}
                             </p>
                         </label>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={handleClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                        Tutup
                    </button>
                    <button 
                        onClick={processFile} 
                        disabled={!file || isProcessing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? 'Memproses...' : 'Proses & Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;