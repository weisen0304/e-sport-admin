import request from '@/utils/request'

// 查询赛程列表
export function listSchedule(query) {
  return request({
    url: '/schedule/list',
    method: 'get',
    params: query
  })
}

// 查询赛程详细
export function getSchedule(raceScheduleId) {
  return request({
    url: '/schedule/' + raceScheduleId,
    method: 'get'
  })
}

// 新增赛程
export function addSchedule(data) {
  return request({
    url: '/schedule',
    method: 'post',
    data: data
  })
}

// 修改赛程
export function updateSchedule(data) {
  return request({
    url: '/schedule',
    method: 'put',
    data: data
  })
}

// 删除赛程
export function delSchedule(raceScheduleId) {
  return request({
    url: '/schedule/' + raceScheduleId,
    method: 'delete'
  })
}

// 导出赛程
export function exportSchedule(query) {
  return request({
    url: '/schedule/export',
    method: 'get',
    params: query
  })
}