import type { BlogAdminCommentQuery, BlogAdminCommentVO } from '@/api/blog/adminComment/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 评论管理列表（契约 §12.1，权限 blog:comment:list）
 */
export const listBlogAdminComment = (query?: BlogAdminCommentQuery): AxiosPromise<PageResult<BlogAdminCommentVO>> => {
  return request({
    url: '/blog/admin/comments',
    method: 'get',
    params: query
  });
};

/**
 * 删除违规评论（契约 §12.2，权限 blog:comment:remove）：逻辑删除，不物理删
 */
export const delBlogAdminComment = (commentId: string | number) => {
  return request({
    url: '/blog/admin/comments/' + commentId,
    method: 'delete'
  });
};
