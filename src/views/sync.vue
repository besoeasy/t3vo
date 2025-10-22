<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              @click="$router.push('/dashboard')"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </button>
            <h1 class="text-2xl font-semibold text-gray-900">Device Sync</h1>
          </div>
          <div v-if="isConnected" class="flex items-center gap-2 text-green-600">
            <div class="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium">Connected</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- Status Card -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="p-3 bg-blue-500 rounded-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">Peer-to-Peer Sync</h2>
            <p class="text-sm text-gray-600">
              Sync your notes directly between devices using WebRTC. No cloud storage needed - data goes directly from device to device.
            </p>
          </div>
        </div>
      </div>

      <!-- Connection Status -->
      <div v-if="!isConnected" class="space-y-6">
        <!-- My Device Info -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">This Device</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Your Device ID</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  :value="myPeerId"
                  readonly
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  @click="copyPeerId"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Share this ID with your other device</p>
            </div>

            <!-- QR Code -->
            <div v-if="qrCodeDataUrl" class="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <p class="text-sm font-medium text-gray-700">Scan with other device</p>
              <img :src="qrCodeDataUrl" alt="QR Code" class="w-48 h-48 border-4 border-white shadow-lg rounded-lg" />
            </div>
          </div>
        </div>

        <!-- Connect to Another Device -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Connect to Another Device</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Enter Device ID</label>
              <input
                v-model="remotePeerId"
                type="text"
                placeholder="Paste the other device's ID here"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                @keyup.enter="connectToPeer"
              />
            </div>
            <button
              @click="connectToPeer"
              :disabled="!remotePeerId || connecting"
              class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {{ connecting ? 'Connecting...' : 'Connect' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Connected View -->
      <div v-else class="space-y-6">
        <!-- Connected Device Info -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-green-500 rounded-lg">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Connected to</p>
                <p class="text-xs text-gray-600 font-mono">{{ connectedPeerId }}</p>
              </div>
            </div>
            <button
              @click="disconnect"
              class="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        <!-- Sync Actions -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Sync Data</h3>
          <div class="space-y-4">
            <button
              @click="performSync"
              :disabled="syncing"
              class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <svg v-if="syncing" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ syncing ? 'Syncing...' : 'Sync Now' }}
            </button>

            <!-- Sync Stats -->
            <div v-if="lastSyncStats" class="bg-gray-50 rounded-lg p-4 space-y-2">
              <p class="text-sm font-medium text-gray-900">Last Sync Results</p>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-600">Sent</p>
                  <p class="font-semibold text-gray-900">{{ lastSyncStats.sent }} notes</p>
                </div>
                <div>
                  <p class="text-gray-600">Received</p>
                  <p class="font-semibold text-gray-900">{{ lastSyncStats.received }} notes</p>
                </div>
                <div>
                  <p class="text-gray-600">Updated</p>
                  <p class="font-semibold text-gray-900">{{ lastSyncStats.updated }} notes</p>
                </div>
                <div>
                  <p class="text-gray-600">Conflicts</p>
                  <p class="font-semibold text-gray-900">{{ lastSyncStats.conflicts }} resolved</p>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">{{ new Date(lastSyncStats.timestamp).toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- How It Works -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">How Sync Works</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>All notes (including deleted) are exchanged between devices</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Conflicts are resolved automatically using timestamps (newest wins)</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Data is encrypted and transferred directly between devices</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>No cloud server stores your data - it's purely peer-to-peer</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-900">Error</p>
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
        <button @click="errorMessage = ''" class="text-red-500 hover:text-red-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Peer from 'peerjs';
import QRCode from 'qrcode';
import { getAllNotes, mergeSyncData } from '@/db';

const myPeerId = ref('');
const remotePeerId = ref('');
const qrCodeDataUrl = ref('');
const isConnected = ref(false);
const connecting = ref(false);
const syncing = ref(false);
const connectedPeerId = ref('');
const errorMessage = ref('');
const lastSyncStats = ref(null);

