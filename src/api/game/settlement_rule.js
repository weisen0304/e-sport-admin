import request from '@/utils/request'

// 查询结算规则列表
export function listRule(query) {
  return request({
    url: '/rule/list',
    method: 'get',
    params: query
  })
}

// 查询结算规则详细
export function getRule(settlementRuleId) {
  return request({
    url: '/rule/' + settlementRuleId,
    method: 'get'
  })
}

// 新增结算规则
export function addRule(data) {
  return request({
    url: '/rule',
    method: 'post',
    data: data
  })
}

// 修改结算规则
export function updateRule(data) {
  return request({
    url: '/rule',
    method: 'put',
    data: data
  })
}

// 删除结算规则
export function delRule(settlementRuleId) {
  return request({
    url: '/rule/' + settlementRuleId,
    method: 'delete'
  })
}

// 导出结算规则
export function exportRule(query) {
  return request({
    url: '/rule/export',
    method: 'get',
    params: query
  })
}