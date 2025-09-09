// services/dbService.ts

const DB_NAME = 'ai-image-editor-db';
const STORE_NAME = 'image-store';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        // The key is the unique identifier for the image data (e.g., "imageId_original")
        // The value will be an object containing the base64 data and mimeType.
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

export const putImageData = async (key: string, value: { data: string; mimeType: string }): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ key, value });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error putting data:', request.error);
      reject(request.error);
    };
  });
};

export const getImageData = async (key: string): Promise<{ data: string; mimeType: string } | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.value);
      } else {
        resolve(undefined);
      }
    };

    request.onerror = () => {
      console.error('Error getting data:', request.error);
      reject(request.error);
    };
  });
};
