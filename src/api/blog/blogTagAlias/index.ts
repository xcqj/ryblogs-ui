import type { BlogTagAliasForm, BlogTagAliasQuery, BlogTagAliasVO } from '@/api/blog/blogTagAlias/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询博客标签历史别名列表
 * @param query
 * @returns {*}
 */
export const listBlogTagAlias = (query?: BlogTagAliasQuery): AxiosPromise<PageResult<BlogTagAliasVO>> => {
  return request({
    url: '/blog/blogTagAlias/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询博客标签历史别名详细
 * @param tagAliasId
 */
export const getBlogTagAlias = (tagAliasId: string | number): AxiosPromise<BlogTagAliasVO> => {
  return request({
    url: '/blog/blogTagAlias/' + tagAliasId,
    method: 'get'
  });
};

/**
 * 新增博客标签历史别名
 * @param data
 */
export const addBlogTagAlias = (data: BlogTagAliasForm) => {
  return request({
    url: '/blog/blogTagAlias',
    method: 'post',
    data: data
  });
};

/**
 * 修改博客标签历史别名
 * @param data
 */
export const updateBlogTagAlias = (data: BlogTagAliasForm) => {
  return request({
    url: '/blog/blogTagAlias',
    method: 'put',
    data: data
  });
};



/**
 * 删除博客标签历史别名
 * @param tagAliasId
 */
export const delBlogTagAlias = (tagAliasId: string | number | Array<string | number>) => {
  return request({
    url: '/blog/blogTagAlias/' + tagAliasId,
    method: 'delete'
  });
};
