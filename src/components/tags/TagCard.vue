<template>
  <div class="flex flex-col gap-1">
    <span class="font-bold text-black">Card:</span>
    <div class="bg-gray-100 px-2 py-1 rounded select-all text-black border border-gray-300 flex flex-col gap-1">
      <span v-if="card.cardNumber"><span class="font-semibold">Number:</span> {{ card.cardNumber }}</span>
      <span v-if="card.expiry"><span class="font-semibold">Expiry:</span> {{ card.expiry }}</span>
      <span v-if="card.cvv"><span class="font-semibold">CVV:</span> {{ card.cvv }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ value: [String, Object] });
const card = typeof props.value === 'object' ? props.value : { cardNumber: '', expiry: '', cvv: '' };
</script>
