import Vue from "vue";
import VueRouter from "vue-router";
import utility from "@/utility";

Vue.use(VueRouter)

import Login from "@/page/Login.vue"
import Layout from "@/layout/Layout";

import {Message} from 'element-ui'
import Logout from "@/page/Logout";

const routes = [
    {
        name: 'Root', path: '/',
        meta: {
            title: '主页',
            showInMenu: true,
            icon: 'el-icon-house' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */
        },
        component: Layout,
        redirect: '/index',
        children: [
            {
                name: 'Index',
                path: 'index',
                meta: {
                    title: '主页',
                    showInMenu: false,
                    icon: 'el-icon-wind-power'
                },
                component: resolve => require(['@/page/index/Index'], resolve),
            },
        ]
    },
    {
        name: 'Route',
        path: '/route',
        component: Layout,
        redirect: '/route/route-list',
        meta: {
            title: '路线推荐',
            showInMenu: true,
            icon: 'el-icon-wind-power' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */
        },
        children: [
            {
                name: 'RouteList',
                path: 'route-list',
                meta: {
                    title: '路线列表',
                    showInMenu: true,
                    icon: 'el-icon-wind-power'
                },
                component: resolve => require(['@/page/route/RouteList'], resolve),
            },
            {
                name: 'RouteLine',
                path: 'route-line',
                meta: {
                    title: '路线展示',
                    showInMenu: true,
                    icon: 'el-icon-wind-power'
                },
                component: resolve => require(['@/page/route/RouteLine'], resolve),
            },
            {
                name: 'RouteEditor',
                path: 'route-editor',
                meta: {
                    title: '路线编辑',
                    showInMenu: true,
                    icon: 'el-icon-wind-power'
                },
                component: resolve => require(['@/page/route/RouteEditor.vue'], resolve),
            }
        ]
    },
    {
        name: 'Tool',
        path: '/tool',
        component: Layout,
        redirect: '/tool/circle',
        meta: {
            title: '地图工具',
            showInMenu: true,
            icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */
        },
        children: [
            {
                name: 'ToolCircle', path: 'circle',
                meta: {title: '范围标记', showInMenu: true},
                component: resolve => require(['@/page/tool/circle/ToolCircle'], resolve),
            },
            {
                name: 'ToolRoute', path: 'route',
                meta: {title: '路线标记', showInMenu: true},
                component: resolve => require(['@/page/tool/route/ToolRoute'], resolve),
            }
        ]
    },
    {
        name: 'Debug',
        path: '/debug',
        component: Layout,
        redirect: '/debug/debug',
        meta: {
            title: '调试',
            showInMenu: false,
            icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */
        },
        children: [
            {
                name: 'debugIndex',
                path: 'debug',
                meta: {
                    title: '调试',
                    showInMenu: true,
                    icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */
                },
                component: resolve => require(['@/page/debug/debug'], resolve),
            }
        ]
    },
    {
        name: 'Info',
        path: '/info',
        component: Layout,
        redirect: '/info/plate',
        meta: {
            title: '地图信息',
            showInMenu: true,
            icon: 'el-icon-collection' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */
        },
        children: [
            {
                name: 'InfoPlate', path: 'plate',
                meta: {title: '山东各市车牌', showInMenu: true},
                component: resolve => require(['@/page/info/carPlate/CarPlate.vue'], resolve),
            },
            {
                name: 'InfoArea', path: 'area',
                meta: {title: '济南各区', showInMenu: true},
                component: resolve => require(['@/page/info/area/AreaJinan'], resolve),
            },
            {
                name: 'InfoCarDepartment',
                path: 'car-department',
                meta: {title: '济南车管所', showInMenu: true},
                component: resolve => require(['@/page/info/car/CarDepartment'], resolve),
            },
            {
                name: 'CarUsed',
                path: 'car-used',
                meta: {title: '济南二手车市场', showInMenu: true},
                component: resolve => require(['@/page/info/car/CarUsed.vue'], resolve),
            },
        ]
    },
    {
        name: 'Other',
        path: '/other',
        component: Layout,
        redirect: '/other/map-loca',
        meta: {
            title: '其它',
            showInMenu: true,
            icon: 'el-icon-magic-stick'
        },
        children: [
            {
                name: 'MapLoca',
                path: 'map-loca',
                meta: {title: '脉冲图', showInMenu: true},
                component: resolve => require(['@/page/other/map/MapLoca'], resolve),
            },
            {
                name: 'About',
                path: 'about',
                meta: {isAdmin: false, title: '关于', showInMenu: true, icon: 'el-icon-warning-outline',},
                component: resolve => require(['@/page/other/About'], resolve),
            },
        ]
    },
    {
        name: 'Logout', path: '/logout',
        meta: {title: '退出登录', showInMenu: false, icon: 'el-icon-user-solid',},
        component: Logout,
    },
    {
        name: 'Login', path: '/login',
        meta: {title: '登录', showInMenu: false, icon: 'el-icon-user-solid',},
        component: Login,
    },
    {
        name: 'NoPage', path: '*',
        meta: {title: '404', showInMenu: false, icon: 'el-icon-user-solid',},
        component: resolve => require(['@/page/Login'], resolve),
    }
]

const router = new VueRouter({
    // mode: 'history', // 由于该项目是二级目录，使用 history 会导致开发与布署的地址不一
    routes
})

router.beforeEach((to, from, next) => {
    next()
})

export default {
    router,
    routes, // 需要显示在边栏的菜单
}

// import lines from "./page/route/lines";
//
// // 添加路线到菜单
// lines.LINES.forEach((line, index) => {
//    routeMap[1].children.push({name: `line${index + 1}`, path: `${index + 1}`, meta: {title: line.index + ' - ' +  line.name, showInMenu: true}},)
// })
