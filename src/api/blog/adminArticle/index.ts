import type {
  BlogAdminArticleHideForm,
  BlogAdminArticleQuery,
  BlogAdminArticleVO
} from '@/api/blog/adminArticle/types';
import type { BlogArticleDetailVO } from '@/api/blog/article/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 管理员文章列表（契约 §11.1，权限 blog:article:list）
 * 可见 DRAFT / PUBLISHED / USER_HIDDEN / ADMIN_HIDDEN 全部状态
 */
export const listBlogAdminArticle = (query?: BlogAdminArticleQuery): AxiosPromise<PageResult<BlogAdminArticleVO>> => {
  return request({
    url: '/blog/admin/articles',
    method: 'get',
    params: query
  });
};

/**
 * 管理员文章详情（契约 §11.2，权限 blog:article:query）：完整当前状态 + 治理信息
 * 与作者详情返回同一 BlogArticleDetailVo 结构，供共享详情组件复用
 */
export const getBlogAdminArticle = (articleId: string | number): AxiosPromise<BlogArticleDetailVO> => {
  return request({
    url: '/blog/admin/articles/' + articleId,
    method: 'get'
  });
};

/**
 * 管理员下线文章（契约 §11.3，权限 blog:article:adminHide）
 * PUBLISHED+PUBLIC → ADMIN_HIDDEN；已 ADMIN_HIDDEN 时更新下线记录（D13 同态幂等）
 */
export const hideBlogAdminArticle = (articleId: string | number, data: BlogAdminArticleHideForm) => {
  return request({
    url: '/blog/admin/articles/' + articleId + '/hide',
    method: 'post',
    data: data
  });
};

/**
 * 管理员恢复文章（契约 §11.4，权限 blog:article:adminRestore）
 * ADMIN_HIDDEN → PUBLIC，status 不变；PUBLIC 同态幂等
 */
export const restoreBlogAdminArticle = (articleId: string | number) => {
  return request({
    url: '/blog/admin/articles/' + articleId + '/restore',
    method: 'post'
  });
};
