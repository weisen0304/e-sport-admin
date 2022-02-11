import Layout from '@/layout'

const kefuRouter = {
    path: '/kefu_config',
    component: Layout,
    name: 'keFuConfig',
    hidden: true,
    meta: {
        title: '在綫客服',
        icon: 'system',
        noCache: false
    },
    children: [
        {
            path: 'kefu',
            component: () =>
                import('@/views/kefu_config/kefu/kefu'),
            name: 'KeFu',
            meta: { title: '客服配置' }
        },
        {
            path: 'hot_problem',
            component: () =>
                import('@/views/kefu_config/hot_problem/hot_problem'),
            name: 'HotProblem',
            meta: { title: '热门问题' }
        },
        {
            path: 'chat_list',
            component: () =>
                import('@/views/kefu_config/chat_list/chat_list'),
            name: 'chatList',
            meta: { title: '客服聊天' },
        },

    ]
}

export default kefuRouter;