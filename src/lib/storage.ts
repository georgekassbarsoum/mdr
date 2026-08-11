import { MediaItem, MediaType } from '../types';

const DB_NAME = 'mdr7_database';
const DB_VERSION = 1;
const STORE_NAME = 'mdr_p_storage';
const META_STORE = 'mdr_metadata';

export class MDRStorage {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('serialNumber', 'serialNumber', { unique: false });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Get next auto-increment serial number starting at 1
  public static async getNextSerialNumber(): Promise<number> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME, META_STORE], 'readwrite');
        const metaStore = transaction.objectStore(META_STORE);
        const getReq = metaStore.get('lastSerialNumber');

        getReq.onsuccess = () => {
          const current = getReq.result ? getReq.result.value : 0;
          const next = current + 1;
          metaStore.put({ key: 'lastSerialNumber', value: next });
          resolve(next);
        };

        getReq.onerror = () => {
          resolve(1);
        };
      });
    } catch (e) {
      console.error('Error fetching serial number:', e);
      return Date.now() % 10000;
    }
  }

  // Generate standardized filename format: mdr_YYYY-MM-DD_HH-mm-ss_#000001.ext
  public static generateFilename(
    date: Date,
    type: MediaType,
    serialNumber: number
  ): { filename: string; formattedDate: string } {
    const pad = (n: number, width = 2) => String(n).padStart(width, '0');
    const serialStr = String(serialNumber).padStart(6, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const datePart = `${year}-${month}-${day}`;
    const timePart = `${hours}-${minutes}-${seconds}`;
    const ext = type === 'photo' ? 'jpg' : 'mp4';

    const filename = `mdr_${datePart}_${timePart}_#${serialStr}.${ext}`;
    const formattedDate = `${datePart} ${hours}:${minutes}:${seconds}`;

    return { filename, formattedDate };
  }

  // Save new media item into mdr-p store
  public static async saveMedia(
    blob: Blob,
    type: MediaType,
    duration?: number,
    width?: number,
    height?: number
  ): Promise<MediaItem> {
    const db = await this.getDB();
    const now = new Date();
    const serialNumber = await this.getNextSerialNumber();
    const { filename, formattedDate } = this.generateFilename(now, type, serialNumber);

    const item: MediaItem = {
      id: `mdr_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      filename,
      timestamp: now.getTime(),
      formattedDate,
      serialNumber,
      blob,
      sizeBytes: blob.size,
      mimeType: blob.type || (type === 'photo' ? 'image/jpeg' : 'video/mp4'),
      duration,
      width,
      height
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.add(item);

      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  // Get all media items
  public static async getAllMedia(): Promise<MediaItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const items: MediaItem[] = req.result || [];
        // Sort descending by timestamp (newest first)
        items.sort((a, b) => b.timestamp - a.timestamp);
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // Get media filtered by type
  public static async getMediaByType(type: MediaType): Promise<MediaItem[]> {
    const all = await this.getAllMedia();
    return all.filter((item) => item.type === type);
  }

  // Get counts of photos and videos in mdr-p
  public static async getCounts(): Promise<{ photos: number; videos: number; total: number }> {
    const all = await this.getAllMedia();
    const photos = all.filter((i) => i.type === 'photo').length;
    const videos = all.filter((i) => i.type === 'video').length;
    return { photos, videos, total: all.length };
  }

  // Delete media item by ID
  public static async deleteMedia(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Delete multiple media items
  public static async deleteMultipleMedia(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteMedia(id);
    }
  }

  // Clear all storage in mdr-p
  public static async clearAll(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME, META_STORE], 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      transaction.objectStore(META_STORE).clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
