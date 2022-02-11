import request from '@/utils/request'

// 查询玩家游戏币列表
export function listCurrency(query) {
  return request({
    url: '/player/finance/currency/list',
    method: 'get',
    params: query
  })
}

// 查询玩家游戏币详细
export function getCurrency(playerGameCurrencyId) {
  return request({
    url: '/player/finance/currency/' + playerGameCurrencyId,
    method: 'get'
  })
}

// 增加/减少金币
export function inOrdeCurrency(data) {
  return request({
    url: '/player/finance/currency/increaseOrDecrease',
    method: 'post',
    data
  })
}

// 新增玩家游戏币
export function addCurrency(data) {
  return request({
    url: '/player/finance/currency',
    method: 'post',
    data: data
  })
}
// 冻结
export function dongJieCurrency(playerTicketId) {
  return request({
    url: '/player/finance/currency/freeze/' + playerTicketId,
    method: 'put',

  })
}
// 解冻
export function jieDongCurrency(playerTicketId) {
  return request({
    url: '/player/finance/currency/relievefreeze/' + playerTicketId,
    method: 'put',

  })
}
// 提现
export function tiXianCurrency(data) {
  return request({
    url: '/player/finance/withdraw',
    method: 'post',
    data: data
  })
}
// 明细
export function listMingCurrency(id, query) {
  return request({
    url: '/player/finance/currency/cash-flow/' + id,
    method: 'get',
    params: query
  })
}
// 修改玩家游戏币
export function updateCurrency(data) {
  return request({
    url: '/player/finance/currency',
    method: 'put',
    data: data
  })
}

// 删除玩家游戏币
export function delCurrency(playerGameCurrencyId) {
  return request({
    url: '/player/finance/currency/' + playerGameCurrencyId,
    method: 'delete'
  })
}

// 导出玩家游戏币
export function exportCurrency(query) {
  return request({
    url: '/player/finance/currency/export',
    method: 'get',
    params: query
  })
}
