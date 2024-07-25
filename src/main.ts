// main.ts
import { createApp } from 'vue'

// APP
import App from './App.vue'
const app = createApp(App)

// ELEMENT-UI
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

app.use(ElementPlus, {
    locale: zhCn
})

// ELEMENT-UI-ICONS
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// PINIA
import {createPinia} from "pinia"
const pinia = createPinia()
app.use(pinia)


// ROUTER
import {router} from "./router"
app.use(router)

app.mount('#app')
