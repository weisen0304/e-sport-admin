import request from '@/utils/request'

// 查询平台消息列表
export function listNotice(query) {
  return request({
    url: '/notice/list',
    method: 'get',
    params: query
  })
}

// 查询平台消息详细
export function getNotice(noticeId) {
  return request({
    url: '/notice/' + noticeId,
    method: 'get'
  })
}

// 新增平台消息
export function addNotice(data) {
  return request({
    url: '/notice',
    method: 'post',
    data: data
  })
}

// 修改平台消息
export function updateNotice(data) {
  return request({
    url: '/notice',
    method: 'put',
    data: data
  })
}

// 删除平台消息
export function delNotice(noticeId) {
  return request({
    url: '/notice/' + noticeId,
    method: 'delete'
  })
}

// 导出平台消息
export function exportNotice(query) {
  return request({
    url: '/notice/export',
    method: 'get',
    params: query
  })
}