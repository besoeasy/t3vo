import Dexie from "dexie";

import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY") || "0";

const hashedKey = ENCRYPTION_KEY ? getSha256Hash(ENCRYPTION_KEY) : null;

export const db = new Dexie(`T3VO-${hashedKey}`);

db.version(1).stores({
  entries: "id, type, data, updatedAt, deletedAt",
});

const itemsPerPage = 10;

const getCurrentTime = () => Date.now();

function matchesSearch(entry, searchQuery) {
  const lowerQuery = searchQuery.toLowerCase();
  const decryptedData = decryptData(entry.data);

  if (typeof decryptedData !== "object") {
    return String(decryptedData).toLowerCase().includes(lowerQuery);
  }

  return Object.values(decryptedData).some((value) => {
    return value && String(value).toLowerCase().includes(lowerQuery);
  });
}

function getSha256Hash(str) {
  let progressiveStr = "";

  for (let i = 1; i <= str.length; i++) {
    progressiveStr += str.substring(0, i);
  }

  return CryptoJS.SHA256(progressiveStr).toString(CryptoJS.enc.Hex);
}

export async function addEntry(type, data) {
  const entry = {
    id: getSha256Hash(type + encryptData(data) + getCurrentTime()),
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
  // Only include entries that haven't been soft-deleted.
  let query = db.entries
    .where("type")
    .equals(type)
    .and((entry) => entry.deletedAt === null)
    .reverse();

  let entries = await query.toArray();

  if (searchQuery) {
    entries = entries.filter((entry) => matchesSearch(entry, searchQuery));
  }

  // Sort by updatedAt (newest first)
  entries.sort((a, b) => b.updatedAt - a.updatedAt);

  // Apply pagination
  const offset = (page - 1) * itemsPerPage;
  const paginatedEntries = entries.slice(offset, offset + itemsPerPage);

  // Decrypt data for each entry
  return paginatedEntries.map((entry) => ({
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

export async function updateNoteEntry(id, noteData) {
  const entry = await db.entries.get(id);
  if (!entry || entry.type !== "note") throw new Error("Note not found");

  const currentData = decryptData(entry.data);
  const updatedData = {
    ...currentData,
    title: noteData.title !== undefined ? noteData.title : currentData.title,
    content: noteData.content !== undefined ? noteData.content : currentData.content,
    tags: noteData.tags !== undefined ? noteData.tags : currentData.tags,
  };

  return updateEntry(id, updatedData);
}

export async function updateBookmarkEntry(id, bookmarkData) {
  const entry = await db.entries.get(id);
  if (!entry || entry.type !== "bookmark") throw new Error("Bookmark not found");

  const currentData = decryptData(entry.data);
  const updatedData = {
    ...currentData,
    title: bookmarkData.title !== undefined ? bookmarkData.title : currentData.title,
    url: bookmarkData.url !== undefined ? bookmarkData.url : currentData.url,
    note: bookmarkData.note !== undefined ? bookmarkData.note : currentData.note,
  };

  return updateEntry(id, updatedData);
}

export async function updatePasswordEntry(id, passwordData) {
  const entry = await db.entries.get(id);
  if (!entry || entry.type !== "password") throw new Error("Password not found");

  const currentData = decryptData(entry.data);
  const updatedData = {
    ...currentData,
    title: passwordData.title !== undefined ? passwordData.title : currentData.title,
    username: passwordData.username !== undefined ? passwordData.username : currentData.username,
    email: passwordData.email !== undefined ? passwordData.email : currentData.email,
    password: passwordData.password !== undefined ? passwordData.password : currentData.password,
    totpSecret: passwordData.totpSecret !== undefined ? passwordData.totpSecret : currentData.totpSecret,
    urls: passwordData.urls !== undefined ? passwordData.urls : currentData.urls,
  };

  return updateEntry(id, updatedData);
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

export function decryptData(encryptedData) {
  if (!ENCRYPTION_KEY || !encryptedData) return encryptedData;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

if (Math.random() > 0.1) {
  console.log("Cleaning up database...");

  // Remove duplicate entries
  const entries = db.entries.toArray();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (entries[i].data === entries[j].data && entries[i].type === entries[j].type) {
        db.entries.delete(entries[j].id);
      }
    }
  }

  // Remove entries older than 90 days
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  db.entries.where("deletedAt").below(ninetyDaysAgo).delete();
}
