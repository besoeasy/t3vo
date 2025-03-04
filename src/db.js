import Dexie from "dexie";

import { getSHA256, encryptData, decryptData } from "@/utils";

const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY");

const hashedKey = ENCRYPTION_KEY ? getSHA256(ENCRYPTION_KEY) : null;

// Define the IndexedDB database name.
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
const generateUniqueId = (...fields) => getSHA256(fields.join(""));

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

// Adds a new note entry to the database.
export async function addNoteEntry(entry) {
  entry.id = generateUniqueId(entry.title, entry.content);
  encryptEntry(entry, ["title", "content"]);
  entry.updated_at = getCurrentTime();
  entry.deleted_at = null;
  await db.notes.add(entry);
}

// Adds a new bookmark entry to the database.
export async function addBookmarkEntry(entry) {
  entry.id = generateUniqueId(entry.title, entry.url, entry.note);
  encryptEntry(entry, ["title", "url", "note"]);
  entry.updated_at = getCurrentTime();
  entry.deleted_at = null;
  await db.bookmarks.add(entry);
}

// Adds a new password entry to the database.
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

// Fetches notes from the database with pagination and search.
export function fetchNotes(page = 1, searchQuery = "") {
  return fetchEntries("notes", ["title", "content"], ["title", "content"], page, searchQuery);
}

// Fetches bookmarks from the database with pagination and search.
export function fetchBookmarks(page = 1, searchQuery = "") {
  return fetchEntries("bookmarks", ["title", "note", "url"], ["title", "note", "url"], page, searchQuery);
}

// Fetches passwords from the database with pagination and search.
export function fetchPasswords(page = 1, searchQuery = "") {
  return fetchEntries("passwords", ["title", "username", "email", "password", "totpSecret", "urls"], ["title", "username", "email"], page, searchQuery);
}

// Soft deletes an entry by setting its deleted_at timestamp.
export async function softDeleteEntry(table, id) {
  const currentTime = getCurrentTime();
  await db[table].update(id, { deleted_at: currentTime, updated_at: currentTime });
}

// Soft deletes a note entry.
export async function deleteNoteEntry(id) {
  return softDeleteEntry("notes", id);
}

// Soft deletes a bookmark entry.
export async function deleteBookmarkEntry(id) {
  return softDeleteEntry("bookmarks", id);
}

// Soft deletes a password entry.
export async function deletePasswordEntry(id) {
  return softDeleteEntry("passwords", id);
}

// Periodically cleans up old entries that have been soft-deleted for more than 90 days.
if (Math.random() > 0.9) {
  console.log("Cleaning up old entries...");

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  db.notes.where("deleted_at").below(ninetyDaysAgo).delete();
  db.bookmarks.where("deleted_at").below(ninetyDaysAgo).delete();
  db.passwords.where("deleted_at").below(ninetyDaysAgo).delete();
}
