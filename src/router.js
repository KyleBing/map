import Layout from "@/layout"

import login from "@/page/login"
import register from "@/page/register"

export default [
   {
      name: 'index',
      path: '/',
      redirect: '/page/list',
      meta: { // meta 字段用于 navMenu 显示菜单
         title: '主页',
         showInMenu: false,
      },
   },
   {
      name: 'page',
      path: '/page',
      component: Layout,
      meta: {
         title: '常用',
         showInMenu: true,
         icon: 'el-icon-house' // 菜单 icon 对应 Element UI 中的 ICON class 名
      },
      children: [
         {
            name: 'list',
            path: 'list',
            meta: {
               title: '骑行列表',
               showInMenu: true
            },
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