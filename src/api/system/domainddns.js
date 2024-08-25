import request from '@/utils/request'

// 查询解析域名列表
export function listDomainddns(query) {
  return request({
    url: '/system/domainddns/list',
    method: 'get',
    params: query
  })
}

// 查询解析域名详细
export function getDomainddns(id) {
  return request({
    url: '/system/domainddns/' + id,
    method: 'get'
  })
}

// 新增解析域名
export function addDomainddns(data) {
  return request({
    url: '/system/domainddns',
    method: 'post',
    data: data
  })
}

// 修改解析域名
export function updateDomainddns(data) {
  return request({
    url: '/system/domainddns',
    method: 'put',
    data: data
  })
}

// 删除解析域名
export function delDomainddns(id) {
  return request({
    url: '/system/domainddns/' + id,
    method: 'delete'
  })
}
