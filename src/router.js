import Layout from "@/layout/layout"

const router = [
   {
      name: 'index',
      path: '/',
      redirect: process.env.VUE_APP_DEFAULT_INDEX, // 根据环境不同，设定不同首页路径
      meta: { // meta 字段用于 navMenu 显示菜单
         title: '主页',
         showInMenu: false,
      },
   },
   {
      name: 'login',
      path: '/login',
      meta: {
         title: '登录',
         showInMenu: false
      },
      component: resolve => require(['@/page/login.vue'], resolve),
   },
   {
      name: 'register',
      path: '/register',
      meta: {
         title: '注册',
         showInMenu: false
      },
      component: resolve => require(['@/page/register.vue'], resolve),
   },
   {
      name: 'route',
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
            component: resolve => require(['@/page/tool/circle'], resolve),
         }
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
         {name: 'circle', path: 'circle', meta: {title: '范围工具', showInMenu: true},},
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