<script setup>
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: "Edit Entry"
  }
});

const emit = defineEmits(["close", "save"]);

const handleSave = () => {
  emit("save");
};

const handleClose = () => {
  emit("close");
};

// Close on escape key
const handleKeyDown = (e) => {
  if (e.key === "Escape" && props.show) {
    handleClose();
  }
};

// Add and remove event listener
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.addEventListener("keydown", handleKeyDown);
  } else {
    document.removeEventListener("keydown", handleKeyDown);
  }
});
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" @click.stop>
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-xl font-bold">{{ title }}</h3>
        <button @click="handleClose" class="p-1 rounded-full hover:bg-gray-100">
          <X size="20" />
        </button>
      </div>
      
      <div class="p-6">
        <slot></slot>
      </div>
      
      <div class="flex justify-end gap-3 p-4 border-t bg-gray-50">
        <button @click="handleClose" class="px-4 py-2 rounded-lg border hover:bg-gray-100">
          Cancel
        </button>
        <button @click="handleSave" class="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

