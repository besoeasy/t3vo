<template>
  <!-- Loading State -->
  <div v-if="!isLoaded" class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>

  <!-- Note Not Found -->
  <div v-else-if="!note" class="flex flex-col items-center justify-center h-full p-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Note not found</h2>
      <p class="text-gray-600 mb-6">This note doesn't exist or has been deleted.</p>
      <router-link to="/dashboard" class="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
        Back to Dashboard
      </router-link>
    </div>
  </div>

  <!-- Note View -->
  <div v-else class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
      <div class="flex items-center gap-3 mb-3">
        <router-link to="/dashboard" class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" title="Back to Dashboard">
          <ArrowLeft class="w-5 h-5" />
        </router-link>
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span v-if="parsed?.icon" class="text-2xl flex-shrink-0">{{ parsed.icon }}</span>
          <span v-if="parsed?.type && parsed.type !== 'note'" class="px-2 py-1 text-xs font-medium rounded-full flex-shrink-0" :class="typeClass">
            {{ parsed.type }}
          </span>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <router-link
            :to="`/notes/${noteId}/edit`"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Edit class="w-4 h-4" />
            <span class="hidden md:inline">Edit</span>
          </router-link>
          <button @click="handleDelete" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Note">
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Title and Metadata -->
      <div class="ml-14">
        <h1 v-if="parsed?.title" class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {{ parsed.title }}
        </h1>
        <h1 v-else class="text-3xl md:text-4xl font-bold text-gray-400 mb-2 italic">Untitled Note</h1>
        <div class="flex items-center gap-3 text-sm text-gray-500">
          <span>{{ formatDate(note.updatedAt) }}</span>
          <span v-if="parsed?.customTags.length" class="flex gap-2">
            <span v-for="tag in parsed.customTags" :key="tag" class="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"> #{{ tag }} </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto bg-gray-50">
      <div class="max-w-4xl mx-auto p-6 md:p-12">
        <!-- Password/Credentials View -->
        <div v-if="parsed?.type === 'password'" class="space-y-4">
          <!-- Email -->
          <div v-if="parsed.tags.email" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-2">Email</div>
            <div class="text-lg text-gray-900 font-mono select-all">
              {{ parsed.tags.email }}
            </div>
          </div>

          <!-- Username -->
          <div v-if="parsed.tags.username" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-2">Username</div>
            <div class="text-lg text-gray-900 font-mono select-all">
              {{ parsed.tags.username }}
            </div>
          </div>

          <!-- Password -->
          <div v-if="parsed.tags.password" class="p-6 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
            <div class="text-sm font-semibold text-blue-700 mb-2">Password</div>
            <div class="flex items-center justify-between gap-4">
              <div class="text-lg text-blue-900 font-mono font-bold select-all flex-1 break-all">
                {{ showPassword ? parsed.tags.password : "••••••••••••" }}
              </div>
              <button
                @click="showPassword = !showPassword"
                class="px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
              >
                {{ showPassword ? "Hide" : "Show" }}
              </button>
            </div>
          </div>

          <!-- 2FA/TOTP -->
          <div v-if="parsed.tags['2fa'] || parsed.tags.totp" class="p-6 bg-green-50 rounded-xl border border-green-200 shadow-sm">
            <div class="text-sm font-semibold text-green-700 mb-3">2FA Code</div>
            <div v-if="totpCode && totpCode !== 'Invalid Secret'">
              <div class="text-5xl font-bold text-green-900 tracking-wider mb-3 font-mono">{{ totpCode.slice(0, 3) }} {{ totpCode.slice(3, 6) }}</div>
              <div class="flex items-center justify-between">
                <div class="text-xs text-green-600">Refreshes in {{ totpTimeRemaining }}s</div>
                <div class="w-24 h-1.5 bg-green-200 rounded-full overflow-hidden">
                  <div class="h-full bg-green-600 transition-all duration-1000" :style="{ width: `${(totpTimeRemaining / 30) * 100}%` }"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-red-600 text-sm">Invalid 2FA secret</div>
          </div>

          <!-- URL/Website -->
          <div v-if="parsed.tags.url" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-2">Website</div>
            <a :href="parsed.tags.url" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-all">
              {{ parsed.tags.url }}
            </a>
          </div>

          <!-- Domains -->
          <div v-if="parsed.tags.domains" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-2">Associated Domains</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="domain in parsed.tags.domains.split(',').map((d) => d.trim())"
                :key="domain"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {{ domain }}
              </span>
            </div>
          </div>

          <!-- Additional notes/content for password entries -->
          <div v-if="parsed.content" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-3">Notes</div>
            <div class="prose prose-sm max-w-none" v-html="renderedMarkdown"></div>
          </div>

          <!-- Attachments -->
          <div v-if="note.attachments && note.attachments.length > 0" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-3">Attachments ({{ note.attachments.length }})</div>
            <div class="space-y-2">
              <div
                v-for="attachment in note.attachments"
                :key="attachment.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="flex-shrink-0">
                    <svg v-if="attachment.type.startsWith('image/')" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <svg v-else class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                </div>
                <button
                  @click="downloadAttachment(attachment)"
                  class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <!-- References -->
          <div v-if="parsed?.references && parsed.references.length > 0" class="p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
            <div class="text-sm font-semibold text-purple-700 mb-3">References ({{ parsed.references.length }})</div>
            <div class="space-y-2">
              <a
                v-for="(ref, index) in parsed.references"
                :key="index"
                :href="ref.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
              >
                <div class="flex-shrink-0 mr-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getPlatformColorClass(ref.type)">
                    <component :is="getPlatformIcon(ref.type)" class="w-5 h-5" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-gray-900">{{ ref.platform }}</span>
                    <ExternalLink class="w-3 h-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <p class="text-xs text-gray-600 truncate">{{ ref.url }}</p>
                  <p v-if="ref.subreddit" class="text-xs text-gray-500 mt-1">r/{{ ref.subreddit }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Bookmark View -->
        <div v-else-if="parsed?.type === 'bookmark'" class="space-y-4">
          <!-- Main Bookmark Card -->
          <div class="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-lg">
            <a :href="parsed.tags.url || parsed.tags.bookmark" target="_blank" rel="noopener noreferrer" class="group block">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <ExternalLink class="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {{ parsed.title || "Bookmark" }}
                  </h3>
                  <p class="text-lg text-purple-600 break-all group-hover:underline font-medium">
                    {{ parsed.tags.url || parsed.tags.bookmark }}
                  </p>
                </div>
              </div>
            </a>
          </div>

          <!-- Description/Notes -->
          <div v-if="parsed.content" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-3">Description</div>
            <div class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
          </div>

          <!-- Attachments -->
          <div v-if="note.attachments && note.attachments.length > 0" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-3">Attachments ({{ note.attachments.length }})</div>
            <div class="space-y-2">
              <div
                v-for="attachment in note.attachments"
                :key="attachment.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="flex-shrink-0">
                    <svg v-if="attachment.type.startsWith('image/')" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <svg v-else class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                </div>
                <button
                  @click="downloadAttachment(attachment)"
                  class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <!-- References -->
          <div v-if="parsed?.references && parsed.references.length > 0" class="p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
            <div class="text-sm font-semibold text-purple-700 mb-3">Related Links ({{ parsed.references.length }})</div>
            <div class="space-y-2">
              <a
                v-for="(ref, index) in parsed.references"
                :key="index"
                :href="ref.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
              >
                <div class="flex-shrink-0 mr-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getPlatformColorClass(ref.type)">
                    <component :is="getPlatformIcon(ref.type)" class="w-5 h-5" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-gray-900">{{ ref.platform }}</span>
                    <ExternalLink class="w-3 h-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <p class="text-xs text-gray-600 truncate">{{ ref.url }}</p>
                  <p v-if="ref.subreddit" class="text-xs text-gray-500 mt-1">r/{{ ref.subreddit }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Crypto View -->
        <div v-else-if="parsed?.type === 'crypto'">
          <!-- Crypto Cards -->
          <div v-if="cryptoData.length > 0" class="space-y-4">
            <div
              v-for="crypto in cryptoData"
              :key="crypto.id"
              class="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div v-if="crypto.error" class="p-6">
                <div class="text-center text-red-600">
                  <p class="font-semibold">Failed to load {{ crypto.id }}</p>
                  <p class="text-sm">{{ crypto.message }}</p>
                </div>
              </div>
              
              <div v-else>
                <!-- Header with logo and name -->
                <div class="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 border-b border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <img v-if="crypto.image" :src="crypto.image" :alt="crypto.name" class="w-16 h-16 rounded-full shadow-md" />
                      <div>
                        <h3 class="text-2xl font-bold text-gray-900">{{ crypto.name }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-lg text-gray-600 font-mono">{{ crypto.symbol }}</span>
                          <span v-if="crypto.market_cap_rank" class="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                            #{{ crypto.market_cap_rank }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-3xl font-bold text-gray-900">{{ formatCryptoPrice(crypto.current_price) }}</div>
                      <div v-if="crypto.price_change_24h !== null && crypto.price_change_24h !== undefined" class="flex items-center justify-end gap-1 mt-1">
                        <span :class="getPriceChangeColor(crypto.price_change_24h)" class="text-sm font-semibold">
                          {{ crypto.price_change_24h >= 0 ? '▲' : '▼' }}
                          {{ Math.abs(crypto.price_change_24h).toFixed(2) }}%
                        </span>
                        <span class="text-xs text-gray-500">24h</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Price Changes Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
                  <div v-if="crypto.price_change_24h !== null && crypto.price_change_24h !== undefined" class="text-center p-3 rounded-lg" :class="getPriceChangeBgColor(crypto.price_change_24h)">
                    <div class="text-xs text-gray-600 font-medium mb-1">24 Hours</div>
                    <div :class="getPriceChangeColor(crypto.price_change_24h)" class="text-lg font-bold">
                      {{ crypto.price_change_24h >= 0 ? '+' : '' }}{{ crypto.price_change_24h.toFixed(2) }}%
                    </div>
                  </div>
                  
                  <div v-if="crypto.price_change_7d !== null && crypto.price_change_7d !== undefined" class="text-center p-3 rounded-lg" :class="getPriceChangeBgColor(crypto.price_change_7d)">
                    <div class="text-xs text-gray-600 font-medium mb-1">7 Days</div>
                    <div :class="getPriceChangeColor(crypto.price_change_7d)" class="text-lg font-bold">
                      {{ crypto.price_change_7d >= 0 ? '+' : '' }}{{ crypto.price_change_7d.toFixed(2) }}%
                    </div>
                  </div>
                  
                  <div v-if="crypto.price_change_30d !== null && crypto.price_change_30d !== undefined" class="text-center p-3 rounded-lg" :class="getPriceChangeBgColor(crypto.price_change_30d)">
                    <div class="text-xs text-gray-600 font-medium mb-1">30 Days</div>
                    <div :class="getPriceChangeColor(crypto.price_change_30d)" class="text-lg font-bold">
                      {{ crypto.price_change_30d >= 0 ? '+' : '' }}{{ crypto.price_change_30d.toFixed(2) }}%
                    </div>
                  </div>
                  
                  <div v-if="crypto.price_change_1y !== null && crypto.price_change_1y !== undefined" class="text-center p-3 rounded-lg" :class="getPriceChangeBgColor(crypto.price_change_1y)">
                    <div class="text-xs text-gray-600 font-medium mb-1">1 Year</div>
                    <div :class="getPriceChangeColor(crypto.price_change_1y)" class="text-lg font-bold">
                      {{ crypto.price_change_1y >= 0 ? '+' : '' }}{{ crypto.price_change_1y.toFixed(2) }}%
                    </div>
                  </div>
                </div>

                <!-- Market Stats -->
                <div class="p-6 border-t border-gray-200 space-y-3">
                  <div v-if="crypto.market_cap" class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 font-medium">Market Cap</span>
                    <span class="text-sm font-bold text-gray-900">{{ formatLargeNumber(crypto.market_cap) }}</span>
                  </div>
                  
                  <div v-if="crypto.total_volume" class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 font-medium">24h Volume</span>
                    <span class="text-sm font-bold text-gray-900">{{ formatLargeNumber(crypto.total_volume) }}</span>
                  </div>
                  
                  <div v-if="crypto.high_24h && crypto.low_24h" class="flex items-center justify-between">
                    <span class="text-sm text-gray-600 font-medium">24h Range</span>
                    <span class="text-sm font-bold text-gray-900">
                      {{ formatCryptoPrice(crypto.low_24h) }} - {{ formatCryptoPrice(crypto.high_24h) }}
                    </span>
                  </div>

                  <div v-if="crypto.website" class="pt-3 border-t border-gray-200">
                    <a :href="crypto.website" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      <ExternalLink class="w-4 h-4" />
                      Official Website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="isLoadingCrypto" class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Loading crypto data...</p>
            </div>
          </div>

          <!-- Notes/Content -->
          <div v-if="parsed.content" class="mt-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-3">Notes</div>
            <div class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
          </div>

          <!-- Attachments -->
          <div v-if="note.attachments && note.attachments.length > 0" class="mt-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-3">Attachments ({{ note.attachments.length }})</div>
            <div class="space-y-2">
              <div
                v-for="attachment in note.attachments"
                :key="attachment.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="flex-shrink-0">
                    <svg v-if="attachment.type.startsWith('image/')" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <svg v-else class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                </div>
                <button
                  @click="downloadAttachment(attachment)"
                  class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <!-- References -->
          <div v-if="parsed?.references && parsed.references.length > 0" class="mt-4 p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
            <div class="text-sm font-semibold text-purple-700 mb-3">Related Links ({{ parsed.references.length }})</div>
            <div class="space-y-2">
              <a
                v-for="(ref, index) in parsed.references"
                :key="index"
                :href="ref.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
              >
                <div class="flex-shrink-0 mr-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getPlatformColorClass(ref.type)">
                    <component :is="getPlatformIcon(ref.type)" class="w-5 h-5" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-gray-900">{{ ref.platform }}</span>
                    <ExternalLink class="w-3 h-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <p class="text-xs text-gray-600 truncate">{{ ref.url }}</p>
                  <p v-if="ref.subreddit" class="text-xs text-gray-500 mt-1">r/{{ ref.subreddit }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Regular Note View -->
        <div v-else-if="parsed?.type === 'note'">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div v-if="parsed?.content" class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
            <div v-else class="text-gray-400 italic text-center py-8">This note is empty</div>
          </div>

          <!-- Attachments for regular notes -->
          <div v-if="note.attachments && note.attachments.length > 0" class="mt-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="text-sm font-semibold text-gray-600 mb-3">Attachments ({{ note.attachments.length }})</div>
            <div class="space-y-2">
              <div
                v-for="attachment in note.attachments"
                :key="attachment.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="flex-shrink-0">
                    <svg v-if="attachment.type.startsWith('image/')" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <svg v-else class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</div>
                  </div>
                </div>
                <button
                  @click="downloadAttachment(attachment)"
                  class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                >
                  Download
                </button>
              </div>
            </div>
          </div>

          <!-- References -->
          <div v-if="parsed?.references && parsed.references.length > 0" class="mt-4 p-6 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
            <div class="text-sm font-semibold text-purple-700 mb-3">References ({{ parsed.references.length }})</div>
            <div class="space-y-2">
              <a
                v-for="(ref, index) in parsed.references"
                :key="index"
                :href="ref.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
              >
                <div class="flex-shrink-0 mr-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getPlatformColorClass(ref.type)">
                    <component :is="getPlatformIcon(ref.type)" class="w-5 h-5" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-gray-900">{{ ref.platform }}</span>
                    <ExternalLink class="w-3 h-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <p class="text-xs text-gray-600 truncate">{{ ref.url }}</p>
                  <p v-if="ref.subreddit" class="text-xs text-gray-500 mt-1">r/{{ ref.subreddit }}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchNoteById, softDeleteNote } from "@/db";
import { parseNote } from "@/utils/noteParser";
import { ArrowLeft, Edit, Trash2, ExternalLink, Youtube, Instagram, Twitter, MessageCircle } from "lucide-vue-next";
import { format } from "timeago.js";
import { Marked } from "marked";
import * as OTPAuth from "otpauth";
import { fetchCryptoData, formatCryptoPrice, formatLargeNumber, getPriceChangeColor, getPriceChangeBgColor } from "@/utils/cryptoApi";

const route = useRoute();
const router = useRouter();

const note = ref(null);
const noteId = ref(null);
const isLoaded = ref(false);
const showPassword = ref(false);

// TOTP state
const totpCode = ref("");
const totpTimeRemaining = ref(30);
let totpInterval = null;

// Crypto state
const cryptoData = ref([]);
const isLoadingCrypto = ref(false);

// Initialize marked
const markedInstance = new Marked({
  breaks: true,
  gfm: true,
});

const parsed = computed(() => {
  if (!note.value?.content) return null;
  return parseNote(note.value.content);
});

const renderedMarkdown = computed(() => {
  if (!parsed.value?.content) return "";
  try {
    return markedInstance.parse(parsed.value.content);
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return parsed.value.content;
  }
});

const typeClass = computed(() => {
  if (!parsed.value?.type) return "";

  const classes = {
    password: "bg-blue-100 text-blue-800",
    bookmark: "bg-purple-100 text-purple-800",
    crypto: "bg-orange-100 text-orange-800",
    note: "bg-gray-100 text-gray-800",
  };

  return classes[parsed.value.type] || classes.note;
});

// Generate TOTP code
const generateTOTP = () => {
  const secret = parsed.value?.tags?.["2fa"] || parsed.value?.tags?.totp;

  if (!secret) {
    totpCode.value = "";
    return;
  }

  try {
    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, "")),
      digits: 6,
      period: 30,
    });

    // Generate current token
    totpCode.value = totp.generate();

    // Calculate time remaining
    const now = Math.floor(Date.now() / 1000);
    totpTimeRemaining.value = 30 - (now % 30);
  } catch (error) {
    console.error("TOTP generation error:", error);
    totpCode.value = "Invalid Secret";
  }
};

