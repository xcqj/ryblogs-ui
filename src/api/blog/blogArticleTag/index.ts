import type { BlogArticleTagForm, BlogArticleTagQuery, BlogArticleTagVO } from '@/api/blog/blogArticleTag/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询博客文章标签关系列表
 * @param query
 * @returns {*}
 */
export const listBlogArticleTag = (query?: BlogArticleTagQuery): AxiosPromise<PageResult<BlogArticleTagVO>> => {
  return request({
    url: '/blog/blogArticleTag/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询博客文章标签关系详细
 * @param articleTagId
 */
export const getBlogArticleTag = (articleTagId: string | number): AxiosPromise<BlogArticleTagVO> => {
  return request({
    url: '/blog/blogArticleTag/' + articleTagId,
    method: 'get'
  });
};

/**
 * 新增博客文章标签关系
 * @param data
 */
export const addBlogArticleTag = (data: BlogArticleTagForm) => {
  return request({
    url: '/blog/blogArticleTag',
    method: 'post',
    data: data
  });
};

/**
 * 修改博客文章标签关系
 * @param data
 */
export const updateBlogArticleTag = (data: BlogArticleTagForm) => {
  return request({
    url: '/blog/blogArticleTag',
    method: 'put',
    data: data
  });
};



/**
 * 删除博客文章标签关系
 * @param articleTagId
 */
export const delBlogArticleTag = (articleTagId: string | number | Array<string | number>) => {
  return request({
    url: '/blog/blogArticleTag/' + articleTagId,
    method: 'delete'
  });
};
