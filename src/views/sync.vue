<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
    <!-- Page Title with Status -->
    <div class="flex items-center justify-between mb-6 md:mb-8">
      <h2 class="text-3xl md:text-5xl font-bold text-gray-900">Device Sync</h2>
      <div v-if="isConnected" class="flex items-center gap-2 text-green-600">
        <div class="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
        <span class="text-sm font-medium">Connected</span>
      </div>
    </div>
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
      <div v-if="!isConnected && !connecting" class="space-y-6">
        <!-- Create or Join Room -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Join or Create a Room</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
              <input
                v-model="roomCode"
                type="text"
                placeholder="Enter room code (e.g., myroom, test123)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                @keyup.enter="joinRoom()"
                :disabled="connecting"
              />
              <p class="text-xs text-gray-500 mt-1">Enter any name you want - if the room exists, you'll join it. If not, you'll create it!</p>
            </div>
            
            <button
              @click="joinRoom()"
              :disabled="!roomCode || connecting"
              class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {{ connecting ? 'Joining...' : 'Join Room' }}
            </button>
          </div>
        </div>

        <!-- How It Works - When Not Connected -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">How Room Sync Works</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong>Device 1:</strong> Enter a room code (e.g., "myroom") and click "Join Room"</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span><strong>Device 2:</strong> Enter the same room code and click "Join Room"</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>First device becomes <strong>host</strong>, second becomes <strong>guest</strong> - it's automatic!</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Once connected, click "Sync Now" to exchange notes</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Connecting State -->
            <!-- Connecting View -->
      <div v-else-if="connecting && !isConnected && !roomReady" class="space-y-6">
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div class="flex items-center gap-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-1">
                {{ isHost ? 'Setting up room...' : 'Connecting to room...' }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ isHost ? 'Your room is being created. Other devices can join soon.' : 'Looking for the host and establishing connection. This may take a few seconds...' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <p class="text-sm text-gray-600 mb-2">Room Code: <span class="font-mono font-semibold">{{ roomCode }}</span></p>
          <button
            @click="disconnect"
            class="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Room Ready - Host waiting for others -->
      <div v-else-if="roomReady && !isConnected" class="space-y-6">
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <div class="p-3 bg-blue-500 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">HOST</span>
                <h3 class="text-lg font-semibold text-gray-900">Room Created Successfully!</h3>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                Your room is ready and waiting for others to join. Share the room code or QR code below.
              </p>
              
              <!-- Room Code Display -->
              <div class="bg-white rounded-lg p-4 border border-blue-200 mb-4">
                <p class="text-xs text-gray-500 mb-1">Room Code</p>
                <p class="text-2xl font-mono font-bold text-gray-900">{{ roomCode }}</p>
              </div>

              <!-- QR Code -->
              <div v-if="qrCodeDataUrl" class="bg-white rounded-lg p-4 border border-blue-200">
                <p class="text-xs text-gray-500 mb-2">Scan to Join</p>
                <img :src="qrCodeDataUrl" alt="Room QR Code" class="w-48 h-48 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
            <p class="text-sm font-medium text-gray-700">Waiting for devices to join...</p>
          </div>
          <button
            @click="disconnect"
            class="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>

      <!-- Connected View -->
      <div v-else-if="isConnected" class="space-y-6">
        <!-- Room Info -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-green-500 rounded-lg">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-700">Connected to Room</p>
                  <div class="flex items-center gap-2">
                    <p class="text-lg font-bold text-gray-900">{{ roomCode }}</p>
                    <span v-if="isHost" class="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">HOST</span>
                    <span v-else class="px-2 py-0.5 bg-purple-500 text-white text-xs font-semibold rounded">GUEST</span>
                  </div>
                </div>
              </div>
              
              <!-- QR Code for room sharing -->
              <div v-if="qrCodeDataUrl && isHost" class="mt-4 flex items-start gap-4">
                <div class="flex-1">
                  <p class="text-sm text-gray-600 mb-2">Share this QR code or room code with other devices:</p>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      :value="roomCode"
                      readonly
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono text-sm"
                    />
                    <button
                      @click="copyRoomCode"
                      class="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <img :src="qrCodeDataUrl" alt="Room QR Code" class="w-24 h-24 border-2 border-white shadow rounded-lg" />
              </div>
            </div>
            
            <button
              @click="disconnect"
              class="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>

        <!-- Connected Peers -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Connected Devices ({{ connections.size + 1 }})
          </h3>
          <div class="space-y-2">
            <!-- This Device -->
            <div class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">This Device</p>
                <p class="text-xs text-gray-600 font-mono">{{ myPeerId }}</p>
              </div>
              <span v-if="isHost" class="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">HOST</span>
              <span v-else class="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded">GUEST</span>
            </div>

            <!-- Connected Peers -->
            <div
              v-for="peerId in connectedPeers"
              :key="peerId"
              class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Remote Device</p>
                <p class="text-xs text-gray-600 font-mono">{{ peerId }}</p>
              </div>
              <span v-if="peerId.includes('-t3vo-' + roomCode) && !peerId.includes('-' + roomCode + '-')" class="px-2 py-1 bg-blue-400 text-white text-xs font-semibold rounded">HOST</span>
              <span v-else class="px-2 py-1 bg-purple-400 text-white text-xs font-semibold rounded">GUEST</span>
            </div>

            <p v-if="connections.size === 0" class="text-sm text-gray-500 text-center py-4">
              Waiting for other devices to join...
            </p>
          </div>
        </div>

        <!-- Sync Actions -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Sync Data</h3>
          <div class="space-y-4">
            <button
              @click="performSync"
              :disabled="syncing || connections.size === 0"
              class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <svg v-if="syncing" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ syncing ? 'Syncing...' : `Sync with ${connections.size} device${connections.size !== 1 ? 's' : ''}` }}
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
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>All notes (including deleted) are exchanged between all connected devices</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Conflicts are resolved automatically using timestamps (newest wins)</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Mesh network: All devices connect directly to each other</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>No cloud server stores your data - it's purely peer-to-peer via WebRTC</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import Peer from 'peerjs';
import QRCode from 'qrcode';
import { getAllNotes, mergeSyncData } from '@/db';

