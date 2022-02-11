import request from '@/utils/request'

// 查询收币机器人列表
export function listConf(query) {
  return request({
    url: '/collectCoinRobotConf/list',
    method: 'get',
    params: query
  })
}

// 查询收币机器人详细
export function getConf(collectCoinRobotConfId) {
  return request({
    url: '/collectCoinRobotConf/' + collectCoinRobotConfId,
    method: 'get'
  })
}

// 新增收币机器人
export function addConf(data) {
  return request({
    url: '/collectCoinRobotConf',
    method: 'post',
    data: data
  })
}

// 修改收币机器人
export function updateConf(data) {
  return request({
    url: '/collectCoinRobotConf',
    method: 'put',
    data: data
  })
}

// 删除收币机器人
export function delConf(collectCoinRobotConfId) {
  return request({
    url: '/collectCoinRobotConf/' + collectCoinRobotConfId,
    method: 'delete'
  })
}

// 导出收币机器人
export function exportConf(query) {
  return request({
    url: '/collectCoinRobotConf/export',
    method: 'get',
    params: query
  })
}