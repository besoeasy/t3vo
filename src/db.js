import Dexie from "dexie";

import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY") || "0";

const hashedKey = ENCRYPTION_KEY ? getSha256Hash(ENCRYPTION_KEY, false) : null;

export const db = new Dexie(`T3VO-${hashedKey}`);

db.version(1).stores({
  entries: "id, type, updatedAt, deletedAt, [type+deletedAt], [type+updatedAt]",
});

const itemsPerPage = 60;

const getCurrentTime = () => Date.now();

// Optimized match function with early returns
function matchesSearch(entry, searchQuery) {
  if (!searchQuery) return true;
  
  const lowerQuery = searchQuery.toLowerCase();
  const decryptedData = decryptData(entry.data);

  if (!decryptedData) return false;

  if (typeof decryptedData !== "object") {
    return String(decryptedData).toLowerCase().includes(lowerQuery);
  }

  // Use for...in loop for early termination
  for (const key in decryptedData) {
    const value = decryptedData[key];
    if (value && String(value).toLowerCase().includes(lowerQuery)) {
      return true;
    }
  }
  
  return false;
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

export async function addEntry(type, data) {
  const entry = {
    id: getSha256Hash(type + encryptData(data) + getCurrentTime(), true),
    type,
    data: encryptData(data),
    updatedAt: getCurrentTime(),
    deletedAt: null,
  };

  const id = await db.entries.add(entry);
  return id;
}

// Convenience functions for specific types
export async function addNoteEntry(noteData) {
  return addEntry("note", {
    title: noteData.title,
    content: noteData.content,
    tags: noteData.tags || [],
  });
}

export async function addBookmarkEntry(bookmarkData) {
  return addEntry("bookmark", {
    title: bookmarkData.title,
    url: bookmarkData.url,
    note: bookmarkData.note || "",
  });
}

export async function addPasswordEntry(passwordData) {
  return addEntry("password", {
    title: passwordData.title,
    username: passwordData.username,
    email: passwordData.email,
    password: passwordData.password,
    totpSecret: passwordData.totpSecret || "",
    urls: passwordData.urls || [],
  });
}

// Generic function for fetching entries with pagination and search.
async function fetchEntries(type, page = 1, searchQuery = "") {
  let entries;
  
  if (searchQuery) {
    // For search, we need to load all entries of this type and filter
    // This is a limitation of encrypted data - we can't index encrypted content
    entries = await db.entries
      .where("type")
      .equals(type)
      .and((entry) => entry.deletedAt === null)
      .toArray();
    
    // Filter by search query
    entries = entries.filter((entry) => matchesSearch(entry, searchQuery));
    
    // Sort by updatedAt (newest first)
    entries.sort((a, b) => b.updatedAt - a.updatedAt);
    
    // Apply pagination after filtering
    const offset = (page - 1) * itemsPerPage;
    entries = entries.slice(offset, offset + itemsPerPage);
  } else {
    // For non-search queries, use efficient database-level pagination
    const offset = (page - 1) * itemsPerPage;
    entries = await db.entries
      .where("type")
      .equals(type)
      .and((entry) => entry.deletedAt === null)
      .reverse()
      .offset(offset)
      .limit(itemsPerPage)
      .toArray();
  }

  // Decrypt data for each entry
  return entries.map((entry) => ({
    ...entry,
    data: decryptData(entry.data),
  }));
}

// Convenience functions for fetching specific types
export function fetchNotes(page = 1, searchQuery = "") {
  return fetchEntries("note", page, searchQuery);
}

export function fetchBookmarks(page = 1, searchQuery = "") {
  return fetchEntries("bookmark", page, searchQuery);
}

export function fetchPasswords(page = 1, searchQuery = "") {
  return fetchEntries("password", page, searchQuery);
}

// Soft deletes an entry by setting its deletedAt timestamp.
export async function softDeleteEntry(id) {
  const currentTime = getCurrentTime();
  await db.entries.update(id, {
    deletedAt: currentTime,
    updatedAt: currentTime,
  });
}

// Update an entry
export async function updateEntry(id, data) {
  const entry = await db.entries.get(id);
  if (!entry) throw new Error("Entry not found");

  await db.entries.update(id, {
    data: encryptData(data),
    updatedAt: getCurrentTime(),
  });
}

// Helper function to reduce update function redundancy
async function updateEntryData(id, expectedType, newData, updateCallback) {
  const entry = await db.entries.get(id);
  if (!entry || entry.type !== expectedType) {
    throw new Error(`${expectedType.charAt(0).toUpperCase() + expectedType.slice(1)} not found`);
  }

  const currentData = decryptData(entry.data);
  const updatedData = updateCallback(currentData, newData);
  
  return updateEntry(id, updatedData);
}

export async function updateNoteEntry(id, noteData) {
  return updateEntryData(id, "note", noteData, (current, updates) => ({
    ...current,
    title: updates.title !== undefined ? updates.title : current.title,
    content: updates.content !== undefined ? updates.content : current.content,
    tags: updates.tags !== undefined ? updates.tags : current.tags,
  }));
}

export async function updateBookmarkEntry(id, bookmarkData) {
  return updateEntryData(id, "bookmark", bookmarkData, (current, updates) => ({
    ...current,
    title: updates.title !== undefined ? updates.title : current.title,
    url: updates.url !== undefined ? updates.url : current.url,
    note: updates.note !== undefined ? updates.note : current.note,
  }));
}

export async function updatePasswordEntry(id, passwordData) {
  return updateEntryData(id, "password", passwordData, (current, updates) => ({
    ...current,
    title: updates.title !== undefined ? updates.title : current.title,
    username: updates.username !== undefined ? updates.username : current.username,
    email: updates.email !== undefined ? updates.email : current.email,
    password: updates.password !== undefined ? updates.password : current.password,
    totpSecret: updates.totpSecret !== undefined ? updates.totpSecret : current.totpSecret,
    urls: updates.urls !== undefined ? updates.urls : current.urls,
  }));
}

export async function getEntryById(id) {
  const entry = await db.entries.get(id);
  if (!entry || entry.deletedAt !== null) return null;

  return {
    ...entry,
    data: decryptData(entry.data),
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
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    // Cache the result, but limit cache size
    if (decryptionCache.size >= CACHE_MAX_SIZE) {
      // Remove oldest entry (first key)
      const firstKey = decryptionCache.keys().next().value;
      decryptionCache.delete(firstKey);
    }
    decryptionCache.set(cacheKey, decrypted);
    
    return decrypted;
  } catch {
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
    // Remove entries older than 90 days (soft deleted items only)
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    await db.entries.where("deletedAt").below(ninetyDaysAgo).delete();
    
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
