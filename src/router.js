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
        meta: {title: '主页', showInMenu: true, icon: 'el-icon-house'},
        component: Layout,
        redirect: '/index',
        children: [
            {name: 'Index', path: 'index', meta: {title: '主页', showInMenu: false, icon: 'el-icon-wind-power'}, component: resolve => require(['@/page/index/Index'], resolve),},
        ]
    },
    {
        name: 'Route',
        path: '/route',
        component: Layout,
        meta: {title: '路线规划', showInMenu: true, icon: 'el-icon-wind-power' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'RouteLine',   path: 'route-line',   meta: {title: '展示', showInMenu: true, icon: 'el-icon-wind-power'}, component: resolve => require(['@/page/route/RouteLine'], resolve),},
            {name: 'RouteList',   path: 'route-list',   meta: {title: '列表', showInMenu: true, icon: 'el-icon-wind-power'}, component: resolve => require(['@/page/route/RouteList'], resolve),},
            {name: 'RouteEditor', path: 'route-editor', meta: {title: '编辑', showInMenu: true, icon: 'el-icon-wind-power'}, component: resolve => require(['@/page/route/RouteEditor.vue'], resolve),}
        ]
    },
    {
        name: 'Pointer',
        path: '/pointer',
        component: Layout,
        meta: {title: '地域信息', showInMenu: true, icon: 'el-icon-location-outline' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'PointerViewer', path: 'pointer-viewer', meta: {title: '展示', showInMenu: true, icon: 'el-icon-wind-power'}, component: resolve => require(['@/page/pointer/PointerViewer'], resolve),},
            {name: 'PointerList',   path: 'pointer-list',   meta: {title: '列表', showInMenu: true, icon: 'el-icon-wind-power'}, component: resolve => require(['@/page/pointer/PointerList'], resolve),},
            {name: 'PointerEditor', path: 'pointer-editor', meta: {title: '编辑', showInMenu: true, icon: 'el-icon-wind-power'}, component: resolve => require(['@/page/pointer/PointerEditor.vue'], resolve),}
        ]
    },
    {
        name: 'GPX',
        path: '/gpx',
        component: Layout,
        meta: {title: 'GPX', showInMenu: true, icon: 'el-icon-s-promotion' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'GpxViewer', path: 'gpx-viewer', meta: {title: 'GPX路径', showInMenu: true, icon: 'el-icon-s-promotion'}, component: resolve => require(['@/page/gpx/GpxViewer.vue'], resolve),},
        ]
    },
    {
        name: 'Debug',
        path: '/debug',
        component: Layout,
        redirect: '/debug/debug',
        meta: {title: '调试', showInMenu: false, icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'debugIndex', path: 'debug', meta: {title: '调试', showInMenu: true, icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */}, component: resolve => require(['@/page/debug/debug'], resolve),}
        ]
    },
    {
        name: 'Tool',
        path: '/tool',
        component: Layout,
        redirect: '/tool/circle',
        meta: {title: '地图工具', showInMenu: true, icon: 'el-icon-place' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'ToolCircle'  , path: 'circle'       , meta: {title: '范围标记' , showInMenu: true}, component: resolve => require(['@/page/tool/circle/ToolCircle'], resolve), },
            {name: 'ToolRoute'   , path: 'route'        , meta: {title: '路线标记' , showInMenu: true}, component: resolve => require(['@/page/tool/route/ToolRoute']  , resolve), },
            {name: 'DistrictInfo', path: 'district-info', meta: {title: '城市各区县', showInMenu: true}, component: resolve => require(['@/page/info/area/District']    , resolve), },
        ]
    },
    {
        name: 'Info',
        path: '/info',
        component: Layout,
        redirect: '/info/plate',
        meta: {title: '济南本地信息', showInMenu: true, icon: 'el-icon-postcard' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'MotorHighway'      , path: 'motor-highway'  , meta: {title: '摩托车高速'  , showInMenu: true} , component: resolve => require(['@/page/info/motorHighway/MotorHighway.vue'] , resolve) , } ,
            {name: 'InfoPlate'         , path: 'plate'          , meta: {title: '山东各市车牌'  , showInMenu: true} , component: resolve => require(['@/page/info/carPlate/CarPlate.vue'] , resolve) , } ,
            {name: 'InfoCarDepartment' , path: 'car-department' , meta: {title: '济南车管所'   , showInMenu: true} , component: resolve => require(['@/page/info/car/CarDepartment']     , resolve) , } ,
            {name: 'CarUsed'           , path: 'car-used'       , meta: {title: '济南二手车市场' , showInMenu: true} , component: resolve => require(['@/page/info/car/CarUsed.vue']       , resolve) , } ,
            {name: 'HighwayXueye'      , path: 'highway-xueye'  , meta: {title: '济南籍车辆高速免费' , showInMenu: true} , component: resolve => require(['@/page/info/highwayXueye/HighwayXueye.vue']       , resolve) , } ,
        ]
    },

/*    {
        name: 'Other',
        path: '/other',
        component: Layout,
        redirect: '/other/map-loca',
        meta: {title: '其它', showInMenu: true, icon: 'el-icon-paperclip'},
        children: [
            {name: 'MapLoca', path: 'map-loca', meta: {title: '脉冲图', showInMenu: true}, component: resolve => require(['@/page/other/map/MapLoca'], resolve),},
        ]
    },*/
    {
        name: 'AboutFramework',
        path: '/about',
        component: Layout,
        redirect: '/about/about',
        meta: {title: '关于', showInMenu: true, icon: 'el-icon-magic-stick'},
        children: [
            {name: 'About', path: 'about', meta: {isAdmin: false, title: '关于', showInMenu: false, icon: 'el-icon-warning-outline',}, component: resolve => require(['@/page/other/About'], resolve),},
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
        name: 'Register', path: '/register',
        meta: {title: '注册', showInMenu: false, icon: 'el-icon-user-solid',},
        component: resolve => require(['@/page/Register'], resolve),
    },
    {
        name: 'NoPage', path: '*',
        meta: {title: '404', showInMenu: false, icon: 'el-icon-user-solid',},
        component: resolve => require(['@/page/Login'], resolve),
    }
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    next()
})

export {
    router,
    routes, // 需要显示在边栏的菜单
}
