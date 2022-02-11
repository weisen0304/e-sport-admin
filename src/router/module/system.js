import Layout from '@/layout'

const systemRouter = {
    path: '/system',
    component: Layout,
    name: 'System',
    hidden: true,
    meta: {
        title: '系统管理',
        icon: 'system',
        noCache: false
    },
    children: [{
            path: 'user',
            component: () =>
                import ('@/views/system/user/index'),
            name: 'UserAdmin',
            meta: { title: '用户管理' }
        },
        {
            path: 'role',
            component: () =>
                import ('@/views/system/role/index'),
            name: 'RoleAdmin',
            meta: { title: '角色管理' }
        },
        {
            path: 'menu',
            component: () =>
                import ('@/views/system/menu/index'),
            name: 'MenuAdmin',
            meta: { title: '菜單管理' }
        },
        {
            path: 'Dict',
            component: () =>
                import ('@/views/system/dict/index'),
            name: 'DictAdmin',
            meta: { title: '字典管理' }
        },
        {
            path: 'notice',
            component: () =>
                import ('@/views/system/notice/index'),
            name: 'NoticeAdmin',
            meta: { title: '通知公告' }
        }

    ]
}

export default systemRouter;