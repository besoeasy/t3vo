<template>
  <div v-if="text" class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">QR Code</div>
    <div class="flex flex-col items-center gap-3">
      <canvas ref="qrcodeCanvas" class="max-w-full h-auto border border-gray-200 rounded-lg"></canvas>
      <div class="text-xs text-gray-600 break-all text-center px-2">
        {{ text }}
      </div>
      <button 
        @click="downloadQRCode" 
        class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Download QR Code
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: {
    type: String,
    default: null
  },
  parsed: {
    type: Object,
    default: null
  }
})

const qrcodeCanvas = ref(null)

const text = computed(() => {
  return props.value || props.parsed?.tags?.qrcode || null
})

const generateQRCode = async () => {
  if (!text.value || !qrcodeCanvas.value) return
  
  try {
    await QRCode.toCanvas(qrcodeCanvas.value, text.value, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}

const downloadQRCode = () => {
  if (!qrcodeCanvas.value) return
  
  const url = qrcodeCanvas.value.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `qrcode-${Date.now()}.png`
  link.click()
}

onMounted(() => {
  generateQRCode()
})

watch(text, () => {
  generateQRCode()
})
</script>

<script>
export const tagMetadata = {
  name: 'qrcode',
  displayName: 'QR Code',
  description: 'Generate scannable QR codes from any text or URL',
  example: 'qrcode=https://example.com',
  category: 'data',
  icon: '📱',
  aliases: [],
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'QR code content is required' }
    }
    return { valid: true }
  }
}
</script>
