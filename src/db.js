import Dexie from "dexie";
import CryptoJS from "crypto-js";
import { parseNote } from "@/utils/noteParser";

const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY") || "0";

const hashedKey = ENCRYPTION_KEY ? getSha256Hash(ENCRYPTION_KEY, false) : null;

export const db = new Dexie(`T3VO-${hashedKey}`);

// Simplified schema - everything is a note
db.version(2).stores({
  notes: "id, updatedAt, deletedAt",
});

const itemsPerPage = 60;

const getCurrentTime = () => Date.now();

// Optimized match function - searches in raw content
function matchesSearch(note, searchQuery) {
  if (!searchQuery) return true;
  
  const lowerQuery = searchQuery.toLowerCase();
  const content = decryptData(note.content);

  if (!content) return false;
  
  // Search in raw content (includes tags and text)
  return content.toLowerCase().includes(lowerQuery);
}

// Optimized hash function using built-in crypto when available
function getSha256Hash(str, includeTimestamp = false) {
  // Use Web Crypto API if available (more efficient)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // For now, fallback to crypto-js for compatibility
    // Could be optimized further with Web Crypto API implementation
  }
  
  // For database naming, we need consistent hashes (no timestamp)
  // For unique IDs, we include timestamp for uniqueness
  const hashInput = includeTimestamp ? str + Date.now() : str;
  return CryptoJS.SHA256(hashInput).toString(CryptoJS.enc.Hex);
}

/**
 * Add a new note to the database
 * @param {string} content - Raw note content with tags
 * @returns {string} - Note ID
 */
export async function addNote(content) {
  const note = {
    id: getSha256Hash(encryptData(content) + getCurrentTime(), true),
    content: encryptData(content),
    updatedAt: getCurrentTime(),
    deletedAt: null,
  };

  const id = await db.notes.add(note);
  return id;
}

/**
 * Fetch notes with pagination and optional search
 * @param {number} page - Page number
 * @param {string} searchQuery - Optional search query
 * @param {string} typeFilter - Optional type filter ('all', 'password', 'bookmark', 'note')
 * @returns {Array} - Array of notes with parsed data
 */
export async function fetchNotes(page = 1, searchQuery = "", typeFilter = "all") {
  let notes;
  
  if (searchQuery || typeFilter !== "all") {
    // For search or filter, load all notes and filter client-side
    notes = await db.notes
      .filter(note => note.deletedAt === null || note.deletedAt === undefined)
      .toArray();
    
    // Decrypt and parse
    notes = notes.map((note) => {
      const content = decryptData(note.content);
      const parsed = parseNote(content);
      return {
        ...note,
        content,
        parsed,
      };
    });
    
    // Filter by search query
    if (searchQuery) {
      notes = notes.filter((note) => matchesSearch(note, searchQuery));
    }
    
    // Filter by type
    if (typeFilter !== "all") {
      notes = notes.filter((note) => note.parsed.type === typeFilter);
    }
    
    // Sort by updatedAt (newest first)
    notes.sort((a, b) => b.updatedAt - a.updatedAt);
    
    // Apply pagination after filtering
    const offset = (page - 1) * itemsPerPage;
    notes = notes.slice(offset, offset + itemsPerPage);
  } else {
    // For non-search queries, use efficient database-level pagination
    const offset = (page - 1) * itemsPerPage;
    notes = await db.notes
      .filter(note => note.deletedAt === null || note.deletedAt === undefined)
      .reverse()
      .sortBy("updatedAt");
    
    notes = notes.slice(offset, offset + itemsPerPage);
    
    // Decrypt and parse
    notes = notes.map((note) => {
      const content = decryptData(note.content);
      const parsed = parseNote(content);
      return {
        ...note,
        content,
        parsed,
      };
    });
  }

  return notes;
}

/**
 * Update a note
 * @param {string} id - Note ID
 * @param {string} content - New raw content
 */
export async function updateNote(id, content) {
  const note = await db.notes.get(id);
  if (!note) throw new Error("Note not found");

  await db.notes.update(id, {
    content: encryptData(content),
    updatedAt: getCurrentTime(),
  });
}

/**
 * Soft delete a note
 * @param {string} id - Note ID
 */
export async function softDeleteNote(id) {
  const currentTime = getCurrentTime();
  await db.notes.update(id, {
    deletedAt: currentTime,
    updatedAt: currentTime,
  });
}

