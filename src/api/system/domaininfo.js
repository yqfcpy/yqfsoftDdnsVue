import request from '@/utils/request'

// 查询域名信息列表
export function listDomaininfo(query) {
  return request({
    url: '/system/domaininfo/list',
    method: 'get',
    params: query
  })
}

// 查询域名信息详细
export function getDomaininfo(id) {
  return request({
    url: '/system/domaininfo/' + id,
    method: 'get'
  })
}

// 新增域名信息
export function addDomaininfo(data) {
  return request({
    url: '/system/domaininfo',
    method: 'post',
    data: data
  })
}

// 修改域名信息
export function updateDomaininfo(data) {
  return request({
    url: '/system/domaininfo',
    method: 'put',
    data: data
  })
}

// 删除域名信息
export function delDomaininfo(id) {
  return request({
    url: '/system/domaininfo/' + id,
    method: 'delete'
  })
}