// Start TOTP updates
const startTOTPUpdates = () => {
  if (totpInterval) {
    clearInterval(totpInterval);
  }

  generateTOTP();

  totpInterval = setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    totpTimeRemaining.value = 30 - (now % 30);

    // Regenerate code when time expires
    if (totpTimeRemaining.value === 30) {
      generateTOTP();
    }
  }, 1000);
};

// Watch for note changes to restart TOTP
watch(
  () => parsed.value?.tags?.["2fa"] || parsed.value?.tags?.totp,
  (newSecret) => {
    if (newSecret) {
      startTOTPUpdates();
    } else {
      if (totpInterval) {
        clearInterval(totpInterval);
        totpInterval = null;
      }
      totpCode.value = "";
    }
  }
);

onMounted(async () => {
  noteId.value = route.params.id;

  try {
    const loadedNote = await fetchNoteById(noteId.value);
    note.value = loadedNote;

    // Start TOTP if note has 2FA
    if (parsed.value?.tags?.["2fa"] || parsed.value?.tags?.totp) {
      startTOTPUpdates();
    }

    // Load crypto data if note is crypto type
    if (parsed.value?.type === 'crypto' && parsed.value?.tags?.crypto) {
      await loadCryptoData();
    }
  } catch (error) {
    console.error("Error loading note:", error);
  } finally {
    isLoaded.value = true;
  }
});

