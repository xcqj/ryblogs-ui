import type { BlogArticleForm, BlogArticleQuery, BlogArticleVO } from '@/api/blog/blogArticle/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询博客文章列表
 * @param query
 * @returns {*}
 */
export const listBlogArticle = (query?: BlogArticleQuery): AxiosPromise<PageResult<BlogArticleVO>> => {
  return request({
    url: '/blog/blogArticle/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询博客文章详细
 * @param articleId
 */
export const getBlogArticle = (articleId: string | number): AxiosPromise<BlogArticleVO> => {
  return request({
    url: '/blog/blogArticle/' + articleId,
    method: 'get'
  });
};

/**
 * 新增博客文章
 * @param data
 */
export const addBlogArticle = (data: BlogArticleForm) => {
  return request({
    url: '/blog/blogArticle',
    method: 'post',
    data: data
  });
};

/**
 * 修改博客文章
 * @param data
 */
export const updateBlogArticle = (data: BlogArticleForm) => {
  return request({
    url: '/blog/blogArticle',
    method: 'put',
    data: data
  });
};



/**
 * 删除博客文章
 * @param articleId
 */
export const delBlogArticle = (articleId: string | number | Array<string | number>) => {
  return request({
    url: '/blog/blogArticle/' + articleId,
    method: 'delete'
  });
};
