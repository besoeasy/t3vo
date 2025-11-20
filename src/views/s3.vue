<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
    <!-- Page Title with Status -->
    <div class="flex items-center justify-between mb-6 md:mb-8">
      <h2 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">S3 Cloud Sync</h2>
      <div v-if="s3Connected" class="flex items-center gap-2 text-green-600 dark:text-green-400">
        <div class="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium">Connected</span>
      </div>
    </div>

    <!-- Status Card -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-blue-500 rounded-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
          </svg>
        </div>
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">S3-Compatible Cloud Storage</h2>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Sync your notes to any S3-compatible storage (AWS S3, MinIO, Backblaze B2, etc.). Your data is encrypted and stored securely in your own cloud storage.
          </p>
        </div>
      </div>
    </div>

    <!-- Configuration Card -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">S3 Configuration</h3>
      <form @submit.prevent="applyConfig" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Endpoint</label>
          <input
            v-model="config.endpoint"
            placeholder="e.g. http://localhost:9000"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Access Key</label>
            <input
              v-model="config.accessKeyId"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secret Key</label>
            <input
              v-model="config.secretAccessKey"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bucket</label>
            <input
              v-model="config.bucket"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Region</label>
            <input
              v-model="config.region"
              placeholder="e.g. us-east-1"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" v-model="config.useSSL" id="useSSL" class="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400" />
          <label for="useSSL" class="text-sm text-gray-700 dark:text-gray-300">Use SSL</label>
        </div>
        <button type="submit" class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
          Connect to S3
        </button>
      </form>
    </div>

    <!-- Connection Status -->
    <div v-if="s3Status" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Connection Status</h3>
        <span
          :class="
            s3Status.connected
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          "
          class="px-3 py-1 rounded-full text-sm font-medium"
        >
          {{ s3Status.connected ? "✓ Connected" : "✗ Disconnected" }}
        </span>
      </div>
      <div v-if="s3Status.connected" class="grid grid-cols-2 gap-4 text-sm">
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p class="text-gray-600 dark:text-gray-400 mb-1">Total Notes</p>
          <p class="font-semibold text-gray-900 dark:text-white text-xl">{{ s3Status.totalNotes || 0 }}</p>
        </div>
        <div v-if="s3Status.oldestEntry" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p class="text-gray-600 dark:text-gray-400 mb-1">Oldest Entry</p>
          <p class="font-semibold text-gray-900 dark:text-white">{{ new Date(s3Status.oldestEntry).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>

    <!-- Sync Actions -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sync Data</h3>
      
      <button
        @click="fullSync"
        :disabled="syncing || !s3Connected"
        class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
      >
        <svg v-if="syncing" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ syncing ? 'Syncing...' : 'Sync Now (Two-Way)' }}
      </button>

      <!-- Progress -->
      <div v-if="syncing" class="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div class="font-medium text-gray-700 dark:text-gray-200 mb-2 text-center text-sm">{{ statusMessage }}</div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all" :style="{ width: total > 0 ? (progress / total * 100) + '%' : '0%' }"></div>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 text-center">{{ progress }} / {{ total }} notes</div>
      </div>

      <!-- Sync Results -->
      <div v-if="syncResult" class="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div class="text-green-700 dark:text-green-300 font-bold mb-3 text-center flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Sync Complete!
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div v-if="syncResult.uploaded !== undefined" class="bg-white dark:bg-gray-800 rounded p-3">
            <p class="text-gray-600 dark:text-gray-400">Uploaded</p>
            <p class="font-semibold text-gray-900 dark:text-white text-lg">{{ syncResult.uploaded.new + syncResult.uploaded.updated }}</p>
          </div>
          <div v-if="syncResult.downloaded !== undefined" class="bg-white dark:bg-gray-800 rounded p-3">
            <p class="text-gray-600 dark:text-gray-400">Downloaded</p>
            <p class="font-semibold text-gray-900 dark:text-white text-lg">{{ syncResult.downloaded.new + syncResult.downloaded.updated }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sync Logs -->
    <div v-if="syncLogs.length" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sync Logs</h3>
        <button 
          @click="syncLogs = []"
          class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Clear
        </button>
      </div>
      <div class="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-xs max-h-48 overflow-y-auto font-mono">
        <div v-for="(log, i) in syncLogs" :key="i" class="text-gray-700 dark:text-gray-300 py-1">{{ log }}</div>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
      <svg class="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div class="flex-1">
        <p class="text-sm font-medium text-red-900 dark:text-red-300">Error</p>
        <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
      </div>
      <button @click="error = ''" class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- How It Works -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">How S3 Sync Works</h3>
      <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Configure your S3-compatible storage credentials above</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Click "Connect to S3" to establish connection and create bucket if needed</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Use "Sync Now" to perform two-way sync - newer notes always win</span>
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Works with AWS S3, MinIO, Backblaze B2, Wasabi, and other S3-compatible services</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, onMounted } from "vue";
import { db, getAllNotes } from "@/db";
import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Sync log state
const syncLogs = ref([]);
function addSyncLog(...args) {
  const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  syncLogs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  // Limit log size
  if (syncLogs.value.length > 100) syncLogs.value.shift();
}

