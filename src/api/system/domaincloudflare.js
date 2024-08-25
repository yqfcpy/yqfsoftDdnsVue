import request from '@/utils/request'

// 查询动态域名列表
export function listDomaincloudflare(query) {
  return request({
    url: '/system/domaincloudflare/list',
    method: 'get',
    params: query
  })
}

// 查询动态域名详细
export function getDomaincloudflare(id) {
  return request({
    url: '/system/domaincloudflare/' + id,
    method: 'get'
  })
}

// 新增动态域名
export function addDomaincloudflare(data) {
  return request({
    url: '/system/domaincloudflare',
    method: 'post',
    data: data
  })
}

// 修改动态域名
export function updateDomaincloudflare(data) {
  return request({
    url: '/system/domaincloudflare',
    method: 'put',
    data: data
  })
}

// 删除动态域名
export function delDomaincloudflare(id) {
  return request({
    url: '/system/domaincloudflare/' + id,
    method: 'delete'
  })
}
