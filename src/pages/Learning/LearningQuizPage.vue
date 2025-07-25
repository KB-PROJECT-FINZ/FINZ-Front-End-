<template>
  <div v-if="quiz">
    <h2>{{ quiz.question }}</h2>
    <ul>
      <li v-for="(choice, idx) in quiz.choices" :key="idx">
        <label>
          <input type="radio" :value="choice" v-model="selected" />
          {{ choice }}
        </label>
      </li>
    </ul>
    <button @click="submitQuiz">제출</button>
    <div v-if="result !== null">
      <p v-if="result">정답입니다!</p>
      <p v-else>오답입니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchLearningQuizById } from '../../services/learning';

const route = useRoute();
const quiz = ref(null);
const selected = ref('');
const result = ref(null);

onMounted(async () => {
  quiz.value = await fetchLearningQuizById(route.params.id);
});

function submitQuiz() {
  // 실제로는 정답 제출 API를 호출해야 함
  result.value = selected.value === quiz.value.answer;
}
</script> 