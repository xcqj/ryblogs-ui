import type { BlogUserProfileForm, BlogUserProfileQuery, BlogUserProfileVO } from '@/api/blog/blogUserProfile/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询博客用户资料列表
 * @param query
 * @returns {*}
 */
export const listBlogUserProfile = (query?: BlogUserProfileQuery): AxiosPromise<PageResult<BlogUserProfileVO>> => {
  return request({
    url: '/blog/blogUserProfile/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询博客用户资料详细
 * @param userId
 */
export const getBlogUserProfile = (userId: string | number): AxiosPromise<BlogUserProfileVO> => {
  return request({
    url: '/blog/blogUserProfile/' + userId,
    method: 'get'
  });
};

/**
 * 新增博客用户资料
 * @param data
 */
export const addBlogUserProfile = (data: BlogUserProfileForm) => {
  return request({
    url: '/blog/blogUserProfile',
    method: 'post',
    data: data
  });
};

/**
 * 修改博客用户资料
 * @param data
 */
export const updateBlogUserProfile = (data: BlogUserProfileForm) => {
  return request({
    url: '/blog/blogUserProfile',
    method: 'put',
    data: data
  });
};



/**
 * 删除博客用户资料
 * @param userId
 */
export const delBlogUserProfile = (userId: string | number | Array<string | number>) => {
  return request({
    url: '/blog/blogUserProfile/' + userId,
    method: 'delete'
  });
};
