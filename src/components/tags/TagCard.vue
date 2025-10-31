
<template>
  <div class="flex flex-col items-center w-full">
  <div class="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[16/10] bg-blue-900 rounded-2xl shadow-xl p-5 flex flex-col justify-between text-white select-none">
      <!-- Card Chip and Brand -->
      <div class="flex items-center justify-between mb-4">
        <div class="w-10 h-7 bg-yellow-200 rounded-md shadow-inner flex items-center justify-center">
          <div class="w-6 h-3 bg-yellow-50 rounded-sm"></div>
        </div>
        <svg class="w-10 h-10" viewBox="0 0 48 48" fill="none">
          <circle cx="16" cy="24" r="8" fill="#fbbf24"/>
          <circle cx="32" cy="24" r="8" fill="#f59e42"/>
        </svg>
      </div>
      <!-- Card Number -->
      <div class="mb-4">
        <div class="tracking-widest text-lg font-mono font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] text-white">
          {{ formatCardNumber(card.cardNumber) }}
        </div>
      </div>
      <!-- Card Details -->
      <div class="flex items-end justify-between text-xs font-mono">
        <div>
          <div class="uppercase text-gray-200">Expiry</div>
          <div class="text-base font-semibold text-white">{{ card.expiry || 'MM/YY' }}</div>
        </div>
        <div>
          <div class="uppercase text-gray-200">CVV</div>
          <div class="text-base font-semibold text-white">{{ card.cvv || '•••' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ value: [String, Object] })
const card = typeof props.value === 'object' ? props.value : { cardNumber: '', expiry: '', cvv: '' }

function formatCardNumber(num) {
  if (!num) return '•••• •••• •••• ••••'
  return num.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim()
}
</script>
