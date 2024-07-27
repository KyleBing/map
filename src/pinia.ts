import { defineStore } from "pinia";
import {EntityAuthorization} from "@/utility.ts";

export const useProjectStore = defineStore('storeProject', {
    state: ()=>({
        navWidth: 200, // 导航宽度
        windowInsets: { // 窗口数据
            height: 0,
            width: 0
        },
        contentInsets: {
            heightToolbar: 60, // toolbar 高度
            heightPager: 50, // pagination 高度
            heightContent: 0, // 内容高度
            widthContent: 0, // 内容宽度
        },
        navMenuIsClosed: false, // navMenu 是否折叠状态
        isInMobile: false, // 是否是手机端
        isShowingMenuToggleBtn: false, // 是否显示移动端的菜单切换按钮
        authorization: null as EntityAuthorization, // authorization

        isShowUserSelfLocation: false, // 是否显示用户自己的位置， http 下无用，https 才有用
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

