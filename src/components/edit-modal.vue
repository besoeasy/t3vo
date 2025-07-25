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
    <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" @click.stop>
      <div class="flex justify-between items-center p-6 border-b">
        <h3 class="text-2xl font-bold">{{ title }}</h3>
        <button @click="handleClose" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X size="24" />
        </button>
      </div>
      
      <div class="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
        <slot></slot>
      </div>
      
      <div class="flex justify-end gap-4 p-6 border-t bg-gray-50">
        <button @click="handleClose" class="px-6 py-3 rounded-lg border hover:bg-gray-100 transition-colors font-medium">
          Cancel
        </button>
        <button @click="handleSave" class="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

