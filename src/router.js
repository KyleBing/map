import Layout from "@/layout/layout"

const router = [
   {
      name: 'index',
      path: '/',
      component: Layout,
      redirect: '/index',
      children: [
         {
            name: 'indexIndex',
            path: 'index',
            component: resolve => require(['@/page/index/index.vue'], resolve),
         }
      ]
      // redirect: process.env.VUE_APP_DEFAULT_INDEX, // 根据环境不同，设定不同首页路径
   },
   {
      name: 'login',
      path: '/login',
      component: resolve => require(['@/page/Login'], resolve),
   },
   {
      name: 'register',
      path: '/register',
      component: resolve => require(['@/page/Register'], resolve),
   },
   {
      name: 'routeline',
      path: '/route',
      component: Layout,
      redirect: '/route/1',
      children: [
         {
            name: 'line',
            path: ':lineId',
            component: resolve => require(['@/page/route/RouteLine'], resolve),
         }
      ]
   },
   {
      name: 'tool',
      path: '/tool',
      component: Layout,
      redirect: '/tool/circle',
      children: [
         {
            name: 'circle',
            path: 'circle',
            component: resolve => require(['@/page/tool/circle/ToolCircle'], resolve),
         },
         {
            name: 'route',
            path: 'route',
            component: resolve => require(['@/page/tool/route/ToolRoute'], resolve),
         }
      ]
   },
   {
      name: 'debug',
      path: '/debug',
      component: Layout,
      redirect: '/debug/debug',
      children: [
         {
            name: 'debugIndex',
            path: 'debug',
            component: resolve => require(['@/page/debug/debug'], resolve),
         }
      ]
   },
   {
      name: 'info',
      path: '/info',
      component: Layout,
      redirect: '/info/plate',
      children: [
         {
            name: 'plate',
            path: 'plate',
            component: resolve => require(['@/page/info/plate/InfoPlate'], resolve),
         },
         {
            name: 'area',
            path: 'area',
            component: resolve => require(['@/page/info/area/AreaJinan'], resolve),
         },
         {
            name: 'carManage',
            path: 'car-manage',
            component: resolve => require(['@/page/info/carManage/CarManage'], resolve),
         },
      ]
   },
   {
      name: 'other',
      path: '/other',
      component: Layout,
      redirect: '/other/map-loca',
      children: [
         {
            name: 'map-loca',
            path: 'map-loca',
            component: resolve => require(['@/page/other/map/MapLoca'], resolve),
         },
      ]
   },
]

// 该列表用于菜单展示
const routeMap = [
   {
      name: 'index',
      path: '/index',
      meta: {
         title: '主页',
         showInMenu: true,
         icon: 'el-icon-house' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
   },
   {
      name: 'route',
      path: '/route',
      meta: {
         title: '路线推荐',
         showInMenu: true,
         icon: 'el-icon-wind-power' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
      children: [
         // {name: 'line1', path: 'list/1', meta: {title: '路线一', showInMenu: true},},
      ]
   },
   {
      name: 'tool',
      path: '/tool',
      meta: {
         title: '地图工具',
         showInMenu: true,
         icon: 'el-icon-position' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
      children: [
         {name: 'circle', path: 'circle', meta: {title: '范围标记', showInMenu: true},},
         {name: 'route', path: 'route', meta: {title: '路线标记', showInMenu: true},},
      ]
   },
   {
      name: 'info',
      path: '/info',
      meta: {
         title: '地图信息',
         showInMenu: true,
         icon: 'el-icon-collection' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
      children: [
         {name: 'plate', path: 'plate', meta: {title: '山东各市车牌', showInMenu: true}},
         {name: 'area', path: 'area', meta: {title: '济南市各区', showInMenu: true}},
         {name: 'carManage', path: 'car-manage', meta: {title: '济南车车管所', showInMenu: true}},
      ]
   },
   {
      name: 'other',
      path: '/other',
      meta: {
         title: '其它',
         showInMenu: true,
         icon: 'el-icon-magic-stick' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
      children: [
         {name: 'mapLoca', path: 'map-loca', meta: {title: '脉冲图', showInMenu: true}},
      ]
   },
]

import lines from "./page/route/lines";

// 添加路线到菜单
lines.LINES.forEach((line, index) => {
   routeMap[1].children.push({name: `line${index + 1}`, path: `${index + 1}`, meta: {title: index + 1 + ' - ' +  line.name, showInMenu: true}},)
})

export default {
   routeMap,
   router
}