// Room-based state
const roomCode = ref('');
const myPeerId = ref('');
const isHost = ref(false);
const qrCodeDataUrl = ref('');
const isConnected = ref(false);
const connecting = ref(false);
const roomReady = ref(false); // Indicates host has created room and is waiting for others
const syncing = ref(false);
const errorMessage = ref('');
const lastSyncStats = ref(null);

// Multiple peer connections
const connections = ref(new Map()); // Map of peerId -> connection object
const connectedPeers = computed(() => Array.from(connections.value.keys()));

let peer = null;

onMounted(() => {
  // Don't auto-initialize peer - wait for user to join/create room
});

onBeforeUnmount(() => {
  cleanup();
});

async function joinRoom(code = null) {
  if (!code && !roomCode.value) {
    errorMessage.value = 'Please enter a room code';
    return;
  }

  const targetRoomCode = code || roomCode.value;
  roomCode.value = targetRoomCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (roomCode.value.length < 2) {
    errorMessage.value = 'Room code must be at least 2 characters';
    return;
  }

  connecting.value = true;
  errorMessage.value = '';

  try {
    // Try to become host first - if room exists, we'll become guest automatically
    const hostId = `t3vo-${roomCode.value}`;
    await initializePeer(hostId, true);
  } catch (err) {
    console.error('Failed to join room:', err);
    errorMessage.value = 'Failed to join room. Please try again.';
    connecting.value = false;
  }
}

