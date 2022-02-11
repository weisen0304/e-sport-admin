import request from '@/utils/request'

// 查询聊天大厅消息列表
export function listMsg(query) {
    return request({
        url: '/msg/list',
        method: 'get',
        params: query
    })
}

// 查询聊天大厅消息详细
export function getMsg(chatroomMsgId) {
    return request({
        url: '/msg/' + chatroomMsgId,
        method: 'get'
    })
}

// 新增聊天大厅消息
export function addMsg(data) {
    return request({
        url: '/msg',
        method: 'post',
        data: data
    })
}

// 修改聊天大厅消息
export function updateMsg(data) {
    return request({
        url: '/msg',
        method: 'put',
        data: data
    })
}

// 删除聊天大厅消息
export function delMsg(chatroomMsgId) {
    return request({
        url: '/msg/' + chatroomMsgId,
        method: 'delete'
    })
}

// 导出聊天大厅消息
export function exportMsg(query) {
    return request({
        url: '/msg/export',
        method: 'get',
        params: query
    })
}