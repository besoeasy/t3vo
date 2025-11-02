<template>
  <div v-if="secret" class="p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
    <div class="text-xs font-semibold text-green-600 mb-3 uppercase tracking-wide">2FA Code</div>
    
    <!-- Valid TOTP Code -->
    <div v-if="totpCode && totpCode !== 'Invalid Secret'">
      <div class="text-3xl font-bold text-green-900 tracking-wider mb-2 font-mono">
        {{ totpCode.slice(0, 3) }} {{ totpCode.slice(3, 6) }}
      </div>
      <div class="flex items-center justify-between">
        <div class="text-xs text-green-600">{{ totpTimeRemaining }}s</div>
        <div class="w-20 h-1 bg-green-200 rounded-full overflow-hidden">
          <div 
            class="h-full bg-green-600 transition-all duration-1000" 
            :style="{ width: `${(totpTimeRemaining / 30) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Invalid Secret -->
    <div v-else class="text-red-600 text-xs">
      Invalid 2FA secret format
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as OTPAuth from 'otpauth'

const props = defineProps({
  value: {
    type: String,
    default: null
  }
})

const totpCode = ref('')
const totpTimeRemaining = ref(30)
let totpInterval = null

const secret = computed(() => {
  return props.value
})

const generateTOTP = () => {
  if (!secret.value) {
    totpCode.value = ''
    totpTimeRemaining.value = 30
    return
  }

  try {
    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret.value.replace(/\s/g, '')),
      digits: 6,
      period: 30,
    })

    // Generate current token
    totpCode.value = totp.generate()

    // Calculate time remaining
    const now = Math.floor(Date.now() / 1000)
    totpTimeRemaining.value = 30 - (now % 30)
  } catch (error) {
    console.error('TOTP generation error:', error)
    totpCode.value = 'Invalid Secret'
    totpTimeRemaining.value = 0
  }
}

const startTOTPUpdates = () => {
  if (totpInterval) {
    clearInterval(totpInterval)
  }

  generateTOTP()

  totpInterval = setInterval(() => {
    const now = Math.floor(Date.now() / 1000)
    totpTimeRemaining.value = 30 - (now % 30)

    // Regenerate code when time expires
    if (totpTimeRemaining.value === 30) {
      generateTOTP()
    }
  }, 1000)
}

// Watch for secret changes
watch(secret, (newSecret) => {
  if (newSecret) {
    startTOTPUpdates()
  } else {
    if (totpInterval) {
      clearInterval(totpInterval)
      totpInterval = null
    }
    totpCode.value = ''
  }
}, { immediate: true })

onMounted(() => {
  if (secret.value) {
    startTOTPUpdates()
  }
})

onUnmounted(() => {
  if (totpInterval) {
    clearInterval(totpInterval)
    totpInterval = null
  }
})
</script>

<script>
export const tagMetadata = {
  name: 'totp',
  displayName: '2FA / TOTP',
  description: 'Generate time-based one-time passwords (TOTP) for two-factor authentication',
  example: 'totp=JBSWY3DPEHPK3PXP',
  category: 'security',
  icon: '🔐',
  parseValue: (value) => value.trim().toUpperCase().replace(/\s/g, ''),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'TOTP secret is required' }
    }
    // Basic Base32 validation
    if (!/^[A-Z2-7]+=*$/.test(value.trim().toUpperCase().replace(/\s/g, ''))) {
      return { valid: false, error: 'Invalid TOTP secret format (must be Base32)' }
    }
    return { valid: true }
  }
}
</script>
