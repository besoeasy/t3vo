<template>
  <div v-if="attachments && attachments.length > 0" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
      Attachments ({{ attachments.length }})
    </div>
    <div class="space-y-2">
      <div
        v-for="attachment in attachments"
        :key="attachment.id"
        class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group cursor-pointer"
        @click="downloadAttachment(attachment)"
      >
        <div class="shrink-0">
          <svg v-if="attachment.type.startsWith('image/')" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <svg v-else class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium text-gray-900 truncate">{{ attachment.name }}</div>
          <div class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  attachments: {
    type: Array,
    default: () => []
  }
})

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

const downloadAttachment = (attachment) => {
  try {
    const blob = new Blob([attachment.data], { type: attachment.type })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading attachment:", error)
    alert("Failed to download attachment")
  }
}
</script>
