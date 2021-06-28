import Vue from "vue"
import Vuex from 'vuex'
Vue.use(Vuex)
export default  new Vuex.Store({
   state: {
      navWidth: 200
   },
   getters: {
   },
   mutations: {
      SET_NAV_WIDTH(state, value){
         state.navWidth = value
      }
   }
})