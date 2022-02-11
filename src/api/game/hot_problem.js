import request from '@/utils/request'

// 查询热门问题列表
export function listProblem(query) {
  return request({
    url: '/problem/list',
    method: 'get',
    params: query
  })
}

// 查询热门问题详细
export function getProblem(hotProblemId) {
  return request({
    url: '/problem/' + hotProblemId,
    method: 'get'
  })
}

// 新增热门问题
export function addProblem(data) {
  return request({
    url: '/problem',
    method: 'post',
    data: data
  })
}

// 修改热门问题
export function updateProblem(data) {
  return request({
    url: '/problem',
    method: 'put',
    data: data
  })
}

// 删除热门问题
export function delProblem(hotProblemId) {
  return request({
    url: '/problem/' + hotProblemId,
    method: 'delete'
  })
}

// 导出热门问题
export function exportProblem(query) {
  return request({
    url: '/problem/export',
    method: 'get',
    params: query
  })
}