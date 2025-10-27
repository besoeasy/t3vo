<template>
  <form class="minio-config-form" @submit.prevent="applyConfig">
    <h3>MinIO/S3 Configuration</h3>
    <div class="form-row">
      <label>Endpoint:</label>
      <input v-model="config.endpoint" placeholder="e.g. http://localhost:9000" required />
    </div>
    <div class="form-row">
      <label>Access Key:</label>
      <input v-model="config.accessKeyId" required />
    </div>
    <div class="form-row">
      <label>Secret Key:</label>
      <input v-model="config.secretAccessKey" type="password" required />
    </div>
    <div class="form-row">
      <label>Bucket:</label>
      <input v-model="config.bucket" required />
    </div>
    <div class="form-row">
      <label>Region:</label>
      <input v-model="config.region" placeholder="e.g. us-east-1" required />
    </div>
    <div class="form-row">
      <label>Use SSL:</label>
      <input type="checkbox" v-model="config.useSSL" />
    </div>
    <button type="submit" class="btn-primary">Apply</button>
  </form>
  <div class="sync-container">
    <h2>Sync Notes With MinIO</h2>

    <div v-if="minioStatus" class="server-info">
      <div class="info-badge" :class="minioStatus.connected ? 'online' : 'offline'">
        {{ minioStatus.connected ? "🟢 S3 Connected" : "🔴 S3 Disconnected" }}
      </div>
      <div class="info-stats">
        <div>Total Notes: {{ minioStatus.totalNotes || 0 }}</div>
        <div v-if="minioStatus.oldestEntry">Oldest: {{ new Date(minioStatus.oldestEntry).toLocaleDateString() }}</div>
      </div>
    </div>

    <div class="button-group">
      <button @click="syncToMinio" :disabled="syncing || !minioConnected" class="btn-primary">📤 Upload to S3</button>
      <button @click="syncFromMinio" :disabled="syncing || !minioConnected" class="btn-primary">📥 Download from S3</button>
      <button @click="fullSync" :disabled="syncing || !minioConnected" class="btn-success">🔄 Full Sync (Two-Way)</button>
    </div>

    <div v-if="syncing" class="progress-section">
      <div class="status-text">{{ statusMessage }}</div>
      <progress :value="progress" :max="total"></progress>
      <span class="progress-text">{{ progress }} / {{ total }} notes</span>
    </div>

    <div v-if="syncResult" class="result-section">
      <div class="done-message">✓ Sync Complete!</div>
      <div class="stats">
        <div v-if="syncResult.uploaded !== undefined">Uploaded: {{ syncResult.uploaded }}</div>
        <div v-if="syncResult.downloaded !== undefined">Downloaded: {{ syncResult.downloaded }}</div>
        <div v-if="syncResult.merged !== undefined">Merged: {{ syncResult.merged }}</div>
        <div v-if="syncResult.conflicts !== undefined">Conflicts resolved: {{ syncResult.conflicts }}</div>
      </div>
    </div>

    <div v-if="error" class="error-message">⚠ Error: {{ error }}</div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
// Helper: convert S3 GetObjectCommand Body (ReadableStream) to string (browser)
async function streamToString(stream) {
  // Browser: stream is a ReadableStream
  const reader = stream.getReader();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += new TextDecoder().decode(value);
  }
  return result;
}
import { ref, onMounted } from "vue";
import { db, getAllNotes } from "@/db";
import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";

// S3/MinIO client configuration (user-editable)
const config = reactive({
  endpoint: localStorage.getItem("minio_endpoint") || "http://localhost:9000",
  accessKeyId: localStorage.getItem("minio_accessKeyId") || "",
  secretAccessKey: localStorage.getItem("minio_secretAccessKey") || "",
  bucket: localStorage.getItem("minio_bucket") || "notes",
  region: localStorage.getItem("minio_region") || "us-east-1",
  useSSL: localStorage.getItem("minio_useSSL") === "true" || false,
});

let s3Client = null;
let BUCKET_NAME = config.bucket;

