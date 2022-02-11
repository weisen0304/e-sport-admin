import request from '@/utils/request'

// 查询通知模板列表
export function listTemplate(query) {
  return request({
    url: '/template/list',
    method: 'get',
    params: query
  })
}

// 查询通知模板详细
export function getTemplate(noticeTemplateId) {
  return request({
    url: '/template/' + noticeTemplateId,
    method: 'get'
  })
}

// 新增通知模板
export function addTemplate(data) {
  return request({
    url: '/template',
    method: 'post',
    data: data
  })
}

// 修改通知模板
export function updateTemplate(data) {
  return request({
    url: '/template',
    method: 'put',
    data: data
  })
}

// 删除通知模板
export function delTemplate(noticeTemplateId) {
  return request({
    url: '/template/' + noticeTemplateId,
    method: 'delete'
  })
}

// 导出通知模板
export function exportTemplate(query) {
  return request({
    url: '/template/export',
    method: 'get',
    params: query
  })
}