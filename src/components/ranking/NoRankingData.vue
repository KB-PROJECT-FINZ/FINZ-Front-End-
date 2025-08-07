<!-- 렝킹데이터가 없을 때 -->
<template>
  <div class="text-center mt-16 px-6">
    <p class="mb-4 text-gray-600">
      이번주 랭킹이 아직 없어요.<br />
      투자자들의 활동이 더 많아지면 랭킹이 업데이트될 예정이에요.
    </p>
    <button
      @click="$emit('loadLastWeekRanking')"
      class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      지난주 랭킹 보기
    </button>
  </div>
</template>

<script setup></script>
