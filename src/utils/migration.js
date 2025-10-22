/**
 * Migration utility to convert old entries (passwords, bookmarks, notes) 
 * to new unified note format with tags
 */

import { db } from '@/db';
import { structuredToNote } from '@/utils/noteParser';
import Dexie from 'dexie';

/**
 * Check if migration is needed
 * @returns {Promise<boolean>}
 */
export async function needsMigration() {
  try {
    // Check if old database exists
    const dbName = db.name;
    const oldDbName = dbName.replace('T3VO-', 'T3VO-entries-');
    
    // Try to open old database
    const oldDb = new Dexie(oldDbName);
    oldDb.version(1).stores({
      entries: "id, type, updatedAt, deletedAt, [type+deletedAt], [type+updatedAt]",
    });
    
    const count = await oldDb.entries.count();
    await oldDb.close();
    
    return count > 0;
  } catch (error) {
    console.log('No old database found or error checking:', error);
    return false;
  }
}

/**
 * Migrate old entries to new note format
 * @returns {Promise<Object>} Migration statistics
 */
export async function migrateData() {
  const stats = {
    passwords: 0,
    bookmarks: 0,
    notes: 0,
    errors: 0,
    total: 0,
  };

  try {
    // Get encryption key
    const ENCRYPTION_KEY = sessionStorage.getItem('ENCRYPTION_KEY');
    if (!ENCRYPTION_KEY) {
      throw new Error('No encryption key found');
    }

    // Open old database
    const CryptoJS = (await import('crypto-js')).default;
    const hashedKey = CryptoJS.SHA256(ENCRYPTION_KEY).toString(CryptoJS.enc.Hex);
    const oldDbName = `T3VO-${hashedKey}`;
    
    const oldDb = new Dexie(oldDbName);
    oldDb.version(1).stores({
      entries: "id, type, updatedAt, deletedAt, [type+deletedAt], [type+updatedAt]",
    });

    // Fetch all non-deleted entries
    const entries = await oldDb.entries
      .where('deletedAt')
      .equals(null)
      .toArray();

    console.log(`Found ${entries.length} entries to migrate`);

    // Decrypt helper
    const decryptData = (encryptedData) => {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      } catch {
        return null;
      }
    };

    // Encrypt helper
    const encryptData = (data) => {
      const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
      return CryptoJS.AES.encrypt(stringData, ENCRYPTION_KEY).toString();
    };

    // Migrate each entry
    for (const entry of entries) {
      try {
        const data = decryptData(entry.data);
        if (!data) {
          stats.errors++;
          continue;
        }

        // Convert to note format based on type
        let noteContent = '';
        
        if (entry.type === 'password') {
          noteContent = structuredToNote('password', {
            title: data.title || '',
            email: data.email || '',
            username: data.username || '',
            password: data.password || '',
            totpSecret: data.totpSecret || '',
            urls: Array.isArray(data.urls) ? data.urls.join(',') : data.urls || '',
            note: data.note || '',
          });
          stats.passwords++;
        } else if (entry.type === 'bookmark') {
          noteContent = structuredToNote('bookmark', {
            title: data.title || '',
            url: data.url || '',
            note: data.note || '',
          });
          stats.bookmarks++;
        } else if (entry.type === 'note') {
          noteContent = structuredToNote('note', {
            title: data.title || '',
            content: data.content || '',
          });
          stats.notes++;
        }

        // Add to new database
        if (noteContent) {
          await db.notes.add({
            id: entry.id, // Keep the same ID
            content: encryptData(noteContent),
            updatedAt: entry.updatedAt,
            deletedAt: null,
          });
          stats.total++;
        }
      } catch (error) {
        console.error('Error migrating entry:', error);
        stats.errors++;
      }
    }

    // Close old database
    await oldDb.close();

    // Mark migration as complete
    localStorage.setItem('t3vo_migrated', 'true');
    localStorage.setItem('t3vo_migration_date', new Date().toISOString());

    console.log('Migration complete:', stats);
    return stats;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Check if migration has already been completed
 * @returns {boolean}
 */
export function isMigrationComplete() {
  return localStorage.getItem('t3vo_migrated') === 'true';
}

/**
 * Reset migration flag (for testing)
 */
export function resetMigration() {
  localStorage.removeItem('t3vo_migrated');
  localStorage.removeItem('t3vo_migration_date');
}
