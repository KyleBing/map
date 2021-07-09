import Layout from "@/layout/layout"

const router = [
   {
      name: 'index',
      path: '/',
      redirect: process.env.VUE_APP_DEFAULT_INDEX, // 根据环境不同，设定不同首页路径
   },
   {
      name: 'login',
      path: '/login',
      component: resolve => require(['@/page/login.vue'], resolve),
   },
   {
      name: 'register',
      path: '/register',
      component: resolve => require(['@/page/register.vue'], resolve),
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
            component: resolve => require(['@/page/route/lines.vue'], resolve),
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
            component: resolve => require(['@/page/tool/circle/circle'], resolve),
         },
         {
            name: 'route',
            path: 'route',
            component: resolve => require(['@/page/tool/route/route'], resolve),
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
            name: 'debug',
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
            component: resolve => require(['@/page/info/plate/plate'], resolve),
         },
         {
            name: 'area',
            path: 'area',
            component: resolve => require(['@/page/info/area/jinan'], resolve),
         },
      ]
   },
]

// 该列表用于菜单展示
const routeMap = [
   {
      name: 'route',
      path: '/route',
      component: Layout,
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
      component: Layout,
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
      component: Layout,
      meta: {
         title: '地图信息',
         showInMenu: true,
         icon: 'el-icon-document' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
      children: [
         {name: 'plate', path: 'plate', meta: {title: '山东各市车牌', showInMenu: true}},
         {name: 'area', path: 'area', meta: {title: '济南市各区', showInMenu: true}},
      ]
   },
]

import lines from "./page/route/lines";

// 添加路线到菜单
lines.LINES.forEach((line, index) => {
   routeMap[0].children.push({name: `line${index + 1}`, path: `${index + 1}`, meta: {title: index + 1 + ' - ' +  line.name, showInMenu: true}},)
})

export default {
   routeMap,
   router
}