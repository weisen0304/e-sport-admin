import request from '@/utils/request'

// 查询客服配置列表
export function listConfig(query) {
  return request({
    url: '/config/list',
    method: 'get',
    params: query
  })
}

// 查询客服配置详细
export function getConfig(customerServiceConfigId) {
  return request({
    url: 'config/' + customerServiceConfigId,
    method: 'get'
  })
}

// 新增客服配置
export function addConfig(data) {
  return request({
    url: '/config',
    method: 'post',
    data: data
  })
}

// 修改客服配置
export function updateConfig(data) {
  return request({
    url: '/config',
    method: 'put',
    data: data
  })
}

// 删除客服配置
export function delConfig(customerServiceConfigId) {
  return request({
    url: '/config/' + customerServiceConfigId,
    method: 'delete'
  })
}

// 导出客服配置
export function exportConfig(query) {
  return request({
    url: '/config/export',
    method: 'get',
    params: query
  })
}