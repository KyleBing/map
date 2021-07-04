<template>
    <nav :style="`height:${height}px`">
        <el-button
            size="small"
            @click="handleCollapseToggle"
            :style="`width: ${navWidth}px`">
            {{ navMenuIsClosed ? '展开' : '折叠' }}
        </el-button>
        <el-menu
            :default-active="activeMenu"
            @select="handleMenu"
            @open="handleOpen"
            @close="handleClose"
            :collapse="navMenuIsClosed"
            :collapse-transition="false"
        >
            <el-submenu :index="submenu.path" v-for="submenu in menus" :key="submenu.path">
                <template slot="title">
                    <i :class="submenu.meta.icon"></i>
                    <span slot="title">{{ submenu.meta.title }}</span>
                </template>
                <el-menu-item
                    v-for="menuItem in submenu.children"
                    :key="menuItem.path"
                    :index="`${submenu.path}/${menuItem.path}`">{{ menuItem.meta.title }}</el-menu-item>
            </el-submenu>
        </el-menu>
    </nav>
</template>

<script>
import {mapMutations, mapState} from "vuex"
import route from "@/router";

export default {
    name: "navbar",
    props: {
        height:{
            type: Number,
        }
    },
    created() {
        this.activeMenu = this.$route.path
        // 过滤 Router 中的路由，去除 showInMenu === false 的菜单
        let submenuShow = route.routeMap.filter(submenu => submenu.meta.showInMenu)
        submenuShow.forEach(menu => {
            menu.children = menu.children.filter(menuItem => menuItem.meta.showInMenu)
            return menu
        })
        this.menus = submenuShow
    },
    data() {
        return {
            activeMenu: '/page-components/canvas',
            menus:[]
        };
    },

    computed: {
        ...mapState(['navWidth', 'navMenuIsClosed'])
    },


    methods: {
        ...mapMutations(['SET_NAV_WIDTH', 'SET_NAV_MENU_STATUS']),
        handleCollapseToggle() {
            this.SET_NAV_MENU_STATUS(!this.navMenuIsClosed)
            this.SET_NAV_WIDTH(this.navMenuIsClosed ? 64 : 200)
        },
        handleOpen() {
            // 处理导航组展开
        },
        handleClose() {
            // 处理导航组折叠
        },
        handleMenu(key) {
            // 处理导航点击
            if (this.$route.path !== key) {
                this.$router.push(key);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.el-menu {
    border: none;
}
.el-radio-group {
    padding: 10px;
}
.el-submenu{
    border-bottom: 1px solid #eeeeee;
}
.el-menu-item{
    line-height: 40px;
    height: 40px;
    &:after{
        background-color: #eeeeee;
        content: '';
        position: absolute;
        bottom: 0;
        left: 20px;
        height: 1px;
        width: 100%;
        transform: scaleY(0.5);
    }
    &:last-child:after{
        content: none;
    }
}
</style>