import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// main.js 또는 src/axios.js
import axios from 'axios'

axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:8080'

window.Kakao.init('979dcf8f3a293be358c7176b82842901')
