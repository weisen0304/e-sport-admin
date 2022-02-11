import Layout from '@/layout'

const gameRouter = {
    path: '/play_admin',
    component: Layout,
    name: 'PlayAdmin',
    hidden: true,
    meta: {
        title: '賽事管理',
        icon: 'system',
        noCache: false
    },
    children: [
        {
            path: 'player',
            component: () =>
                import('@/views/play_admin/player/player'),
            name: 'PlayerAdmin',
            meta: { title: '玩家管理' },
        },
        {
            path: 'account',
            component: () =>
                import('@/views/play_admin/account/index'),

            children: [{
                path: 'ticket',
                component: () =>
                    import('@/views/play_admin/account/ticket'),
                name: 'TicketAdmin',
                meta: { title: '玩家门票' }
            }, {
                path: 'currency',
                component: () =>
                    import('@/views/play_admin/account/currency'),
                name: '',
                meta: { title: '玩家游戏币' }
            },]

        },

    ]
}

export default gameRouter;