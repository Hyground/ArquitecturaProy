import Dexie, { type Table } from 'dexie';

export interface OfflineRequest {
  id?: number;
  url: string;
  method: string;
  data: any;
  timestamp: number;
}

export class MyDatabase extends Dexie {
  offlineRequests!: Table<OfflineRequest>;

  constructor() {
    super('ProyectoArqDB');
    this.version(1).stores({
      offlineRequests: '++id, url, method, timestamp'
    });
  }
}

export const db = new MyDatabase();
