
import React, { useState, useEffect } from 'react';
import { CloudConfig } from '../types';

interface CloudSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentConfig: CloudConfig | null;
    onSave: (config: CloudConfig | null) => void;
}

const CloudSettingsModal: React.FC<CloudSettingsModalProps> = ({ isOpen, onClose, currentConfig, onSave }) => {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUrl(currentConfig?.url || '');
            setKey(currentConfig?.key || '');
        }
    }, [isOpen, currentConfig]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim() && key.trim()) {
            onSave({ url: url.trim(), key: key.trim() });
        } else if (!url.trim() && !key.trim()) {
            onSave(null);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-slate-900 p-6 text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        Pengaturan Cloud Sync
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Hubungkan ke Supabase agar data sinkron di semua perangkat.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supabase Project URL</label>
                        <input 
                            type="url" 
                            required={!!key}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://xyz.supabase.co"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supabase Anon Key</label>
                        <input 
                            type="password" 
                            required={!!url}
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                            <span className="font-bold">Cara mendapatkan:</span> Buka Dashboard Supabase &gt; Project Settings &gt; API. Salin URL dan Anon Key (public). 
                            Kosongkan keduanya jika ingin kembali ke mode <strong>Offline</strong>.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-semibold text-sm transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm shadow-lg shadow-blue-200 transition-all"
                        >
                            Simpan & Hubungkan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CloudSettingsModal;
