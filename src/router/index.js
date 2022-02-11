import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import ParentView from '@/components/ParentView';

/* Router Modules */
import systemRouter from './module/system'
import gameRouter from './module/game'
import toolRuter from './module/tool'
import monitorRouter from './module/monitor'
import baseConfig from './module/base_config'
import playAdminRouter from './module/play_admin'
import keConfigRouter from './module/kefu_config'
import matchAdminRouter from './module/match_admin'

/**
 * Note: 路由配置项
 *
 * hidden: true                   // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true               // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                               // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect           // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'             // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * meta : {
    noCache: true                // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'               // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'             // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false            // 如果设置为false，则不会在breadcrumb面包屑中显示
  }
 */

// 公共路由
export const constantRoutes = [
    {
        path: '',
        component: Layout,
        redirect: 'index',
        title: '首頁',
        children: [{
            path: 'index',
            component: (resolve) => require(['@/views/index'], resolve),
            name: 'Index',
            meta: { title: '首頁', icon: 'dashboard', noCache: true, affix: true }
        }]
    },
    {
        path: '/redirect',
        component: Layout,
        hidden: true,
        children: [{
            path: '/redirect/:path(.*)',
            component: (resolve) => require(['@/views/redirect'], resolve)
        }]
    },
    {
        path: '/login',
        component: (resolve) => require(['@/views/login'], resolve),
        hidden: true
    },
    {
        path: '/404',
        component: (resolve) => require(['@/views/error/404'], resolve),
        hidden: true
    },
    {
        path: '/401',
        component: (resolve) => require(['@/views/error/401'], resolve),
        hidden: true
    },
    /** when your routing map is too long, you can split it into small modules **/

    {
        path: '/user',
        component: Layout,
        hidden: true,
        redirect: 'noredirect',
        children: [{ 
            path: 'profile',
            component: (resolve) => require(['@/views/system/user/profile/index'], resolve),
            name: 'Profile',
            meta: { title: '个人中心', icon: 'user' }
        }]
    },
    {
        path: '/dict',
        component: Layout,
        hidden: true,
        children: [{
            path: 'type/data/:dictId(\\d+)',
            component: (resolve) => require(['@/views/system/dict/data'], resolve),
            name: 'Data',
            meta: { title: '字典数据', icon: '' }
        }]
    },
    {
        path: '/game',
        component: Layout,
        hidden: true,
        children: [{
            path: 'player/detail/:playerId(\\d+)',
            component: (resolve) => require(['@/views/play_admin/player/detail'], resolve),
            name: 'detail',
            meta: { title: '玩家详情', icon: '' }
        },
        {
            path: 'player/history/:playerId(\\d+)',
            component: (resolve) => require(['@/views/play_admin/player/history'], resolve),
            name: 'history',
            meta: { title: '竞赛历史信息', icon: '' }
        }
        ]
    },
    {
        path: '/job',
        component: Layout,
        hidden: true,
        children: [{
            path: 'log',
            component: (resolve) => require(['@/views/monitor/job/log'], resolve),
            name: 'JobLog',
            meta: { title: '调度日志' }
        }]
    },
    {
        path: '/gen',
        component: Layout,
        hidden: true,
        children: [{
            path: 'edit/:tableId(\\d+)',
            component: (resolve) => require(['@/views/tool/gen/editTable'], resolve),
            name: 'GenEdit',
            meta: { title: '修改生成配置' }
        }]
    },
    systemRouter,
    gameRouter,
    toolRuter,
    monitorRouter,
    baseConfig,
    playAdminRouter,
    keConfigRouter,
    matchAdminRouter

]
const originalPush = Router.prototype.push
const originalReplace = Router.prototype.replace
//push
Router.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}
//replace
Router.prototype.replace = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
    return originalReplace.call(this, location).catch(err => err)
}

export default new Router({
    mode: 'history', // 去掉url中的#
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})
// export default new Router({
//     mode:'history',
//     routes:constantRoutes
// })
// new 一个路由，并导出
// 路由构造器接收一个配置对象，配置对象的属性：mode；routes