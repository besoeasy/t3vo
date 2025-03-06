<template>
  <div class="m-2 flex justify-center max-w-md mx-auto">
    <img :src="roboHashUrl" alt="Profile Avatar" class="w-full h-full transition-all duration-300" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { getSHA256 } from "@/utils";

const props = defineProps({
  password: {
    type: String,
    default: "",
  },
});

const roboHashUrl = computed(() => {
  const hash = getSHA256(props.password || new Date());
  return `https://robohash.org/${hash}?set=set2&size=500x500`;
});
</script>
