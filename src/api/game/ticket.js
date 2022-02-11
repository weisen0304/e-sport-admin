import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listTicket(query) {
  return request({
    url: '/player/finance/ticket/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getTicket(playerTicketId) {
  return request({
    url: '/player/finance/ticket/' + playerTicketId,
    method: 'get'
  })
}

// 充值
export function addRecharge(data) {
  return request({
    url: '/player/finance/ticket/recharge',
    method: 'post',
    data: data
  })
}
// 冻结
export function dongJieTicket(playerTicketId) {
  return request({
    url: '/player/finance/ticket/freeze/' + playerTicketId,
    method: 'put',

  })
}
// 解冻
export function jieDongTicket(playerTicketId) {
  return request({
    url: '/player/finance/ticket/relieveFreeze/' + playerTicketId,
    method: 'put',

  })
}
// 明细
export function listMingXiTicket(id,query) {
  return request({
    url: '/player/finance/ticket/cash-flow/'+id,
    method: 'get',
    params: query
  })
}
// 修改【请填写功能名称】
export function updateTicket(data) {
  return request({
    url: '/player/finance/ticket',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delTicket(playerTicketId) {
  return request({
    url: '/player/finance/ticket/' + playerTicketId,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportTicket(query) {
  return request({
    url: '/player/finance/ticket/export',
    method: 'get',
    params: query
  })
}