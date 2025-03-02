import Dexie from "dexie";
import CryptoJS from "crypto-js";
import { sha256 } from "js-sha256";

// Retrieve the encryption key from sessionStorage.
const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY");
if (!ENCRYPTION_KEY) {
  console.error("Encryption key is missing. Ensure it is set in sessionStorage.");
}
const hashedKey = ENCRYPTION_KEY ? sha256(ENCRYPTION_KEY) : null;
export const dbname = `T3VO-${hashedKey}`;

// Define the IndexedDB schema.
export const db = new Dexie(dbname);
db.version(1).stores({
  notes: "id, title, content, tags, updated_at, deleted_at",
  bookmarks: "id, title, note, url, updated_at, deleted_at",
  passwords: "id, title, username, email, password, totpSecret, urls, updated_at, deleted_at",
});

// Common constant for pagination.
const itemsPerPage = 10;

// Helper: Returns current timestamp.
const getCurrentTime = () => Date.now();

// Helper: Generates a unique ID based on provided fields.
const generateUniqueId = (...fields) => sha256(fields.join(""));

// Helper: Encrypts data using AES.
function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

// Helper: Decrypts data using AES.
function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) {
      throw new Error("Failed to decrypt content.");
    }
    return JSON.parse(decryptedData);
  } catch (e) {
    console.error("Decryption error:", e.message);
    return null;
  }
}

// Helper: Encrypts the specified keys in the entry.
function encryptEntry(entry, keys) {
  keys.forEach((key) => {
    if (entry[key] !== undefined) {
      entry[key] = encryptData(entry[key]);
    }
  });
  return entry;
}

// Helper: Decrypts the specified keys in the entry.
function decryptEntry(entry, keys) {
  const decrypted = { ...entry };
  keys.forEach((key) => {
    if (entry[key] !== undefined) {
      decrypted[key] = decryptData(entry[key]);
    }
  });
  return decrypted;
}

// Helper: Checks if any decrypted field contains the search query.
function matchesSearch(entry, keys, searchQuery) {
  const lowerQuery = searchQuery.toLowerCase();
  return keys.some((key) => {
    const decrypted = decryptData(entry[key]);
    return decrypted && decrypted.toString().toLowerCase().includes(lowerQuery);
  });
}

// CRUD Functions

export async function addNoteEntry(entry) {
  entry.id = generateUniqueId(entry.title, entry.content);
  encryptEntry(entry, ["title", "content"]);
  entry.updated_at = getCurrentTime();
  entry.deleted_at = null;
  await db.notes.add(entry);
}

export async function addBookmarkEntry(entry) {
  entry.id = generateUniqueId(entry.title, entry.url, entry.note);
  encryptEntry(entry, ["title", "url", "note"]);
  entry.updated_at = getCurrentTime();
  entry.deleted_at = null;
  await db.bookmarks.add(entry);
}

export async function addPasswordEntry(entry) {
  entry.id = generateUniqueId(entry.title, entry.username, entry.email);
  encryptEntry(entry, ["title", "username", "email", "password", "totpSecret", "urls"]);
  entry.updated_at = getCurrentTime();
  entry.deleted_at = null;
  await db.passwords.add(entry);
}

// Generic function for fetching entries with pagination and search.
// Now only returns entries where deleted_at is null.
async function fetchEntries(table, fieldsToDecrypt, searchFields, page, searchQuery) {
  // Only include entries that haven't been soft-deleted.
  let query = db[table]
    .orderBy("updated_at")
    .reverse()
    .filter((entry) => entry.deleted_at === null);

  if (searchQuery) {
    query = query.filter((entry) => matchesSearch(entry, searchFields, searchQuery));
  }
  const offset = (page - 1) * itemsPerPage;
  const entries = await query.offset(offset).limit(itemsPerPage).toArray();
  return entries.map((entry) => decryptEntry(entry, fieldsToDecrypt));
}

export function fetchNotes(page = 1, searchQuery = "") {
  return fetchEntries("notes", ["title", "content"], ["title", "content"], page, searchQuery);
}

export function fetchBookmarks(page = 1, searchQuery = "") {
  return fetchEntries("bookmarks", ["title", "note", "url"], ["title", "note", "url"], page, searchQuery);
}

export function fetchPasswords(page = 1, searchQuery = "") {
  return fetchEntries("passwords", ["title", "username", "email", "password", "totpSecret", "urls"], ["title", "username", "email"], page, searchQuery);
}

export async function softDeleteEntry(table, id) {
  const currentTime = getCurrentTime();
  await db[table].update(id, { deleted_at: currentTime, updated_at: currentTime });
}

export async function deleteNoteEntry(id) {
  return softDeleteEntry("notes", id);
}

export async function deleteBookmarkEntry(id) {
  return softDeleteEntry("bookmarks", id);
}

export async function deletePasswordEntry(id) {
  return softDeleteEntry("passwords", id);
}

if (Math.random() < 0.95) {
  console.log("Cleaning up old entries...");

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  db.notes.where("deleted_at").below(ninetyDaysAgo).delete();
  db.bookmarks.where("deleted_at").below(ninetyDaysAgo).delete();
  db.passwords.where("deleted_at").below(ninetyDaysAgo).delete();
}
