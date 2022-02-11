import request from '@/utils/request'

// 查询邀请奖励配置列表
export function listConf(query) {
  return request({
    url: '/invitationRewardConf/list',
    method: 'get',
    params: query
  })
}

// 查询邀请奖励配置详细
export function getConf(invitationRewardConfId) {
  return request({
    url: '/conf/' + invitationRewardConfId,
    method: 'get'
  })
}

// 新增邀请奖励配置
export function addConf(data) {
  return request({
    url: '/invitationRewardConf',
    method: 'post',
    data: data
  })
}

// 修改邀请奖励配置
export function updateConf(data) {
  return request({
    url: '/invitationRewardConf',
    method: 'put',
    data: data
  })
}

// 删除邀请奖励配置
export function delConf(invitationRewardConfId) {
  return request({
    url: '/invitationRewardConf/' + invitationRewardConfId,
    method: 'delete'
  })
}

