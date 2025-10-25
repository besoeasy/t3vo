<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
          <button
            @click="$emit('cancel')"
            class="flex-shrink-0 p-2 md:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Back to Notes"
          >
            <ArrowLeft class="w-5 h-5 md:w-5 md:h-5" />
          </button>
          <h2 class="text-lg md:text-2xl font-bold text-gray-900 truncate">
            {{ isNew ? 'New Note' : (isEditMode ? 'Edit Note' : parsed?.title || 'Note') }}
          </h2>
          <span
            v-if="detectedType && !isEditMode"
            class="hidden sm:inline-block px-3 py-1 text-xs font-medium rounded-full flex-shrink-0"
            :class="typeClass"
          >
            {{ detectedType }}
          </span>
        </div>
        <div class="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          <!-- View Mode Buttons -->
          <template v-if="!isNew && !isEditMode">
            <button
              @click="isEditMode = true"
              class="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            >
              <FileText class="w-4 h-4 md:mr-2" />
              <span class="hidden md:inline">Edit</span>
            </button>
            <button
              @click="$emit('delete')"
              class="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
            >
              <Trash2 class="w-4 h-4 md:mr-2" />
              <span class="hidden md:inline">Delete</span>
            </button>
          </template>
          
          <!-- Edit Mode Buttons -->
          <template v-else>
            <button
              v-if="!isNew"
              @click="cancelEdit"
              class="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              v-else
              @click="$emit('cancel')"
              class="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              :disabled="!content.trim()"
              class="flex items-center px-4 md:px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
            >
              <Save class="w-4 h-4 md:mr-2" />
              <span class="hidden md:inline">Save</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Reading View (for existing notes) -->
    <div v-if="!isNew && !isEditMode" class="flex-1 overflow-auto p-4 md:p-12 max-w-5xl mx-auto">
      <div class="space-y-8">
        <!-- Title -->
        <div v-if="parsed?.title">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ parsed.title }}</h1>
        </div>

        <!-- Notes Structure (Credentials or Bookmark) -->
        <!-- Password Fields -->
        <div v-if="parsed?.type === 'password'" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Credentials</h3>
          
          <div v-if="parsed.tags.email || parsed.tags.username" class="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <span class="text-sm text-gray-600 font-semibold">{{ parsed.tags.email ? 'Email' : 'Username' }}</span>
            <p class="text-lg text-gray-900 mt-2" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags.email || parsed.tags.username }}</p>
          </div>

          <div v-if="parsed.tags.password" class="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <span class="text-sm text-blue-700 font-semibold">Password</span>
            <p class="text-lg text-blue-900 mt-2 font-bold" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags.password }}</p>
          </div>

          <div v-if="parsed.tags['2fa'] || parsed.tags.totp" class="p-6 bg-green-50 rounded-xl border border-green-200">
            <span class="text-sm text-green-700 font-semibold mb-2 block">2FA Code</span>
            <div v-if="totpCode && totpCode !== 'Invalid Secret'">
              <p class="text-5xl font-bold text-green-900 tracking-wider mb-2" style="font-family: 'SF Mono', 'Monaco', monospace">
                {{ totpCode.slice(0, 3) }} {{ totpCode.slice(3, 6) }}
              </p>
              <div class="flex items-center gap-2 text-sm text-green-600">
                <div class="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-green-600 transition-all duration-1000 ease-linear"
                    :style="{ width: `${(totpTimeRemaining / 30) * 100}%` }"
                  ></div>
                </div>
                <span>{{ totpTimeRemaining }}s</span>
              </div>
            </div>
          </div>

          <div v-if="parsed.tags.domains" class="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <span class="text-sm text-gray-600 font-semibold">Domains</span>
            <p class="text-base text-gray-900 mt-2">{{ parsed.tags.domains }}</p>
          </div>
        </div>

        <!-- Bookmark URL -->
        <div v-if="parsed?.type === 'bookmark' && (parsed.tags.bookmark || parsed.tags.url)">
          <div class="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <span class="text-sm text-blue-700 font-semibold block mb-2">Bookmark URL</span>
                <p class="text-base text-blue-700 break-all">{{ parsed.tags.bookmark || parsed.tags.url }}</p>
              </div>
              <a
                :href="parsed.tags.bookmark || parsed.tags.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex-shrink-0 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                title="Open in new tab"
              >
                <ExternalLink class="w-4 h-4 mr-2" />
                Open
              </a>
            </div>
          </div>
        </div>

        <!-- Note Content (Markdown Parsed) -->
        <div v-if="parsed?.content" class="prose prose-lg max-w-none">
          <div 
            class="markdown-body text-gray-800"
            v-html="renderedMarkdown"
          ></div>
        </div>

        <!-- Attachments -->
        <div v-if="attachments.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Attachments ({{ attachments.length }})</h3>
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="(attachment, index) in attachments"
              :key="index"
              class="p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-400 transition-colors"
            >
              <div v-if="attachment.preview" class="w-full h-32 rounded overflow-hidden mb-3">
                <img :src="attachment.preview" :alt="attachment.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-full h-32 rounded bg-gray-100 flex items-center justify-center mb-3">
                <File class="w-12 h-12 text-gray-400" />
              </div>
              <p class="text-sm font-medium text-gray-900 truncate mb-1">{{ attachment.name }}</p>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</p>
                <button
                  @click="downloadAttachment(attachment)"
                  class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- References -->
        <div v-if="parsed?.references && parsed.references.length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">References ({{ parsed.references.length }})</h3>
          <div class="space-y-3">
            <a
              v-for="(ref, index) in parsed.references"
              :key="index"
              :href="ref.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all group"
            >
              <div class="flex-shrink-0 mr-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :class="getPlatformColorClass(ref.type)"
                >
                  <component :is="getPlatformIcon(ref.type)" class="w-6 h-6" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-gray-900">{{ ref.platform }}</span>
                  <ExternalLink class="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <p class="text-sm text-gray-600 truncate">{{ ref.url }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor View (for new notes or edit mode) -->
    <div v-else class="flex-1 overflow-hidden flex flex-col md:flex-row p-4 md:p-8 gap-4 md:gap-8">
      <!-- Editor Panel -->
      <div class="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-0">
        <!-- Toolbar -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Content</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="showTagHelp = !showTagHelp"
                :class="[
                  'flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  showTagHelp ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
                ]"
                title="Tag Help"
              >
                <HelpCircle class="w-3.5 h-3.5 mr-1.5" />
                Tags
              </button>
              <button
                @click="insertTemplate('password')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Insert Password Template"
              >
                <Key class="w-3.5 h-3.5 mr-1.5" />
                Password
              </button>
              <button
                @click="insertTemplate('bookmark')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Insert Bookmark Template"
              >
                <Bookmark class="w-3.5 h-3.5 mr-1.5" />
                Bookmark
              </button>
              <button
                @click="insertTemplate('note')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Insert Note Template"
              >
                <FileText class="w-3.5 h-3.5 mr-1.5" />
                Note
              </button>
            </div>
          </div>

          <!-- Tag Help -->
          <div
            v-if="showTagHelp"
            class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs"
          >
            <p class="font-semibold text-blue-900 mb-3">Available Tags:</p>
            <div class="grid grid-cols-2 gap-3 text-blue-800">
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@title=</code> Title</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@tags=</code> Tags (comma-separated)</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@pin=true</code> Pin to top</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@icon=</code> Custom emoji</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@email=</code> Email</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@username=</code> Username</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@password=</code> Password</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@2fa=</code> 2FA Secret</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@domains=</code> Domains</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@bookmark=</code> URL</div>
            </div>
          </div>

          <!-- Validation Warnings -->
          <div v-if="warnings.length > 0" class="mt-3 space-y-2">
            <div
              v-for="(warning, index) in warnings"
              :key="index"
              class="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900"
            >
              <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              {{ warning }}
            </div>
          </div>
        </div>

        <!-- Textarea -->
        <div class="flex-1 p-6 overflow-auto">
          <textarea
            ref="textareaRef"
            v-model="content"
            @input="handleInput"
            @keydown.tab.prevent="handleTab"
            placeholder="Start typing your note... Use #@tag= to add metadata"
            class="w-full h-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none resize-none text-sm leading-relaxed"
            :class="{ 'border-yellow-400': warnings.length > 0 }"
            style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace"
          ></textarea>
        </div>

        <!-- Attachments Section -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Paperclip class="w-4 h-4 text-gray-600" />
              <span class="text-xs font-semibold text-gray-900">Attachments</span>
              <span v-if="attachments.length > 0" class="text-xs text-gray-500">({{ attachments.length }})</span>
            </div>
            <label class="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
              <Upload class="w-3.5 h-3.5 mr-1.5" />
              Add Files
              <input
                ref="fileInputRef"
                type="file"
                multiple
                @change="handleFileSelect"
                class="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              />
            </label>
          </div>

          <!-- Drag and Drop Zone -->
          <div
            v-if="attachments.length === 0"
            @drop.prevent="handleFileDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            :class="[
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              isDragging ? 'border-gray-900 bg-gray-100' : 'border-gray-300 bg-white'
            ]"
          >
            <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-xs text-gray-600">Drag and drop files here or click "Add Files"</p>
            <p class="text-xs text-gray-400 mt-1">Max 10MB per file • Images, PDFs, Documents</p>
          </div>

          <!-- Attachments List -->
          <div v-else class="space-y-2">
            <div
              v-for="(attachment, index) in attachments"
              :key="index"
              class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
            >
              <!-- File Icon/Preview -->
              <div class="flex-shrink-0">
                <div v-if="attachment.preview" class="w-12 h-12 rounded overflow-hidden">
                  <img :src="attachment.preview" :alt="attachment.name" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                  <File class="w-6 h-6 text-gray-500" />
                </div>
              </div>
              
              <!-- File Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ attachment.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-1">
                <!-- Download Button -->
                <button
                  @click="downloadAttachment(attachment)"
                  class="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Download"
                >
                  <Download class="w-4 h-4" />
                </button>
                
                <!-- Delete Button -->
                <button
                  @click="removeAttachment(index)"
                  class="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Add more files button -->
            <label class="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Plus class="w-4 h-4 text-gray-500" />
              <span class="text-xs font-medium text-gray-600">Add more files</span>
              <input
                type="file"
                multiple
                @change="handleFileSelect"
                class="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              />
            </label>
          </div>

          <!-- Total Size Warning -->
          <div v-if="totalAttachmentSize > 50 * 1024 * 1024" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-xs text-yellow-800">
              <AlertCircle class="w-3 h-3 inline mr-1" />
              Total attachment size is large ({{ formatFileSize(totalAttachmentSize) }}). This may impact performance.
            </p>
          </div>
        </div>

        <!-- Character Count -->
        <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>{{ content.length }} characters</span>
          <span v-if="tagCount > 0" class="font-medium">{{ tagCount }} tag{{ tagCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="hidden lg:flex lg:w-1/2 flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-0">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-900">Live Preview</h3>
        </div>
        <div class="flex-1 p-6 overflow-auto">
          <div
            v-if="parsed && content.trim()"
            class="space-y-6"
          >
            <!-- Title (Always at top) -->
            <div v-if="parsed.title">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ parsed.title }}</h3>
              <div class="flex items-center gap-2 mb-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
                  :class="typeClass"
                >
                  <component :is="typeIcon" class="w-3.5 h-3.5 mr-1.5" />
                  {{ detectedType }}
                </span>
              </div>
            </div>

            <!-- Content/Notes Body (Second - main content) -->
            <div v-if="parsed.content" class="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span class="text-xs text-gray-600 font-semibold mb-3 block">{{ parsed.type === 'note' ? 'Content' : 'Notes' }}</span>
              <div 
                class="text-sm text-gray-900 markdown-body"
                v-html="renderedMarkdown"
              ></div>
            </div>

            <!-- Password Fields -->
            <div v-if="parsed.type === 'password'" class="space-y-3 mt-6">
              <div v-if="parsed.tags.email || parsed.tags.username" class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span class="text-xs text-gray-600 font-semibold">{{ parsed.tags.email ? 'Email' : 'Username' }}</span>
                <p class="text-sm text-gray-900 mt-1.5" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags.email || parsed.tags.username }}</p>
              </div>

              <div v-if="parsed.tags.password" class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span class="text-xs text-blue-700 font-semibold">Password</span>
                <p class="text-sm text-blue-900 mt-1.5 font-bold" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags.password }}</p>
              </div>

              <div v-if="parsed.tags['2fa'] || parsed.tags.totp" class="p-4 bg-green-50 rounded-xl border border-green-200">
                <span class="text-xs text-green-700 font-semibold">2FA Secret</span>
                <p class="text-xs text-green-900 mt-1.5 break-all" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags['2fa'] || parsed.tags.totp }}</p>
                
                <!-- TOTP Code -->
                <div v-if="totpCode && totpCode !== 'Invalid Secret'" class="mt-3 pt-3 border-t border-green-300">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-green-700 font-semibold">Current Code</span>
                    <span class="text-xs text-green-600">{{ totpTimeRemaining }}s</span>
                  </div>
                  <p class="text-3xl font-bold text-green-900 tracking-wider" style="font-family: 'SF Mono', 'Monaco', monospace">
                    {{ totpCode.slice(0, 3) }} {{ totpCode.slice(3, 6) }}
                  </p>
                  <div class="mt-2 h-1 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-green-600 transition-all duration-1000 ease-linear"
                      :style="{ width: `${(totpTimeRemaining / 30) * 100}%` }"
                    ></div>
                  </div>
                </div>
                <div v-else-if="totpCode === 'Invalid Secret'" class="mt-3 pt-3 border-t border-green-300">
                  <p class="text-xs text-red-600">Invalid 2FA secret format</p>
                </div>
              </div>

              <div v-if="parsed.tags.domains" class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span class="text-xs text-gray-600 font-semibold">Domains</span>
                <p class="text-sm text-gray-900 mt-1.5">{{ parsed.tags.domains }}</p>
              </div>
            </div>

            <!-- Attachments Preview -->
            <div v-if="attachments.length > 0" class="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div class="flex items-center mb-3">
                <Paperclip class="w-4 h-4 text-emerald-700 mr-2" />
                <span class="text-xs text-emerald-700 font-semibold">Attachments ({{ attachments.length }})</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="(attachment, index) in attachments"
                  :key="index"
                  class="relative group p-2 bg-white rounded-lg border border-emerald-200 hover:border-emerald-400 transition-colors"
                >
                  <div v-if="attachment.preview" class="w-full h-24 rounded overflow-hidden mb-2">
                    <img :src="attachment.preview" :alt="attachment.name" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="w-full h-24 rounded bg-gray-100 flex items-center justify-center mb-2">
                    <File class="w-8 h-8 text-gray-400" />
                  </div>
                  <p class="text-xs font-medium text-gray-900 truncate">{{ attachment.name }}</p>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</p>
                    <button
                      @click="downloadAttachment(attachment)"
                      class="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                      title="Download"
                    >
                      <Download class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- References Section -->
            <div v-if="parsed.references && parsed.references.length > 0" class="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div class="flex items-center mb-3">
                <Link2 class="w-4 h-4 text-purple-700 mr-2" />
                <span class="text-xs text-purple-700 font-semibold">References ({{ parsed.references.length }})</span>
              </div>
              <div class="space-y-2">
                <a
                  v-for="(ref, index) in parsed.references"
                  :key="index"
                  :href="ref.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-start p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
                >
                  <!-- Platform Icon -->
                  <div class="flex-shrink-0 mr-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center"
                      :class="getPlatformColorClass(ref.type)"
                    >
                      <component :is="getPlatformIcon(ref.type)" class="w-4 h-4" />
                    </div>
                  </div>
                  
                  <!-- Reference Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-semibold text-gray-900">{{ ref.platform }}</span>
                      <ExternalLink class="w-3 h-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <p class="text-xs text-gray-600 truncate">{{ ref.url }}</p>
                    <div v-if="ref.subreddit" class="text-xs text-gray-500 mt-1">
                      r/{{ ref.subreddit }}
                    </div>
                    <div v-if="ref.username" class="text-xs text-gray-500 mt-1">
                      @{{ ref.username }}
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <!-- Bookmark Fields (Bottom) -->
            <div v-if="parsed.type === 'bookmark' && (parsed.tags.bookmark || parsed.tags.url)">
              <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <span class="text-xs text-blue-700 font-semibold">URL</span>
                    <p class="text-sm text-blue-700 mt-1.5 break-all">{{ parsed.tags.bookmark || parsed.tags.url }}</p>
                  </div>
                  <a
                    :href="parsed.tags.bookmark || parsed.tags.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-shrink-0 flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                    title="Open in new tab"
                  >
                    <ExternalLink class="w-3.5 h-3.5 mr-1.5" />
                    Open
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <FileText class="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p class="text-sm font-medium">Preview will appear here</p>
              <p class="text-xs mt-1">Start typing to see your note</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { parseNote, validateNote } from '@/utils/noteParser';
