import request from '@/utils/request'

// 查询玩家列表
export function listPlayer(query) {
    return request({
        url: '/player/list',
        method: 'get',
        params: query
    })
}

// 查询玩家详细
export function getPlayer(id) {
    return request({
        url: '/player/' + id,
        method: 'get'
    })
}
// 操作玩家
export function handlePlayer(params) {
    return request({
        headers: {
            "Content-type": "application/json"
        },
        url: '/player/handle',
        method: 'put',
        data: params
    })
}
// /player/competitionHis/{playerId}获取玩家竞赛历史
export function getCompetitionHistory(query) {
    return request({
        url: '/player/competitionHis/' + query.playerId,
        method: 'get',
        params: query
    })
}
// reqDetail
export function reqDetail(query) {
    return request({
        url: '/player/competitionDetail',
        method: 'get',
        params: query
    })
}

// 处理玩家战绩
export function reqHandleResult(query) {
    console.log(query)
    return request({
        url: '/player/handle/standing/' + query.raceRoomId + '/' + query.playerId + '/' + query.gameResult,
        method: 'post',

    })
}
export function reqCancellationReason(query) {
    console.log(query)
    return request({
        url: '/player/cancellation-reason',
        method: 'get',
        params: query


    })
}