function createS3Client() {
  const endpoint = config.endpoint.replace(/\/$/, "");
  return new S3Client({
    region: config.region || "us-east-1",
    endpoint: endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function applyConfig() {
  localStorage.setItem("minio_endpoint", config.endpoint);
  localStorage.setItem("minio_accessKeyId", config.accessKeyId);
  localStorage.setItem("minio_secretAccessKey", config.secretAccessKey);
  localStorage.setItem("minio_bucket", config.bucket);
  localStorage.setItem("minio_region", config.region);
  localStorage.setItem("minio_useSSL", config.useSSL ? "true" : "false");
  s3Client = createS3Client();
  BUCKET_NAME = config.bucket;
  checkMinioStatus();
}

// Initialize S3 client on mount
s3Client = createS3Client();
BUCKET_NAME = config.bucket;

// Watch for config changes (reactive)
watch(
  () => config.bucket,
  (val) => {
    BUCKET_NAME = val;
  }
);
const userID = db.name; // Use database hash as folder name

const syncing = ref(false);
const syncResult = ref(null);
const error = ref("");
const progress = ref(0);
const total = ref(0);
const statusMessage = ref("");
const minioStatus = ref({ connected: false, totalNotes: 0, oldestEntry: null });
const minioConnected = ref(false);

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  if (!buffer || buffer.byteLength === 0) return null;
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  if (!base64 || typeof base64 !== "string") return null;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Check MinIO/S3 connection and bucket status
async function checkMinioStatus() {
  try {
    // Check if bucket exists
    let bucketExists = true;
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    } catch (err) {
      bucketExists = false;
    }
    if (!bucketExists) {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    }
    minioStatus.value.connected = true;
    minioConnected.value = true;

    // Fetch metadata for stats
    let totalNotes = 0;
    let oldestEntry = null;
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` }));
    if (listRes.Contents) {
      totalNotes = listRes.Contents.length;
      for (const obj of listRes.Contents) {
        const lastModified = new Date(obj.LastModified);
        if (!oldestEntry || lastModified < oldestEntry) {
          oldestEntry = lastModified;
        }
      }
    }
    minioStatus.value = { connected: true, totalNotes, oldestEntry };
  } catch (e) {
    console.error("MinIO connection error:", e);
    minioStatus.value.connected = false;
    minioConnected.value = false;
    error.value = "Failed to connect to MinIO";
  }
}

// Upload local notes to MinIO/S3
async function syncToMinio() {
  syncing.value = true;
  syncResult.value = null;
  error.value = "";
  progress.value = 0;
  statusMessage.value = "Loading local notes...";

  try {
    const notes = await getAllNotes();
    total.value = notes.length;
    statusMessage.value = "Uploading notes to MinIO...";

    let uploaded = 0;

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];

      // Convert ArrayBuffer attachments to Base64
      const attachments = (note.attachments || []).map((att) => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        data: att.data instanceof ArrayBuffer ? arrayBufferToBase64(att.data) : null,
        uploadedAt: att.uploadedAt,
      }));

      // Prepare note for MinIO
      const minioNote = {
        noteID: note.id,
        userID: userID,
        content: note.content, // Keep encrypted
        updatedAt: note.updatedAt,
        deletedAt: note.deletedAt,
        attachments: attachments,
      };

      const objectName = `${userID}/${note.id}.json`;
      const noteJson = JSON.stringify(minioNote);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: objectName,
          Body: noteJson,
          ContentType: "application/json",
        })
      );

      uploaded++;
      progress.value = i + 1;
    }

    syncResult.value = { uploaded };
    statusMessage.value = "Upload complete!";
    await checkMinioStatus(); // Update status after upload
  } catch (e) {
    console.error("Sync to MinIO error:", e);
    error.value = e.message || "Failed to sync to MinIO";
  } finally {
    syncing.value = false;
  }
}

// Download notes from MinIO/S3
async function syncFromMinio() {
  syncing.value = true;
  syncResult.value = null;
  error.value = "";
  progress.value = 0;
  statusMessage.value = "Fetching notes from MinIO...";

  try {
    const objects = [];
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` }));
    if (listRes.Contents) {
      for (const obj of listRes.Contents) {
        objects.push(obj);
      }
    }

    total.value = objects.length;
    statusMessage.value = "Syncing notes to local database...";

    let downloaded = 0;

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const objectName = obj.Key;

      const getObjRes = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: objectName }));
      const data = await streamToString(getObjRes.Body);
      const serverNote = JSON.parse(data);

      // Convert Base64 attachments back to ArrayBuffer
      const attachments = (serverNote.attachments || []).map((att) => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        data: att.data ? base64ToArrayBuffer(att.data) : null,
        uploadedAt: att.uploadedAt,
      }));

      // Convert to local format
      const localNote = {
        id: serverNote.noteID,
        content: serverNote.content,
        updatedAt: serverNote.updatedAt,
        deletedAt: serverNote.deletedAt || null,
        attachments: attachments,
      };

      // Check if note exists locally
      const existingNote = await db.notes.get(localNote.id);

      if (!existingNote) {
        // New note - add it
        await db.notes.add(localNote);
        downloaded++;
      } else if (localNote.updatedAt > existingNote.updatedAt) {
        // MinIO version is newer - update local
        await db.notes.put(localNote);
        downloaded++;
      }

      progress.value = i + 1;
    }

    syncResult.value = { downloaded };
    statusMessage.value = "Download complete!";
    await checkMinioStatus(); // Update status after download
  } catch (e) {
    console.error("Sync from MinIO error:", e);
    error.value = e.message || "Failed to sync from MinIO";
  } finally {
    syncing.value = false;
  }
}

