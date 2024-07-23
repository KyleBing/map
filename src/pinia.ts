import { defineStore } from "pinia";
import {EntityAuthorization} from "@/utility.ts";

export const useProjectStore = defineStore('storeProject', {
    state: ()=>({
        navWidth: 200, // 导航宽度
        windowInsets: { // 窗口数据
            height: 0,
            width: 0
        },
        navMenuIsClosed: false, // navMenu 是否折叠状态
        isInMobile: false, // 是否是手机端
        isShowingMenuToggleBtn: false, // 是否显示移动端的菜单切换按钮
        authorization: null as EntityAuthorization, // authorization
    }),
    getters: {
        isInPortraitMode (state) {
            return state.windowInsets.height > state.windowInsets.width
        },
        isAdmin (state) {
            return state.authorization && state.authorization.group_id === 1
        },
    }
})

