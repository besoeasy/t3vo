
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
      <div class="mx-auto p-6 md:p-12">
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Tags & Metadata -->
          <div class="lg:col-span-1 space-y-4">
            <!-- Render all tags in order -->
            <template v-for="(tag, index) in parsed?.allTags" :key="`${tag.key}-${index}`">
              <!-- Dynamic tag component rendering -->
              <component 
                :is="getTagComponent(tag.key)" 
                v-if="getTagComponent(tag.key) && shouldRenderTag(tag.key)"
                :value="tag.value" 
                :parsed="parsed"
              />
            </template>

            <!-- Attachments -->
            <ParseAttachments v-if="note.attachments?.length" :attachments="note.attachments" />

            <!-- Crypto Addresses -->
            <ParseCryptoAddresses v-if="parsed?.cryptoAddresses?.length" :cryptoAddresses="parsed.cryptoAddresses" />

            <!-- References -->
            <ParseReferences v-if="parsed?.references?.length" :references="parsed.references" />
          </div>

          <!-- Right Column - Content -->
          <div class="lg:col-span-2">
            <!-- Bookmark content goes in the card on left, so show full markdown here -->
            <div v-if="parsed?.tags?.bookmark && parsed?.content" class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
              <div class="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Description</div>
              <div class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
            </div>

            <!-- Regular content display -->
            <div v-else-if="parsed?.content" class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
              <div class="prose prose-lg max-w-none" v-html="renderedMarkdown"></div>
            </div>

            <!-- Empty state -->
            <div v-else class="p-8 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex items-center justify-center">
              <div class="text-gray-400 italic text-center">No content</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchNoteById, softDeleteNote } from "@/db";
import { parseNote } from "@/utils/noteParser";
import { ArrowLeft, Edit, Trash2 } from "lucide-vue-next";
import { format } from "timeago.js";
import { Marked } from "marked";

import { getTagComponent } from "@/tags";

import ParseCryptoAddresses from "@/components/parsed/CryptoAddresses.vue";
import ParseReferences from "@/components/parsed/References.vue";
import ParseAttachments from "@/components/parsed/Attachments.vue";

const route = useRoute();
const router = useRouter();

const note = ref(null);
const noteId = ref(null);
const isLoaded = ref(false);

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

const hasPasswordTags = computed(() => {
  return !!(parsed.value?.tags?.password || parsed.value?.tags?.email || parsed.value?.tags?.username);
});

const renderedOnce = ref(new Set());

// Tags that should only render once (e.g., password combines email, username, password)
const renderOnceMap = {
  'password': ['password', 'email', 'username'],
  '2fa': ['2fa', 'totp'],
  'bookmark': ['bookmark', 'url']
};

const shouldRenderTag = (tagKey) => {
  // Check if this tag is part of a render-once group
  for (const [groupKey, tags] of Object.entries(renderOnceMap)) {
    if (tags.includes(tagKey)) {
      // If any tag in this group has been rendered, skip
      if (renderedOnce.value.has(groupKey)) {
        return false;
      }
      // Mark this group as rendered
      renderedOnce.value.add(groupKey);
      return true;
    }
  }
  // All other tags can render multiple times
  return true;
};

const resetRenderedOnce = () => {
  renderedOnce.value.clear();
};

onMounted(async () => {
  noteId.value = route.params.id;

  try {
    resetRenderedOnce();
    const loadedNote = await fetchNoteById(noteId.value);
    note.value = loadedNote;
  } catch (error) {
    console.error("Error loading note:", error);
  } finally {
    isLoaded.value = true;
  }
});

watch(() => parsed.value, () => {
  resetRenderedOnce();
});

const formatDate = (timestamp) => {
  return format(timestamp);
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
