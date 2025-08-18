<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-sm"
  >
    <div
      class="bg-white w-full max-w-sm rounded-t-2xl p-6 pb-8 shadow-lg relative animate-slide-up"
      @click.stop
    >
      <button class="absolute right-4 top-4 text-gray-400 text-2xl" @click="$emit('close')">
        &times;
      </button>
      <div class="mb-4 text-center text-lg font-bold">사용할 수 있는 크레딧</div>
      <div class="flex justify-between items-center mb-2">
        <span class="text-gray-700">내 크레딧</span>
        <span class="font-bold text-gray-700">{{ userCredit }}C</span>
      </div>
      <div class="mt-6 mb-2 text-gray-700 font-medium">전환신청 크레딧 입력</div>
      <div class="flex justify-end mb-2">
        <button
          class="border border-gray-300 text-gray-700 bg-white rounded px-2 py-1 text-xs font-normal hover:bg-gray-100 transition-colors"
          style="min-width: 60px"
          @click="chargeCreditInput = userCredit"
        >
          보유크레딧 전체
        </button>
      </div>
      <div class="relative mb-4">
        <input
          v-model.number="chargeCreditInput"
          type="number"
          min="1"
          :max="userCredit"
          class="border rounded-lg px-4 py-2 w-full text-right font-bold text-lg pr-7 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="0"
        />
        <span
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 text-lg font-bold pointer-events-none"
          >C</span
        >
      </div>
      <div class="my-6 text-center text-gray-700">
        내 계좌에
        <span class="font-bold text-blue-600">{{
          (chargeCreditInput * 1000).toLocaleString()
        }}</span>
        원이 추가됩니다.
      </div>
      <button
        class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:text-gray-400"
        :disabled="!chargeCreditInput || chargeCreditInput < 1 || chargeCreditInput > userCredit"
        @click="onChargeNext"
      >
        확인
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  show: Boolean,
  userCredit: Number,
})
const emit = defineEmits(['close', 'charged'])

const chargeCreditInput = ref(0)

watch(chargeCreditInput, (val) => {
  if (val > props.userCredit) chargeCreditInput.value = props.userCredit
})

function onChargeNext() {
  emit('charged', chargeCreditInput.value)
  chargeCreditInput.value = 0
  emit('close')
}
</script>
