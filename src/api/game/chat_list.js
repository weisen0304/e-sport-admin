import request from '@/utils/request'

// 查询聊天大厅消息列表
export function listMsg(query) {
    return request({
        url: '/customer-service/list',
        method: 'get',
        params: query
    })
}
// 蒐索会话
export function searchList(query) {
    return request({
        url: '/customer-service/search',
        method: 'get',
        params: query
    })
}



// 发送信息
export function sendMsg(data) {
    return request({
        url: '/customer-service/send',
        method: 'post',
        data: data
    })
}

// 切换会话
export function changeMsg(sessionId) {
    return request({
        url: '/customer-service/switch-session/' + sessionId,
        method: 'post',
    })
}
