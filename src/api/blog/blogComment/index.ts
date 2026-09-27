import type { BlogCommentForm, BlogCommentQuery, BlogCommentVO } from '@/api/blog/blogComment/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询博客评论列表
 * @param query
 * @returns {*}
 */
export const listBlogComment = (query?: BlogCommentQuery): AxiosPromise<PageResult<BlogCommentVO>> => {
  return request({
    url: '/blog/blogComment/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询博客评论详细
 * @param commentId
 */
export const getBlogComment = (commentId: string | number): AxiosPromise<BlogCommentVO> => {
  return request({
    url: '/blog/blogComment/' + commentId,
    method: 'get'
  });
};

/**
 * 新增博客评论
 * @param data
 */
export const addBlogComment = (data: BlogCommentForm) => {
  return request({
    url: '/blog/blogComment',
    method: 'post',
    data: data
  });
};

/**
 * 修改博客评论
 * @param data
 */
export const updateBlogComment = (data: BlogCommentForm) => {
  return request({
    url: '/blog/blogComment',
    method: 'put',
    data: data
  });
};



/**
 * 删除博客评论
 * @param commentId
 */
export const delBlogComment = (commentId: string | number | Array<string | number>) => {
  return request({
    url: '/blog/blogComment/' + commentId,
    method: 'delete'
  });
};
