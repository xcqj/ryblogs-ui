import type { BlogTagForm, BlogTagQuery, BlogTagVO } from '@/api/blog/blogTag/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询博客标签列表
 * @param query
 * @returns {*}
 */
export const listBlogTag = (query?: BlogTagQuery): AxiosPromise<PageResult<BlogTagVO>> => {
  return request({
    url: '/blog/blogTag/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询博客标签详细
 * @param tagId
 */
export const getBlogTag = (tagId: string | number): AxiosPromise<BlogTagVO> => {
  return request({
    url: '/blog/blogTag/' + tagId,
    method: 'get'
  });
};

/**
 * 新增博客标签
 * @param data
 */
export const addBlogTag = (data: BlogTagForm) => {
  return request({
    url: '/blog/blogTag',
    method: 'post',
    data: data
  });
};

/**
 * 修改博客标签
 * @param data
 */
export const updateBlogTag = (data: BlogTagForm) => {
  return request({
    url: '/blog/blogTag',
    method: 'put',
    data: data
  });
};



/**
 * 删除博客标签
 * @param tagId
 */
export const delBlogTag = (tagId: string | number | Array<string | number>) => {
  return request({
    url: '/blog/blogTag/' + tagId,
    method: 'delete'
  });
};
