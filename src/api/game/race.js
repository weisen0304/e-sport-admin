import request from '@/utils/request'

// 查询赛事列表
export function racelist(query) {
    return request({
        url: '/race/list',
        method: 'get',
        params: query
    })
}
// 新增赛事
export function addRace(query) {
    return request({
        url: '/race',
        method: 'post',
        params: query
    })
}
// 删除对应赛事
export function delRace(query) {
    return request({
        url: '/race',
        method: 'DELETE',
        params: query
    })
}