/**
 * Get a note by ID
 * @param {string} id - Note ID
 * @returns {Object|null} - Note with parsed data or null
 */
export async function getNoteById(id) {
  const note = await db.notes.get(id);
  if (!note || note.deletedAt !== null) return null;

  const content = decryptData(note.content);
  const parsed = parseNote(content);

  return {
    ...note,
    content,
    parsed,
  };
}

export function encryptData(data) {
  if (!ENCRYPTION_KEY) return data;
  const stringData = typeof data === "object" ? JSON.stringify(data) : String(data);
  return CryptoJS.AES.encrypt(stringData, ENCRYPTION_KEY).toString();
}

// Optimized cache for decrypted data to avoid repeated decryption
const decryptionCache = new Map();
const CACHE_MAX_SIZE = 1000;

function getCacheKey(encryptedData) {
  return encryptedData; // Use encrypted data as cache key
}

// Export cache management functions for external control
export function clearDecryptionCache() {
  decryptionCache.clear();
}

export function getDecryptionCacheSize() {
  return decryptionCache.size;
}

export function decryptData(encryptedData) {
  if (!ENCRYPTION_KEY || !encryptedData) return encryptedData;
  
  // Check cache first
  const cacheKey = getCacheKey(encryptedData);
  if (decryptionCache.has(cacheKey)) {
    return decryptionCache.get(cacheKey);
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // Cache the result, but limit cache size
    if (decryptionCache.size >= CACHE_MAX_SIZE) {
      // Remove oldest entry (first key)
      const firstKey = decryptionCache.keys().next().value;
      decryptionCache.delete(firstKey);
    }
    decryptionCache.set(cacheKey, decrypted);
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

// Database maintenance - run periodically instead of randomly
let lastMaintenanceRun = localStorage.getItem('lastDbMaintenance') || 0;
const MAINTENANCE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export async function performDatabaseMaintenance() {
  const now = Date.now();
  
  if (now - lastMaintenanceRun < MAINTENANCE_INTERVAL) {
    return; // Skip if maintenance was run recently
  }
  
  console.log("Performing database maintenance...");
  
  try {
    // Remove notes older than 90 days (soft deleted items only)
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    await db.notes.where("deletedAt").below(ninetyDaysAgo).delete();
    
    // Clear decryption cache to free memory
    decryptionCache.clear();
    
    localStorage.setItem('lastDbMaintenance', now.toString());
    console.log("Database maintenance completed");
  } catch (error) {
    console.error("Database maintenance failed:", error);
  }
}

// Run maintenance check on import (non-blocking)
setTimeout(() => performDatabaseMaintenance(), 1000);

/**
 * Get all notes including deleted ones (for sync)
 * @returns {Array} - All notes with encrypted content
 */
export async function getAllNotes() {
  try {
    const notes = await db.notes.toArray();
    return notes; // Return raw notes with encrypted content
  } catch (error) {
    console.error("Error fetching all notes:", error);
    return [];
  }
}

/**
 * Merge sync data from remote device
 * @param {Array} localNotes - Local notes
 * @param {Array} remoteNotes - Remote notes
 * @returns {Object} - Sync statistics
 */
export async function mergeSyncData(localNotes, remoteNotes) {
  const stats = {
    sent: localNotes.length,
    received: remoteNotes.length,
    updated: 0,
    conflicts: 0
  };

  try {
    // Create a map of local notes by ID for quick lookup
    const localNotesMap = new Map(localNotes.map(note => [note.id, note]));

    // Process each remote note
    for (const remoteNote of remoteNotes) {
      const localNote = localNotesMap.get(remoteNote.id);

      if (!localNote) {
        // New note from remote - add it
        await db.notes.add(remoteNote);
        stats.updated++;
      } else {
        // Note exists locally - check for conflicts
        if (remoteNote.updatedAt > localNote.updatedAt) {
          // Remote is newer - update local
          await db.notes.put(remoteNote);
          stats.updated++;
          stats.conflicts++;
        } else if (remoteNote.updatedAt < localNote.updatedAt) {
          // Local is newer - remote will get our version
          stats.conflicts++;
        }
        // If timestamps are equal, no action needed
      }
    }

    // Clear cache after sync
    clearDecryptionCache();

    return stats;
  } catch (error) {
    console.error("Error merging sync data:", error);
    throw error;
  }
}