let peer = null;
let connection = null;

onMounted(() => {
  initializePeer();
});

onBeforeUnmount(() => {
  cleanup();
});

function initializePeer() {
  try {
    // Create a peer with a random ID
    peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peer.on('open', (id) => {
      myPeerId.value = id;
      generateQRCode(id);
    });

    peer.on('connection', (conn) => {
      handleIncomingConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      errorMessage.value = `Connection error: ${err.type}`;
      connecting.value = false;
    });

  } catch (err) {
    console.error('Failed to initialize peer:', err);
    errorMessage.value = 'Failed to initialize P2P connection. Please refresh the page.';
  }
}

async function generateQRCode(peerId) {
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(peerId, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
  }
}

function connectToPeer() {
  if (!remotePeerId.value || connecting.value) return;

  connecting.value = true;
  errorMessage.value = '';

  try {
    connection = peer.connect(remotePeerId.value, {
      reliable: true
    });

    connection.on('open', () => {
      isConnected.value = true;
      connectedPeerId.value = remotePeerId.value;
      connecting.value = false;
      setupConnectionHandlers(connection);
    });

    connection.on('error', (err) => {
      console.error('Connection error:', err);
      errorMessage.value = 'Failed to connect. Please check the Device ID and try again.';
      connecting.value = false;
      isConnected.value = false;
    });

  } catch (err) {
    console.error('Failed to connect:', err);
    errorMessage.value = 'Failed to establish connection.';
    connecting.value = false;
  }
}

function handleIncomingConnection(conn) {
  connection = conn;
  connectedPeerId.value = conn.peer;
  isConnected.value = true;
  setupConnectionHandlers(conn);
}

function setupConnectionHandlers(conn) {
  conn.on('data', async (data) => {
    if (data.type === 'sync_request') {
      // Other device is requesting our data
      const notes = await getAllNotes();
      conn.send({
        type: 'sync_response',
        notes: notes
      });
    } else if (data.type === 'sync_response') {
      // Received data from other device
      await handleSyncResponse(data.notes);
    }
  });

  conn.on('close', () => {
    isConnected.value = false;
    connectedPeerId.value = '';
    connection = null;
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    errorMessage.value = 'Connection lost.';
    isConnected.value = false;
  });
}

async function performSync() {
  if (!connection || syncing.value) return;

  syncing.value = true;
  errorMessage.value = '';

  try {
    // Get all our notes (including deleted)
    const myNotes = await getAllNotes();

    // Send sync request and our notes
    connection.send({
      type: 'sync_request',
      notes: myNotes
    });

    // Wait for response (handled in setupConnectionHandlers)
    // The actual merge happens in handleSyncResponse

  } catch (err) {
    console.error('Sync error:', err);
    errorMessage.value = 'Failed to sync data.';
    syncing.value = false;
  }
}

async function handleSyncResponse(remoteNotes) {
  try {
    const myNotes = await getAllNotes();
    
    // Merge the data
    const stats = await mergeSyncData(myNotes, remoteNotes);
    
    lastSyncStats.value = {
      ...stats,
      timestamp: Date.now()
    };

    // Send our notes back if this was a sync_request
    if (connection && connection.open) {
      connection.send({
        type: 'sync_response',
        notes: myNotes
      });
    }

    syncing.value = false;
  } catch (err) {
    console.error('Failed to handle sync response:', err);
    errorMessage.value = 'Failed to merge data.';
    syncing.value = false;
  }
}

function disconnect() {
  if (connection) {
    connection.close();
  }
  isConnected.value = false;
  connectedPeerId.value = '';
  connection = null;
}

function cleanup() {
  if (connection) {
    connection.close();
  }
  if (peer) {
    peer.destroy();
  }
}

async function copyPeerId() {
  try {
    await navigator.clipboard.writeText(myPeerId.value);
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}
</script>
