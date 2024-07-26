import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import Layout from "./layout/Layout.vue"
import Logout from "./page/Logout.vue"
import Login from "./page/Login.vue"
import Register from "./page/Register.vue"

const FIXED_ROUTES: Array<RouteRecordRaw> = [
    {
        name: 'Root',
        path: '/',
        meta: {title: '主页', showInMenu: true, icon: 'House'},
        component: Layout,
        redirect: '/index',
        children: [
            {name: 'Index', path: 'index', meta: {title: '主页', showInMenu: false, icon: 'el-icon-wind-power'}, component: () => import('./page/index/Index.vue')},
        ]
    },
    {
        name: 'Route',
        path: '/route',
        component: Layout,
        meta: {title: '路线规划', showInMenu: true, icon: 'WindPower' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'RouteLine',   path: 'route-line',   meta: {title: '展示', showInMenu: true, icon: 'el-icon-wind-power'}, component: () => import('./page/route/RouteLine.vue')},
            {name: 'RouteList',   path: 'route-list',   meta: {title: '列表', showInMenu: true, icon: 'el-icon-wind-power'}, component: () => import('./page/route/RouteList.vue')},
            {name: 'RouteEditor', path: 'route-editor', meta: {title: '新建 | 编辑', showInMenu: true, icon: 'el-icon-wind-power'}, component: () => import('./page/route/RouteEditor.vue')}
        ]
    },
    {
        name: 'Pointer',
        path: '/pointer',
        component: Layout,
        meta: {title: '地域信息', showInMenu: true, icon: 'LocationInformation' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'PointerViewer', path: 'pointer-viewer', meta: {title: '展示', showInMenu: true, icon: 'el-icon-wind-power'}, component: () => import('./page/pointer/PointerViewer.vue')},
            {name: 'PointerList',   path: 'pointer-list',   meta: {title: '列表', showInMenu: true, icon: 'el-icon-wind-power'}, component: () => import('./page/pointer/PointerList.vue')},
            {name: 'PointerEditor', path: 'pointer-editor', meta: {title: '新建 | 编辑', showInMenu: true, icon: 'el-icon-wind-power'}, component: () => import('./page/pointer/PointerEditor.vue')}
        ]
    },
    {
        name: 'GPX',
        path: '/gpx',
        component: Layout,
        meta: {title: 'GPX', showInMenu: true, icon: 'Promotion' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'GpxViewer', path: 'gpx-viewer', meta: {title: 'GPX 路径', showInMenu: true, icon: 'el-icon-s-promotion'}, component: () => import('./page/gpx/GpxViewer.vue')},
            {name: 'GpxViewer3D', path: 'gpx-viewer-3D', meta: {title: 'GPX 路径 3D', showInMenu: true, icon: 'el-icon-s-promotion'}, component: () => import('./page/gpx/GpxViewer3D.vue')},
        ]
    },
    {
        name: 'Debug',
        path: '/debug',
        component: Layout,
        redirect: '/debug/debug',
        meta: {title: '调试', showInMenu: false, icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'debugIndex', path: 'debug', meta: {title: '调试', showInMenu: true, icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */}, component: () => import('./page/debug/debug.vue')}
        ]
    },
    {
        name: 'Tool',
        path: '/tool',
        component: Layout,
        redirect: '/tool/circle',
        meta: {title: '地图工具', showInMenu: true, icon: 'Coordinate' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'ToolCircle'  , path: 'circle'       , meta: {title: '范围标记' , showInMenu: true}, component: () => import('./page/tool/circle/ToolCircle.vue')},
            {name: 'DistrictInfo', path: 'district-info', meta: {title: '城市各区县', showInMenu: true}, component: () => import('./page/info/area/District.vue')},
        ]
    },
    {
        name: 'Info',
        path: '/info',
        component: Layout,
        redirect: '/info/plate',
        meta: {title: '济南本地信息', showInMenu: true, icon: 'CreditCard' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
        children: [
            {name: 'MotorHighway'      , path: 'motor-highway'  , meta: {title: '摩托车高速'  , showInMenu: true} , component: () => import('./page/info/motorHighway/MotorHighway.vue')} ,
            {name: 'InfoPlate'         , path: 'plate'          , meta: {title: '山东各市车牌'  , showInMenu: true} , component: () => import('./page/info/carPlate/CarPlate.vue')} ,
            {name: 'InfoCarDepartment' , path: 'car-department' , meta: {title: '济南车管所'   , showInMenu: true} , component: () => import('./page/info/car/CarDepartment.vue')} ,
            {name: 'HighwayXueye'      , path: 'highway-xueye'  , meta: {title: '济南籍车辆高速免费' , showInMenu: true} , component: () => import('./page/info/highwayXueye/HighwayXueye.vue')} ,
        ]
    },

    {
        name: 'Other',
        path: '/other',
        component: Layout,
        redirect: '/other/map-loca',
        meta: {title: '其它', showInMenu: true, icon: 'Grape'},
        children: [
            {name: 'MapLoca', path: 'map-loca', meta: {title: '脉冲图', showInMenu: true}, component: () => import('./page/other/map/MapLoca.vue')},
        ]
    },
    {
        name: 'AboutFramework',
        path: '/about',
        component: Layout,
        redirect: '/about/about',
        meta: {title: '关于', showInMenu: true, icon: 'ChatDotRound'},
        children: [
            {name: 'About', path: 'about', meta: {isAdmin: false, title: '关于', showInMenu: false, icon: 'el-icon-warning-outline',}, component: () => import('./page/other/About.vue')},
        ]
    },
    {
        name: 'Logout', path: '/logout',
        meta: {title: '退出登录', showInMenu: false, icon: 'BottomRight',},
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
        component: Register,
    },
    // {
    //     name: 'NoPage', path: '*',
    //     meta: {title: '404', showInMenu: false, icon: 'el-icon-user-solid',},
    //     component: Login,
    // }
]


const router = createRouter({
    history: createWebHashHistory(),
    routes: FIXED_ROUTES
})


export {
    router,
    FIXED_ROUTES, // 需要显示在边栏的菜单
}
