import request from '@/utils/request'

// 查询赛事种类列表
export function listType(query) {
  return request({
    url: '/type/list',
    method: 'get',
    params: query
  })
}

// 查询赛事种类详细
export function getType(raceTypeId) {
  return request({
    url: '/type/' + raceTypeId,
    method: 'get'
  })
}

// 新增赛事种类
export function addType(data) {
  return request({
    url: '/type',
    method: 'post',
    data: data
  })
}

// 修改赛事种类
export function updateType(data) {
  return request({
    url: '/type',
    method: 'put',
    data: data
  })
}

// 删除赛事种类
export function delType(raceTypeId) {
  return request({
    url: '/type/' + raceTypeId,
    method: 'delete'
  })
}

// 导出赛事种类
export function exportType(query) {
  return request({
    url: '/type/export',
    method: 'get',
    params: query
  })
}
/**
 * 
 * @param {*} data 
 */
// export function getType(raceTypeId) {
//   return request({
//     url: '/type/' + raceTypeId,
//     method: 'get'
//   })
// }

// 查询
export function querySchedule(id) {
  return request({
    url: '/schedule/'+id,
    method: 'get',
  })
}

// 查询
export function queryGame(id) {
  return request({
    url: '/game/'+id,
    method: 'get',
  
  })
}

// 查询
export function queryRule(id) {
  return request({
    url: '/rule/'+id,
    method: 'get'
  })
}