// Two-way sync (merge both ways)
async function fullSync() {
  syncing.value = true;
  syncResult.value = null;
  error.value = "";
  progress.value = 0;

  try {
    // Step 1: Upload to MinIO
    statusMessage.value = "Step 1/2: Uploading local notes...";
    const localNotes = await getAllNotes();
    total.value = localNotes.length;

    let uploaded = 0;

    for (let i = 0; i < localNotes.length; i++) {
      const note = localNotes[i];
      // Convert ArrayBuffer attachments to Base64
      const attachments = (note.attachments || []).map((att) => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        data: att.data instanceof ArrayBuffer ? arrayBufferToBase64(att.data) : null,
        uploadedAt: att.uploadedAt,
      }));
      const minioNote = {
        noteID: note.id,
        userID: userID,
        content: note.content,
        updatedAt: note.updatedAt,
        deletedAt: note.deletedAt,
        attachments: attachments,
      };
      const objectName = `${userID}/${note.id}.json`;
      const noteJson = JSON.stringify(minioNote);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: objectName,
          Body: noteJson,
          ContentType: "application/json",
        })
      );
      uploaded++;
      progress.value = i + 1;
    }

    // Step 2: Download and merge from MinIO/S3
    statusMessage.value = "Step 2/2: Downloading and merging...";
    const objects = [];
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` }));
    if (listRes.Contents) {
      for (const obj of listRes.Contents) {
        objects.push(obj);
      }
    }
    total.value = objects.length;
    progress.value = 0;
    let merged = 0;
    let conflicts = 0;
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const objectName = obj.Key;
      const getObjRes = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: objectName }));
      const data = await streamToString(getObjRes.Body);
      const serverNote = JSON.parse(data);
      // Convert Base64 attachments back to ArrayBuffer
      const attachments = (serverNote.attachments || []).map((att) => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        data: att.data ? base64ToArrayBuffer(att.data) : null,
        uploadedAt: att.uploadedAt,
      }));
      const localNote = {
        id: serverNote.noteID,
        content: serverNote.content,
        updatedAt: serverNote.updatedAt,
        deletedAt: serverNote.deletedAt || null,
        attachments: attachments,
      };
      const existingNote = await db.notes.get(localNote.id);
      if (!existingNote) {
        await db.notes.add(localNote);
        merged++;
      } else if (localNote.updatedAt > existingNote.updatedAt) {
        await db.notes.put(localNote);
        merged++;
        conflicts++;
      } else if (localNote.updatedAt < existingNote.updatedAt) {
        conflicts++;
      }
      progress.value = i + 1;
    }
    syncResult.value = { uploaded, downloaded: objects.length, merged, conflicts };
    statusMessage.value = "Full sync complete!";
    await checkMinioStatus(); // Update status after sync
  } catch (e) {
    console.error("Full sync error:", e);
    error.value = e.message || "Failed to complete full sync";
  } finally {
    syncing.value = false;
  }
}

// Initialize MinIO status on mount
onMounted(() => {
  checkMinioStatus();
});
</script>

<style scoped>
/* Same styles as original, no changes needed */
.sync-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: linear-gradient(to bottom, #ffffff, #f8f9fa);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
  font-size: 1.5rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

button {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.progress-section {
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.status-text {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.75rem;
  text-align: center;
}

progress {
  width: 100%;
  height: 24px;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 0.875rem;
  color: #6c757d;
}

.result-section {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.done-message {
  color: #155724;
  font-weight: bold;
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
  text-align: center;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #155724;
}

.stats div {
  padding: 0.25rem 0;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
}
form.minio-config-form {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  max-width: 400px;
}
.minio-config-form h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #333;
}
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}
.form-row label {
  width: 110px;
  font-size: 0.98rem;
  color: #444;
}
.form-row input[type="text"],
.form-row input[type="password"] {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}
.form-row input[type="checkbox"] {
  margin-left: 0.5rem;
}
</style>
