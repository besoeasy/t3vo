<template>
  <div class="flex flex-col items-center min-h-screen bg-white dark:bg-gray-900 py-6 px-2 sm:px-4">
    <form
      @submit.prevent="applyConfig"
      class="w-full max-w-md bg-gray-50 dark:bg-gray-800 rounded-xl shadow p-6 mb-8 border border-gray-200 dark:border-gray-700"
    >
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">S3 Configuration</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint</label>
          <input
            v-model="config.endpoint"
            placeholder="e.g. http://localhost:9000"
            required
            class="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Key</label>
          <input
            v-model="config.accessKeyId"
            required
            class="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Key</label>
          <input
            v-model="config.secretAccessKey"
            type="password"
            required
            class="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bucket</label>
          <input
            v-model="config.bucket"
            required
            class="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
          <input
            v-model="config.region"
            placeholder="e.g. us-east-1"
            required
            class="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="config.useSSL" id="useSSL" class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400" />
          <label for="useSSL" class="text-sm text-gray-700 dark:text-gray-300">Use SSL</label>
        </div>
      </div>
      <button type="submit" class="mt-6 w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Connect</button>
    </form>

    <section class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white text-center">Sync Notes With S3</h2>

      <div v-if="s3Status" class="flex flex-col items-center mb-4">
        <span
          :class="
            s3Status.connected
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          "
          class="px-3 py-1 rounded-full text-sm font-medium mb-2"
        >
          {{ s3Status.connected ? "🟢 S3 Connected" : "🔴 S3 Disconnected" }}
        </span>
        <div class="flex gap-4 text-gray-700 dark:text-gray-300 text-sm">
          <div>
            Total Notes: <span class="font-semibold">{{ s3Status.totalNotes || 0 }}</span>
          </div>
          <div v-if="s3Status.oldestEntry">
            Oldest: <span class="font-semibold">{{ new Date(s3Status.oldestEntry).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          @click="fullSync"
          :disabled="syncing || !s3Connected"
          class="w-full py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          🔄 Full Sync (Two-Way)
        </button>
      </div>

      <div v-if="syncing" class="bg-gray-50 dark:bg-gray-900 rounded p-4 mb-4">
        <div class="font-medium text-gray-700 dark:text-gray-200 mb-2 text-center">{{ statusMessage }}</div>
        <progress :value="progress" :max="total" class="w-full h-4 mb-1"></progress>
        <div class="text-xs text-gray-500 text-center">{{ progress }} / {{ total }} notes</div>
      </div>

      <div v-if="syncResult" class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-4 mb-4">
        <div class="text-green-700 dark:text-green-300 font-bold mb-2 text-center">✓ Sync Complete!</div>
        <div class="flex flex-wrap gap-4 justify-center text-green-800 dark:text-green-200 text-sm">
          <div v-if="syncResult.uploaded !== undefined">
            Uploaded: <span class="font-semibold">{{ syncResult.uploaded }}</span>
          </div>
          <div v-if="syncResult.downloaded !== undefined">
            Downloaded: <span class="font-semibold">{{ syncResult.downloaded }}</span>
          </div>
          <div v-if="syncResult.merged !== undefined">
            Merged: <span class="font-semibold">{{ syncResult.merged }}</span>
          </div>
          <div v-if="syncResult.conflicts !== undefined">
            Conflicts resolved: <span class="font-semibold">{{ syncResult.conflicts }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="error"
        class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded p-4 font-medium text-center mb-2"
      >
        ⚠ Error: {{ error }}
      </div>
    </section>
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

// S3 client configuration (user-editable)
const config = reactive({
  endpoint: localStorage.getItem("s3_endpoint") || "http://localhost:9000",
  accessKeyId: localStorage.getItem("s3_accessKeyId") || "",
  secretAccessKey: localStorage.getItem("s3_secretAccessKey") || "",
  bucket: localStorage.getItem("s3_bucket") || "notes",
  region: localStorage.getItem("s3_region") || "us-east-1",
  useSSL: localStorage.getItem("s3_useSSL") === "true" || false,
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
  localStorage.setItem("s3_endpoint", config.endpoint);
  localStorage.setItem("s3_accessKeyId", config.accessKeyId);
  localStorage.setItem("s3_secretAccessKey", config.secretAccessKey);
  localStorage.setItem("s3_bucket", config.bucket);
  localStorage.setItem("s3_region", config.region);
  localStorage.setItem("s3_useSSL", config.useSSL ? "true" : "false");
  s3Client = createS3Client();
  BUCKET_NAME = config.bucket;
  checkS3Status();
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
const s3Status = ref({ connected: false, totalNotes: 0, oldestEntry: null });
const s3Connected = ref(false);

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

// Check S3 connection and bucket status
async function checkS3Status() {
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
    s3Status.value.connected = true;
    s3Connected.value = true;

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
    s3Status.value = { connected: true, totalNotes, oldestEntry };
  } catch (e) {
    console.error("MinIO connection error:", e);
    s3Status.value.connected = false;
    s3Connected.value = false;
    error.value = "Failed to connect to S3";
  }
}


// Two-way sync (prefer latest updatedAt)
async function fullSync() {
  syncing.value = true;
  syncResult.value = null;
  error.value = "";
  progress.value = 0;

  try {
    const localNotes = await getAllNotes();
    const listRes = await s3Client.send(
      new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` })
    );

    const cloudObjects = listRes.Contents || [];
    const cloudNotes = {};

    // Step 1: Load all cloud notes into memory
    for (const obj of cloudObjects) {
      const getObjRes = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: obj.Key })
      );
      const data = await streamToString(getObjRes.Body);
      const note = JSON.parse(data);
      cloudNotes[note.noteID] = note;
    }

    const uploaded = { new: 0, updated: 0 };
    const downloaded = { new: 0, updated: 0 };

    // Step 2: Compare and sync both ways
    for (const localNote of localNotes) {
      const s3Key = `${userID}/${localNote.id}.json`;
      const remoteNote = cloudNotes[localNote.id];
      const localUpdated = new Date(localNote.updatedAt);
      const remoteUpdated = remoteNote ? new Date(remoteNote.updatedAt) : null;

      if (!remoteNote) {
        // New local note → upload to S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: JSON.stringify({
              noteID: localNote.id,
              userID,
              content: localNote.content,
              updatedAt: localNote.updatedAt,
              deletedAt: localNote.deletedAt || null,
              attachments: (localNote.attachments || []).map(att => ({
                ...att,
                data: att.data
                  ? arrayBufferToBase64(att.data)
                  : null,
              })),
            }),
            ContentType: "application/json",
          })
        );
        uploaded.new++;
        continue;
      }

      // Conflict resolution: prefer latest updatedAt
      if (remoteUpdated > localUpdated) {
        // Cloud is newer → replace local note
        await db.notes.delete(localNote.id);
        const attachments = (remoteNote.attachments || []).map(att => ({
          ...att,
          data: att.data ? base64ToArrayBuffer(att.data) : null,
        }));
        await db.notes.add({
          id: remoteNote.noteID,
          content: remoteNote.content,
          updatedAt: remoteNote.updatedAt,
          deletedAt: remoteNote.deletedAt || null,
          attachments,
        });
        downloaded.updated++;
      } else if (localUpdated > remoteUpdated) {
        // Local is newer → overwrite cloud
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: JSON.stringify({
              noteID: localNote.id,
              userID,
              content: localNote.content,
              updatedAt: localNote.updatedAt,
              deletedAt: localNote.deletedAt || null,
              attachments: (localNote.attachments || []).map(att => ({
                ...att,
                data: att.data
                  ? arrayBufferToBase64(att.data)
                  : null,
              })),
            }),
            ContentType: "application/json",
          })
        );
        uploaded.updated++;
      }
    }

    // Step 3: Handle notes that exist only in cloud
    for (const key in cloudNotes) {
      const note = cloudNotes[key];
      const existsLocal = await db.notes.get(note.noteID);
      if (!existsLocal) {
        const attachments = (note.attachments || []).map(att => ({
          ...att,
          data: att.data ? base64ToArrayBuffer(att.data) : null,
        }));
        await db.notes.add({
          id: note.noteID,
          content: note.content,
          updatedAt: note.updatedAt,
          deletedAt: note.deletedAt || null,
          attachments,
        });
        downloaded.new++;
      }
    }

    syncResult.value = { uploaded, downloaded };
    statusMessage.value = "Sync complete!";
    await checkS3Status();
  } catch (e) {
    console.error("Full sync error:", e);
    error.value = e.message || "Failed to complete sync";
  } finally {
    syncing.value = false;
  }
}

// Initialize S3 status on mount
onMounted(() => {
  checkS3Status();
});
</script>
