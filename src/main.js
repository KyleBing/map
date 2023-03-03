import Vue from 'vue'
import App from './App.vue'
import Vuex from "vuex"

// element ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// VUEX
Vue.use(Vuex)
import store from "@/store";

// UTILITY
import utility from "@/utility";

Vue.prototype.$utility = utility

// Router
import router from "./router"

router.router.afterEach((to, from) => {
    if (store.getters.isInPortraitMode) { // 适配移动端 路由跳转后，隐藏菜单
        store.commit('SET_IS_SHOWING_MENU_TOGGLE_BTN', true)
    }
})

Vue.config.productionTip = false

new Vue({
    router: router.router,
    store,
    render: h => h(App),
}).$mount('#app')
