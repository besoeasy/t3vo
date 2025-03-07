import Dexie from "dexie";

import { getSHA256, encryptData, decryptData } from "@/utils";

const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY");

const hashedKey = ENCRYPTION_KEY ? getSHA256(ENCRYPTION_KEY) : null;

// Define the IndexedDB database name.
export const dbname = `T3VO-${hashedKey}`;

// Define the IndexedDB schema.
export const db = new Dexie(dbname);

db.version(1).stores({
  data: "id, type, object, updatedAt, deletedAt",
});

// Common constant for pagination.
const itemsPerPage = 10;

// Helper: Returns current timestamp.
const getCurrentTime = () => Date.now();

// Helper: Generates a unique ID based on provided fields.
const generateUniqueId = (...fields) => getSHA256(fields.join(""));

// Helper: Encrypts the specified keys in the entry.
function encryptEntry(entry) {
  entry.object = encryptData(entry.object);
  return entry;
}

// Helper: Decrypts the specified keys in the entry.
function decryptEntry(entry) {
  const decrypted = { ...entry };
  decrypted.object = decryptData(entry.object);
  return decrypted;
}

// Helper: Checks if any decrypted field contains the search query.
function matchesSearch(entry, searchQuery) {
  const lowerQuery = searchQuery.toLowerCase();
  const decrypted = decryptData(entry.object);
  return decrypted && decrypted.toString().toLowerCase().includes(lowerQuery);
}

// CRUD Functions

// Adds a new entry to the database.
export async function addEntry(type, object) {
  const entry = {
    id: generateUniqueId(type, JSON.stringify(object)),
    type,
    object: JSON.stringify(object),
    updatedAt: getCurrentTime(),
    deletedAt: null,
  };
  encryptEntry(entry);
  await db.data.add(entry);
}

// Generic function for fetching entries with pagination and search.
// Now only returns entries where deletedAt is null.
async function fetchEntries(type, page, searchQuery) {
  // Only include entries that haven't been soft-deleted.
  let query = db.data
    .where("type")
    .equals(type)
    .and((entry) => entry.deletedAt === null);

  if (searchQuery) {
    query = query.filter((entry) => matchesSearch(entry, searchQuery));
  }
  const offset = (page - 1) * itemsPerPage;
  const entries = await query.offset(offset).limit(itemsPerPage).toArray();
  return entries.map((entry) => decryptEntry(entry));
}

// Fetches entries of a specific type from the database with pagination and search.
export function fetchEntriesByType(type, page = 1, searchQuery = "") {
  return fetchEntries(type, page, searchQuery);
}

// Soft deletes an entry by setting its deletedAt timestamp.
export async function softDeleteEntry(id) {
  const currentTime = getCurrentTime();
  await db.data.update(id, { deletedAt: currentTime, updatedAt: currentTime });
}

// Periodically cleans up old entries that have been soft-deleted for more than 90 days.
if (Math.random() > 0.9) {
  console.log("Cleaning up old entries...");

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  db.data.where("deletedAt").below(ninetyDaysAgo).delete();
}