onUnmounted(() => {
  if (totpInterval) {
    clearInterval(totpInterval);
    totpInterval = null;
  }
});

const formatDate = (timestamp) => {
  return format(timestamp);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const downloadAttachment = (attachment) => {
  try {
    // Create blob from array buffer
    const blob = new Blob([attachment.data], { type: attachment.type });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    alert("Failed to download attachment");
  }
};

const handleDelete = async () => {
  if (confirm("Are you sure you want to delete this note?")) {
    try {
      await softDeleteNote(noteId.value);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  }
};

// Helper functions for references
const getPlatformIcon = (type) => {
  switch (type) {
    case "youtube":
      return Youtube;
    case "instagram":
      return Instagram;
    case "twitter":
      return Twitter;
    case "reddit":
      return MessageCircle;
    default:
      return ExternalLink;
  }
};

const getPlatformColorClass = (type) => {
  switch (type) {
    case "youtube":
      return "bg-red-100 text-red-600";
    case "instagram":
      return "bg-pink-100 text-pink-600";
    case "twitter":
      return "bg-blue-100 text-blue-600";
    case "reddit":
      return "bg-orange-100 text-orange-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// Load crypto data
const loadCryptoData = async () => {
  isLoadingCrypto.value = true;
  cryptoData.value = [];

  try {
    const cryptoIds = parsed.value?.tags?.crypto?.split(',').map(id => id.trim()).filter(Boolean);
    
    if (!cryptoIds || cryptoIds.length === 0) {
      console.warn('No crypto IDs found');
      return;
    }

    const data = await fetchCryptoData(cryptoIds);
    cryptoData.value = data;
  } catch (error) {
    console.error('Error loading crypto data:', error);
  } finally {
    isLoadingCrypto.value = false;
  }
};

</script>

<style scoped>
/* Prose styling for rendered markdown */
.prose {
  color: #1f2937;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
  line-height: 1.75;
}

.prose a {
  color: #2563eb;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.prose ul,
.prose ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.5rem;
}
</style>
