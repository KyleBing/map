import Vue from 'vue'
import App from './App.vue'
import Vuex from "vuex"


// element ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// Router
import route from "@/router";
import Router from "vue-router"

let router = new Router({
   routes: route
})
Vue.use(Router)

// VUEX
Vue.use(Vuex)
import store from "@/store";

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
