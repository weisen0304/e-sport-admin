import Layout from '@/layout'

const monitorRouter = {
    path: '/monitor',
    component: Layout,
    name: 'Monitor',
    hidden: true,
    meta: {
        title: '系统监控',
        icon: 'monitor',
        noCache: false
    },
    children: [{
            path: 'online',
            component: () =>
                import ('@/views/monitor/online/index'),
            name: 'Online',
            meta: { title: '在线用户' }
        },
        {
            path: 'job',
            component: () =>
                import ('@/views/monitor/job/index'),
            name: 'Job',
            meta: { title: '定时任务' }
        },
        {
            path: 'druid',
            component: () =>
                import ('@/views/monitor/druid/index'),
            name: 'Druid',
            meta: { title: '数据监控' }
        },
        {
            path: 'server',
            component: () =>
                import ('@/views/monitor/server/index'),
            name: 'Server',
            meta: { title: '服务监控' }
        },
        // {
        //     path: 'server',
        //     component: () =>
        //         import ('@/views/monitor/server/index'),
        //     name: 'Server',
        //     meta: { title: '服务监控' }
        // },
        {
            path: 'cache',
            component: () =>
                import ('@/views/monitor/cache/index'),
            name: 'Cache',
            meta: { title: '缓存监控' }
        },
    ]
}

export default monitorRouter;