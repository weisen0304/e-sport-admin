import Layout from '@/layout'

const matchRouter = {
    path: '/match_admin',
    component: Layout,
    name: 'MatchAdmin',
    hidden: true,
    meta: {
        title: '賽事管理',
        icon: 'system',
        noCache: false
    },
    children: [{
        path: 'race_schedule',
        component: () =>
            import('@/views/match_admin/race_schedule/race_schedule'),
        name: 'RaceSchedule',
        meta: { title: '赛程管理' }
    }, {
        path: 'race_type',
        component: () =>
            import('@/views/match_admin/race_type/race_type'),
        name: 'RaceType',
        meta: { title: '赛事种类' }
    },
    {
        path: 'settlement_rule',
        component: () =>
            import('@/views/match_admin/settlement_rule/settlement_rule'),
        name: 'SettlementRule',
        meta: { title: '结算规则' }
    },


    ]
}

export default matchRouter;