import * as OTPAuth from 'otpauth';
import { Marked } from 'marked';
import {
  ArrowLeft,
  Save,
  Trash2,
  Key,
  Bookmark,
  FileText,
  HelpCircle,
  AlertCircle,
  Link2,
  ExternalLink,
  Youtube,
  Instagram,
  Twitter,
  MessageSquare,
  Paperclip,
  Upload,
  File,
  X,
  Plus,
  Download,
} from 'lucide-vue-next';

const props = defineProps({
  initialContent: {
    type: String,
    default: '',
  },
  isNew: {
    type: Boolean,
    default: true,
  },
  noteId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['save', 'cancel', 'delete']);

const content = ref(props.initialContent);
const showTagHelp = ref(false);
const textareaRef = ref(null);
const fileInputRef = ref(null);
const totpCode = ref('');
const totpTimeRemaining = ref(30);
let totpInterval = null;

// Attachments state
const attachments = ref([]);
const isDragging = ref(false);

// Edit mode state
const isEditMode = ref(props.isNew); // Start in edit mode for new notes
const originalContent = ref(props.initialContent);

// Parse content in real-time
const parsed = computed(() => {
  if (!content.value) return null;
  return parseNote(content.value);
});

// Initialize marked
const markedInstance = new Marked({
  breaks: true,
  gfm: true,
});

// Render markdown - make it async
const renderedMarkdown = computed(() => {
  if (!parsed.value?.content) return '';
  
  try {
    // Use parseInline for inline content or parse for full markdown
    const result = markedInstance.parse(parsed.value.content);
    // Handle Promise if needed
    if (result instanceof Promise) {
      result.then(html => {
        console.log('Markdown HTML:', html);
        return html;
      });
      return 'Loading...';
    }
    console.log('Markdown HTML:', result);
    return result;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return `<div>${parsed.value.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>`;
  }
});

// Generate TOTP code
const generateTOTP = () => {
  const secret = parsed.value?.tags['2fa'] || parsed.value?.tags.totp;
  if (!secret) {
    totpCode.value = '';
    totpTimeRemaining.value = 30;
    return;
  }

  try {
    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      secret: secret.replace(/\s/g, ''), // Remove spaces
      digits: 6,
      period: 30,
    });

    // Generate current token
    totpCode.value = totp.generate();

    // Calculate time remaining
    const now = Math.floor(Date.now() / 1000);
    totpTimeRemaining.value = 30 - (now % 30);
  } catch (error) {
    console.error('Error generating TOTP:', error);
    totpCode.value = 'Invalid Secret';
    totpTimeRemaining.value = 0;
  }
};

