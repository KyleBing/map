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
import {mapMutations, mapState} from "vuex"
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

<style lang="scss" scoped>
@import "../scss/variables";

.el-menu {
    border: none;
}
.el-radio-group {
    padding: 10px;
}
.el-submenu{
    border-bottom: 1px solid #eeeeee;
    .el-menu{
        .el-menu-item:hover{
            background-color: transparentize($orange, 0.8);
        }
    }
    &.is-active{
        background-color: transparentize($orange, 0.95);
        .el-menu{
            .el-menu-item{
                background-color: transparentize($orange, 0.95);
                &.is-active{
                    background-color: transparentize($orange, 0.8);
                }
            }
        }
    }
}

.el-submenu__title{
    line-height: 40px;
    height: 40px;
    &:hover{
        background-color: transparentize($orange, 0.9) !important;
    }
}

.el-menu-item{
    line-height: 40px;
    height: 40px;
    font-size: 0.9rem;
    color: $text-subtitle;
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