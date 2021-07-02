import Layout from "@/layout/layout"

import login from "@/page/login"
import register from "@/page/register"

const router = [
   {
      name: 'index',
      path: '/',
      redirect: '/page/list/1',
      meta: { // meta 字段用于 navMenu 显示菜单
         title: '主页',
         showInMenu: false,
      },
   },
   {
      name: 'page',
      path: '/page',
      component: Layout,
      children: [
         {
            name: 'list',
            path: 'list/:lineId',
            component: resolve => require(['@/page/list/list'], resolve),
         }
      ]
   },

   {
      name: 'login',
      path: '/login',
      meta: {
         title: '登录',
         showInMenu: false
      },
      component: login,
   },
   {
      name: 'register',
      path: '/register',
      meta: {
         title: '注册',
         showInMenu: false
      },
      component: register,
   }
]

// 该列表用于菜单展示
const routes = [
   {
      name: 'page',
      path: '/page',
      component: Layout,
      meta: {
         title: '路线推荐',
         showInMenu: true,
         icon: 'el-icon-bicycle' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
      children: [
         // {name: 'line1', path: 'list/1', meta: {title: '路线一', showInMenu: true},},
      ]
   },
]

import lines from "./page/list/lines";

// 添加路线到菜单
lines.LINES.forEach((line, index) => {
   routes[0].children.push({name: `line${index + 1}`, path: `list/${index + 1}`, meta: {title: line.name, showInMenu: true}},)
})

export default {
   routes,
   router
}