<template>
    <nav :style="`height:${height}px`">
        <ElMenu
            :default-active="activeMenu"
            @select="handleMenu"
            @open="handleOpen"
            @close="handleClose"
            :unique-opened="false"
            :collapse="store.navMenuIsClosed"
            :collapse-transition="false"
        >
            <template v-for="(submenu,index) in menus">
                <ElSubMenu v-if="submenu.children && submenu.children.length > 0" :index="submenu.path">
                    <template #title>
                        <ElIcon>
                            <component :is="submenu.meta.icon"/>
                        </ElIcon>

                        <span>{{ submenu.meta.title }}</span>
                    </template>
                    <ElMenuItem
                        :class="{'is-active': menuItem.name === $route.name}"
                        v-for="menuItem in submenu.children"
                        :key="menuItem.path"
                        :index="`${submenu.path}/${menuItem.path}`">{{ menuItem.meta.title }}
                    </ElMenuItem>
                </ElSubMenu>

                <!-- 显示所有名不为 CategoryLink 的-->
                <ElMenuItem
                    v-else-if="submenu.name !== 'CategoryLink'"
                    :index="submenu.path"
                >
                    <ElIcon>
                        <component :is="submenu.meta.icon"/>
                    </ElIcon>
                    <span>{{ submenu.meta.title }}</span>
                </ElMenuItem>
                <!--如果名为 CategoryLink，需要 email === 管理员账户才显示 -->
                <ElMenuItem
                    v-else-if="getAuthorization().group_id === 1"
                    :index="submenu.path"
                >
                    <ElIcon>
                        <component :is="submenu.meta.icon"/>
                    </ElIcon>
                    <span>{{ submenu.meta.title }}</span>
                </ElMenuItem>
            </template>

        </ElMenu>
    </nav>
</template>

<script lang="ts" setup>
import {FIXED_ROUTES} from "../router"
import  {getAuthorization} from "@/utility";
import {onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useProjectStore} from "@/pinia.ts";

const store = useProjectStore()

const route = useRoute()
const router = useRouter()

defineProps<{
    height: number
}>()

const activeMenu = ref('/page-components/canvas')
const menus = ref([])

onMounted(()=>{
    activeMenu.value = route.path
    // 过滤 Router 中的路由，去除 showInMenu === false 的菜单
    let submenuShow = FIXED_ROUTES.filter(submenu => {
        if (submenu.meta.showInMenu){
            if (submenu.meta.isAdmin){
                return store.isAdmin
            } else {
                return true
            }
        } else {
            return false
        }
    })
    submenuShow.forEach(menu => {
        if (menu.children){ // 有子菜单才进行筛选
            menu.children = menu.children.filter(menuItem => menuItem.meta.showInMenu)
        }
        return menu
    })
    menus.value = submenuShow
})

function handleOpen() {
    // 处理导航组展开
}
function handleClose() {
    // 处理导航组折叠
}
function handleMenu(key) {
    // 处理导航点击
    if (route.path !== key) {
        router.push(key);
    }
}

watch(route, newValue => {
    activeMenu.value = newValue.path
})

</script>

<style lang="scss">
@import "../scss/variables";

$active-submenu-title: darken($color-main, 20%);
$active-submenu-bg: transparentize($color-main, 0.9);
$hover-menu-bg: transparentize($color-main, 0.4);

.el-menu {
    border: none;
}
.ElRadio-group {
    padding: 10px;
}
.el-sub-menu{
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
        .el-sub-menu__title{
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

.el-menu-item, .el-sub-menu__title{
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
