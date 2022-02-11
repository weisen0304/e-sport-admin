import Layout from '@/layout'

const gameRouter = {
    path: '/game',
    component: Layout,
    name: 'Game',
    hidden: true,
    meta: {
        title: '游戏平台',
        icon: 'system',
        noCache: false
    },
    children: [
        {
            path: 'goods',
            component: () =>
                import('@/views/game/goods/goods'),
            name: 'GoodsAdmin',
            meta: { title: '平台商品' }
        },
        {
            path: 'exchange',
            component: () =>
                import('@/views/game/exchange/exchange'),
            name: 'exchange',
            meta: { title: '玩家兑换商品管理' }
        },

        {
            path: 'chartroom',
            component: () =>
                import('@/views/game/chartroom/chartroom'),
            name: 'ChartroomAdmin',
            meta: { title: '聊天大厅' }
        },

        {
            path: 'notice_template',
            component: () =>
                import('@/views/game/notice_template/notice_template'),
            name: 'NoticeTemplateAdmin',
            meta: { title: '消息模板' },
        },

        // notice
        {
            path: 'notice',
            component: () =>
                import('@/views/game/notice/notice'),
            name: 'InfoNoticeAdmin',
            meta: { title: '平台消息通知' },
        },




    ]
}

export default gameRouter;