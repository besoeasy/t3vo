<template>
  <div v-if="references && references.length > 0" class="p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
    <div class="text-xs font-semibold text-purple-700 mb-3 uppercase tracking-wide">
      Links ({{ references.length }})
    </div>
    <div class="space-y-2">
      <a
        v-for="(ref, index) in references"
        :key="index"
        :href="ref.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-all group"
      >
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="getPlatformColorClass(ref.type)">
            <component :is="getPlatformIcon(ref.type)" class="w-4 h-4" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-gray-900 truncate">{{ ref.platform }}</div>
          <p class="text-xs text-gray-500 truncate">{{ ref.url }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { Youtube, Instagram, Twitter, MessageCircle, ExternalLink } from 'lucide-vue-next'

defineProps({
  references: {
    type: Array,
    default: () => []
  }
})

const getPlatformIcon = (type) => {
  switch (type) {
    case "youtube":
      return Youtube
    case "instagram":
      return Instagram
    case "twitter":
      return Twitter
    case "reddit":
      return MessageCircle
    default:
      return ExternalLink
  }
}

const getPlatformColorClass = (type) => {
  switch (type) {
    case "youtube":
      return "bg-red-100 text-red-600"
    case "instagram":
      return "bg-pink-100 text-pink-600"
    case "twitter":
      return "bg-blue-100 text-blue-600"
    case "reddit":
      return "bg-orange-100 text-orange-600"
    default:
      return "bg-gray-100 text-gray-600"
  }
}
</script>