function initializePeer(peerId, tryHost = false) {
  return new Promise((resolve, reject) => {
    try {
      // Clean up any existing peer first
      if (peer) {
        peer.destroy();
        peer = null;
      }

      // Create peer with specific ID or let PeerJS assign one
      const peerConfig = {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      };

      // IMPORTANT: Set the ID in the constructor, not in config
      if (peerId) {
        peer = new Peer(peerId, peerConfig);
      } else {
        peer = new Peer(peerConfig);
      }

      peer.on('open', (id) => {
        myPeerId.value = id;
        
        // Check if we became the host
        if (tryHost && id === `t3vo-${roomCode.value}`) {
          isHost.value = true;
          console.log('🎯 Became HOST with ID:', id);
          connecting.value = false;
          roomReady.value = true; // Room is created and ready for others to join
          resolve(id);
        } else if (!tryHost && id.startsWith(`t3vo-${roomCode.value}-`)) {
          isHost.value = false;
          console.log('👤 Became GUEST with ID:', id);
          // If we're a guest, connect to the host AFTER we're fully ready
          connecting.value = false;
          resolve(id);
          // Connect after a delay to ensure peer is fully initialized
          setTimeout(() => {
            connectToHost();
          }, 1000);
        } else {
          console.error('Unexpected peer ID format:', id);
          errorMessage.value = 'Failed to join room with correct ID format';
          connecting.value = false;
          reject(new Error('Invalid peer ID'));
        }

        generateQRCode(roomCode.value);
      });

      peer.on('connection', (conn) => {
        handleIncomingConnection(conn);
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        
        if (err.type === 'unavailable-id' && tryHost) {
          // Host ID is taken, become a guest (this is expected behavior)
          console.log('Host ID taken, becoming guest...');
          
          // Create guest ID with timestamp
          const guestId = `t3vo-${roomCode.value}-${Date.now()}`;
          console.log('Creating guest with ID:', guestId);
          initializePeer(guestId, false).then(resolve).catch(reject);
        } else if (err.type === 'peer-unavailable') {
          // Peer not found yet - this is common for guests trying to connect
          console.log('Peer not available yet, will retry...');
          // Don't show error - retry will happen automatically
        } else if (err.type === 'network' || err.type === 'server-error') {
          errorMessage.value = 'Network error. Please check your connection.';
          connecting.value = false;
          reject(err);
        } else {
          // Only show errors that matter to users
          if (!tryHost && err.type !== 'peer-unavailable') {
            errorMessage.value = `Connection error: ${err.type}`;
            connecting.value = false;
            reject(err);
          }
        }
      });

    } catch (err) {
      console.error('Failed to initialize peer:', err);
      errorMessage.value = 'Failed to initialize P2P connection. Please refresh the page.';
      reject(err);
    }
  });
}

function connectToHost() {
  const hostId = `t3vo-${roomCode.value}`;
  console.log('🔌 Guest connecting to host:', hostId);
  
  // Connect immediately since we already waited in initializePeer
  connectToPeer(hostId);
}

function connectToPeer(targetPeerId, retryCount = 0) {
  if (!peer || !targetPeerId) return;

  // Don't connect to ourselves
  if (targetPeerId === myPeerId.value) return;

  // Don't connect if already connected
  if (connections.value.has(targetPeerId)) {
    console.log('Already connected to', targetPeerId);
    return;
  }

  try {
    console.log('🔗 Connecting to peer:', targetPeerId, `(attempt ${retryCount + 1})`);
    const conn = peer.connect(targetPeerId, {
      reliable: true
    });

    let connectionTimeout;

    conn.on('open', () => {
      console.log('✅ Connected to:', targetPeerId);
      clearTimeout(connectionTimeout);
      connections.value.set(targetPeerId, conn);
      isConnected.value = true;
      setupConnectionHandlers(conn);

      // If we're the host, broadcast the peer list to all peers
      if (isHost.value) {
        broadcastPeerList();
      }
    });

    conn.on('error', (err) => {
      console.error('Connection error with', targetPeerId, err);
      clearTimeout(connectionTimeout);
      connections.value.delete(targetPeerId);
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const retryDelay = 2000 * (retryCount + 1); // 2s, 4s, 6s
        console.log(`Will retry in ${retryDelay}ms...`);
        setTimeout(() => {
          connectToPeer(targetPeerId, retryCount + 1);
        }, retryDelay);
      } else {
        console.error('Failed to connect after 3 retries');
        errorMessage.value = `Could not connect to ${isHost.value ? 'guest' : 'host'}. They may have left the room.`;
      }
      
      if (connections.value.size === 0) {
        isConnected.value = false;
      }
    });

    // Set a timeout for connection attempt (10 seconds)
    connectionTimeout = setTimeout(() => {
      if (!connections.value.has(targetPeerId)) {
        console.log('Connection timeout for', targetPeerId);
        conn.close();
        
        // Retry up to 3 times
        if (retryCount < 3) {
          const retryDelay = 2000 * (retryCount + 1);
          console.log(`Will retry in ${retryDelay}ms...`);
          setTimeout(() => {
            connectToPeer(targetPeerId, retryCount + 1);
          }, retryDelay);
        } else {
          console.error('Failed to connect after 3 retries');
          errorMessage.value = `Could not connect to ${isHost.value ? 'guest' : 'host'}. They may have left the room.`;
        }
      }
    }, 10000);

  } catch (err) {
    console.error('Failed to connect to peer:', err);
    
    // Retry logic
    if (retryCount < 3) {
      const retryDelay = 2000 * (retryCount + 1);
      console.log(`Will retry in ${retryDelay}ms...`);
      setTimeout(() => {
        connectToPeer(targetPeerId, retryCount + 1);
      }, retryDelay);
    }
  }
}


