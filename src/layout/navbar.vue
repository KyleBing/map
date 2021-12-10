<template>
    <nav :style="`height:${height}px`">
        <el-menu
            :default-active="activeMenu"
            @select="handleMenu"
            @open="handleOpen"
            @close="handleClose"
            :unique-opened="true"
            :collapse="navMenuIsClosed"
            :collapse-transition="false"
        >
          <template  v-for="(submenu,index) in menus">
            <el-submenu v-if="submenu.children" :index="submenu.path">
              <template slot="title">
                <i :class="submenu.meta.icon"></i>
                <span slot="title">{{ submenu.meta.title }}</span>
              </template>
              <el-menu-item
                  v-for="menuItem in submenu.children"
                  :key="menuItem.path"
                  :index="`${submenu.path}/${menuItem.path}`">{{ menuItem.meta.title }}</el-menu-item>
            </el-submenu>
            <el-menu-item v-else :index="submenu.path">
                <i :class="submenu.meta.icon"></i>
                <span slot="title">{{ submenu.meta.title }}</span>
                </el-menu-item>
          </template>

        </el-menu>
    </nav>
</template>

<script>
import {mapGetters, mapState} from "vuex"
import route from "../router"

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
        submenuShow.map(menu => {
            if (menu.children){
                menu.children = menu.children.filter(menuItem => menuItem.meta.showInMenu)
            }
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
        ...mapGetters(['isInPortraitMode']),
        ...mapState(['navMenuIsClosed'])
    },
    methods: {
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

<style lang="scss">
@import "../scss/variables";

$active-submenu-title: darken($color-main, 20%);
$active-submenu-bg: transparentize($color-main, 0.9);
$hover-menu-bg: transparentize($color-main, 0.4);

.el-menu {
    border: none;
}
.el-radio-group {
    padding: 10px;
}
.el-submenu{
    .el-menu-item{
        line-height: 40px;
        height: 40px;
        &:after{
            background-color: $border-color-nav;
        }
    }
    .el-menu{
        .el-menu-item:hover{
            background-color: $active-submenu-bg;
        }
    }
    &.is-active{
        background-color: $active-submenu-bg;
        .el-submenu__title{
            color: $active-submenu-title;
            &:hover{
                color: white;
            }
        }
        .el-menu{
            .el-menu-item{
                color: $active-submenu-title;
                background-color: $active-submenu-bg;
                &.is-active{
                    color: white;
                    //background-color: $active-submenu-bg;
                    background-color: $color-main;
                }
                &:hover{
                    color: white;
                }
            }
        }
    }
    &.is-opened{
        .el-menu{
            &:after{
                background-color: #eeeeee;
                content: "";
                position: absolute;
                bottom: 0;
                left: 20px;
                height: 1px;
                width: 100%;
                transform: scaleY(0.5);
            }
        }
    }
}

.el-menu-item, .el-submenu__title{
    line-height: 40px;
    height: 40px;
    font-size: 0.9rem;
    color: $text-main;
    border-bottom: none;
    transition: all 0s;
    i{
        color: inherit;
    }

    &.is-active {
        color: white;
        background-color: $color-main;
        &:hover{
            background-color: $color-main !important;
        }
    }
    &:hover{
        color: white;
        background-color: $hover-menu-bg !important;
        transition: all 0s;
    }
    &:after{
        background-color: $border-color-nav;
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