// Watch for changes in 2FA secret
watch(() => parsed.value?.tags['2fa'] || parsed.value?.tags.totp, () => {
  generateTOTP();
}, { immediate: true });

// Update TOTP every second
onMounted(() => {
  totpInterval = setInterval(() => {
    if (parsed.value?.tags['2fa'] || parsed.value?.tags.totp) {
      generateTOTP();
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (totpInterval) {
    clearInterval(totpInterval);
  }
});

// Detect type and get styling
const detectedType = computed(() => parsed.value?.type || 'note');

const typeIcon = computed(() => {
  switch (detectedType.value) {
    case 'password':
      return Key;
    case 'bookmark':
      return Bookmark;
    default:
      return FileText;
  }
});

const typeClass = computed(() => {
  switch (detectedType.value) {
    case 'password':
      return 'bg-blue-100 text-blue-700';
    case 'bookmark':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-green-100 text-green-700';
  }
});

// Count tags
const tagCount = computed(() => {
  return Object.keys(parsed.value?.tags || {}).length;
});

// Validate content
const warnings = computed(() => {
  if (!content.value) return [];
  return validateNote(content.value);
});

// Insert templates
const insertTemplate = (type) => {
  const templates = {
    password: `#@title=My Account
#@email=user@example.com
#@password=
#@2fa=
#@domains=example.com
#@tags=
#@icon=🔑
#@pin=false

Notes about this account...`,
    bookmark: `#@title=Useful Website
#@bookmark=https://example.com
#@tags=
#@icon=🔖

Description of the website...`,
    note: `#@title=My Note
#@tags=
#@icon=📝
#@pin=false

Your note content here...`,
  };

  if (templates[type]) {
    content.value = templates[type];
    // Focus textarea
    setTimeout(() => {
      if (textareaRef.value) {
        textareaRef.value.focus();
      }
    }, 100);
  }
};

// Handle tab key for indentation
const handleTab = (e) => {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  const value = content.value;

  // Insert tab character
  content.value = value.substring(0, start) + '  ' + value.substring(end);

  // Move cursor after tab
  setTimeout(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 2;
  }, 0);
};

// Handle input for live parsing
const handleInput = () => {
  // Auto-close tag help if content is being edited
  if (content.value.length > 10) {
    showTagHelp.value = false;
  }
};

// Save handler
const handleSave = () => {
  if (content.value.trim()) {
    // Only pass new attachments (not existing ones)
    const newAttachments = attachments.value.filter(att => !att.existing);
    emit('save', content.value, newAttachments);
    // Exit edit mode after save
    isEditMode.value = false;
    originalContent.value = content.value;
  }
};

// Cancel edit handler
const cancelEdit = () => {
  content.value = originalContent.value;
  isEditMode.value = false;
};

// Attachment handlers
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files || []);
  await processFiles(files);
  // Reset input
  if (event.target) {
    event.target.value = '';
  }
};

