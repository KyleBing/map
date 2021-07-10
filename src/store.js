import Vue from "vue"
import Vuex from 'vuex'
Vue.use(Vuex)
export default  new Vuex.Store({
   state: {
      navWidth: 200, // 导航宽度
      windowInsets: { // 窗口数据
         height: 0,
         width: 0
      },
      navMenuIsClosed: false, // navMenu 是否折叠状态
      isInMobile: false, // 是否是手机端
      isShowingMenuToggleBtn: false, // 是否显示移动端的菜单切换按钮
   },
   getters: {
      isInPortraitMode: state => {
         return state.windowInsets.height > state.windowInsets.width
      }
   },
   mutations: {
      SET_NAV_WIDTH(state, value){
         state.navWidth = value
      },
      SET_WINDOW_INSETS(state, value){
         state.windowInsets = value
      },
      SET_NAV_MENU_STATUS(state, value){
         state.navMenuIsClosed = value
      },
      SET_IS_IN_MOBILE(state, value){
         state.isInMobile = value
      },
      SET_IS_SHOWING_MENU_TOGGLE_BTN(state, value){
         state.isShowingMenuToggleBtn = value
      }
   }
})