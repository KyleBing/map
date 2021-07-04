import Vue from "vue"
import Vuex from 'vuex'
Vue.use(Vuex)
export default  new Vuex.Store({
   state: {
      navWidth: 200,
      windowInsets: {}
   },
   getters: {
   },
   mutations: {
      SET_NAV_WIDTH(state, value){
         state.navWidth = value
      },
      SET_WINDOW_INSETS(state, value){
         state.windowInsets = value
      }
   }
})