const handleFileDrop = async (event) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files || []);
  await processFiles(files);
};

const processFiles = async (files) => {
  for (const file of files) {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
      continue;
    }

    // Check total attachment size (50MB limit)
    const currentTotalSize = attachments.value.reduce((sum, att) => sum + att.size, 0);
    if (currentTotalSize + file.size > 50 * 1024 * 1024) {
      alert('Total attachment size would exceed 50MB limit.');
      break;
    }

    // Create attachment object
    const attachment = {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: null,
    };

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      attachment.preview = await generateImagePreview(file);
    }

    attachments.value.push(attachment);
  }
};

const generateImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

const downloadAttachment = async (attachment) => {
  try {
    let blob;
    
    // If it's an existing attachment, we need to get it from the database
    if (attachment.existing && attachment.id && props.noteId) {
      const { getAttachment } = await import('@/db');
      const dbAttachment = await getAttachment(props.noteId, attachment.id);
      if (dbAttachment) {
        blob = new Blob([dbAttachment.data], { type: dbAttachment.type });
      } else {
        throw new Error("Attachment not found in database");
      }
    } else {
      // For new attachments, use the file directly
      blob = attachment.file;
    }
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    alert("Failed to download attachment");
  }
};

const removeAttachment = async (index) => {
  const attachment = attachments.value[index];
  
  // If it's an existing attachment, delete from database
  if (attachment.existing && attachment.id && props.noteId) {
    try {
      const { deleteAttachment } = await import('@/db');
      await deleteAttachment(props.noteId, attachment.id);
    } catch (error) {
      console.error("Error deleting attachment:", error);
      alert("Failed to delete attachment");
      return;
    }
  }
  
  attachments.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const totalAttachmentSize = computed(() => {
  return attachments.value.reduce((sum, att) => sum + att.size, 0);
});

// Helper functions for references
const getPlatformIcon = (type) => {
  switch (type) {
    case 'youtube':
      return Youtube;
    case 'instagram':
      return Instagram;
    case 'twitter':
      return Twitter;
    case 'reddit':
      return MessageSquare;
    default:
      return Link2;
  }
};

const getPlatformColorClass = (type) => {
  switch (type) {
    case 'youtube':
      return 'bg-red-100 text-red-600';
    case 'instagram':
      return 'bg-pink-100 text-pink-600';
    case 'twitter':
      return 'bg-blue-100 text-blue-600';
    case 'reddit':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// Load existing attachments for editing
const loadExistingAttachments = async () => {
  if (!props.noteId || props.isNew) return;
  
  try {
    const { getAttachments } = await import('@/db');
    const existingAttachments = await getAttachments(props.noteId);
    
    // Convert stored attachments to display format
    for (const att of existingAttachments) {
      const blob = new Blob([att.data], { type: att.type });
      
      const attachment = {
        file: blob, // Just use the blob directly
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        preview: null,
        existing: true,
      };
      
      // Generate preview for images
      if (att.type.startsWith('image/')) {
        const url = URL.createObjectURL(blob);
        attachment.preview = url;
      }
      
      attachments.value.push(attachment);
    }
  } catch (error) {
    console.error("Error loading attachments:", error);
  }
};

// Focus textarea on mount
onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus();
    // If new note, show tag help briefly
    if (props.isNew && !content.value) {
      showTagHelp.value = true;
      setTimeout(() => {
        showTagHelp.value = false;
      }, 5000);
    }
  }
  
  // Load existing attachments
  loadExistingAttachments();
});

// Handle Escape key
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    emit('cancel');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f5f9;
}

textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Markdown styling */
.markdown-body {
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-body :deep(h1) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.67em 0;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.3em;
  font-weight: bold;
  margin: 0.75em 0 0.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-body :deep(h3) {
  font-size: 1.1em;
  font-weight: bold;
  margin: 0.5em 0;
}

.markdown-body :deep(p) {
  margin: 0.5em 0;
}

.markdown-body :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0.5em 0;
  padding-left: 2em;
}

.markdown-body :deep(li) {
  margin: 0.25em 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
}

.markdown-body :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(strong) {
  font-weight: bold;
}

.markdown-body :deep(em) {
  font-style: italic;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1.5em 0;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  border: 1px solid #e5e7eb;
  padding: 0.5em;
  text-align: left;
}

.markdown-body :deep(table th) {
  background-color: #f9fafb;
  font-weight: bold;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
}
</style>