function broadcastPeerList() {
  if (!isHost.value) return;

  const peerList = [myPeerId.value, ...connectedPeers.value];
  console.log('📢 Host broadcasting peer list:', peerList);

  // Send peer list to all connected peers
  connections.value.forEach((conn, peerId) => {
    if (conn.open) {
      conn.send({
        type: 'peer_list',
        peers: peerList.filter(p => p !== peerId) // Don't send peer its own ID
      });
    }
  });
}

function handleIncomingConnection(conn) {
  console.log('📨 Incoming connection from:', conn.peer);
  connections.value.set(conn.peer, conn);
  isConnected.value = true;
  setupConnectionHandlers(conn);

  // If we're the host, broadcast updated peer list
  if (isHost.value) {
    broadcastPeerList();
  }
}

function setupConnectionHandlers(conn) {
  conn.on('data', async (data) => {
    if (data.type === 'peer_list') {
      // Received list of peers from host - connect to them
      console.log('📋 Received peer list:', data.peers);
      for (const peerId of data.peers) {
        if (peerId !== myPeerId.value && !connections.value.has(peerId)) {
          connectToPeer(peerId);
        }
      }
    } else if (data.type === 'sync_request') {
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
    console.log('❌ Connection closed:', conn.peer);
    connections.value.delete(conn.peer);
    if (connections.value.size === 0) {
      isConnected.value = false;
    }
    
    // If we're the host, broadcast updated peer list
    if (isHost.value && connections.value.size > 0) {
      broadcastPeerList();
    }
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    connections.value.delete(conn.peer);
    if (connections.value.size === 0) {
      isConnected.value = false;
    }
  });
}

async function performSync() {
  if (connections.value.size === 0 || syncing.value) return;

  syncing.value = true;
  errorMessage.value = '';

  try {
    // Get all our notes (including deleted)
    const myNotes = await getAllNotes();

    // Send sync request to all connected peers
    connections.value.forEach((conn, peerId) => {
      if (conn.open) {
        console.log('🔄 Syncing with:', peerId);
        conn.send({
          type: 'sync_request',
          notes: myNotes
        });
      }
    });

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

    syncing.value = false;
  } catch (err) {
    console.error('Failed to handle sync response:', err);
    errorMessage.value = 'Failed to merge data.';
    syncing.value = false;
  }
}

function disconnect() {
  connections.value.forEach((conn) => {
    if (conn) {
      conn.close();
    }
  });
  connections.value.clear();
  isConnected.value = false;
  roomReady.value = false;
  
  if (peer) {
    peer.destroy();
    peer = null;
  }
  
  roomCode.value = '';
  myPeerId.value = '';
  isHost.value = false;
}

function cleanup() {
  disconnect();
}

async function generateQRCode(code) {
  try {
    // Generate QR code with room code (not peer ID)
    const qrData = code;
    qrCodeDataUrl.value = await QRCode.toDataURL(qrData, {
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

async function copyRoomCode() {
  try {
    await navigator.clipboard.writeText(roomCode.value);
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

</script>
