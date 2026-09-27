import type { BlogArticleVersionForm, BlogArticleVersionQuery, BlogArticleVersionVO } from '@/api/blog/blogArticleVersion/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询博客文章版本历史列表
 * @param query
 * @returns {*}
 */
export const listBlogArticleVersion = (query?: BlogArticleVersionQuery): AxiosPromise<PageResult<BlogArticleVersionVO>> => {
  return request({
    url: '/blog/blogArticleVersion/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询博客文章版本历史详细
 * @param versionId
 */
export const getBlogArticleVersion = (versionId: string | number): AxiosPromise<BlogArticleVersionVO> => {
  return request({
    url: '/blog/blogArticleVersion/' + versionId,
    method: 'get'
  });
};

/**
 * 新增博客文章版本历史
 * @param data
 */
export const addBlogArticleVersion = (data: BlogArticleVersionForm) => {
  return request({
    url: '/blog/blogArticleVersion',
    method: 'post',
    data: data
  });
};

/**
 * 修改博客文章版本历史
 * @param data
 */
export const updateBlogArticleVersion = (data: BlogArticleVersionForm) => {
  return request({
    url: '/blog/blogArticleVersion',
    method: 'put',
    data: data
  });
};



/**
 * 删除博客文章版本历史
 * @param versionId
 */
export const delBlogArticleVersion = (versionId: string | number | Array<string | number>) => {
  return request({
    url: '/blog/blogArticleVersion/' + versionId,
    method: 'delete'
  });
};