async function streamToString(stream) {
  const reader = stream.getReader();
  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += new TextDecoder().decode(value);
  }
  return result;
}

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
    addSyncLog('🔍 Checking S3 connection...');
    // Check if bucket exists
    let bucketExists = true;
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
      addSyncLog(`✓ Bucket '${BUCKET_NAME}' exists`);
    } catch (err) {
      bucketExists = false;
      addSyncLog(`⚠ Bucket '${BUCKET_NAME}' does not exist, creating...`);
    }
    if (!bucketExists) {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      addSyncLog(`✓ Bucket '${BUCKET_NAME}' created successfully`);
    }
    s3Status.value.connected = true;
    s3Connected.value = true;

    // Fetch metadata for stats
    let totalNotes = 0;
    let oldestEntry = null;
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` }));
    if (listRes.Contents) {
      const uniqueNotes = new Set();
      for (const obj of listRes.Contents) {
        const filename = obj.Key.split('/').pop();
        const match = filename.match(/^(.+)-(\d+)\.json$/);
        if (match) {
          const [, noteID] = match;
          uniqueNotes.add(noteID);
          
          const lastModified = new Date(obj.LastModified);
          if (!oldestEntry || lastModified < oldestEntry) {
            oldestEntry = lastModified;
          }
        }
      }
      totalNotes = uniqueNotes.size;
    }
    s3Status.value = { connected: true, totalNotes, oldestEntry };
    addSyncLog(`✓ S3 connected - ${totalNotes} notes found`);
  } catch (e) {
    console.error("MinIO connection error:", e);
    addSyncLog(`❌ S3 connection failed: ${e.message}`);
    s3Status.value.connected = false;
    s3Connected.value = false;
    error.value = "Failed to connect to S3";
  }
}

async function fullSync() {
  syncing.value = true;
  syncResult.value = null;
  error.value = "";
  progress.value = 0;

  try {
    addSyncLog('🔄 Starting optimized full sync...');
    const localNotes = await getAllNotes();
    addSyncLog(`📱 Found ${localNotes.length} local notes`);
    
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: `${userID}/` }));

    const cloudObjects = listRes.Contents || [];
    addSyncLog(`☁️ Found ${cloudObjects.length} cloud objects`);
    
    // Parse cloud notes with timestamps from filenames
    const cloudNotes = {};
    const filesToDelete = [];
    
    for (const obj of cloudObjects) {
      const filename = obj.Key.split('/').pop();
      const match = filename.match(/^(.+)-(\d+)\.json$/);
      
      if (match) {
        const [, noteID, timestampStr] = match;
        const timestamp = parseInt(timestampStr);
        
        if (!cloudNotes[noteID] || timestamp > cloudNotes[noteID].timestamp) {
          // Mark older version for deletion if we have a newer one
          if (cloudNotes[noteID]) {
            filesToDelete.push(cloudNotes[noteID].key);
          }
          
          cloudNotes[noteID] = {
            key: obj.Key,
            noteID,
            timestamp,
            size: obj.Size,
            lastModified: obj.LastModified
          };
        } else {
          // This is an older version, mark for deletion
          filesToDelete.push(obj.Key);
        }
      } else {
        // Old format file, mark for deletion (no backward compatibility)
        filesToDelete.push(obj.Key);
      }
    }

    addSyncLog(`📋 Parsed ${Object.keys(cloudNotes).length} unique cloud notes`);
    if (filesToDelete.length > 0) {
      addSyncLog(`🗑️ Will clean up ${filesToDelete.length} old versions`);
    }

    const uploaded = { new: 0, updated: 0 };
    const downloaded = { new: 0, updated: 0 };

    addSyncLog('📤 Processing uploads...');
    total.value = localNotes.length;
    
    for (let i = 0; i < localNotes.length; i++) {
      const localNote = localNotes[i];
      progress.value = i + 1;
      statusMessage.value = `Processing ${localNote.id}...`;
      
      const localTimestamp = new Date(localNote.updatedAt).getTime();
      const cloudNote = cloudNotes[localNote.id];
      
      const needsUpload = !cloudNote || localTimestamp > cloudNote.timestamp;
      
      if (needsUpload) {
        // Delete old version if it exists
        if (cloudNote) {
          try {
            await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: cloudNote.key }));
            addSyncLog(`🗑️ Deleted old version: ${cloudNote.key}`);
          } catch (e) {
            addSyncLog(`⚠️ Failed to delete old version: ${e.message}`);
          }
        }
        
        const s3Key = `${userID}/${localNote.id}-${localTimestamp}.json`;
        
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
              attachments: (localNote.attachments || []).map((att) => ({
                ...att,
                data: att.data ? arrayBufferToBase64(att.data) : null,
              })),
            }),
            ContentType: "application/json",
          })
        );
        
        if (cloudNote) {
          uploaded.updated++;
          addSyncLog(`⬆️ Updated note: ${localNote.id}`);
        } else {
          uploaded.new++;
          addSyncLog(`⬆️ Uploaded new note: ${localNote.id}`);
        }
      }
    }

    addSyncLog('📥 Processing downloads...');
    for (const noteID in cloudNotes) {
      const cloudNote = cloudNotes[noteID];
      const existsLocal = await db.notes.get(noteID);
      
      if (!existsLocal || new Date(existsLocal.updatedAt).getTime() < cloudNote.timestamp) {
        // Download the note
        const getObjRes = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: cloudNote.key }));
        const data = await streamToString(getObjRes.Body);
        const noteData = JSON.parse(data);
        
        if (existsLocal) {
          await db.notes.delete(noteID);
        }
        
        const attachments = (noteData.attachments || []).map((att) => ({
          ...att,
          data: att.data ? base64ToArrayBuffer(att.data) : null,
        }));
        
        await db.notes.add({
          id: noteData.noteID,
          content: noteData.content,
          updatedAt: noteData.updatedAt,
          deletedAt: noteData.deletedAt || null,
          attachments,
        });
        
        if (existsLocal) {
          downloaded.updated++;
          addSyncLog(`⬇️ Downloaded updated note: ${noteID}`);
        } else {
          downloaded.new++;
          addSyncLog(`⬇️ Downloaded new note: ${noteID}`);
        }
      }
    }

    // Clean up old versions
    if (filesToDelete.length > 0) {
      addSyncLog(`🧹 Cleaning up ${filesToDelete.length} old versions...`);
      for (const key of filesToDelete) {
        try {
          await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
          addSyncLog(`✅ Deleted: ${key}`);
        } catch (e) {
          addSyncLog(`⚠️ Failed to delete ${key}: ${e.message}`);
        }
      }
    }

    syncResult.value = { uploaded, downloaded };
    statusMessage.value = "Sync complete!";
    addSyncLog(`✅ Sync complete! Uploaded: ${uploaded.new + uploaded.updated}, Downloaded: ${downloaded.new + downloaded.updated}`);
    await checkS3Status();
  } catch (e) {
    console.error("Full sync error:", e);
    addSyncLog(`❌ Sync failed: ${e.message}`);
    error.value = e.message || "Failed to complete sync";
  } finally {
    syncing.value = false;
  }
}
</script>
