import request from '@/utils/request'

// 新增游戏币
export function addCurrent(query) {
    return request({
        headers: {
            "Content-type": "application/json"
        },
        url: '/currency',
        method: 'POST',
        data: query
    })
}
// 修改游戏币
export function updateCurrent(query) {
    return request({
        headers: {
            "Content-type": "application/json"
        },
        url: '/currency',
        method: 'PUT',
        data: query
    })
}
// 查询游戏币列表
export function getCurrentList(query) {
    return request({
        url: '/currency/list',
        method: 'GET',
        params: query
    })
}
// 查询平台支持游戏下拉数据
export function getSelectList(query) {
    return request({
        url: '/currency/select',
        method: 'GET',
        params: query
    })
}
// 获取游戏币详细信息
export function getCurrentById(id, query) {
    return request({
        url: '/currency/' + id,
        method: 'GET',
        data: query
    })
}

//删除游戏币
export function deleteCurrent(id, query) {
    return request({
        url: '/currency/' + id,
        method: 'delete',
        data: query
    })
}
// 查询平台支持游戏下拉数据
export function getCurrencyOptions(query) {
    return request({
        url: '/currency/select',
        method: 'GET',
        params: query
    })
}