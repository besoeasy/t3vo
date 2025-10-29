import Dexie from "dexie";
import CryptoJS from "crypto-js";

import { parseNote } from "@/utils/noteParser";

const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY") || "0";

const hashedKey = ENCRYPTION_KEY ? getSha256Hash(ENCRYPTION_KEY, false) : null;

export const db = new Dexie(`T3VO-${hashedKey}`);

db.version(1).stores({
  notes: "id, attachments, updatedAt, deletedAt",
});

const itemsPerPage = 60;

const getCurrentTime = () => Date.now();

// Optimized hash function using built-in crypto when available
function getSha256Hash(str, includeTimestamp = false) {
  // Use Web Crypto API if available (more efficient)
  if (typeof crypto !== "undefined" && crypto.subtle) {
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
 * @param {Array} files - Optional array of File/Blob objects
 * @param {string} customId - Optional custom note ID (if not provided, generates hash)
 * @returns {string} - Note ID
 */
export async function addNote(content, files = [], customId = null) {
  const noteId = customId || getSha256Hash(encryptData(content) + getCurrentTime(), true);

  // Process attachments
  const attachments = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    attachments.push({
      id: getSha256Hash(noteId + file.name + getCurrentTime(), true),
      name: file.name,
      type: file.type,
      size: file.size,
      data: arrayBuffer,
      uploadedAt: getCurrentTime(),
    });
  }

  const note = {
    id: noteId,
    content: encryptData(content),
    updatedAt: getCurrentTime(),
    deletedAt: null,
    attachments,
  };

  await db.notes.add(note);
  return noteId;
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

  // Always return all notes (including deleted) for dashboard display
  notes = await db.notes.toArray();

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
    const query = searchQuery.toLowerCase();
    notes = notes.filter((note) => note.parsed.title?.toLowerCase().includes(query) || note.parsed.content?.toLowerCase().includes(query));
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
 * Add attachments to an existing note
 * @param {string} noteId - Note ID
 * @param {Array} files - Array of File/Blob objects
 * @returns {Array} - Array of attachment IDs
 */
export async function addAttachments(noteId, files) {
  if (!files || files.length === 0) {
    return [];
  }

  const note = await db.notes.get(noteId);
  if (!note) {
    throw new Error("Note not found");
  }

  const currentAttachments = note.attachments || [];
  const attachmentIds = [];

  for (const file of files) {
    // Validate file size (10MB limit per file)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large (max 10MB)`);
    }

    const arrayBuffer = await file.arrayBuffer();
    const attachmentId = getSha256Hash(noteId + file.name + getCurrentTime(), true);

    currentAttachments.push({
      id: attachmentId,
      name: file.name,
      type: file.type,
      size: file.size,
      data: arrayBuffer,
      uploadedAt: getCurrentTime(),
    });

    attachmentIds.push(attachmentId);
  }

  // Update note with new attachments
  await db.notes.update(noteId, {
    attachments: currentAttachments,
    updatedAt: getCurrentTime(),
  });

  return attachmentIds;
}

/**
 * Get attachments for a note
 * @param {string} noteId - Note ID
 * @returns {Array} - Array of attachments with data
 */
export async function getAttachments(noteId) {
  const note = await db.notes.get(noteId);
  return note?.attachments || [];
}

/**
 * Get a single attachment
 * @param {string} noteId - Note ID
 * @param {string} attachmentId - Attachment ID
 * @returns {Object|null} - Attachment object
 */
export async function getAttachment(noteId, attachmentId) {
  const note = await db.notes.get(noteId);
  if (!note || !note.attachments) return null;
  return note.attachments.find((att) => att.id === attachmentId);
}

/**
 * Delete an attachment
 * @param {string} noteId - Note ID
 * @param {string} attachmentId - Attachment ID
 */
export async function deleteAttachment(noteId, attachmentId) {
  const note = await db.notes.get(noteId);
  if (!note || !note.attachments) return;

  await db.notes.update(noteId, {
    attachments: note.attachments.filter((a) => a.id !== attachmentId),
    updatedAt: getCurrentTime(),
  });
}

/**
 * Get total size of attachments for a note
 * @param {string} noteId - Note ID
 * @returns {number} - Total size in bytes
 */
export async function getNoteTotalAttachmentSize(noteId) {
  const note = await db.notes.get(noteId);
  if (!note || !note.attachments) return 0;
  return note.attachments.reduce((total, att) => total + (att.size || 0), 0);
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

/**
 * Fetch a note by ID (alias for compatibility)
 * @param {string} id - Note ID
 * @returns {Object|null} - Note with parsed data or null
 */
export async function fetchNoteById(id) {
  return getNoteById(id);
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

let lastMaintenanceRun = localStorage.getItem("lastDbMaintenance") || 0;
const MAINTENANCE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export async function performDatabaseMaintenance() {
  const now = Date.now();

  if (now - lastMaintenanceRun < MAINTENANCE_INTERVAL) {
    return;
  }

  console.log("Performing database maintenance...");

  try {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    await db.notes.filter((note) => note.deletedAt && now - Number(note.deletedAt) > SEVEN_DAYS).delete();

    decryptionCache.clear();

    localStorage.setItem("lastDbMaintenance", now.toString());
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
    conflicts: 0,
  };

  try {
    // Create a map of local notes by ID for quick lookup
    const localNotesMap = new Map(localNotes.map((note) => [note.id, note]));

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
          // Remote is newer - merge attachments
          let mergedAttachments = [];
          const localAtt = Array.isArray(localNote.attachments) ? localNote.attachments : [];
          const remoteAtt = Array.isArray(remoteNote.attachments) ? remoteNote.attachments : [];

          // Merge attachments by id, prefer newer uploadedAt
          const attMap = new Map();
          for (const att of localAtt) {
            attMap.set(att.id, att);
          }
          for (const att of remoteAtt) {
            if (!attMap.has(att.id) || att.uploadedAt > (attMap.get(att.id)?.uploadedAt || 0)) {
              attMap.set(att.id, att);
            }
          }
          mergedAttachments = Array.from(attMap.values());

          await db.notes.put({
            ...remoteNote,
            attachments: mergedAttachments,
          });
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
