import request from '@/utils/request'

// 查询游戏数据
export function gamelist(query) {
    return request({
        url: '/game/list',
        method: 'get',
        params: query
    })
}
// 新增游戏
export function addGame(query) {
    return request({
        headers: {
            "Content-type": "application/json"
        },
        url: '/game',
        method: 'POST',
        data: query

    })
}
// 获取详细信息
export function getCurrentById(id, query) {
    return request({
        url: '/game/' + id,
        method: 'GET',
        data: query
    })
}
// 编辑
export function updateGame(query) {
    return request({
        headers: {
            "Content-type": "application/json"
        },
        url: '/game',
        method: 'PUT',
        data: query
    })
}
// 删除游戏
export function delGame(id, query) {
    return request({
        url: '/game/' + id,
        method: 'DELETE',
        params: query
    })
}
// 获取游戏下拉框列表
export function getSelectGame(query) {
    return request({
        url: '/game/select',
        method: 'GET',
        params: query
    })
}