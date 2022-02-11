import Layout from '@/layout'

const baseConfigRouter = {
    path: '/base_config',
    component: Layout,
    name: 'BaseConfig',
    hidden: true,
    meta: {
        title: '基礎配置管理',
        icon: 'system',
        noCache: false
    },
    children: [{
        path: 'game',
        component: () =>
            import('@/views/base_config/game/index'),
        name: 'Support',
        meta: { title: '平台支持游戏' }
    },
    {
        path: 'currency',
        component: () =>
            import('@/views/base_config/currency/index'),
        name: 'CurrencyAdmin',
        meta: { title: '游戏币' }
    },
    {
        path: 'coin_robot',
        component: () =>
            import('@/views/base_config/coin_robot/coin_robot'),
        name: 'CoinRobot',
        meta: { title: '收币机器人' },
    },
    {
        path: 'Invite_rewards',
        component: () =>
            import('@/views/base_config/Invite_rewards/Invite_rewards'),
        name: 'InviteRewards',
        meta: { title: '邀请奖励' },
    },

    ]
}

export default baseConfigRouter;