
export interface TardyRecord {
  id: string;
  name: string;
  nis: string;
  class: string;
  timestamp: number;
}

export interface Student {
  name: string;
  nis: string;
  class: string;
}

export interface CloudConfig {
  url: string;
  key: string;
}

export interface AppBackupData {
  masterStudentList: Student[];
  tardyRecords: TardyRecord[];
  version: string;
  exportDate: number;
}

export type NewTardyRecord = Omit<TardyRecord, 'id' | 'timestamp'>;

export type FilterType = 'day' | 'week' | 'month' | 'all';
