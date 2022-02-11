import Layout from '@/layout'

const toolRouter = {
    path: '/tool',
    component: Layout,
    name: 'Tool',
    hidden: true,
    meta: {
        title: '系统工具',
        icon: 'tool',
        noCache: false
    },
    children: [{
            path: 'build',
            component: () =>
                import ('@/views/tool/build/index'),
            name: 'Build',
            meta: { title: '表單构建' }
        },
        {
            path: 'gen',
            component: () =>
                import ('@/views/tool/gen/index'),
            name: 'Gen',
            meta: { title: '代码生成' }
        },
        {
            path: 'swagger',
            component: () =>
                import ('@/views/tool/swagger/index'),
            name: 'Swagger',
            meta: { title: '系统接口' }
        },

    ]
}

export default toolRouter;