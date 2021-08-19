import Vue from 'vue'
import App from './App.vue'
import Vuex from "vuex"


// element ui
import {
   Button,
   Menu, Submenu, MenuItem,
   Form, FormItem, Input,
   Container, Aside, Main,
    Table, TableColumn,
    Message
} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Button);
Vue.use(Menu);Vue.use(Submenu);Vue.use(MenuItem);
Vue.use(Form);Vue.use(FormItem);Vue.use(Input);
Vue.use(Container);Vue.use(Aside);Vue.use(Main);
Vue.use(Table);Vue.use(TableColumn);
Vue.prototype.$message = Message
// Router
import route from "@/router";
import Router from "vue-router"

let router = new Router({
   routes: route.router
})

Vue.use(Router)


// VUEX
Vue.use(Vuex)
import store from "@/store";


router.afterEach((to, from) => {
    if(store.getters.isInPortraitMode){ // 适配移动端 路由跳转后，隐藏菜单
        store.commit('SET_IS_SHOWING_MENU_TOGGLE_BTN', true)
    }
})

Vue.config.productionTip = false

new Vue({
   router,
   store,
   render: h => h(App),
}).$mount('#app')

// import axios from "axios";
// axios.defaults.withCredentials=true



// router.beforeEach((to, from, next) => {
//    switch (to.name) {
//       case 'login':
//       case 'register':
//          next();
//          break;
//       default:
//          if (utility.hasLogined()) {
//             next()
//          } else {
//             next('/login')
//          }
//    }
// })
