import Vue from "vue";
import VueRouter from "vue-router";
import Layout from "@/layout/layout"


import utility from "@/utility";

Vue.use(VueRouter)

import login from "@/page/Login.vue"
import register from "@/page/Register.vue"
import layout from "@/layout/Layout.vue";
import changePassword from "@/page/ChangePassword.vue";
import logout from "@/page/Logout.vue";

import  {Message} from 'element-ui'


const routes = [
   {
      name: 'statistics', path: '/statistics',
      meta: {isAdmin: false, title: '统计', showInMenu: true, icon: 'el-icon-monitor',},
      component: resolve => require(['@/page/statistics/StatisticMain'], resolve),
   },
   /*    {
           name: 'BillList', path: '/bill',
           meta: {isAdmin: false, title: '账单', showInMenu: true, icon: 'el-icon-document',},
           component: resolve => require(['@/page/Bill'], resolve),
       },*/
   {
      name: 'CategoryList', path: '/diary-category',
      meta: {isAdmin: true, title: '日记类别', showInMenu: true, icon: 'el-icon-notebook-2',},
      component: resolve => require(['@/page/diary/DiaryCategory'], resolve),
   },
   {
      name: 'WubiCategory', path: '/wubi-category',
      meta: {isAdmin: true, title: '五笔词条类别', showInMenu: true, icon: 'el-icon-price-tag',},
      component: resolve => require(['@/page/wubi/WubiCategory'], resolve),
   },
   {
      name: 'WubiWords', path: '/wubi-words',
      meta: {isAdmin: false, title: '五笔词条', showInMenu: true, icon: 'el-icon-collection',},
      component: resolve => require(['@/page/wubi/WubiWords'], resolve),
   },
   {
      name: 'UserList', path: '/user',
      meta: {isAdmin: false, title: '用户管理', showInMenu: true, icon: 'el-icon-user',},
      component: resolve => require(['@/page/user/User'], resolve),
   },
   {
      name: 'QrList', path: '/qr',
      meta: {isAdmin: false, title: '二维码管理', showInMenu: true, icon: 'el-icon-s-grid',},
      component: resolve => require(['@/page/qr/QR'], resolve),
   },
   {
      name: 'ThumbsUp', path: '/thumbs-up',
      meta: {isAdmin: true, title: "点赞管理", showInMenu: true, icon: 'el-icon-medal',},
      component: resolve => require(['@/page/thumbsUp/ThumbsUp'], resolve),
   },
   {
      name: 'Mail', path: '/mail',
      meta: {isAdmin: true, title: 'Mail', showInMenu: true, icon: 'el-icon-message',},
      component: resolve => require(['@/page/Mail'], resolve),
   },
   {
      name: 'ChangePassword', path: '/change-password',
      meta: {isAdmin: false, title: '修改密码', showInMenu: true, icon: 'el-icon-key',},
      component:  changePassword,
   },
   {
      name: 'about', path: '/about',
      meta: {isAdmin: false, title: '关于', showInMenu: true, icon: 'el-icon-warning-outline',},
      component: resolve => require(['@/page/About.vue'], resolve),
   },
]

const routeLogout = {
   name: 'logout', path: '/logout', meta: {title: '退出', showInMenu: true, icon: 'el-icon-switch-button',},
   component: logout,
}
const ROUTE_FRAME =  [
   {
      name: 'index',
      path: '/',
      redirect: '/statistics',
      component: layout,
      meta: { // meta 字段用于 navMenu 显示菜单
         title: '主页',
         showInMenu: false,
      },
      children: routes
   },
   {
      name: 'login', path: '/login', meta: {title: '登录', showInMenu: false, icon: 'el-icon-user-solid',},
      component: login,
   },
   {
      name: 'noPage', path: '*', meta: {title: '404', showInMenu: false, icon: 'el-icon-user-solid',},
      component: login,
   },
]

const router = new VueRouter({
   // mode: 'history', // 由于该项目是二级目录，使用 history 会导致开发与布署的地址不一
   routes: [...ROUTE_FRAME, routeLogout]
})


router.beforeEach((to, from, next) => {
   if (to.name !== 'login' && to.name !== 'register' && to.name !== 'share'){
      if (utility.getAuthorization() && utility.getAuthorization().email){
         const isAdmin = utility.getAuthorization().email === 'kylebing@163.com'
         if (isAdmin){
            next()
         } else {
            if (to.meta.isAdmin) {
               Message.warning('没有权限')
            } else {
               next()
            }
         }
      } else {
         next('/login')
      }
   } else {
      next()
   }
})

export default {
   router,
   routes: [...routes, routeLogout], // 需要显示在边栏的菜单
}




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
            name: 'CarDepartment',
            path: 'car-department',
            component: resolve => require(['@/page/info/car/CarDepartment'], resolve),
         },
         {
            name: 'CarUsed',
            path: 'car-used',
            component: resolve => require(['@/page/info/car/CarUsed.vue'], resolve),
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
         {name: 'CarDepartment', path: 'car-department', meta: {title: '济南车管所', showInMenu: true}},
         {name: 'CarUsed', path: 'car-used', meta: {title: '济南二手车市场', showInMenu: true}},
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
   routeMap[1].children.push({name: `line${index + 1}`, path: `${index + 1}`, meta: {title: line.index + ' - ' +  line.name, showInMenu: true}},)
})

export default {
   routeMap,
   router
}
