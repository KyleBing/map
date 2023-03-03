import Vue from "vue";
import VueRouter from "vue-router";
import utility from "@/utility";

Vue.use(VueRouter)

import Login from "@/page/Login.vue"
import Layout from "@/layout/Layout";

import  {Message} from 'element-ui'

const routes = [
   {
      name: 'RouteLine',
      path: '/route',
      component: Layout,
      redirect: '/route/list',
      meta: {title: '路线推荐', showInMenu: true, icon: 'el-icon-wind-power' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
      children: [
         {
            name: 'RouteList',
            path: 'list',
            meta: {
               title: '路线列表',
               showInMenu: true,
               icon: 'el-icon-wind-power' // 菜单 icon 对应 Element UI 中的 ICON class 名
            },
            component: resolve => require(['@/page/route/RouteList'], resolve),
         },
         {
            name: 'line',
            path: ':lineId',
            meta: {
               title: '路线推荐',
               showInMenu: true,
               icon: 'el-icon-wind-power' // 菜单 icon 对应 Element UI 中的 ICON class 名
            },
            component: resolve => require(['@/page/route/RouteLine'], resolve),
         }
      ]
   },
   {
      name: 'Tool',
      path: '/tool',
      component: Layout,
      redirect: '/tool/circle',
      meta: {title: '地图工具', showInMenu: true, icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
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
      meta: {title: '调试', showInMenu: true, icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
      children: [
         {
            name: 'debugIndex',
            path: 'debug',
            meta: {title: '调试', showInMenu: true, icon: 'el-icon-position' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
            component: resolve => require(['@/page/debug/debug'], resolve),
         }
      ]
   },
   {
      name: 'Info',
      path: '/info',
      component: Layout,
      redirect: '/info/plate',
      meta: {title: '地图信息', showInMenu: true, icon: 'el-icon-collection' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
      children: [
         {
            name: 'InfoPlate', path: 'plate',
            meta: {title: '山东各市车牌', showInMenu: true},
            component: resolve => require(['@/page/info/plate/InfoPlate'], resolve),
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
         icon: 'el-icon-magic-stick' // 菜单 icon 对应 Element UI 中的 ICON class 名
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
]
const ROUTE_FRAME =  [
   {
      name: 'index', path: '/',
      meta: {title: '主页', showInMenu: true, icon: 'el-icon-house' /* 菜单 icon 对应 Element UI 中的 ICON class 名 */},
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
      name: 'Login', path: '/Login',
      meta: {title: '登录', showInMenu: false, icon: 'el-icon-user-solid',},
      component: resolve => require(['@/page/Login'], resolve),
   },
   {
      name: 'NoPage', path: '*',
      meta: {title: '404', showInMenu: false, icon: 'el-icon-user-solid',},
      component: Login,
   },
]

const router = new VueRouter({
   // mode: 'history', // 由于该项目是二级目录，使用 history 会导致开发与布署的地址不一
   routes: [...ROUTE_FRAME, ...routes]
})

router.beforeEach((to, from, next) => {
   if (to.name !== 'Login' && to.name !== 'share'){
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
         next('/Login')
      }
   } else {
      next()
   }
})

export default {
   router,
   routes: [...routes], // 需要显示在边栏的菜单
}

// import lines from "./page/route/lines";
//
// // 添加路线到菜单
// lines.LINES.forEach((line, index) => {
//    routeMap[1].children.push({name: `line${index + 1}`, path: `${index + 1}`, meta: {title: line.index + ' - ' +  line.name, showInMenu: true}},)
// })
